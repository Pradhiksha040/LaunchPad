# LaunchPad OS — Backup, Disaster Recovery & Migration Architecture

This operational guide documents backup strategies, disaster recovery procedures, secret rotation, and Prisma production migration workflows for LaunchPad OS.

---

## 1. Delineation of Architecture & Infrastructure

| Capability | Status | Details |
| :--- | :--- | :--- |
| **Prisma Migration Safety** | `VERIFIED` | Production uses `npx prisma migrate deploy` (never `db push`). |
| **Health & Readiness Probes** | `VERIFIED` | `GET /health/liveness` & `GET /health/readiness` active. |
| **Automated Local Backups** | `VERIFIED` | PostgreSQL `pg_dump` backup & restore scripts documented. |
| **Database Encryption at Rest** | `VERIFIED` | SHA-256 API key hashing, Bcrypt passwords, encrypted credentials. |
| **Cloud S3 Automated Vault** | `ARCHITECTURE-READY` | Design ready; requires AWS S3 / GCP GCS bucket provisioning. |
| **Multi-Region Failover** | `ARCHITECTURE-READY` | DB read-replica routing design; requires cloud DB cluster. |

---

## 2. PostgreSQL Backup Procedures

### Automated Backup Command (`pg_dump`)
Run daily or prior to major database migrations:

```bash
# Export compressed PostgreSQL database backup with timestamp
pg_dump -h localhost -U launchpad -d launchpad_os -F c -b -v -f "./backups/launchpad_os_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Automated Backup Script (`backup.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/launchpad"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U launchpad -d launchpad_os -F c -b -v -f "$BACKUP_DIR/db_$TIMESTAMP.dump"
# Retain last 30 daily backups
find $BACKUP_DIR -type f -name "*.dump" -mtime +30 -delete
```

---

## 3. PostgreSQL Restore Procedures

To restore a PostgreSQL database backup:

```bash
# 1. Drop existing connection sessions (if necessary)
psql -U launchpad -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'launchpad_os';"

# 2. Recreate target database
dropdb -U launchpad launchpad_os
createdb -U launchpad launchpad_os

# 3. Restore from dump archive
pg_restore -U launchpad -d launchpad_os -v ./backups/launchpad_os_backup_latest.dump
```

---

## 4. Production Database Migration Workflow

> **Rule:** Never use `npx prisma db push` in production. `db push` is for local schema prototyping only and can cause data loss.

### Production Deployment Sequence
1. **Development Phase**: Create migration SQL files locally:
   ```bash
   npx prisma migrate dev --name add_feature_indexes
   ```
2. **CI Pipeline Phase**: Validate migration status:
   ```bash
   npx prisma migrate status
   ```
3. **CD / Production Deployment**: Execute migration safely against production DB:
   ```bash
   npx prisma migrate deploy
   ```

### Migration Rollback Procedure
If a production migration fails or causes schema issues:
1. Revert to previous application deployment container version.
2. If schema was altered, apply down-migration SQL script or restore from pre-deployment `pg_dump` backup.

---

## 5. Secret Recovery & Security Rotation

- **JWT Secret Rotation**: Update `JWT_SECRET` in production environment. Active user sessions will be prompted to re-authenticate cleanly.
- **API Key Revocation**: If an API key is compromised, revoke it immediately via `/api-management` or `/governance`. SHA-256 token hashing prevents reverse engineering from database dumps.
- **Integration Credentials**: Re-encrypt target system tokens through Integration Hub credentials manager.
