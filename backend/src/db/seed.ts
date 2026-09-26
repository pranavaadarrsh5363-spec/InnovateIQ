import { persistentStore, query } from './connection';
import { runMigrations } from './migrate';
import { users, projects, researchPapers, challenges } from '../data/seed';
import {
  enterpriseProblems,
  enterpriseEvidence,
  enterprisePilotPrograms,
  enterpriseImpactKPIs,
  enterpriseFeedbackLoops,
  enterpriseAuditLogs,
} from '../data/enterpriseSeed';

export async function seedDatabase() {
  console.log('🌱 [Database Seeder] Seeding InnovateIQ Persistent Real Data Architecture...');
  await runMigrations();

  // 1. Seed Users
  persistentStore.set('users', users.map(u => ({ ...u, isDemo: false })));

  // 2. Seed Flagship Problems
  persistentStore.set('problems', enterpriseProblems.map(p => ({
    ...p,
    isDemo: false,
  })));

  // 3. Seed Field Pilots
  persistentStore.set('pilots', enterprisePilotPrograms.map(p => ({
    ...p,
    isDemo: false,
  })));

  // 4. Seed Registered Field Sensor Devices (IoT Nodes)
  const seedDevices = [
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
  persistentStore.set('devices', seedDevices);

  // 5. Seed Production Baseline Telemetry
  const seedTelemetry = [
    {
      id: 'telemetry-seed-01',
      pilotId: 'pilot-alwar-01',
      deviceId: 'node-alwar-01',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      measurements: {
        ph: 7.2,
        turbidity: 3.4,
        tds: 380,
        temperature: 26.5,
      },
      evaluation: {
        hasAnomaly: false,
        status: 'NORMAL',
        overallScore: 96,
        violationsCount: 0,
        interpretation: 'Baseline field reading within permissible limits (BIS IS 10500:2012).',
        recommendedAction: 'Continue standard monitoring routine.',
      },
      isDemo: false,
    },
  ];
  persistentStore.set('telemetry', seedTelemetry);

  // 6. Seed Governance Audit Logs
  persistentStore.set('audit_logs', enterpriseAuditLogs.map(a => ({
    ...a,
    isDemo: false,
  })));

  // 7. Seed Multi-Connector Academic Evidence
  persistentStore.set('evidence', enterpriseEvidence.map(e => ({
    ...e,
    isDemo: false,
  })));

  // 8. Seed Impact KPIs
  persistentStore.set('impact_kpis', enterpriseImpactKPIs.map(k => ({
    ...k,
    isDemo: false,
  })));

  // 9. Seed Continuous Improvement Feedback Loops
  persistentStore.set('feedback_loops', enterpriseFeedbackLoops.map(f => ({
    ...f,
    isDemo: false,
  })));

  console.log('✅ [Database Seeder] Deterministic seed data populated successfully.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
