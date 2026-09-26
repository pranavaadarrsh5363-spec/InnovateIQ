import { persistentStore, query } from '../db/connection';
import { DecisionAlert } from '../types';

export class AlertRepository {
  /**
   * Find alerts with optional filtering
   */
  async findAll(filter?: { pilotId?: string; problemId?: string; organizationId?: string; status?: string; isDemo?: boolean }): Promise<DecisionAlert[]> {
    const list = persistentStore.get('decision_alerts') || [];
    let filtered = list;

    if (filter?.pilotId) {
      filtered = filtered.filter((a: DecisionAlert) => a.pilotId === filter.pilotId);
    }
    if (filter?.problemId) {
      filtered = filtered.filter((a: DecisionAlert) => a.problemId === filter.problemId);
    }
    if (filter?.organizationId) {
      filtered = filtered.filter((a: DecisionAlert) => !a.organizationId || a.organizationId === filter.organizationId);
    }
    if (filter?.status) {
      filtered = filtered.filter((a: DecisionAlert) => a.status === filter.status);
    }
    if (filter?.isDemo !== undefined) {
      filtered = filtered.filter((a: DecisionAlert) => Boolean(a.isDemo) === filter.isDemo);
    }

    return filtered;
  }

  /**
   * Find alert by ID
   */
  async findById(id: string): Promise<DecisionAlert | null> {
    const list = persistentStore.get('decision_alerts') || [];
    return list.find((a: DecisionAlert) => a.id === id) || null;
  }

  /**
   * Create a new alert
   */
  async create(alert: DecisionAlert): Promise<DecisionAlert> {
    const list = persistentStore.get('decision_alerts') || [];
    list.unshift(alert);
    persistentStore.set('decision_alerts', list);

    try {
      await query(
        `INSERT INTO decision_alerts (id, organization_id, problem_id, pilot_id, device_id, type, severity, title, interpretation, observed_data_json, root_cause_analysis, recommended_actions_json, status, is_demo, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          alert.id,
          alert.organizationId || null,
          alert.problemId || null,
          alert.pilotId || null,
          alert.deviceId || null,
          alert.type || 'ANOMALY',
          alert.severity || 'WARNING',
          alert.title,
          alert.interpretation,
          JSON.stringify(alert.observedData || {}),
          alert.rootCauseAnalysis || null,
          JSON.stringify(alert.recommendedActions || []),
          alert.status || 'ACTIVE',
          alert.isDemo ?? false,
          alert.createdAt || new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return alert;
  }

  /**
   * Update alert status (e.g. acknowledge or resolve)
   */
  async update(id: string, updates: Partial<DecisionAlert>): Promise<DecisionAlert | null> {
    const list = persistentStore.get('decision_alerts') || [];
    const index = list.findIndex((a: DecisionAlert) => a.id === id);
    if (index === -1) return null;

    const updated: DecisionAlert = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    persistentStore.set('decision_alerts', list);

    try {
      await query(
        `UPDATE decision_alerts
         SET status = $1, acknowledged_by = $2, acknowledged_at = $3, resolved_at = $4
         WHERE id = $5`,
        [updated.status, updated.acknowledgedBy || null, updated.acknowledgedAt || null, updated.resolvedAt || null, id]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return updated;
  }
}

export const alertRepository = new AlertRepository();
