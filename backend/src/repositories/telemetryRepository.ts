import { persistentStore, query } from '../db/connection';
import { RealTelemetryPacket } from '../routes/telemetry';

export interface TelemetryFilter {
  pilotId?: string;
  deviceId?: string;
  isDemo?: boolean;
  limit?: number;
}

export class TelemetryRepository {
  /**
   * Persist a new telemetry reading packet
   */
  async create(packet: RealTelemetryPacket): Promise<RealTelemetryPacket> {
    const list = persistentStore.get('telemetry');
    // Ensure packet matches persistent schema
    const record = {
      ...packet,
      createdAt: packet.timestamp || new Date().toISOString(),
    };
    list.unshift(record);

    // Keep bounded history in persistent store (e.g. 500 recent readings)
    if (list.length > 500) {
      list.pop();
    }
    persistentStore.set('telemetry', list);

    // If PostgreSQL query available, persist in background
    try {
      await query(
        `INSERT INTO telemetry (id, pilot_id, device_id, timestamp, ph, turbidity, tds, temperature, has_anomaly, anomaly_status, overall_score, violations_count, interpretation, recommended_action, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          packet.id,
          packet.pilotId,
          packet.deviceId,
          packet.timestamp,
          packet.measurements.ph,
          packet.measurements.turbidity,
          packet.measurements.tds,
          packet.measurements.temperature,
          packet.evaluation.hasAnomaly,
          packet.evaluation.status,
          packet.evaluation.overallScore,
          packet.evaluation.violationsCount,
          packet.evaluation.interpretation,
          packet.evaluation.recommendedAction,
          packet.isDemo ?? false,
        ]
      );
    } catch (err: any) {
      // Background pg sync fallback
    }

    return record;
  }

  /**
   * Find latest telemetry packet for a specific pilot program
   */
  async findLatestByPilotId(pilotId: string, isDemo?: boolean): Promise<RealTelemetryPacket | null> {
    const list = persistentStore.get('telemetry');
    const filtered = list.filter((p: any) => {
      const matchPilot = p.pilotId === pilotId;
      const matchDemo = isDemo !== undefined ? Boolean(p.isDemo) === isDemo : true;
      return matchPilot && matchDemo;
    });

    return filtered.length > 0 ? filtered[0] : null;
  }

  /**
   * Find historical time-series telemetry packets for a pilot
   */
  async findHistoryByPilotId(pilotId: string, limit: number = 20, isDemo?: boolean): Promise<RealTelemetryPacket[]> {
    const list = persistentStore.get('telemetry');
    const filtered = list.filter((p: any) => {
      const matchPilot = p.pilotId === pilotId;
      const matchDemo = isDemo !== undefined ? Boolean(p.isDemo) === isDemo : true;
      return matchPilot && matchDemo;
    });

    return filtered.slice(0, Math.min(100, Math.max(1, limit)));
  }

  /**
   * Count telemetry readings
   */
  async count(filter?: TelemetryFilter): Promise<number> {
    const list = persistentStore.get('telemetry');
    if (!filter) return list.length;
    return list.filter((p: any) => {
      if (filter.pilotId && p.pilotId !== filter.pilotId) return false;
      if (filter.deviceId && p.deviceId !== filter.deviceId) return false;
      if (filter.isDemo !== undefined && Boolean(p.isDemo) !== filter.isDemo) return false;
      return true;
    }).length;
  }

  /**
   * Clear only demo telemetry records during demo reset without touching production data
   */
  async clearDemoTelemetry(): Promise<number> {
    const list = persistentStore.get('telemetry');
    const remaining = list.filter((p: any) => p.isDemo !== true);
    const removedCount = list.length - remaining.length;
    persistentStore.set('telemetry', remaining);
    return removedCount;
  }
}

export const telemetryRepository = new TelemetryRepository();
