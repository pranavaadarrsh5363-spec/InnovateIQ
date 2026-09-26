# 🛠️ InnovateIQ Troubleshooting & Diagnostic Guide

This guide provides actionable, project-specific solutions for diagnosing and resolving common runtime issues during local development, deployment, or live evaluation.

---

## 🔍 1. Port Already in Use (`EADDRINUSE: 5000` or `5173`)

### Problem
Starting the backend or frontend fails with `Error: listen EADDRINUSE: address already in use :::5000`.

### Solution (Windows PowerShell)
```powershell
# 1. Find the process using port 5000
netstat -ano | findstr :5000

# 2. Terminate the process by PID (replace <PID> with the actual number from the right column)
taskkill /F /PID <PID>
```

### Solution (Linux / macOS)
```bash
lsof -ti :5000 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```

---

## 🗄️ 2. Database Connection or Migration Issues

### Problem: PostgreSQL is not running locally
- **Behavior:** The backend logs `[Database] Failed to initialize PostgreSQL pool: ...` but continues running.
- **Explanation:** InnovateIQ is designed with a resilient local persistence fallback. When `DATABASE_URL` is omitted or PostgreSQL is unreachable, the system automatically falls back to atomic local storage in `backend/data/innovateiq.db.json`. All APIs, repositories, and tests remain 100% operational.
- **Resolution:** If you intend to connect to a live PostgreSQL instance, verify `DATABASE_URL` in `backend/.env`:
  ```env
  DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/innovateiq
  ```

### Problem: Resetting corrupted database state
To cleanly wipe and re-seed the persistent state:
```bash
cd backend
npm run db:reset
```

---

## 🔑 3. Authentication & Session Expiry

### Problem: API returns `401 Unauthorized` or `403 Forbidden`
- **Cause:** JWT token is missing, expired, or the user's role lacks permissions for the target endpoint.
- **Resolution:**
  1. Re-authenticate via `POST /api/auth/login` to obtain a fresh token.
  2. For Admin-only operations (such as viewing the full audit ledger or modifying regulatory thresholds), log in with `admin@sih.dev` / `demo123`.
  3. Verify `JWT_SECRET` in `backend/.env` has not changed between server restarts.

### Pre-Seeded Working Personas
| Role | Email | Password | Allowed Sensitive Operations |
| :--- | :--- | :--- | :--- |
| **Student** | `aarav@sih.dev` | `demo123` | Innovation project creation, evidence search |
| **Mentor** | `mentor@sih.dev` | `demo123` | Threshold reading, feedback logging |
| **Admin** | `admin@sih.dev` | `demo123` | Full audit ledger access, threshold updates |

---

## 📡 4. Telemetry Ingestion Errors (`400 Bad Request`)

### Problem: `POST /api/telemetry` returns validation error
- **Cause:** Telemetry readings violate server-side physical bounds or miss mandatory identifiers.
- **Resolution:** Ensure the payload adheres to strict range bounds:
  - `ph`: Float between `0.0` and `14.0`
  - `turbidity`: Non-negative float $\le 2000.0\text{ NTU}$
  - `tds`: Non-negative float $\le 10000.0\text{ ppm}$
  - `temperature`: Float between `-30.0^\circ\text{C}` and `90.0^\circ\text{C}`
  - `deviceId` and `pilotId`: Non-empty string identifiers.

---

## ⚖️ 5. Demo State Reset & Repeatability

### Problem: Demo appears stuck or shows previous evaluation state
- **Resolution:** Reset the simulation cleanly:
  ```bash
  curl -X POST http://localhost:5000/api/demo/reset
  ```
  Or click **"Reset Demo"** on the floating Judge Demo Control Panel in the UI.

---

## 🌐 6. CORS Policy Errors

### Problem: Browser displays `Origin http://localhost:5173 not allowed by CORS`
- **Resolution:** Add your frontend URL to the `FRONTEND_URL` environment variable in `backend/.env`:
  ```env
  FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://innovate-iq-liard.vercel.app
  ```

---

## 🩺 7. Health & Diagnostic Endpoints

To check live status of all subsystems:
- **General Health:** `http://localhost:5000/api/health`
- **Liveness Probe:** `http://localhost:5000/health/live`
- **Readiness Probe:** `http://localhost:5000/health/ready`
- **Demo Pre-Flight:** `http://localhost:5000/api/demo/readiness`
