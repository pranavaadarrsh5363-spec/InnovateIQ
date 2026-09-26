# InnovateIQ — Production Setup & Deployment Guide

This document provides complete instructions for deploying the **InnovateIQ Platform** in production environments. InnovateIQ is an enterprise, multi-tenant innovation intelligence and empirical field telemetry verification platform designed for national ministries, universities, research institutes, and engineering cohorts.

---

## 1. System Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Client Browser / PWA   │
                          │ React + Vite + Tailwind  │
                          └─────────────┬────────────┘
                                        │ HTTPS / WSS
                                        ▼
                          ┌──────────────────────────┐
                          │  Reverse Proxy / Ingress │
                          │     (Nginx / Caddy)      │
                          └─────────────┬────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼                                             ▼
   ┌──────────────────────────┐                  ┌──────────────────────────┐
   │   InnovateIQ Backend     │                  │   Edge IoT Sensor Nodes  │
   │ Express + TypeScript API │                  │ ESP32-S3 / LoRaWAN / 4G  │
   │  (Port 5000 / Stateless) │                  └─────────────┬────────────┘
   └─────────────┬────────────┘                                │ Ingestion API
                 │                                             │ POST /api/telemetry
                 ├─────────────────────────────────────────────┘
                 │
                 ▼
   ┌───────────────────────────────────────────────────────────┐
   │                  Persistence & Storage Layer              │
   │                                                           │
   │  ┌─────────────────────────┐   ┌───────────────────────┐  │
   │  │ PostgreSQL 14+ (Primary)│   │ Resilient Local Store │  │
   │  │   (ACID Relational DB)  │   │   (Disk-Backed JSON)  │  │
   │  └─────────────────────────┘   └───────────────────────┘  │
   └───────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites & System Requirements

### Hardware Requirements
| Component | Minimum Specification | Recommended (Production) |
| :--- | :--- | :--- |
| **CPU** | 2 vCPU cores | 4+ vCPU cores |
| **RAM** | 4 GB | 8 GB - 16 GB |
| **Disk Storage** | 20 GB SSD | 100 GB+ NVMe SSD |
| **Network** | 100 Mbps uplink | 1 Gbps redundant uplink |

### Software Prerequisites
- **Node.js**: `v18.x` or `v20.x LTS`
- **npm**: `v9.x` or higher
- **PostgreSQL**: `v14.x`, `v15.x`, or `v16.x` (or managed Amazon RDS / Google Cloud SQL / Supabase)
- **Git**: `v2.30+`

---

## 3. Environment Configuration

Create a `.env` file in `backend/` and `frontend/` directories from the provided templates.

### Backend `.env` (`backend/.env`)
```bash
# Server Runtime
PORT=5000
NODE_ENV=production
LOG_LEVEL=info

# Database Connection
# Format: postgres://<user>:<password>@<host>:<port>/<dbname>?sslmode=require
DATABASE_URL=postgres://innovateiq_user:StrongPasswordHere@postgres-cluster.internal:5432/innovateiq_prod

# Authentication & Cryptography
JWT_SECRET=c38e9f8a24d77b06b2e1855e94b2a95c721e8e922c07044f54e12e0b51ad8891
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Security & CORS
CORS_ORIGIN=https://app.innovateiq.gov.in,https://innovateiq.gov.in
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000

# Edge Telemetry & Ingestion
MAX_TELEMETRY_BATCH_SIZE=100
MAX_CLOCK_SKEW_MINUTES=5
```

### Frontend `.env` (`frontend/.env`)
```bash
VITE_API_URL=https://api.innovateiq.gov.in/api
VITE_APP_NAME="InnovateIQ Platform"
VITE_ENABLE_DEMO_MODE=true
```

---

## 4. Database Setup & Migration Lifecycle

InnovateIQ includes automated schema migrations and deterministic database seeding scripts.

### Step 1: Initialize Database
```bash
# Connect to PostgreSQL and create production database
psql -U postgres -c "CREATE USER innovateiq_user WITH PASSWORD 'StrongPasswordHere';"
psql -U postgres -c "CREATE DATABASE innovateiq_prod OWNER innovateiq_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE innovateiq_prod TO innovateiq_user;"
```

### Step 2: Execute Schema Migrations
```bash
cd backend
npm run db:migrate
```
*Applies all 5 SQL migration files:*
1. `001_initial_schema.sql` (Organizations, Users, Problems, Projects, Analysis)
2. `002_evidence_and_solutions.sql` (Connectors, Evidence, Candidate Solutions, Trade-offs)
3. `003_telemetry_and_devices.sql` (Pilots, Devices, Telemetry packets, Anomaly records)
4. `004_actions_and_alerts.sql` (Decision Alerts, Action Tasks, Impact KPIs, Feedback Loops)
5. `005_audit_ledger.sql` (Cryptographic SHA-256 chained audit logs)

### Step 3: Seed Reference Catalogs (Optional for New Workspaces)
```bash
npm run db:seed
```

---

## 5. Building & Packaging

### Backend Build
```bash
cd backend
npm ci --production=false
npm run build
```
*Generates compiled JavaScript in `backend/dist/` with zero TypeScript errors.*

### Frontend Build
```bash
cd frontend
npm ci
npm run build
```
*Generates static production assets in `frontend/dist/`.*

---

## 6. Process Management with PM2

For resilient production deployment on Linux / Windows VMs:

```bash
# Install PM2 globally
npm install -g pm2

# Start Backend Cluster
cd backend
pm2 start dist/server.js --name "innovateiq-api" -i max --env production

# Serve Frontend static assets via Nginx or PM2 serve
pm2 serve ../frontend/dist 5173 --name "innovateiq-web" --spa

# Save Process List
pm2 save
pm2 startup
```

---

## 7. Nginx Production Configuration

```nginx
# /etc/nginx/sites-available/innovateiq.conf

server {
    listen 80;
    server_name app.innovateiq.gov.in api.innovateiq.gov.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.innovateiq.gov.in;

    ssl_certificate /etc/letsencrypt/live/innovateiq.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/innovateiq.gov.in/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name app.innovateiq.gov.in;

    ssl_certificate /etc/letsencrypt/live/innovateiq.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/innovateiq.gov.in/privkey.pem;

    root /var/www/innovateiq/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 8. Health Verification & Smoke Tests

Verify service health immediately after deployment:

```bash
# 1. Primary Health Check
curl -s https://api.innovateiq.gov.in/api/health | jq .

# Expected Output:
# {
#   "status": "healthy",
#   "databaseEngine": "postgresql",
#   "services": {
#     "database": "connected",
#     "telemetryIngestion": "operational",
#     "anomalyDetection": "operational",
#     "demoEngine": "operational"
#   }
# }

# 2. Kubernetes Liveness Probe
curl -s https://api.innovateiq.gov.in/health/live

# 3. Kubernetes Readiness Probe
curl -s https://api.innovateiq.gov.in/health/ready

# 4. Cryptographic Ledger Verification
curl -s -H "Authorization: Bearer <AdminJWT>" https://api.innovateiq.gov.in/api/audit/verify-chain | jq .
```
