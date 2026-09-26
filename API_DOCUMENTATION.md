# InnovateIQ REST API Documentation

**Version:** `2.0.0 (Enterprise Multi-Tenant & Real-World Data Layer)`  
**Base URL:** `http://localhost:5000/api` (or custom environment `PORT`)  
**Specification:** RESTful JSON API with JWT Bearer Token Authentication, SHA-256 Hash Chaining & Multi-Tenant Data Layer  

---

## 1. Architectural Overview & Design Philosophy

InnovateIQ provides an enterprise-grade RESTful API designed to power real-world innovation lifecycle tracking—from multi-tenant organization problems and academic evidence synthesis to candidate solution trade-off matrices, IoT field pilots, automated anomaly detection, operational action dispatch, and mathematically verified community impact.

### Key Architectural Tenets
1. **Multi-Tenant SaaS Isolation (`organizationId` & `isDemo` Isolation):**
   - **Multi-Tenant Production Data (`isDemo: false`):** Organization-scoped entities (`problems`, `solutions`, `pilots`, `devices`, `telemetry`, `actions`, `alerts`) persist across database resets and are strictly scoped by tenant.
   - **Judge Evaluation Demo Mode (`isDemo: true`):** A self-contained 14-stage guided simulation designed for hackathon judges and evaluators without polluting production ledgers. Resetting the demo only purges `isDemo: true` records.
2. **Deterministic Role-Based Access Control (RBAC):**
   - JWT tokens encode `id`, `name`, `email`, `role` (`student`, `mentor`, `admin`), and `organizationId`.
   - Granular middleware gates sensitive operations (e.g., audit log queries, organization creation, and regulatory threshold adjustments).
3. **Cryptographic SHA-256 Tamper-Evident Ledger:**
   - Every audit log entry computes a cryptographic SHA-256 signature chaining `prevHash + timestamp + actor + action + payload` into `entryHash`.
   - The entire ledger chain can be verified end-to-end via `GET /api/audit/verify-chain`.
4. **Traceable Dynamic Impact Calculation:**
   - Real-world impact is dynamically calculated via `GET /api/impact/calculate/:pilotId` by reading actual historical telemetry points.
   - If fewer than 3 points exist, it returns `status: "INSUFFICIENT_DATA"`. When $\ge 3$ points exist, it computes exact mathematical delta ($(\text{current} - \text{baseline}) / \text{baseline} \times 100$) and statistical confidence score.

---

## 2. Authentication & Authorization

All authenticated endpoints require an `Authorization` header formatted as:
```http
Authorization: Bearer <jwt_token>
```

### 2.1 User Login
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "aarav@sih.dev",
  "password": "demo123"
}
```
* **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u1",
    "name": "Aarav Sharma",
    "email": "aarav@sih.dev",
    "role": "student",
    "skills": ["Python", "Machine Learning", "IoT", "TensorFlow"],
    "college": "IIT Delhi"
  }
}
```

### 2.2 Pre-Seeded Evaluation Personas
| Role | Email | Password | Permissions & Use Case |
| :--- | :--- | :--- | :--- |
| **Student** | `aarav@sih.dev` | `demo123` | Problem publishing, candidate solution submission, pilot tracking, manual telemetry |
| **Mentor** | `mentor@sih.dev` | `demo123` | Solution evaluation, pilot feedback, operational action assignment |
| **Admin** | `admin@sih.dev` | `demo123` | Organization provisioning, full audit ledger, regulatory threshold management |

---

## 3. Multi-Tenant Organizations API

### 3.1 Create Organization
* **Endpoint:** `POST /api/organizations`
* **Access:** Restricted to `admin`
* **Request Body:**
```json
{
  "name": "Tamil Nadu Water Supply and Drainage Board (TWAD)",
  "type": "Government",
  "domain": "Rural Aquifer Monitoring",
  "location": "Chennai, Tamil Nadu",
  "subscriptionTier": "ENTERPRISE",
  "contactEmail": "nodal@twadboard.gov.in",
  "description": "State statutory body implementing piped water and rural desalination schemes."
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "organization": {
    "id": "org-twad-01",
    "name": "Tamil Nadu Water Supply and Drainage Board (TWAD)",
    "type": "Government",
    "domain": "Rural Aquifer Monitoring",
    "location": "Chennai, Tamil Nadu",
    "subscriptionTier": "ENTERPRISE",
    "createdAt": "2026-09-26T12:00:00.000Z"
  }
}
```

### 3.2 Get Organization Metrics & Stats
* **Endpoint:** `GET /api/organizations/:id/stats`
* **Access:** Public / Authenticated
* **Response (200 OK):** Live aggregated metrics for total problems, active pilots, registered devices, resolved actions, and active alerts.

---

## 4. Candidate Solutions & Trade-off Matrix API

### 4.1 Create Candidate Solution
* **Endpoint:** `POST /api/solutions`
* **Access:** Authenticated
* **Request Body:**
```json
{
  "problemId": "prob-water-01",
  "organizationId": "org-twad-01",
  "title": "Solar-Powered Capacitive Deionization (CDI) with Online Conductivity Cell",
  "description": "Low-pressure electrosorption unit targeting specific fluoride and monovalent salt removal.",
  "technologyStack": ["Capacitive Deionization", "ESP32-S3", "RS485 Modbus", "Solar MPPT"],
  "maturityLevel": "TRL-6",
  "feasibilityScore": 89,
  "estimatedCostInr": 12500,
  "timelineWeeks": 10
}
```

