import { Router, Request, Response } from 'express';
import { anomalyService } from '../services/anomalyService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { telemetryRepository } from '../repositories/telemetryRepository';
import { deviceRepository } from '../repositories/deviceRepository';
import { auditRepository } from '../repositories/auditRepository';
import { alertRepository } from '../repositories/alertRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { db } from '../data/seed';

const router = Router();

export interface RealTelemetryPacket {
  id: string;
  pilotId: string;
  deviceId: string;
  timestamp: string;
  measurements: {
    ph: number;
    turbidity: number;
    tds: number;
    temperature: number;
    [key: string]: number;
  };
  evaluation: {
    hasAnomaly: boolean;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    overallScore: number;
    violationsCount: number;
    interpretation: string;
    recommendedAction: string;
  };
  source?: 'PHYSICAL_SENSOR' | 'MANUAL_ENTRY' | 'EXTERNAL_API' | 'SIMULATION';
  organizationId?: string | null;
  recordedByUserId?: string | null;
  isDemo: boolean;
}

export interface FieldDevice {
  deviceId: string;
  pilotId: string;
  name: string;
  location: string;
  sensorTypes: string[];
  hardwareModel: string;
  firmwareVersion: string;
  status: 'ONLINE' | 'RECENTLY_SEEN' | 'STALE' | 'OFFLINE' | 'WARNING' | 'CRITICAL';
  batteryPercent: number;
  signalStrengthDbm: number;
  lastSeen: string;
  registeredAt: string;
  organizationId?: string;
  isDemo?: boolean;
}

// Initial registered devices seed if empty
const initialSeedDevices: FieldDevice[] = [
  {
    deviceId: 'node-alwar-01',
    pilotId: 'pilot-alwar-01',
    name: 'Thanagazi Gram Panchayat Well #3 Node',
    location: 'Thanagazi Tehsil, Alwar, Rajasthan (27.4011° N, 76.3214° E)',
    sensorTypes: ['Analog pH (SEN0161-V2)', 'Optical Turbidity (SEN0189)', 'TDS Conductivity Cell', 'DS18B20 Temp'],
    hardwareModel: 'ESP32-WROOM-32D Dual Core MCU + SIM800L 2G Shield',
    firmwareVersion: 'v2.1.4-production',
    status: 'ONLINE',
    batteryPercent: 94,
    signalStrengthDbm: -72,
    lastSeen: new Date().toISOString(),
    registeredAt: '2024-03-01T08:00:00Z',
    isDemo: false,
  },
  {
    deviceId: 'node-alwar-02',
    pilotId: 'pilot-alwar-01',
    name: 'Rajgarh Primary Health Center Water Point',
    location: 'Rajgarh Tehsil, Alwar, Rajasthan (27.2341° N, 76.6219° E)',
    sensorTypes: ['Analog pH (SEN0161-V2)', 'Optical Turbidity (SEN0189)', 'TDS Conductivity Cell', 'DS18B20 Temp'],
    hardwareModel: 'ESP32-WROOM-32D Dual Core MCU + SIM800L 2G Shield',
    firmwareVersion: 'v2.1.4-production',
    status: 'ONLINE',
    batteryPercent: 88,
    signalStrengthDbm: -68,
    lastSeen: new Date().toISOString(),
    registeredAt: '2024-03-05T09:30:00Z',
    isDemo: false,
  },
];

deviceRepository.findAll().then(devices => {
  if (devices.length === 0) {
    initialSeedDevices.forEach(d => deviceRepository.create(d));
  }
});

