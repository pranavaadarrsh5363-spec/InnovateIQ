import { persistentStore, query } from '../db/connection';
import { FieldDevice } from '../routes/telemetry';

export class DeviceRepository {
  /**
   * Derive real-time data-driven status based on timestamp and telemetry evaluation
   */
  deriveStatus(device: FieldDevice, latestEvaluationStatus?: 'NORMAL' | 'WARNING' | 'CRITICAL'): 'ONLINE' | 'RECENTLY_SEEN' | 'STALE' | 'OFFLINE' | 'CRITICAL' | 'WARNING' {
    if (latestEvaluationStatus === 'CRITICAL') return 'CRITICAL';
    if (latestEvaluationStatus === 'WARNING') return 'WARNING';

    if (!device.lastSeen) return 'OFFLINE';

    const lastSeenTime = new Date(device.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return 'OFFLINE';

    const elapsedMs = Date.now() - lastSeenTime;
    const fifteenMins = 15 * 60 * 1000;
    const twoHours = 2 * 60 * 60 * 1000;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (elapsedMs <= fifteenMins) return 'ONLINE';
    if (elapsedMs <= twoHours) return 'RECENTLY_SEEN';
    if (elapsedMs <= twentyFourHours) return 'STALE';
    return 'OFFLINE';
  }

  /**
   * Find all registered IoT sensor devices
   */
  async findAll(filter?: { isDemo?: boolean; pilotId?: string; organizationId?: string } | boolean): Promise<FieldDevice[]> {
    const list = persistentStore.get('devices');
    let filtered = list;

    if (typeof filter === 'boolean') {
      filtered = filtered.filter((d: any) => Boolean(d.isDemo) === filter);
    } else if (filter) {
      if (filter.isDemo !== undefined) {
        filtered = filtered.filter((d: any) => Boolean(d.isDemo) === filter.isDemo);
      }
      if (filter.pilotId) {
        filtered = filtered.filter((d: any) => d.pilotId === filter.pilotId);
      }
      if (filter.organizationId) {
        filtered = filtered.filter((d: any) => !d.organizationId || d.organizationId === filter.organizationId);
      }
    }

    // Attach dynamic derived status
    return filtered.map((d: any) => ({
      ...d,
      status: d.status === 'CRITICAL' || d.status === 'WARNING' ? d.status : this.deriveStatus(d),
    }));
  }

  /**
   * Find a specific device by deviceId
   */
  async findById(deviceId: string): Promise<FieldDevice | null> {
    const list = persistentStore.get('devices');
    const found = list.find((d: any) => d.deviceId === deviceId.trim());
    if (!found) return null;
    return {
      ...found,
      status: found.status === 'CRITICAL' || found.status === 'WARNING' ? found.status : this.deriveStatus(found),
    };
  }

  /**
   * Register a new IoT sensor device
   */
  async create(device: FieldDevice): Promise<FieldDevice> {
    const list = persistentStore.get('devices');
    const existingIndex = list.findIndex((d: any) => d.deviceId === device.deviceId.trim());

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...device };
    } else {
      list.push(device);
    }

    persistentStore.set('devices', list);

    try {
      await query(
        `INSERT INTO devices (device_id, pilot_id, name, location, sensor_types_json, hardware_model, firmware_version, status, battery_percent, signal_strength_dbm, last_seen, registered_at, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (device_id) DO UPDATE SET
           status = EXCLUDED.status,
           battery_percent = EXCLUDED.battery_percent,
           signal_strength_dbm = EXCLUDED.signal_strength_dbm,
           last_seen = EXCLUDED.last_seen`,
        [
          device.deviceId,
          device.pilotId,
          device.name,
          device.location,
          JSON.stringify(device.sensorTypes || []),
          device.hardwareModel,
          device.firmwareVersion,
          device.status,
          device.batteryPercent,
          device.signalStrengthDbm,
          device.lastSeen,
          device.registeredAt,
          (device as any).isDemo ?? false,
        ]
      );
    } catch (e) {
      // Background pg sync fallback
    }

    return device;
  }

  /**
   * Update device status and heartbeat timestamp
   */
  async updateStatus(deviceId: string, status: 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE', lastSeen: string): Promise<FieldDevice | null> {
    const list = persistentStore.get('devices');
    const found = list.find((d: any) => d.deviceId === deviceId.trim());
    if (!found) return null;

    found.status = status;
    found.lastSeen = lastSeen;
    persistentStore.set('devices', list);

    try {
      await query(
        `UPDATE devices SET status = $1, last_seen = $2 WHERE device_id = $3`,
        [status, lastSeen, deviceId.trim()]
      );
    } catch (e) {
      // Background sync fallback
    }

    return found;
  }
}

export const deviceRepository = new DeviceRepository();