### 4.2 Multi-Candidate Solution Trade-off Comparison
* **Endpoint:** `POST /api/solutions/compare`
* **Access:** Public / Authenticated
* **Request Body:**
```json
{
  "solutionIds": ["sol-1", "sol-2"]
}
```
* **Response (200 OK):** Returns side-by-side comparison matrix, cost analysis, TRL maturity, and recommended candidate.

---

## 5. Production Telemetry & IoT Sensor Ingestion API

### 5.1 Ingest Telemetry Reading (Physical Sensor or Manual Operator Entry)
* **Endpoint:** `POST /api/telemetry`
* **Access:** Public / IoT Edge Nodes / Field Operators
* **Request Body:**
```json
{
  "pilotId": "pilot-alwar-01",
  "deviceId": "node-alwar-01",
  "measurements": {
    "ph": 7.4,
    "turbidity": 2.3,
    "tds": 320,
    "temperature": 25.1
  },
  "source": "PHYSICAL_SENSOR",
  "organizationId": "org-twad-01"
}
```
* **Validation Bounds:**
  - `ph`: $0.0 \le \text{pH} \le 14.0$
  - `turbidity`: $0.0 \le \text{Turbidity} \le 2000.0\text{ NTU}$
  - `tds`: $0.0 \le \text{TDS} \le 10000.0\text{ ppm}$
  - `temperature`: $-30.0 \le \text{Temp} \le 90.0^\circ\text{C}$
* **Automatic Alert Triggering:** Any reading exceeding BIS IS 10500:2012 critical limits automatically inserts a `CRITICAL` decision alert and notifies active operators.

---

## 6. Operational Actions & Task Dispatch API

### 6.1 Create Operational Action
* **Endpoint:** `POST /api/actions`
* **Access:** Authenticated
* **Request Body:**
```json
{
  "pilotId": "pilot-alwar-01",
  "problemId": "prob-water-01",
  "alertId": "alert-101",
  "title": "Execute Chemical Desorption and Membrane Backwash",
  "description": "Clean CDI electrode modules with dilute citric acid.",
  "priority": "HIGH",
  "assignedToName": "S. Ramanathan (Field Engineer)"
}
```

### 6.2 Update Action Status & Field Notes
* **Endpoint:** `PATCH /api/actions/:id`
* **Access:** Authenticated
* **Request Body:**
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Backwash completed successfully. Nominal flow restored."
}
```

---

## 7. Decision Alerts API

### 7.1 List Active Alerts
* **Endpoint:** `GET /api/alerts?pilotId=pilot-alwar-01`
* **Access:** Public / Authenticated

### 7.2 Acknowledge / Resolve Alert
* **Endpoint:** `POST /api/alerts/:id/acknowledge`
* **Endpoint:** `POST /api/alerts/:id/resolve`

---

## 8. Dynamic Traceable Impact Engine API

### 8.1 Dynamically Calculate Pilot Impact
* **Endpoint:** `GET /api/impact/calculate/:pilotId`
* **Access:** Public / Authenticated
* **Response (200 OK - Calculated):**
```json
{
  "computed": true,
  "pilotId": "pilot-alwar-01",
  "dataPointsCount": 4,
  "timeWindow": {
    "firstReading": "2026-09-26T08:00:00.000Z",
    "latestReading": "2026-09-26T12:30:00.000Z"
  },
  "metrics": [
    {
      "key": "turbidity",
      "label": "Optical Turbidity (NTU)",
      "baseline": 9.8,
      "current": 1.4,
      "percentageChange": -85.7,
      "confidenceScore": 94,
      "direction": "decrease",
      "unit": "NTU",
      "sourceOfTruth": "PHYSICAL_SENSOR"
    }
  ]
}
```
* **Response (200 OK - Insufficient Data):**
```json
{
  "computed": false,
  "status": "INSUFFICIENT_DATA",
  "readingsFound": 1,
  "requiredReadings": 3,
  "message": "Insufficient field data (1/3 readings recorded). At least 3 verified field readings required."
}
```

---

## 9. Cryptographic SHA-256 Audit Ledger API

### 9.1 Verify Cryptographic Ledger Chain Integrity
* **Endpoint:** `GET /api/audit/verify-chain`
* **Access:** Restricted to `admin` / `mentor`
* **Response (200 OK):**
```json
{
  "integrity": "VALID",
  "totalChecked": 34,
  "message": "All 34 audit records cryptographically verified with unbroken SHA-256 hash chaining."
}
```

### 9.2 Query Audit Logs
* **Endpoint:** `GET /api/audit/logs`
* **Access:** Restricted to `admin` / `mentor`

---

## 10. Automated Test Execution

InnovateIQ includes an exhaustive end-to-end automated test suite verifying all 17 core subsystems (106 automated assertions):

```bash
cd backend
npm test
# Or: node backend/scratch/e2e-audit.js
```
