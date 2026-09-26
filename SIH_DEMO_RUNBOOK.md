# 🏆 InnovateIQ Smart India Hackathon (SIH) Judge Evaluation Runbook

**Purpose:** Comprehensive guide for presenting InnovateIQ during live hackathon evaluation. Explains how to start the platform from a clean state, walk judges through the 14-stage lifecycle, and deliver factual, technically grounded commentary.

---

## ⚡ 1. Pre-Flight Demonstration Setup

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```
*Verify output:* `API health: http://localhost:5000/api/health`

### Step 2: Start Frontend Application
```bash
cd frontend
npm run dev
```
*Verify URL:* `http://localhost:5173`

### Step 3: Run Demo Pre-Flight Check
Open browser or run curl:
```http
GET http://localhost:5000/api/demo/readiness
```
*Expected Response:* `{"status": "READY", "scenario": "Rural Community Water Contamination Early Warning", ...}`

### Step 4: Login with Evaluation Persona
- Navigate to `http://localhost:5173`
- Click **"Demo Login"** or enter credentials:
  - **Email:** `aarav@sih.dev`
  - **Password:** `demo123`
  - **Role:** Student / Lead Innovator

---

## 🎯 2. The 14-Stage Evaluation Walkthrough & Script

```
Problem ──► Intelligence ──► Root Cause ──► Evidence ──► Scoring ──► Brief ──► Tech
                                                                                 │
Audit ◄── Impact ◄── Restoration ◄── Intervention ◄── Anomaly ◄── Telemetry ◄── Pilot
```

---

### Stage 1: Problem Statement Identified (`/problems`)
- **Action:** Open Problem Hub, select **Rural Groundwater Contamination (Alwar, Rajasthan)**.
- **🗣️ WHAT TO SAY:**
  > *"InnovateIQ begins with real-world national problems. Here, we register a critical groundwater contamination problem from Thanagazi Tehsil, Alwar, affecting over 12,000 villagers with seasonal runoff and mineral leaching."*

---

### Stage 2: Problem Intelligence & Context Modeling (`/problems/prob-water-01/analyze`)
- **Action:** View the 16-dimensional root-cause breakdown.
- **🗣️ WHAT TO SAY:**
  > *"Rather than jumping straight to building software, the intelligence engine models the full problem ecosystem—analyzing environmental topography, seasonal monsoon timing, and municipal testing delays."*

---

### Stage 3: Root Cause Analysis
- **Action:** Inspect the failure mode cards (fertilizer runoff, uncalibrated open wells).
- **🗣️ WHAT TO SAY:**
  > *"The system isolates primary failure modes: delayed manual sampling cycles (7–14 days) and sudden agricultural fertilizer leaching during early rainfall events."*

---

### Stage 4: Multi-Source Evidence Aggregation (`/evidence`)
- **Action:** Open Evidence Center, show the 6 active research connectors (Jal Jeevan Mission, WHO Water Safety, arXiv, PubMed).
- **🗣️ WHAT TO SAY:**
  > *"Every AI claim is grounded in empirical literature and government open data. Our connectors aggregate peer-reviewed papers and open standards into structured citation cards."*

---

### Stage 5: Evidence Scoring (BIS IS 10500:2012)
- **Action:** Point out the 4-dimension quality scoring breakdown (Authority, Recency, Relevance, Completeness).
- **🗣️ WHAT TO SAY:**
  > *"We don't rely on arbitrary AI hallucinations. Citations are scored against the Bureau of Indian Standards BIS IS 10500 Drinking Water Specification with complete provenance links."*

---

### Stage 6: AI Decision Brief Synthesis (`/problems/prob-water-01/decision-brief`)
- **Action:** Showcase the 6-dimension Feasibility Radar and ₹3,500 Bill of Materials breakdown.
- **🗣️ WHAT TO SAY:**
  > *"The Decision Brief generates a comprehensive feasibility matrix across technical, financial, and operational axes, ensuring the proposed solution fits rural gram panchayat budget constraints."*

---

### Stage 7: Hardware Architecture & Tech Selection
- **Action:** View the recommended IoT hardware stack.
- **🗣️ WHAT TO SAY:**
  > *"The platform recommends an edge hardware architecture: ESP32 dual-core MCU, optical nephelometric turbidity sensor, analog pH probe, and low-power LoRaWAN telemetry mesh."*

---

### Stage 8: Field Pilot Deployment (`/pilots`)
- **Action:** Open Pilot Manager, show Node `ALWAR-01` installed in Thanagazi Gram Panchayat Well #3.
- **🗣️ WHAT TO SAY:**
  > *"The innovation moves to the ground. Pilot ALWAR-01 is actively deployed in the field with registered hardware telemetry nodes."*

---

### Stage 9: Live Simulated Telemetry Ingestion
- **Action:** View the live sensor stream card (`pH: 7.2`, `Turbidity: 3.4 NTU`, `TDS: 380 ppm`).
- **🗣️ WHAT TO SAY:**
  > *"The edge node streams multi-parameter water quality packets into our production telemetry ingestion endpoint with strict physical bounds validation."*

---

### Stage 10: Critical Anomaly Detection & AI Alert
- **Action:** Trigger the simulated runoff event (`Turbidity spikes to 16.2 NTU`). Show the **CRITICAL DECISION ALERT** banner.
- **🗣️ WHAT TO SAY:**
  > *"A critical anomaly occurs—turbidity breaches the 5.0 NTU permissible limit. Notice our 3-layer explainable AI alert: Layer 1 is the observed measurement, Layer 2 is the standard-grounded interpretation, and Layer 3 is the prioritized recommended action."*

---

### Stage 11: Frontline Community & Automated Intervention
- **Action:** View the automated vernacular SMS alert dispatch to 1,200 households and solar UV valve relay activation.
- **🗣️ WHAT TO SAY:**
  > *"Before contaminated water reaches household taps, the system triggers automated fail-safes: sending SMS warnings to the Sarpanch and activating filtration bypass valves."*

---

### Stage 12: Potability Normalization & Recovery
- **Action:** Observe telemetry returning to safe baseline (`pH 6.7`, `Turbidity 4.6 NTU`).
- **🗣️ WHAT TO SAY:**
  > *"Post-flush sensor readings verify that potability has been restored within BIS IS 10500 safety thresholds."*

---

### Stage 13: Measurable Impact KPI Verification (`/impact`)
- **Action:** Open Impact Dashboard, compare baseline vs. pilot outcomes (Detection lag reduced from 72 hrs to 4.5 hrs; 78% illness reduction).
- **🗣️ WHAT TO SAY:**
  > *"InnovateIQ measures verified ground ROI. Notice the explicit 'Simulated Demo Result' badge—we maintain complete transparency between demonstration runs and real verified field telemetry."*

---

### Stage 14: Immutable Governance Audit Ledger (`/audit`)
- **Action:** Open Audit Ledger (logged in as Admin or viewing pilot trail).
- **🗣️ WHAT TO SAY:**
  > *"Every telemetry spike, AI inference, SMS broadcast, and operator intervention is signed and recorded in our governance audit trail for municipal accountability."*

---

## 🔄 3. Demo Reset & Repeatability

To reset the demonstration back to Stage 1 at any time:
1. Click the **"Reset Demo"** button on the bottom Judge Demo Control Panel, OR
2. Issue an HTTP POST request:
   ```bash
   curl -X POST http://localhost:5000/api/demo/reset
   ```
*Verification:* The simulation immediately returns to `idle` state, ready for the next evaluator, while all production telemetry records and registered field devices remain completely untouched in persistent storage.
