import { persistentStore, query } from '../db/connection';

export class ImpactRepository {
  /**
   * Find all Impact KPIs
   */
  async findAllKPIs(isDemo?: boolean): Promise<any[]> {
    const list = persistentStore.get('impact_kpis');
    if (isDemo === undefined) return list;
    return list.filter((k: any) => Boolean(k.isDemo) === isDemo);
  }

  /**
   * Update a specific Impact KPI current reading
   */
  async updateKPI(id: string, currentValue: number, verifiedDate?: string): Promise<any | null> {
    const list = persistentStore.get('impact_kpis');
    const item = list.find((k: any) => k.id === id);
    if (!item) return null;

    item.currentValue = currentValue;
    if (verifiedDate) {
      item.verifiedDate = verifiedDate;
    }
    item.updatedAt = new Date().toISOString();
    persistentStore.set('impact_kpis', list);

    try {
      await query(
        `UPDATE impact_kpis SET current_value = $1, verified_date = $2, updated_at = $3 WHERE id = $4`,
        [currentValue, verifiedDate || null, item.updatedAt, id]
      );
    } catch (e) {
      // Fallback
    }

    return item;
  }

  /**
   * Record a continuous improvement feedback loop
   */
  async createFeedbackLoop(loop: any): Promise<any> {
    const list = persistentStore.get('feedback_loops');
    const record = {
      id: loop.id || `loop-${Date.now()}`,
      ...loop,
      createdAt: loop.createdAt || new Date().toISOString(),
    };
    list.unshift(record);
    persistentStore.set('feedback_loops', list);

    try {
      await query(
        `INSERT INTO feedback_loops (id, problem_id, cycle_number, date, finding, decision, updated_target, status, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          record.id,
          record.problemId,
          record.cycleNumber,
          record.date,
          record.finding,
          record.decision,
          record.updatedTarget,
          record.status,
          record.isDemo ?? false,
        ]
      );
    } catch (e) {
      // Fallback
    }

    return record;
  }

  /**
   * Find feedback loops for a problem
   */
  async findAllFeedbackLoops(problemId?: string, isDemo?: boolean): Promise<any[]> {
    const list = persistentStore.get('feedback_loops');
    let filtered = list;
    if (problemId) {
      filtered = filtered.filter((f: any) => f.problemId === problemId);
    }
    if (isDemo !== undefined) {
      filtered = filtered.filter((f: any) => Boolean(f.isDemo) === isDemo);
    }
    return filtered;
  }
}

export const impactRepository = new ImpactRepository();