// POST /api/telemetry (Ingest Real Sensor or Manual Telemetry Packet)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { pilotId, deviceId, measurements, timestamp, source, organizationId, recordedByUserId } = req.body;

    // 1. Validate required strings
    if (!pilotId || typeof pilotId !== 'string' || pilotId.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Missing or invalid "pilotId". Must be a non-empty string identifier.',
      });
    }

    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Missing or invalid "deviceId". Must be a non-empty string identifier.',
      });
    }

    // 2. Validate measurements payload
    if (!measurements || typeof measurements !== 'object' || Array.isArray(measurements)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Missing or invalid "measurements" object. Must contain numeric key-value telemetry pairs.',
      });
    }

    const { ph, turbidity, tds, temperature } = measurements;

    if (ph === undefined && turbidity === undefined && tds === undefined && temperature === undefined) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'At least one valid sensor metric (ph, turbidity, tds, temperature) must be supplied in measurements.',
      });
    }

    // 3. Strict physical bounds validation
    if (ph !== undefined) {
      if (typeof ph !== 'number' || isNaN(ph) || ph < 0 || ph > 14) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Invalid measurement for 'ph': ${ph}. Must be a valid number between 0.0 and 14.0.`,
        });
      }
    }

    if (turbidity !== undefined) {
      if (typeof turbidity !== 'number' || isNaN(turbidity) || turbidity < 0 || turbidity > 2000) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Invalid measurement for 'turbidity': ${turbidity}. Must be a non-negative number <= 2000 NTU.`,
        });
      }
    }

    if (tds !== undefined) {
      if (typeof tds !== 'number' || isNaN(tds) || tds < 0 || tds > 10000) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Invalid measurement for 'tds': ${tds}. Must be a non-negative number <= 10000 ppm.`,
        });
      }
    }

    if (temperature !== undefined) {
      if (typeof temperature !== 'number' || isNaN(temperature) || temperature < -30 || temperature > 90) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Invalid measurement for 'temperature': ${temperature}. Must be between -30°C and 90°C.`,
        });
      }
    }

    // 4. Validate timestamp format and prevent future timestamps (> 5 mins ahead)
    let finalTimestamp = new Date().toISOString();
    if (timestamp) {
      const parsedDate = new Date(timestamp);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Invalid 'timestamp' format: ${timestamp}. Must be a valid ISO-8601 date string.`,
        });
      }
      if (parsedDate.getTime() > Date.now() + 5 * 60 * 1000) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Timestamp cannot be in the future.',
        });
      }
      finalTimestamp = parsedDate.toISOString();
    }

    // 5. Source categorization
    const allowedSources = ['PHYSICAL_SENSOR', 'MANUAL_ENTRY', 'EXTERNAL_API', 'SIMULATION'];
    const packetSource = allowedSources.includes(source) ? source : 'PHYSICAL_SENSOR';

    // 6. Run Server-Side Anomaly Detection Service (BIS IS 10500:2012)
    const evaluation = anomalyService.evaluate(measurements);

    const packet: RealTelemetryPacket = {
      id: `packet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pilotId: pilotId.trim(),
      deviceId: deviceId.trim(),
      timestamp: finalTimestamp,
      measurements: {
        ph: ph ?? 7.0,
        turbidity: turbidity ?? 2.0,
        tds: tds ?? 350,
        temperature: temperature ?? 25.0,
      },
      evaluation: {
        hasAnomaly: evaluation.hasAnomaly,
        status: evaluation.status,
        overallScore: evaluation.overallScore,
        violationsCount: evaluation.violations.length,
        interpretation: evaluation.interpretation,
        recommendedAction: evaluation.recommendedAction,
      },
      source: packetSource,
      organizationId: organizationId || null,
      recordedByUserId: recordedByUserId || null,
      isDemo: false,
    };

    // Persist Telemetry Record via Repository
    await telemetryRepository.create(packet);

    // Update Device Status in Registry
    const newStatus = evaluation.status === 'CRITICAL' ? 'CRITICAL' : evaluation.status === 'WARNING' ? 'WARNING' : 'ONLINE';
    await deviceRepository.updateStatus(deviceId.trim(), newStatus, finalTimestamp);

    // 7. Record System Audit Entry and Trigger Decision Alert if threshold is violated
    if (evaluation.status === 'CRITICAL' || evaluation.status === 'WARNING') {
      const alertId = `alert-${Date.now()}`;
      await alertRepository.create({
        id: alertId,
        organizationId: organizationId || 'org-rajasthan-phed',
        problemId: 'prob-water-01',
        pilotId: pilotId.trim(),
        deviceId: deviceId.trim(),
        type: 'THRESHOLD_BREACH',
        severity: evaluation.status,
        title: `Field Sensor Alert: ${evaluation.violations.map(v => v.metric).join(', ')} Threshold Breach`,
        interpretation: evaluation.interpretation,
        observedData: packet.measurements,
        rootCauseAnalysis: evaluation.status === 'CRITICAL' ? 'Probable aquifer contamination or filter saturation requiring immediate operational flush.' : 'Minor deviation observed beyond optimal potable range.',
        recommendedActions: [evaluation.recommendedAction, 'Deploy field inspection team', 'Cross-verify with secondary sampling'],
        status: 'ACTIVE',
        isDemo: false,
        createdAt: finalTimestamp,
      });

      // Send System Notification
      await notificationRepository.create({
        id: `notif-${Date.now()}`,
        userId: 'all',
        organizationId: organizationId || undefined,
        title: `[ALERT] ${evaluation.status} Water Anomaly on ${deviceId.trim()}`,
        message: evaluation.interpretation,
        type: 'ALERT',
        link: `/pilots`,
        read: false,
        createdAt: finalTimestamp,
      });

      const auditLog = {
        id: `audit-prod-${Date.now()}`,
        userId: recordedByUserId || 'iot-telemetry-gateway',
        userName: recordedByUserId ? 'Field Officer (Manual)' : `Device ${deviceId.trim()}`,
        userRole: recordedByUserId ? 'student' : 'system',
        action: '[PRODUCTION] SENSOR_THRESHOLD_VIOLATION',
        timestamp: finalTimestamp,
        entityType: 'Pilot',
        entityId: pilotId.trim(),
        organizationId: organizationId || undefined,
        details: `[REAL TELEMETRY ALERT] ${evaluation.status} anomaly detected on ${deviceId.trim()} (source: ${packetSource}): ${evaluation.violations.map(v => `${v.metric}=${v.observed} (Limit: ${v.threshold})`).join(', ')}`,
        isDemo: false,
      };
      await auditRepository.create(auditLog);
      (db as any).auditLogs.unshift(auditLog);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Telemetry ingested and evaluated successfully',
      data: packet,
      violations: evaluation.violations,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', message: err.message || 'Failed to ingest telemetry' });
  }
});

