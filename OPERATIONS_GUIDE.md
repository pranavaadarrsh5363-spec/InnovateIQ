# InnovateIQ — Production Operations & Maintenance Manual

This guide provides operational procedures, disaster recovery protocols, observability practices, and forensic ledger validation routines for system administrators and DevOps engineers operating the **InnovateIQ Platform**.

---

## 1. Daily Health Checks & Monitoring

Execute these automated checks on scheduled monitoring intervals (e.g. Prometheus / Datadog / Grafana Agent):

### Automated API Liveness & Readiness
```bash
# 1. Check Liveness (Process Alive)
curl -f -s https://api.innovateiq.gov.in/health/live || alert_pagerduty "InnovateIQ API Unhealthy"

# 2. Check Readiness (DB & Ingestion Connected)
curl -f -s https://api.innovateiq.gov.in/health/ready || alert_pagerduty "InnovateIQ Service Not Ready"

# 3. Comprehensive Diagnostic Payload
curl -s https://api.innovateiq.gov.in/api/health
```

### Key Metrics to Monitor
| Metric | Healthy Range | Action on Breach |
| :--- | :--- | :--- |
| **API Latency (p95)** | $< 120\text{ ms}$ | Check DB connection pool saturation |
| **Telemetry Ingestion Rate** | $> 0\text{ packets/min}$ | Verify cellular/LoRaWAN gateway status |
| **Active Anomaly Alerts** | Varies | Review `/actions` for unresolved high-priority incidents |
| **Ledger Integrity** | `VALID` (100%) | **P0 Incident**: Trigger forensic audit |

---

## 2. Backup & Disaster Recovery

### Automated PostgreSQL Nightly Backup
Create a cron job on the database server:

```bash
#!/bin/bash
# /opt/scripts/backup_innovateiq.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/innovateiq"
mkdir -p "$BACKUP_DIR"

# Full PostgreSQL Database Dump
pg_dump -U innovateiq_user -h localhost -F c -b -v -f "$BACKUP_DIR/innovateiq_$TIMESTAMP.dump" innovateiq_prod

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +30 -exec rm {} \;

echo "✅ Backup completed: innovateiq_$TIMESTAMP.dump"
```

### Local Storage Snapshot (Fallback Engine)
```bash
# Snapshot resilient local JSON persistence store
cp /var/www/innovateiq/backend/data/innovateiq.db.json /var/backups/innovateiq/db_snapshot_$(date +"%Y%m%d").json
```

### Disaster Recovery / Database Restoration
```bash
# Drop corrupted database (if necessary)
dropdb -U postgres innovateiq_prod

# Re-create database
createdb -U postgres -O innovateiq_user innovateiq_prod

# Restore from dump file
pg_restore -U innovateiq_user -d innovateiq_prod -v "/var/backups/innovateiq/innovateiq_20260926_000000.dump"
```

---

## 3. Database Migration & Schema Maintenance

### Applying New Migrations
```bash
cd backend
npm run db:migrate
```

### Migration Integrity Verification
The migration runner records applied migration IDs in `schema_migrations`. To verify applied migrations:
```bash
psql -U innovateiq_user -d innovateiq_prod -c "SELECT * FROM schema_migrations ORDER BY id ASC;"
```

---

## 4. Cryptographic Audit Trail Forensic Verification

If regulatory compliance or tamper detection is requested, run the SHA-256 chain verification routine:

```bash
# Run Forensic Ledger Verification via Admin API
curl -s -H "Authorization: Bearer <AdminJWT>" \
     https://api.innovateiq.gov.in/api/audit/verify-chain | jq .
```

### Interpreting Verification Outputs:

#### Case A: Legitimate, Untampered Ledger
```json
{
  "success": true,
  "integrity": "VALID",
  "totalChecked": 134,
  "algorithm": "SHA-256",
  "verifiedAt": "2026-09-26T14:20:00.000Z"
}
```

#### Case B: Tampering Detected (`COMPROMISED`)
```json
{
  "success": true,
  "integrity": "COMPROMISED",
  "totalChecked": 42,
  "brokenIndex": 41,
  "reason": "PAYLOAD_HASH_MISMATCH",
  "tamperedId": "audit-042",
  "algorithm": "SHA-256"
}
```
**Incident Response on Compromise:**
1. Isolate the affected node.
2. Cross-reference `tamperedId` against external WORM / S3 object lock backups.
3. Review `X-Request-ID` access logs for unauthorized write operations on the database.

---

## 5. Telemetry Calibration & Threshold Updates

Administrators can tune BIS IS 10500 regulatory thresholds via authenticated API:

```bash
# Update Turbidity permissible threshold to 4.5 NTU
curl -X PUT https://api.innovateiq.gov.in/api/telemetry/thresholds \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <AdminJWT>" \
     -d '{
       "turbidity": {
         "acceptable": 1.0,
         "permissible": 4.5,
         "critical": 10.0
       }
     }'
```
*Note: This operation is automatically audited with a cryptographic SHA-256 entry in the governance ledger.*
