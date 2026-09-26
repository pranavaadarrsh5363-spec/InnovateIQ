import { persistentStore, query } from '../db/connection';
import { OperationalAction } from '../types';

export class ActionRepository {
  /**
   * Find operational actions with optional filtering
   */
  async findAll(filter?: { pilotId?: string; problemId?: string; organizationId?: string; status?: string; isDemo?: boolean }): Promise<OperationalAction[]> {
    const list = persistentStore.get('operational_actions') || [];
    if (list.length === 0) {
      // Seed initial action if empty
      const defaultActions: OperationalAction[] = [
        {
          id: 'act-filter-backwash-01',
          organizationId: 'org-rajasthan-phed',
          problemId: 'prob-water-01',
          pilotId: 'pilot-alwar-01',
          alertId: 'alt-turb-spike-01',
          title: 'Field Backwash & Primary Sand-Bed Replacement at Thanagazi Well #3',
          description: 'Deploy field technicians to perform reverse flush cycle and inspect pre-filter mesh integrity following high turbidity alert.',
          assignedTo: 'u1',
          assignedToName: 'Aarav Sharma (Field Lead)',
          priority: 'HIGH',
          status: 'RESOLVED',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          resolutionNotes: 'Reverse flush executed. Media replaced with graded silica sand. Turbidity restored to 1.8 NTU.',
          isDemo: false,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      persistentStore.set('operational_actions', defaultActions);
      return defaultActions;
    }

    let filtered = list;
    if (filter?.pilotId) {
      filtered = filtered.filter((a: OperationalAction) => a.pilotId === filter.pilotId);
    }
    if (filter?.problemId) {
      filtered = filtered.filter((a: OperationalAction) => a.problemId === filter.problemId);
    }
    if (filter?.organizationId) {
      filtered = filtered.filter((a: OperationalAction) => !a.organizationId || a.organizationId === filter.organizationId);
    }
    if (filter?.status) {
      filtered = filtered.filter((a: OperationalAction) => a.status === filter.status);
    }
    if (filter?.isDemo !== undefined) {
      filtered = filtered.filter((a: OperationalAction) => Boolean(a.isDemo) === filter.isDemo);
    }

    return filtered;
  }

  /**
   * Find action by ID
   */
  async findById(id: string): Promise<OperationalAction | null> {
    const list = await this.findAll();
    return list.find((a: OperationalAction) => a.id === id) || null;
  }

  /**
   * Create a new action
   */
  async create(action: OperationalAction): Promise<OperationalAction> {
    const list = persistentStore.get('operational_actions') || [];
    list.unshift(action);
    persistentStore.set('operational_actions', list);

    try {
      await query(
        `INSERT INTO operational_actions (id, organization_id, problem_id, pilot_id, alert_id, title, description, assigned_to, assigned_to_name, priority, status, due_date, resolution_notes, is_demo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO NOTHING`,
        [
          action.id,
          action.organizationId || null,
          action.problemId || null,
          action.pilotId || null,
          action.alertId || null,
          action.title,
          action.description || null,
          action.assignedTo || null,
          action.assignedToName || null,
          action.priority || 'MEDIUM',
          action.status || 'OPEN',
          action.dueDate || null,
          action.resolutionNotes || null,
          action.isDemo ?? false,
          action.createdAt || new Date().toISOString(),
          action.updatedAt || new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return action;
  }

  /**
   * Update action status, priority, or resolution notes
   */
  async update(id: string, updates: Partial<OperationalAction>): Promise<OperationalAction | null> {
    const list = persistentStore.get('operational_actions') || [];
    const index = list.findIndex((a: OperationalAction) => a.id === id);
    if (index === -1) return null;

    const updated: OperationalAction = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    persistentStore.set('operational_actions', list);

    try {
      await query(
        `UPDATE operational_actions
         SET status = $1, resolution_notes = $2, priority = $3, updated_at = $4
         WHERE id = $5`,
        [updated.status, updated.resolutionNotes || null, updated.priority, updated.updatedAt, id]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return updated;
  }

  /**
   * Delete an action
   */
  async delete(id: string): Promise<boolean> {
    const list = persistentStore.get('operational_actions') || [];
    const filtered = list.filter((a: OperationalAction) => a.id !== id);
    if (filtered.length === list.length) return false;
    persistentStore.set('operational_actions', filtered);
    try {
      await query('DELETE FROM operational_actions WHERE id = $1', [id]);
    } catch (e) {}
    return true;
  }
}

export const actionRepository = new ActionRepository();
