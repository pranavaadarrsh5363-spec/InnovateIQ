# 🚀 InnovateIQ – AI-Powered Enterprise Innovation & Field Impact Intelligence Platform

> **Smart India Hackathon (SIH) Production-Ready Platform**  
> *Transforming national problem statements into verified, persistent, data-backed community impact.*

InnovateIQ is a multi-tenant enterprise innovation intelligence SaaS platform that bridges the gap between academic problem discovery, feasibility analysis, evidence synthesis, IoT sensor telemetry ingestion, automated anomaly detection, operational action dispatch, persistent data hardening, and verifiable real-world impact.

---

## 📋 Table of Contents
- [Architectural Highlights](#-architectural-highlights)
- [Enterprise SaaS Workflow](#-enterprise-saas-workflow)
- [Persistent Database & Real Data Layer](#-persistent-database--real-data-layer)
- [Database Migrations & Management](#-database-migrations--management)
- [Real-World Data Architecture & Telemetry](#-real-world-data-architecture--telemetry)
- [Judge Evaluation Demo Mode (14 Stages)](#-judge-evaluation-demo-mode-14-stages)
- [Responsive Navigation System](#-responsive-navigation-system)
- [Tech Stack](#-tech-stack)
- [Installation & Quickstart](#-installation--quickstart)
- [Pre-Seeded Evaluation Personas](#-pre-seeded-evaluation-personas)
- [Automated Verification & Testing](#-automated-verification--testing)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Production Deployment](#-production-deployment)

---

## 🏛️ Architectural Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                   InnovateIQ Multi-Tenant Architecture                  │
└────────────────────────────────────────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────┐                       ┌──────────────────────────┐
│   REAL SAAS PLATFORM     │                       │   JUDGE DEMO MODE        │
│   (isDemo: false)        │                       │   (isDemo: true)         │
├──────────────────────────┤                       ├──────────────────────────┤
│ • Multi-Tenant Orgs      │                       │ • 14-Stage Guided Flow   │
│ • Candidate Solutions    │                       │ • Rajasthan Water Case   │
│ • Operational Actions    │                       │ • Simulated Runoff Spike │
│ • IoT Telemetry (Auto/Man│                       │ • Emergency Alerts       │
│ • BIS IS 10500:2012 Specs│                       │ • Baseline vs Pilot ROI  │
│ • Dynamic Impact Delta   │                       │ • Isolated Simulation    │
│ • SHA-256 Chained Ledger │                       │ • Independent Reset      │
└──────────────────────────┘                       └──────────────────────────┘
```

1. **Strict Data Separation (`isDemo` Flag):** Real production multi-tenant data (`isDemo: false`) is strictly segregated from the interactive 14-stage Judge Evaluation Demo (`isDemo: true`).
2. **Persistent Repository Architecture:** Typed repository layer decoupling Express routes from PostgreSQL storage and zero-dependency persistent local storage.
3. **Standard-Grounded Anomaly Detection:** Water potability indices and threshold violations are calculated directly against Bureau of Indian Standards (**BIS IS 10500:2012 Drinking Water Specification**).
4. **Dynamic Traceable Impact Calculation:** Telemetry deltas are computed mathematically ($(\text{current} - \text{baseline}) / \text{baseline} \times 100$) with statistical confidence scores.
5. **Cryptographic SHA-256 Ledger Chain:** Tamper-evident hash chaining across every logged operation, verifiable via `GET /api/audit/verify-chain`.

---

## 🔄 Enterprise SaaS Workflow

InnovateIQ provides an unbroken data-grounded pipeline:
`Organization` $\rightarrow$ `Problem` $\rightarrow$ `Evidence` $\rightarrow$ `Solutions Matrix` $\rightarrow$ `Pilot Deployment` $\rightarrow$ `IoT & Manual Telemetry` $\rightarrow$ `Anomaly Detection` $\rightarrow$ `Operational Action Dispatch` $\rightarrow$ `Dynamic Impact` $\rightarrow$ `SHA-256 Ledger`

See [`PRODUCT_WORKFLOW.md`](./PRODUCT_WORKFLOW.md) for full architectural blueprints and sequence flowcharts.

---

## 🗄️ Persistent Database & Real Data Layer

InnovateIQ features a robust repository pattern connecting business logic to database storage across 14 persistent tables:

* **`organizations`**: Multi-tenant organizations, types, subscription tiers.
* **`problems`**: Organization-scoped problem statements, target populations.
* **`solutions`**: Engineering candidate architectures, TRL scores, cost & timeline estimates.
* **`pilots`**: Active field pilot programs, locations, cohorts, partner bodies.
* **`devices`**: Registered IoT sensor nodes (`node-alwar-01`), hardware models, firmware versions.
* **`telemetry`**: Multi-parameter sensor time-series packets with `PHYSICAL_SENSOR` or `MANUAL_ENTRY` source tags.
* **`operational_actions`**: Assigned field intervention and maintenance tasks.
* **`decision_alerts`**: Critical threshold breach alerts with AI interpretations.
* **`audit_logs`**: SHA-256 hash-chained immutable audit records.
* **`evidence`**: Academic citations, DOIs, and source URLs.
* **`impact_kpis`**: Baseline vs. target outcome measurements and continuous improvement feedback loops.

---

## 🔄 Database Migrations & Management

```bash
# In backend directory:

# 1. Run all pending SQL migrations
npm run db:migrate

# 2. Populate deterministic development/demo seed data
npm run db:seed

# 3. Cleanly reset database, re-apply migrations, and re-seed
npm run db:reset
```

---

## 📡 Real-World Data Architecture & Telemetry

* **Ingestion Endpoint:** `POST /api/telemetry`
* **Sources:** `PHYSICAL_SENSOR` (automated IoT packet) or `MANUAL_ENTRY` (field technician observation)
* **Supported Parameters:** Analog pH (`SEN0161-V2`), Optical Turbidity (`SEN0189`), TDS Conductivity Cells, DS18B20 Temperature Probes.
* **Regulatory Standard Thresholds (BIS IS 10500:2012):**
  - **pH:** $6.5 - 8.5$ acceptable ($5.5 - 9.5$ permissible limit)
  - **Turbidity:** $\le 1.0\text{ NTU}$ acceptable ($\le 5.0\text{ NTU}$ permissible limit)
  - **TDS:** $\le 500\text{ ppm}$ acceptable ($\le 2000\text{ ppm}$ permissible limit)
  - **Temperature:** $5 - 40^\circ\text{C}$

---

## ⚖️ Judge Evaluation Demo Mode (14 Stages)

InnovateIQ includes a 1-click end-to-end evaluation flow demonstrating how a national problem statement is transformed into measurable ground impact in an isolated sandbox. Resetting the demo never touches production tenant data.

---

## 📱 Responsive Navigation System

* **Desktop / PC ($\ge 1024\text{px}$):** Sleek horizontal top bar with categorized dropdown menus (Core Intelligence, Execution & Pilots, Innovation Workspace, Governance).
* **Mobile / Android ($< 768\text{px}$):** Fixed bottom navigation bar with 4 primary action tabs and an expandable **"More"** sheet drawer.
* **Tablet ($768\text{px} - 1023\text{px}$):** Compact horizontal top bar with icon-first labeling and full-width layout elasticity.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Modular architecture, zero layout squeeze |
| **Styling & UI** | Tailwind CSS, Lucide React | Clean enterprise design, responsive layout |
| **State & Context** | React Context (`AuthContext`, `DemoContext`) | Real-time telemetry, JWT state |
| **Backend** | Node.js, Express, TypeScript | RESTful API, rate-limiting, strict validation |
| **Database** | PostgreSQL / Resilient Store | Schema migrations, indexed time-series |
| **Security & Auth**| JWT, `bcryptjs` | Multi-tenant RBAC (`student`, `mentor`, `admin`) |
| **Integrity** | SHA-256 Hash Chaining | Tamper-evident cryptographic ledger verification |
| **Testing** | Node.js E2E Test Suite | **106 automated assertions** across 17 subsystems |

---

## 📦 Installation & Quickstart

```bash
# Clone repository
git clone https://github.com/<your-username>/InnovateIQ.git
cd InnovateIQ

# Backend setup
cd backend
npm install
npm run db:reset
npm run dev

# Frontend setup (separate terminal)
cd ../frontend
npm install
npm run dev
```

* **Frontend URL:** [http://localhost:5173](http://localhost:5173)  
* **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Evaluation Personas

| Role | Email | Password | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Student** | `aarav@sih.dev` | `demo123` | Problem analysis, solution creation, manual field readings |
| **Mentor** | `mentor@sih.dev` | `demo123` | Pilot review, action dispatch, threshold monitoring |
| **Admin** | `admin@sih.dev` | `demo123` | Organization provisioning, SHA-256 ledger verification |

---

## 🧪 Automated Verification & Testing

```bash
cd backend
npm test
```

### Verified Test Coverage (106/106 Passing):
1. **Authentication & RBAC (3/3):** Student, Mentor, and Admin role logins.
2. **Problem Intelligence & Decision Briefs (6/6):** Feasibility scorecards, 6-dimension analysis.
3. **Context Continuity (4/4):** Problem inheritance into project workspaces.
4. **Multi-Connector Evidence (2/2):** Academic search and 6 active research connectors.
5. **Technology & Skills (2/2):** Stack recommendations and skill gap evaluations.
6. **Field Trials & Pilots (3/3):** Deployments, community sentiment, obstacle logs.
7. **Measurable Impact (3/3):** Baseline vs target KPIs, feedback loops.
8. **Audit Trail Governance (2/2):** Admin access vs Student 403 authorization.
9. **Judge Demo Mode (12/12):** 14-stage progression, simulated turbidity anomaly, state isolation.
10. **Production Telemetry Architecture (19/19):** Input bounds validation, BIS IS 10500 anomaly classification, device registry.
11. **Database Persistence & Real Data Hardening (5/5):** Multi-device persistence, time-series indexing.
12. **Judge Demo Repeatability (7/7):** Multiple full runs with clean reset isolation.
13. **Observability & Security Headers (4/4):** Correlation IDs, X-Frame-Options, CSP, nosniff.
14. **Liveness & Readiness Probes (4/4):** K8s-ready health checks.
15. **10-Cycle Safety Lock (2/2):** 10 consecutive reset cycles without state corruption.
16. **Structured Error Handling (2/2):** RFC-compliant 404/500 JSON envelopes.
17. **Multi-Tenant Enterprise SaaS Lifecycle (26/26):** Organizations, solutions comparison, pilot creation, manual reading ingestion, decision alerts, action dispatch & resolution, dynamic impact delta, and SHA-256 ledger chain verification.

---

## 📖 API Documentation

Detailed REST endpoint specifications, request payloads, response schemas, and validation rules are available in:
👉 **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)**

---

Built with ❤️ for **Smart India Hackathon**
