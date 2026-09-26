import { persistentStore, query } from '../db/connection';
import { Solution } from '../types';

export class SolutionRepository {
  /**
   * Find solutions with optional filtering
   */
  async findAll(filter?: { problemId?: string; organizationId?: string; isDemo?: boolean }): Promise<Solution[]> {
    const list = persistentStore.get('solutions') || [];
    if (list.length === 0) {
      // Seed default candidate solutions if empty
      const defaultSolutions: Solution[] = [
        {
          id: 'sol-edge-opt-01',
          problemId: 'prob-water-01',
          organizationId: 'org-iit-delhi',
          title: 'Solar-Powered Multi-Wavelength Optical Turbidity & Conductivity Edge Node',
          description: 'Deployable low-cost edge unit using optical nephelometry and 4-electrode conductivity cell with local anomaly screening via TinyML.',
          technologyStack: ['ESP32-S3', 'TinyML', 'FreeRTOS', '4G-LTE Cat-M1', 'Solar MPPT'],
          maturityLevel: 'TRL-6',
          feasibilityScore: 92,
          estimatedCostInr: 4500,
          timelineWeeks: 8,
          risks: [
            { risk: 'Bio-fouling on optical sensor windows', severity: 'Medium', mitigation: 'Periodic ultrasonic vibration self-cleaning cycle' },
            { risk: 'Monsoon cloud cover impacting battery', severity: 'Low', mitigation: '7-day LiFePO4 battery reserve design' },
          ],
          createdBy: 'u1',
          isDemo: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sol-lora-dist-02',
          problemId: 'prob-water-01',
          organizationId: 'org-iit-delhi',
          title: 'Community Mesh LoRaWAN Sensor Network with Gateway Uplink',
          description: 'Distributed sensor cluster reporting to centralized village panchayat gateway to minimize GSM SIM costs across multiple handpumps.',
          technologyStack: ['SX1262 LoRa', 'Raspberry Pi Gateway', 'MQTT', 'InfluxDB'],
          maturityLevel: 'TRL-5',
          feasibilityScore: 84,
          estimatedCostInr: 8200,
          timelineWeeks: 12,
          risks: [
            { risk: 'Line of sight obstruction by village terrain', severity: 'Medium', mitigation: 'Elevated directional yagi antenna on water tower' },
          ],
          createdBy: 'u1',
          isDemo: false,
          createdAt: new Date().toISOString(),
        },
      ];
      persistentStore.set('solutions', defaultSolutions);
      return defaultSolutions;
    }

    let filtered = list;
    if (filter?.problemId) {
      filtered = filtered.filter((s: Solution) => s.problemId === filter.problemId);
    }
    if (filter?.organizationId) {
      filtered = filtered.filter((s: Solution) => !s.organizationId || s.organizationId === filter.organizationId);
    }
    if (filter?.isDemo !== undefined) {
      filtered = filtered.filter((s: Solution) => Boolean(s.isDemo) === filter.isDemo);
    }

    return filtered;
  }

  /**
   * Find solution by ID
   */
  async findById(id: string): Promise<Solution | null> {
    const list = await this.findAll();
    return list.find((s: Solution) => s.id === id) || null;
  }

  /**
   * Create a new solution
   */
  async create(sol: Solution): Promise<Solution> {
    const list = persistentStore.get('solutions') || [];
    list.unshift(sol);
    persistentStore.set('solutions', list);

    try {
      await query(
        `INSERT INTO solutions (id, problem_id, organization_id, title, description, technology_stack_json, maturity_level, feasibility_score, estimated_cost_inr, timeline_weeks, risks_json, created_by, is_demo, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [
          sol.id,
          sol.problemId,
          sol.organizationId || null,
          sol.title,
          sol.description,
          JSON.stringify(sol.technologyStack || []),
          sol.maturityLevel || 'TRL-4',
          sol.feasibilityScore || 75,
          sol.estimatedCostInr || 0,
          sol.timelineWeeks || 12,
          JSON.stringify(sol.risks || []),
          sol.createdBy || null,
          sol.isDemo ?? false,
          sol.createdAt || new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return sol;
  }

  /**
   * Update solution details
   */
  async update(id: string, updates: Partial<Solution>): Promise<Solution | null> {
    const list = persistentStore.get('solutions') || [];
    const index = list.findIndex((s: Solution) => s.id === id);
    if (index === -1) return null;

    const updated: Solution = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    persistentStore.set('solutions', list);

    try {
      await query(
        `UPDATE solutions
         SET title = $1, description = $2, maturity_level = $3, feasibility_score = $4, estimated_cost_inr = $5, timeline_weeks = $6
         WHERE id = $7`,
        [updated.title, updated.description, updated.maturityLevel, updated.feasibilityScore, updated.estimatedCostInr, updated.timelineWeeks, id]
      );
    } catch (e) {}

    return updated;
  }

  /**
   * Delete solution
   */
  async delete(id: string): Promise<boolean> {
    const list = persistentStore.get('solutions') || [];
    const filtered = list.filter((s: Solution) => s.id !== id);
    if (filtered.length === list.length) return false;
    persistentStore.set('solutions', filtered);
    try {
      await query('DELETE FROM solutions WHERE id = $1', [id]);
    } catch (e) {}
    return true;
  }
}

export const solutionRepository = new SolutionRepository();
