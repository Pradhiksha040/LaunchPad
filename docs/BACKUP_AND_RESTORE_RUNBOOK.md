# LaunchPad OS — Backup & Disaster Recovery Runbook

**Version:** `v1.0.0-production`  

---

## 1. Operational RPO & RTO Assumptions

- **Recovery Point Objective (RPO)**: **15 minutes** (Maximum acceptable data loss window during catastrophic failure).
- **Recovery Time Objective (RTO)**: **1 hour** (Target time to restore complete system operations from backup).

*Note: These assumptions reflect recommended operational targets and require managed cloud database automated backups (e.g., AWS RDS Automated Backups / Point-in-Time Recovery) or cron scheduled container backups.*

---

## 2. Automated PostgreSQL Backup Procedures

### 2.1 Full Logical Backup (`pg_dump`)
Run a compressed daily logical backup of the PostgreSQL database:

```bash
docker exec -t launchpad-postgres-prod pg_dump \
  -U launchpad_admin \
  -d launchpad_os_prod \
  -F c -b -v \
  -f /var/lib/postgresql/data/backups/launchpad_backup_$(date +%Y%m%d_%H%M%S).dump
```

### 2.2 Recommended Cron Backup Job
```cron
# Daily backup at 02:00 AM UTC
0 2 * * * root docker exec -t launchpad-postgres-prod pg_dump -U launchpad_admin -d launchpad_os_prod -F c -b -f /var/lib/postgresql/data/backups/launchpad_daily_$(date +\%Y\%m\%d).dump
```

---

## 3. Database Restoration Procedure (`pg_restore`)

To restore a database dump into a target PostgreSQL instance:

1. **Stop Application Backend**:
   ```bash
   docker-compose -f docker-compose.prod.yml stop backend
   ```

2. **Restore Dump File**:
   ```bash
   docker exec -i launchpad-postgres-prod pg_restore \
     -U launchpad_admin \
     -d launchpad_os_prod \
     --clean --if-exists --verbose \
     < /path/to/backup_file.dump
   ```

3. **Restart Application Backend**:
   ```bash
   docker-compose -f docker-compose.prod.yml start backend
   ```

4. **Verify System Integrity**:
   ```bash
   curl https://api.launchpad-os.com/health/readiness
   ```

---

## 4. Backup Retention Policy

- **Daily Backups**: Retain for 30 days.
- **Weekly Backups**: Retain for 12 weeks.
- **Monthly Backups**: Retain for 12 months.
