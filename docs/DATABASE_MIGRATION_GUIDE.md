# LaunchPad OS — Database Migration & Schema Guide

**Version:** `v1.0.0-production`  
**ORM Tool:** Prisma ORM `v5.10+`  
**Engine:** PostgreSQL 16  

---

## 1. Production Migration Strategy

LaunchPad enforces versioned, idempotent database schema migrations via Prisma.

In production deployment pipelines:
- **`prisma migrate deploy` MUST be used** to apply pending migration SQL scripts.
- **`prisma db push` IS STRICTLY FORBIDDEN** in production environments because it circumvents versioned migration histories and can cause irreversible data loss.

---

## 2. Migration Execution Commands

### Apply Pending Migrations in Production
```bash
cd backend
npx prisma migrate deploy
```

### Seed Baseline Production System Data
```bash
cd backend
npx ts-node prisma/seed.ts
```

### Check Migration Status
```bash
cd backend
npx prisma migrate status
```

---

## 3. Schema Modification Workflow (For Developers)

When introducing database schema updates during development:

1. Edit `backend/prisma/schema.prisma`.
2. Generate migration SQL file locally:
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. Commit generated migration files in `backend/prisma/migrations/` to Git.
4. Verify schema validity:
   ```bash
   npx prisma validate
   ```

---

## 4. Migration Failure & Rollback Runbook

If a migration fails during production deployment:

1. **Check Migration Status**:
   ```bash
   npx prisma migrate status
   ```
2. **Mark Failed Migration as Resolved** (if manually fixed in SQL):
   ```bash
   npx prisma migrate resolve --applied "20260917000000_migration_name"
   ```
3. **Roll Back Migration** (if required):
   - Apply reverse SQL script from schema backup before re-attempting `prisma migrate deploy`.
