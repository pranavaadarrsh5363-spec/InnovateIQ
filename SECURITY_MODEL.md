# InnovateIQ — Security Architecture & Threat Model

This document outlines the multi-layered security architecture, access control policies, cryptographic integrity guarantees, and threat mitigations implemented in the **InnovateIQ Platform**.

---

## 1. Role-Based Access Control (RBAC) Matrix

InnovateIQ enforces strict server-side authorization across four distinct platform roles:

| Action / Resource | Student / Innovator | Faculty / Mentor | Agency / Org Admin | Platform Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Problem Intelligence & Evidence** | ✅ | ✅ | ✅ | ✅ |
| **Run AI Feasibility & Decision Briefs** | ✅ | ✅ | ✅ | ✅ |
| **Create & Edit Owned Projects / Solutions** | ✅ | ✅ | ❌ | ✅ |
| **Publish Organization-Scoped Problems** | ❌ | ❌ | ✅ | ✅ |
| **Provision & Launch Field Pilots** | ✅ (Tenant-Scoped) | ✅ | ✅ | ✅ |
| **Register IoT Hardware Sensor Nodes** | ✅ | ✅ | ✅ | ✅ |
| **Ingest Field Telemetry (Sensor/Manual)** | ✅ | ✅ | ✅ | ✅ |
| **Update Regulatory Telemetry Thresholds** | ❌ | ❌ | ❌ | ✅ |
| **Dispatch & Resolve Operational Actions** | ✅ | ✅ | ✅ | ✅ |
| **Acknowledge & Resolve Decision Alerts** | ✅ | ✅ | ✅ | ✅ |
| **View Cryptographic Audit Trail Logs** | ❌ (403 Forbidden) | ✅ | ✅ | ✅ |
| **Trigger Hash Chain Integrity Verification** | ❌ (403 Forbidden) | ✅ | ✅ | ✅ |
| **Tenant Organization Management** | ❌ | ❌ | ✅ (Own Org) | ✅ (Global) |

---

## 2. Authentication & Session Security

### JSON Web Token (JWT) Lifecycle
- **Algorithm**: `HMAC-SHA256` (`HS256`)
- **Token Validity**: `24 Hours`
- **Signing Secret**: High-entropy 256-bit cryptographically secure string from environment variables (`JWT_SECRET`).

#### Sample JWT Claims Payload:
```json
{
  "userId": "usr-tamil-nadu-eng-01",
  "name": "Priya Narayanan",
  "email": "priya@twadboard.gov.in",
  "role": "student",
  "organization": "Tamil Nadu Water Supply and Drainage Board (TWAD)",
  "organizationId": "org-twad-01",
  "domain": "Water Resources & Sanitation",
  "iat": 1716980000,
  "exp": 1717066400
}
```

### Password Security & Hashing
- Passwords are never stored in plaintext.
- Hashing is performed using `bcrypt` with a minimum cost factor of `10 salt rounds` (`$2b$10$...`).
- Timing-safe comparisons prevent side-channel timing attacks during authentication verification.

---

## 3. Defense Against Injection Attacks

### SQL Injection Mitigation
- 100% of database queries routed through PostgreSQL use parameterized placeholders (`$1, $2, $3, ...`).
- Raw string concatenation in SQL execution is strictly prohibited across all repositories:
```typescript
// SECURE: Parameterized Query Execution in InnovateIQ
await query(
  `UPDATE problems
   SET title = $1, description = $2, priority = $3, updated_at = $4
   WHERE id = $5 AND (organization_id = $6 OR $6 IS NULL)`,
  [title, description, priority, new Date().toISOString(), problemId, tenantOrgId]
);
```

### NoSQL / Object Injection Mitigation
- Structured type coercion for all request body fields.
- Deep prototype pollution protection via sanitized object cloning.

---

## 4. Cryptographic SHA-256 Tamper-Evident Audit Ledger

Governance, regulatory evaluations, problem sponsorship, and telemetry anomaly alerts are permanently recorded in a cryptographically chained tamper-evident ledger.

```
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│       Block N - 1       │       │         Block N         │       │       Block N + 1       │
│                         │       │                         │       │                         │
│ prevHash: 0000...a4f1   │       │ prevHash: 78d9...e210 ──┼──────►│ prevHash: 3f91...cc84   │
│ entryHash: 78d9...e210 ─┼──────►│ entryHash: 3f91...cc84  │       │ entryHash: a902...519e  │
│ payload: ProblemCreated │       │ payload: AnomalyAlert   │       │ payload: ActionResolved │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

### Hash Chaining Formula
$$\text{EntryHash}_i = \text{SHA-256}(\text{PrevHash}_{i-1} \parallel \text{ID} \parallel \text{UserID} \parallel \text{Action} \parallel \text{Timestamp} \parallel \text{EntityType} \parallel \text{EntityID} \parallel \text{OrgID})$$

### Automated Integrity Verification (`GET /api/audit/verify-chain`)
The verification engine inspects every record in sequential order:
1. **Payload Hash Check**: Computes expected SHA-256 over raw record fields; flags `PAYLOAD_HASH_MISMATCH` if content was altered.
2. **Chain Linkage Check**: Verifies that $\text{prevHash}_i == \text{entryHash}_{i+1}$; flags `PREV_HASH_CHAIN_BROKEN` if a record was deleted, inserted, or reordered.

---

## 5. Network & HTTP Security Controls

### HTTP Security Headers
Every HTTP response emitted by the InnovateIQ API contains defensive security headers:
- `X-Content-Type-Options: nosniff` — Prevents MIME-sniffing exploits.
- `X-Frame-Options: SAMEORIGIN` — Prevents Clickjacking in untrusted framing contexts.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects token and path leakage in outbound referrers.
- `X-Request-ID` — Distributed correlation identifier for end-to-end auditability.

### Rate Limiting & DDoS Defense
- Express-rate-limit configured with sliding windows (`1000 requests / 15 minutes` per IP).
- Telemetry ingestion endpoints enforce strict max payload sizes (`100 KB`) and reject future-dated timestamps ($> 5\text{ minutes}$ ahead) to thwart replay attacks.
