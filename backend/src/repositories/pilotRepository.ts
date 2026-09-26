import { persistentStore, query } from '../db/connection';
import { db } from '../data/seed';
import { PilotProgram } from '../types';

export class PilotRepository {
  /**
   * Find all pilots with filtering and pagination
   */
  async findAll(filter?: {
    status?: string;
    projectId?: string;
    problemId?: string;
    organizationId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    isDemo?: boolean;
  }): Promise<{ items: PilotProgram[]; total: number; page?: number; pageSize?: number; totalPages?: number } | PilotProgram[]> {
    const list = persistentStore.get('pilots') || [];
    let allPilots: PilotProgram[] = list;

    // Merge with in-memory seed pilots if store is freshly initialized
    if (allPilots.length === 0 && (db as any).pilotPrograms?.length > 0) {
      allPilots = [...(db as any).pilotPrograms];
      persistentStore.set('pilots', allPilots);
    }

    let filtered = allPilots;

    if (filter?.isDemo !== undefined) {
      filtered = filtered.filter((p: any) => Boolean(p.isDemoData || p.isDemo) === filter.isDemo);
    }
    if (filter?.status && filter.status !== 'All') {
      filtered = filtered.filter((p: PilotProgram) => p.status?.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter?.projectId) {
      filtered = filtered.filter((p: PilotProgram) => p.projectId === filter.projectId);
    }
    if (filter?.problemId) {
      filtered = filtered.filter((p: PilotProgram) => p.problemId === filter.problemId);
    }
    if (filter?.organizationId) {
      filtered = filtered.filter((p: PilotProgram) => (p as any).organizationId === filter.organizationId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter((p: PilotProgram) =>
        (p.name || (p as any).title)?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.organization?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Pagination
    if (filter?.page !== undefined) {
      const page = Math.max(1, filter.page || 1);
      const pageSize = Math.max(1, filter.pageSize || 25);
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { items, total, page, pageSize, totalPages };
    }

    return filtered;
  }

  /**
   * Find pilot by ID
   */
  async findById(id: string): Promise<PilotProgram | null> {
    const list = persistentStore.get('pilots') || [];
    const found = list.find((p: PilotProgram) => p.id === id);
    if (found) return found;

    const memList = (db as any).pilotPrograms || [];
    return memList.find((p: PilotProgram) => p.id === id) || null;
  }

  /**
   * Create a new pilot
   */
  async create(pilot: PilotProgram): Promise<PilotProgram> {
    const list = persistentStore.get('pilots') || [];
    list.unshift(pilot);
    persistentStore.set('pilots', list);

    if ((db as any).pilotPrograms && !(db as any).pilotPrograms.some((p: any) => p.id === pilot.id)) {
      (db as any).pilotPrograms.unshift(pilot);
    }

    try {
      await query(
        `INSERT INTO pilots (id, problem_id, name, location, partner, stage, target_completion, budget, organization_id, is_demo, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          pilot.id,
          pilot.problemId,
          pilot.name || pilot.title,
          pilot.location,
          pilot.partnerOrganization || pilot.organization,
          pilot.status,
          pilot.endDate || null,
          null,
          (pilot as any).organizationId || null,
          pilot.isDemoData ?? false,
          new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return pilot;
  }

  /**
   * Update pilot
   */
  async update(id: string, updates: Partial<PilotProgram>): Promise<PilotProgram | null> {
    const list = persistentStore.get('pilots') || [];
    const index = list.findIndex((p: PilotProgram) => p.id === id);
    if (index === -1) return null;

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    persistentStore.set('pilots', list);

    if ((db as any).pilotPrograms) {
      const memIdx = (db as any).pilotPrograms.findIndex((p: any) => p.id === id);
      if (memIdx !== -1) (db as any).pilotPrograms[memIdx] = updated;
    }

    return updated;
  }

  /**
   * Delete pilot
   */
  async delete(id: string): Promise<boolean> {
    const list = persistentStore.get('pilots') || [];
    const filtered = list.filter((p: PilotProgram) => p.id !== id);
    const deleted = list.length !== filtered.length;
    if (deleted) {
      persistentStore.set('pilots', filtered);
      if ((db as any).pilotPrograms) {
        (db as any).pilotPrograms = (db as any).pilotPrograms.filter((p: any) => p.id !== id);
      }
      try {
        await query(`DELETE FROM pilots WHERE id = $1`, [id]);
      } catch (e) {
        // PG fallback
      }
    }
    return deleted;
  }
}

export const pilotRepository = new PilotRepository();
