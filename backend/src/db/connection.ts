import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export interface DbHealth {
  status: 'connected' | 'operational' | 'degraded';
  dialect: 'postgresql' | 'persistent_storage';
  latencyMs: number;
  activeTables: string[];
  persistenceFile?: string;
}

// Persistent Disk Storage Path for resilient local / offline execution
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'innovateiq.db.json');

// Initialize Pool if DATABASE_URL is configured
export let pgPool: Pool | null = null;
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && !databaseUrl.includes('placeholder')) {
  try {
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost') ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pgPool.on('error', (err) => {
      console.warn('[Database] PostgreSQL background connection error:', err.message);
    });
  } catch (err: any) {
    console.warn('[Database] Failed to initialize PostgreSQL pool:', err.message);
    pgPool = null;
  }
}

// Structured Persistent Store Interface
export interface PersistentTables {
  schema_migrations: Array<{ id: number; version: string; name: string; applied_at: string }>;
  organizations: Array<any>;
  users: Array<any>;
  problems: Array<any>;
  solutions: Array<any>;
  pilots: Array<any>;
  devices: Array<any>;
  telemetry: Array<any>;
  operational_actions: Array<any>;
  decision_alerts: Array<any>;
  notifications: Array<any>;
  audit_logs: Array<any>;
  evidence: Array<any>;
  impact_kpis: Array<any>;
  feedback_loops: Array<any>;
}

class PersistentStoreManager {
  private tables: PersistentTables;
  private filePath: string;
  private initialized: boolean = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.tables = {
      schema_migrations: [],
      organizations: [],
      users: [],
      problems: [],
      solutions: [],
      pilots: [],
      devices: [],
      telemetry: [],
      operational_actions: [],
      decision_alerts: [],
      notifications: [],
      audit_logs: [],
      evidence: [],
      impact_kpis: [],
      feedback_loops: [],
    };
  }

  public init() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.tables = { ...this.tables, ...parsed };
      } else {
        this.persist();
      }
      this.initialized = true;
    } catch (err: any) {
      console.warn('[PersistentStore] Initial load warning:', err.message);
      this.initialized = true;
    }
  }

  public get<K extends keyof PersistentTables>(table: K): PersistentTables[K] {
    this.init();
    return this.tables[table] || [];
  }

  public set<K extends keyof PersistentTables>(table: K, data: PersistentTables[K]) {
    this.init();
    this.tables[table] = data;
    this.persist();
  }

  public persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${this.filePath}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.tables, null, 2), 'utf-8');
      fs.renameSync(tmpFile, this.filePath);
    } catch (err: any) {
      console.error('[PersistentStore] Disk write error:', err.message);
    }
  }

  public reset() {
    this.tables = {
      schema_migrations: [],
      organizations: [],
      users: [],
      problems: [],
      solutions: [],
      pilots: [],
      devices: [],
      telemetry: [],
      operational_actions: [],
      decision_alerts: [],
      notifications: [],
      audit_logs: [],
      evidence: [],
      impact_kpis: [],
      feedback_loops: [],
    };
    this.persist();
  }
}

export const persistentStore = new PersistentStoreManager(DB_FILE);

/**
 * Execute SQL or structured persistent query
 */
export async function query<T = any>(sqlText: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
  const startTime = Date.now();

  // 1. Try PostgreSQL if pool is available and healthy
  if (pgPool) {
    try {
      const res = await pgPool.query(sqlText, params);
      return { rows: res.rows as T[], rowCount: res.rowCount || res.rows.length };
    } catch (err: any) {
      console.warn(`[Database] PostgreSQL query error (${err.message}), evaluating fallback...`);
    }
  }

  // 2. Structured Persistent Storage Execution
  persistentStore.init();
  const lowerSql = sqlText.trim().toLowerCase();

  // Basic SQL dispatch for common repository operations
  if (lowerSql.startsWith('select')) {
    if (lowerSql.includes('from telemetry')) {
      const rows = persistentStore.get('telemetry') as unknown as T[];
      return { rows, rowCount: rows.length };
    }
    if (lowerSql.includes('from devices')) {
      const rows = persistentStore.get('devices') as unknown as T[];
      return { rows, rowCount: rows.length };
    }
    if (lowerSql.includes('from audit_logs')) {
      const rows = persistentStore.get('audit_logs') as unknown as T[];
      return { rows, rowCount: rows.length };
    }
  }

  return { rows: [], rowCount: 0 };
}

/**
 * Check database health & connectivity
 */
export async function checkDbHealth(): Promise<DbHealth> {
  const start = Date.now();
  persistentStore.init();

  const allTables = [
    'organizations',
    'users',
    'problems',
    'solutions',
    'pilots',
    'devices',
    'telemetry',
    'operational_actions',
    'decision_alerts',
    'notifications',
    'audit_logs',
    'evidence',
    'impact_kpis',
    'feedback_loops',
  ];

  if (pgPool) {
    try {
      await pgPool.query('SELECT 1');
      return {
        status: 'connected',
        dialect: 'postgresql',
        latencyMs: Date.now() - start,
        activeTables: allTables,
      };
    } catch (e) {
      // Fall through to persistent storage status
    }
  }

  return {
    status: 'operational',
    dialect: 'persistent_storage',
    latencyMs: Date.now() - start,
    activeTables: allTables,
    persistenceFile: 'data/innovateiq.db.json',
  };
}

export default {
  query,
  checkDbHealth,
  persistentStore,
  pgPool,
};
