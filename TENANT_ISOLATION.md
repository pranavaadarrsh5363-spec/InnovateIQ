# InnovateIQ — Multi-Tenant Isolation Architecture

This document describes the multi-tenant partitioning, boundary enforcement mechanisms, and demo/production isolation layers of the **InnovateIQ Platform**.

---

## 1. Multi-Tenant Partitioning Model

InnovateIQ employs a **Shared Database, Tenant-Scoped Partitioning** model. Every business entity belongs to a distinct `organizationId` representing a government department, university, research institute, or corporate partner.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      InnovateIQ Enterprise Platform                     │
│                                                                         │
│  ┌───────────────────────────────┐     ┌──────────────────────────────┐ │
│  │    Tenant A: TWAD Board       │     │     Tenant B: GWSSB Board    │ │
│  │    organizationId: org-twad   │     │    organizationId: org-gwssb │ │
│  ├───────────────────────────────┤     ├──────────────────────────────┤ │
│  │ • Problems: Ramanathapuram    │     │ • Problems: Gandhinagar      │ │
│  │ • Solutions: Capacitive CDI   │     │ • Solutions: Solar RO Mesh   │ │
│  │ • Pilots: Mandapam Testbed    │     │ • Pilots: Bhavnagar Trial    │ │
│  │ • Nodes: node-mandapam-01     │     │ • Nodes: node-bhavnagar-04   │ │
│  │ • Telemetry: Raw sensor data  │     │ • Telemetry: Raw sensor data │ │
│  │ • Actions: Acid wash tasks    │     │ • Actions: Membrane flush    │ │
│  └───────────────────────────────┘     └──────────────────────────────┘ │
│                                                                         │
│  ═════════════════════ HARD TENANT ISOLATION BARRIER ══════════════════  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Judge Evaluation Demo Sandbox                 │   │
│  │                    isDemo: true (Isolated State)                 │   │
│  │ • Rural Water Contamination Scenario                             │   │
│  │ • Simulated Live Turbidity Ingestion (16.2 NTU)                  │   │
│  │ • Ephemeral Demo Reset Cycles with Zero Production Data Impact   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tenant Boundary Rules Across Platform Entities

| Entity | Partition Key | Read Scope | Mutation Scope (`PATCH` / `DELETE` / `PUT`) |
| :--- | :--- | :--- | :--- |
| **Organizations** | `id` | Public directory or specific org details | Global Admin or verified Org Admin |
| **Users** | `organizationId` | Own organization directory | Self or Org Admin |
| **Problems** | `organizationId` | Public (for academic search) or Tenant | Restricted to creating Organization |
| **Solutions** | `organizationId` | Linked Problem Collaborators | Restricted to Solution Creator / Org |
| **Pilots** | `organizationId` | Field Operators & Linked Problem Cohort | Restricted to Pilot Sponsor Organization |
| **IoT Devices** | `pilotId` / `organizationId`| Pilot Field Engineers | Restricted to Pilot Owner |
| **Telemetry** | `organizationId` / `pilotId`| Pilot Field Engineers & Auditors | Immutable append-only |
| **Operational Actions**| `organizationId` | Assigned Field Personnel | Assignee or Org Field Leads |
| **Decision Alerts**| `organizationId` | Tenant Crisis Response Team | Tenant Stakeholders & Admins |
| **Audit Logs** | `organizationId` | Tenant Governance & Security Leads | Append-only cryptographically chained |

---

## 3. Server-Side Enforcement Mechanics

Tenant isolation is enforced strictly on the server side in backend route handlers and repository queries. Even if an attacker manipulates client-side requests, the server validates identity bindings embedded in the verified JWT.

### Example: Server-Side Tenant Authorization Guard
```typescript
// DELETE /api/problems/:id Guard
const existing = await problemRepository.findById(req.params.id);
if (!existing) {
  return res.status(404).json({ success: false, error: { message: 'Problem not found' } });
}

// Global Admin bypass; otherwise enforce strict tenant ownership
const isGlobalAdmin = req.user.role === 'admin' && !req.user.organizationId;
const isOwnerTenant = existing.organizationId === req.user.organizationId;

if (!isGlobalAdmin && !isOwnerTenant) {
  return res.status(403).json({
    success: false,
    error: {
      code: 'TENANT_ACCESS_DENIED',
      message: 'You do not have permission to modify resources owned by another organization',
    },
  });
}
```

---

## 4. Demo vs Production Isolation (`isDemo: false` vs `isDemo: true`)

InnovateIQ maintains strict, deterministic isolation between production tenant data and simulated presentation runs.

### Isolation Rules:
1. **Tagging**: Every telemetry packet, alert, audit log, and impact metric contains an explicit `isDemo: boolean` flag.
2. **Persistence Boundary**: Production queries filter by `isDemo === false` by default.
3. **Safe Demo Reset (`POST /api/demo/reset`)**:
   - The demo reset endpoint clears only objects flagged with `isDemo === true`.
   - Real tenant telemetry, active physical hardware nodes, and real organization challenges in PostgreSQL / persistent storage remain 100% untouched.
   - Tested and verified across 10 consecutive rapid-reset cycles with zero state leakage.
