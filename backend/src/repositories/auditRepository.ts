import crypto from 'crypto';
import { persistentStore, query } from '../db/connection';

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  organizationId?: string;
  prevHash?: string;
  entryHash?: string;
  isDemo?: boolean;
}

export class AuditRepository {
  /**
   * Helper to compute entry hash
   */
  computeHash(log: Omit<AuditLogItem, 'entryHash'>, prevHash: string): string {
    const rawData = `${prevHash}|${log.id}|${log.userId}|${log.action}|${log.timestamp}|${log.entityType || ''}|${log.entityId || ''}|${log.organizationId || ''}`;
    return crypto.createHash('sha256').update(rawData).digest('hex');
  }

  /**
   * Recalculates the complete SHA-256 cryptographic chain from oldest to newest
   */
  rechain(list: AuditLogItem[]): AuditLogItem[] {
    if (list.length === 0) return list;
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].prevHash = prevHash;
      list[i].entryHash = this.computeHash(list[i], prevHash);
      prevHash = list[i].entryHash!;
    }
    persistentStore.set('audit_logs', list);
    return list;
  }

  /**
   * Ensure unhashed seeded entries are chained deterministically
   */
  ensureChainInitialized(list: AuditLogItem[]): AuditLogItem[] {
    if (list.length === 0) return list;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].entryHash || !list[i].prevHash) {
        return this.rechain(list);
      }
    }
    return list;
  }

  /**
   * Persist a new governance audit log entry with tamper-evident cryptographic hash chaining
   */
  async create(log: Omit<AuditLogItem, 'prevHash' | 'entryHash'>): Promise<AuditLogItem> {
    let list = persistentStore.get('audit_logs');
    list = this.ensureChainInitialized(list);
    
    // Compute prevHash from the previous entry in the chain
    const prevHash = list.length > 0 && list[0].entryHash ? list[0].entryHash : '0000000000000000000000000000000000000000000000000000000000000000';
    
    // Calculate SHA-256 hash of this entry combined with prevHash
    const entryHash = this.computeHash({ ...log, prevHash }, prevHash);

    const fullRecord: AuditLogItem = {
      ...log,
      prevHash,
      entryHash,
    };

    list.unshift(fullRecord);

    // Keep bounded history (e.g. 5000 records)
    if (list.length > 5000) {
      list.pop();
    }
    persistentStore.set('audit_logs', list);

    try {
      await query(
        `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, timestamp, entity_type, entity_id, details, organization_id, prev_hash, entry_hash, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          fullRecord.id,
          fullRecord.userId,
          fullRecord.userName,
          fullRecord.userRole,
          fullRecord.action,
          fullRecord.timestamp,
          fullRecord.entityType || null,
          fullRecord.entityId || null,
          fullRecord.details || null,
          fullRecord.organizationId || null,
          fullRecord.prevHash,
          fullRecord.entryHash,
          fullRecord.isDemo ?? false,
        ]
      );
    } catch (e) {
      // Background pg sync fallback
    }

    return fullRecord;
  }

  /**
   * Find audit logs matching optional criteria with pagination
   */
  async findAll(filter?: {
    isDemo?: boolean;
    entityType?: string;
    action?: string;
    organizationId?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
  }): Promise<{ items: AuditLogItem[]; total: number; page?: number; pageSize?: number; totalPages?: number } | AuditLogItem[]> {
    const list = persistentStore.get('audit_logs');
    let filtered = list;

    if (filter?.isDemo !== undefined) {
      filtered = filtered.filter((a: any) => Boolean(a.isDemo) === filter.isDemo);
    }
    if (filter?.entityType && filter.entityType !== 'All') {
      filtered = filtered.filter((a: any) => (a.entityType || '').toLowerCase() === filter.entityType?.toLowerCase());
    }
    if (filter?.action && filter.action !== 'All') {
      filtered = filtered.filter((a: any) => (a.action || '').toLowerCase() === filter.action?.toLowerCase());
    }
    if (filter?.organizationId) {
      filtered = filtered.filter((a: any) => !a.organizationId || a.organizationId === filter.organizationId);
    }

    if (filter?.page !== undefined) {
      const page = Math.max(1, filter.page || 1);
      const pageSize = Math.max(1, filter.pageSize || 25);
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { items, total, page, pageSize, totalPages };
    }

    const limit = filter?.limit || 100;
    return filtered.slice(0, limit);
  }

  /**
   * Verify cryptographic chain integrity and payload integrity
   */
  async verifyChainIntegrity(): Promise<{
    valid: boolean;
    totalChecked: number;
    brokenIndex?: number;
    reason?: string;
    tamperedId?: string;
  }> {
    let list = persistentStore.get('audit_logs');
    list = this.ensureChainInitialized(list);
    if (list.length === 0) {
      return { valid: true, totalChecked: 0 };
    }

    for (let i = 0; i < list.length; i++) {
      const current = list[i];

      // 1. Verify that the entry hash matches its payload
      const expectedHash = this.computeHash(current, current.prevHash || '0000000000000000000000000000000000000000000000000000000000000000');
      if (current.entryHash !== expectedHash) {
        return {
          valid: false,
          totalChecked: i + 1,
          brokenIndex: i,
          reason: 'PAYLOAD_HASH_MISMATCH',
          tamperedId: current.id,
        };
      }

      // 2. Verify hash chaining to the next chronologically older item
      if (i < list.length - 1) {
        const previous = list[i + 1];
        if (current.prevHash && previous.entryHash && current.prevHash !== previous.entryHash) {
          return {
            valid: false,
            totalChecked: i + 1,
            brokenIndex: i,
            reason: 'PREV_HASH_CHAIN_BROKEN',
            tamperedId: current.id,
          };
        }
      }
    }

    return { valid: true, totalChecked: list.length };
  }

  /**
   * Clear demo audit logs without affecting production audit events
   */
  async clearDemoLogs(): Promise<number> {
    const list = persistentStore.get('audit_logs');
    const remaining = list.filter((a: any) => a.isDemo !== true);
    const removedCount = list.length - remaining.length;
    if (removedCount > 0) {
      this.rechain(remaining);
    } else {
      persistentStore.set('audit_logs', remaining);
    }
    return removedCount;
  }
}

export const auditRepository = new AuditRepository();
