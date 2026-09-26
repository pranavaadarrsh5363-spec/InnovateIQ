-- ====================================================================
-- InnovateIQ Enterprise Database Schema: Migration 002
-- Production Multi-Tenant Entities: Organizations, Solutions,
-- Operational Actions, Decision Alerts, Notifications & Thresholds
-- ====================================================================

-- 1. Organizations Table (Multi-Tenancy)
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'Enterprise',
  domain VARCHAR(100),
  location VARCHAR(255),
  subscription_tier VARCHAR(32) DEFAULT 'COMMUNITY',
  settings_json TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- 2. Solutions / Innovations Table
CREATE TABLE IF NOT EXISTS solutions (
  id VARCHAR(64) PRIMARY KEY,
  problem_id VARCHAR(64) NOT NULL,
  organization_id VARCHAR(64),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  technology_stack_json TEXT,
  maturity_level VARCHAR(32) DEFAULT 'TRL-4',
  feasibility_score INTEGER DEFAULT 75,
  estimated_cost_inr NUMERIC(12, 2) DEFAULT 0,
  timeline_weeks INTEGER DEFAULT 12,
  risks_json TEXT,
  created_by VARCHAR(64),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_solutions_problem ON solutions(problem_id);
CREATE INDEX IF NOT EXISTS idx_solutions_org ON solutions(organization_id);
CREATE INDEX IF NOT EXISTS idx_solutions_is_demo ON solutions(is_demo);

-- 3. Operational Actions Table (Action Management)
CREATE TABLE IF NOT EXISTS operational_actions (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64),
  problem_id VARCHAR(64),
  pilot_id VARCHAR(64),
  alert_id VARCHAR(64),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  assigned_to VARCHAR(64),
  assigned_to_name VARCHAR(255),
  priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  due_date VARCHAR(50),
  resolution_notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_actions_org ON operational_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_actions_pilot ON operational_actions(pilot_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON operational_actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_priority ON operational_actions(priority);
CREATE INDEX IF NOT EXISTS idx_actions_is_demo ON operational_actions(is_demo);

-- 4. Decision Alerts Table (AI Decision Support)
CREATE TABLE IF NOT EXISTS decision_alerts (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64),
  problem_id VARCHAR(64),
  pilot_id VARCHAR(64),
  device_id VARCHAR(64),
  type VARCHAR(64) NOT NULL DEFAULT 'ANOMALY',
  severity VARCHAR(32) NOT NULL DEFAULT 'WARNING',
  title VARCHAR(500) NOT NULL,
  interpretation TEXT NOT NULL,
  observed_data_json TEXT,
  root_cause_analysis TEXT,
  recommended_actions_json TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  acknowledged_by VARCHAR(64),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON decision_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_alerts_pilot ON decision_alerts(pilot_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON decision_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON decision_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_is_demo ON decision_alerts(is_demo);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  organization_id VARCHAR(64),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 6. Alter Telemetry table to add source and organization_id if not present
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'PHYSICAL_SENSOR';
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS recorded_by_user_id VARCHAR(64);
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS chemical_parameters_json TEXT;

-- 7. Alter Users table to add organization_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- 8. Alter Problems table to add organization_id
ALTER TABLE problems ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);
ALTER TABLE problems ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'IDENTIFIED';

-- 9. Alter Pilots table to add organization_id
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);

-- 10. Alter Devices table to add organization_id
ALTER TABLE devices ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);

-- 11. Alter Audit Logs table to add hash chaining
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS prev_hash VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entry_hash VARCHAR(64);
