-- ====================================================================
-- InnovateIQ Enterprise Database Schema: Migration 001
-- PostgreSQL Standard DDL with Multi-Index Optimization
-- ====================================================================

-- 1. Schema Migrations Ledger
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  avatar TEXT,
  profile_json TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Problems Table
CREATE TABLE IF NOT EXISTS problems (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  domain VARCHAR(100) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  target_population VARCHAR(255),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON problems(domain);
CREATE INDEX IF NOT EXISTS idx_problems_is_demo ON problems(is_demo);

-- 4. Pilots Table
CREATE TABLE IF NOT EXISTS pilots (
  id VARCHAR(64) PRIMARY KEY,
  problem_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  partner VARCHAR(255),
  stage VARCHAR(50) NOT NULL,
  target_completion VARCHAR(50),
  budget VARCHAR(50),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pilots_problem_id ON pilots(problem_id);
CREATE INDEX IF NOT EXISTS idx_pilots_is_demo ON pilots(is_demo);

-- 5. Field Devices Table (IoT Nodes)
CREATE TABLE IF NOT EXISTS devices (
  device_id VARCHAR(64) PRIMARY KEY,
  pilot_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  sensor_types_json TEXT,
  hardware_model VARCHAR(255),
  firmware_version VARCHAR(50),
  status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
  battery_percent INTEGER DEFAULT 100,
  signal_strength_dbm INTEGER DEFAULT -70,
  last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_demo BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_devices_pilot_id ON devices(pilot_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_is_demo ON devices(is_demo);

-- 6. Telemetry Readings Table (IoT Time-Series Data)
CREATE TABLE IF NOT EXISTS telemetry (
  id VARCHAR(64) PRIMARY KEY,
  pilot_id VARCHAR(64) NOT NULL,
  device_id VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  ph NUMERIC(5, 2),
  turbidity NUMERIC(7, 2),
  tds NUMERIC(8, 2),
  temperature NUMERIC(5, 2),
  has_anomaly BOOLEAN DEFAULT FALSE,
  anomaly_status VARCHAR(32) DEFAULT 'NORMAL',
  overall_score INTEGER DEFAULT 100,
  violations_count INTEGER DEFAULT 0,
  interpretation TEXT,
  recommended_action TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_telemetry_pilot_id ON telemetry(pilot_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_id ON telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_is_demo ON telemetry(is_demo);
CREATE INDEX IF NOT EXISTS idx_telemetry_pilot_time ON telemetry(pilot_id, timestamp DESC);

-- 7. Audit Logs Table (Tamper-Evident Governance Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  user_name VARCHAR(255),
  user_role VARCHAR(32),
  action VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  entity_type VARCHAR(64),
  entity_id VARCHAR(64),
  details TEXT,
  is_demo BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_is_demo ON audit_logs(is_demo);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 8. Evidence Metadata Table
CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  source_name VARCHAR(255),
  source_type VARCHAR(64),
  domain VARCHAR(100),
  published_date VARCHAR(50),
  source_url TEXT,
  quality_score_json TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_evidence_domain ON evidence(domain);
CREATE INDEX IF NOT EXISTS idx_evidence_is_demo ON evidence(is_demo);

-- 9. Impact KPIs Table
CREATE TABLE IF NOT EXISTS impact_kpis (
  id VARCHAR(64) PRIMARY KEY,
  problem_id VARCHAR(64),
  pilot_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  baseline_value NUMERIC(10, 2),
  target_value NUMERIC(10, 2),
  current_value NUMERIC(10, 2),
  unit VARCHAR(50),
  is_demo BOOLEAN DEFAULT FALSE,
  verified_date VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_impact_kpis_problem ON impact_kpis(problem_id);
CREATE INDEX IF NOT EXISTS idx_impact_kpis_is_demo ON impact_kpis(is_demo);

-- 10. Feedback Loops Table (Continuous Improvement)
CREATE TABLE IF NOT EXISTS feedback_loops (
  id VARCHAR(64) PRIMARY KEY,
  problem_id VARCHAR(64) NOT NULL,
  cycle_number INTEGER NOT NULL,
  date VARCHAR(50) NOT NULL,
  finding TEXT NOT NULL,
  decision TEXT NOT NULL,
  updated_target TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_feedback_loops_problem ON feedback_loops(problem_id);
CREATE INDEX IF NOT EXISTS idx_feedback_loops_is_demo ON feedback_loops(is_demo);