// GET /api/telemetry/latest/:pilotId
router.get('/latest/:pilotId', async (req: Request, res: Response) => {
  const { pilotId } = req.params;
  const latest = await telemetryRepository.findLatestByPilotId(pilotId, false);
  if (!latest) {
    return res.status(404).json({ message: `No telemetry packets found for pilot: ${pilotId}` });
  }
  return res.json({ status: 'success', data: latest });
});

// GET /api/telemetry/history/:pilotId
router.get('/history/:pilotId', async (req: Request, res: Response) => {
  const { pilotId } = req.params;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const history = await telemetryRepository.findHistoryByPilotId(pilotId, limit, false);
  return res.json({
    status: 'success',
    count: history.length,
    data: history,
    isDemo: false,
  });
});

// GET /api/telemetry/devices (List Devices with Live Derived Statuses)
router.get('/devices', async (req: Request, res: Response) => {
  const { pilotId, organizationId } = req.query;
  const devices = await deviceRepository.findAll({
    pilotId: pilotId as string,
    organizationId: organizationId as string,
    isDemo: false,
  });
  return res.json({
    status: 'success',
    count: devices.length,
    data: devices,
    isDemo: false,
  });
});

// POST /api/telemetry/devices (Register a New Field Sensor Node)
router.post('/devices', async (req: Request, res: Response) => {
  const { deviceId, pilotId, organizationId, name, location, sensorTypes, hardwareModel, firmwareVersion } = req.body;

  if (!deviceId || !pilotId || !name) {
    return res.status(400).json({ message: 'deviceId, pilotId, and name are required to register a field node' });
  }

  const existing = await deviceRepository.findById(deviceId.trim());
  if (existing) {
    return res.status(409).json({ message: `Device with ID ${deviceId} is already registered` });
  }

  const newDevice: FieldDevice = {
    deviceId: deviceId.trim(),
    pilotId: pilotId.trim(),
    name: name.trim(),
    location: location || 'Field Testbed Location',
    sensorTypes: Array.isArray(sensorTypes) ? sensorTypes : ['Standard Potability Sensors'],
    hardwareModel: hardwareModel || 'ESP32 IoT Node',
    firmwareVersion: firmwareVersion || 'v1.0.0',
    status: 'ONLINE',
    batteryPercent: 100,
    signalStrengthDbm: -65,
    lastSeen: new Date().toISOString(),
    registeredAt: new Date().toISOString(),
    organizationId: organizationId || undefined,
    isDemo: false,
  };

  await deviceRepository.create(newDevice);

  // Record audit log
  await auditRepository.create({
    id: `audit-dev-${Date.now()}`,
    userId: 'admin',
    userName: 'Device Provisioner',
    userRole: 'admin',
    action: 'DEVICE_REGISTERED',
    timestamp: new Date().toISOString(),
    entityType: 'Device',
    entityId: newDevice.deviceId,
    organizationId: newDevice.organizationId,
    details: `Registered IoT field node ${newDevice.deviceId} ("${newDevice.name}") for pilot ${newDevice.pilotId}`,
  });

  return res.status(201).json({ status: 'success', data: newDevice });
});

// GET /api/telemetry/thresholds (Get BIS IS 10500 Quality Thresholds)
router.get('/thresholds', (_req: Request, res: Response) => {
  return res.json({
    status: 'success',
    regulatoryStandard: 'BIS IS 10500:2012 Drinking Water Specification',
    data: anomalyService.getThresholds(),
  });
});

// PUT /api/telemetry/thresholds (Update Threshold Configuration - Admin/Mentor Protected)
router.put('/thresholds', authenticateToken, requireRole('admin', 'mentor'), (req: Request, res: Response) => {
  try {
    const updated = anomalyService.updateThresholds(req.body);
    return res.json({
      status: 'success',
      message: 'Threshold configuration updated successfully',
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid threshold configuration format' });
  }
});

export default router;
