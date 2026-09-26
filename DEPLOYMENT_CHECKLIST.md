# 🚀 InnovateIQ Production Deployment Checklist

This document provides a step-by-step verification protocol for deploying the InnovateIQ platform to production environments (Vercel, Render, Railway, AWS ECS, Docker, etc.) and preparing for Smart India Hackathon (SIH) live evaluation.

---

## 📋 1. Environment & Configuration Checklist

- [ ] **Node.js Runtime:** Ensure Node.js $\ge$ v18.0.0 and npm $\ge$ v9.0.0 are installed.
- [ ] **Environment File (.env):** Create `backend/.env` from `backend/.env.example`.
- [ ] **JWT Secret:** Generate a cryptographically secure key:
  ```bash
  openssl rand -base64 32
  ```
- [ ] **CORS Configuration:** Ensure `FRONTEND_URL` in `backend/.env` points to the exact deployed frontend domain (e.g., `https://innovate-iq-liard.vercel.app`).
- [ ] **Production Flags:** Set `NODE_ENV=production`.
- [ ] **No Committed Secrets:** Verify `.env` is listed in `.gitignore` and no private credentials exist in client bundles.

---

## 🗄️ 2. Database & Data Architecture Checklist

- [ ] **Database Connection:** Set `DATABASE_URL` for PostgreSQL instance (Supabase, Neon, AWS RDS, Render PostgreSQL).
  *Note: If `DATABASE_URL` is omitted, InnovateIQ will automatically operate on its resilient local disk storage adapter.*
- [ ] **Run Database Migrations:**
  ```bash
  cd backend
  npm run db:migrate
  ```
- [ ] **Populate Seed Data:**
  ```bash
  npm run db:seed
  ```
- [ ] **Fresh Demo Environment (Optional Reset):**
  ```bash
  npm run db:reset
  ```

---

## 🏗️ 3. Build & Artifact Verification

- [ ] **Backend Build:**
  ```bash
  cd backend
  npm run build
  ```
  *Verify: TypeScript `tsc` exits with 0 errors and creates `dist/index.js`.*
- [ ] **Frontend Production Build:**
  ```bash
  cd frontend
  npm run build
  ```
  *Verify: Vite produces optimized production assets in `frontend/dist` with 0 TypeScript/Rollup errors.*

---

## 🩺 4. Health, Observability & Readiness Validation

- [ ] **General Health Check:**
  ```http
  GET /health
  GET /api/health
  ```
  *Expected: HTTP 200 with `status: "healthy"`, database status, environment, and uptime.*
- [ ] **Liveness Probe (Kubernetes / Docker):**
  ```http
  GET /health/live
  ```
  *Expected: HTTP 200 with `status: "alive"`.*
- [ ] **Readiness Probe (Load Balancers):**
  ```http
  GET /health/ready
  ```
  *Expected: HTTP 200 with `status: "ready"`.*
- [ ] **SIH Judge Demo Pre-Flight:**
  ```http
  GET /api/demo/readiness
  ```
  *Expected: HTTP 200 with `status: "READY"` and all subsystem checks true.*
- [ ] **Correlation Tracking:** Confirm response headers contain `X-Request-ID`.
- [ ] **Security Headers:** Verify `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin` are attached.

---

## 🧪 5. Automated Verification & Smoke Testing

- [ ] **Run Complete Test Suite:**
  ```bash
  cd backend
  npm test
  ```
  *Verify: All 86 automated test assertions pass with 0 failures.*
- [ ] **Verify Production Data Isolation:** Confirm that calling `POST /api/demo/reset` clears only `isDemo: true` records without modifying production telemetry (`isDemo: false`) or registered field nodes.

---

## 🔄 6. Backup, Recovery & Rollback Protocol

1. **PostgreSQL Automated Snapshots:** Enable daily automatic backups on the managed database provider (Supabase / Render / AWS).
2. **Manual Schema Dump (Pre-Release):**
   ```bash
   pg_dump -U username -h hostname -d innovateiq > backup_$(date +%Y%m%d).sql
   ```
3. **Rollback Procedure:**
   - Revert deployment to previous Git release tag / Docker digest.
   - If database schema was modified, restore snapshot or apply reverse DDL.
