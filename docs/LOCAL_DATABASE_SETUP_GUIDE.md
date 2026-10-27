# LaunchPad OS — Local Database Setup & Operational Guide

**Date:** 2026-10-27  
**Status:** **VERIFIED & OPERATIONAL (Local PostgreSQL)**  
**Local Database Name:** `launchpad_dev`  
**Host & Port:** `127.0.0.1:5432`  
**Target Environment:** Local Development (Zero Cloud Subscription Dependency)  

---

## 1. Executive Summary

This guide documents the local PostgreSQL database configuration for LaunchPad OS, replacing any dependency on external paid cloud databases (Render / Neon) during active development.

All development data, relational schemas, user accounts, and application templates are stored and persisted permanently on your local computer disk across computer restarts and service reboots.

---

## 2. Verified Local Configuration

| Component | Setting / Implementation | Details |
| :--- | :--- | :--- |
| **Engine** | PostgreSQL 16 | Local service running on `127.0.0.1:5432`. |
| **Database Name** | `launchpad_dev` | Isolated development database. |
| **ORM** | Prisma ORM `v5.20.0` | [`backend/prisma/schema.prisma`](file:///d:/Prajai%20Tech/Product%20LaunchPad/Product%20LaunchPad/backend/prisma/schema.prisma) |
| **Migrations** | `20260919135800_init` | 32 tables, 11 enums, 839 DDL statements. Status: **Applied**. |
| **Seed Data** | `backend/prisma/seed.ts` | Default tenant (`TechSolutions Inc.`), 5 RBAC users, 4 templates, 1 sample app. Status: **Seeded**. |
| **Persistence** | Windows Local Storage / Volume | All tables and records survive machine and backend restarts. |

### Local Environment Configuration (`backend/.env`)
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:<YOUR_LOCAL_PASSWORD>@localhost:5432/launchpad_dev?schema=public"
JWT_SECRET="launchpad_enterprise_jwt_secret_key_2026_super_secure"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="launchpad_enterprise_refresh_secret_key_2026"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000,http://localhost:4000"
```

> [!NOTE]
> `backend/.env` is strictly protected by Git ignore rules (`.gitignore`). Local credentials are never tracked or exposed in source control.

---

## 3. Live Verification Results

The local database and backend connection were verified live:

1. **Liveness Probe (`GET http://localhost:4000/health/liveness`):**
   ```json
   {
     "status": "ok",
     "timestamp": "2026-10-27T08:49:18.580Z"
   }
   ```
   *Result:* **HTTP 200 OK**

2. **Readiness Probe (`GET http://localhost:4000/health/readiness`):**
   ```json
   {
     "status": "ready",
     "database": "connected",
     "latencyMs": 47,
     "timestamp": "2026-10-27T08:49:28.884Z"
   }
   ```
   *Result:* **HTTP 200 OK** (Local database connection active with 47ms latency).

3. **Authentication & Data Retrieval (`POST http://localhost:4000/auth/login`):**
   - **Credentials Tested:** `alexander@launchpad-os.com` / `DemoPass123!`
   - **Result:** **HTTP 201 Created**
   - **Payload:** Returned valid JWT access token, refresh token, and organization record for `TechSolutions Inc.`, successfully read from local PostgreSQL.

---

## 4. How to Run LaunchPad OS Locally

### Starting the Backend
```bash
cd backend
npm run start:dev
```
- API Base URL: `http://localhost:4000`
- Swagger Documentation: `http://localhost:4000/api/docs`

### Starting the Frontend
```bash
npm run dev
```
- Dashboard URL: `http://localhost:3000`

### Seed Account Credentials for Local Testing
| Email | Password | Role | Organization |
| :--- | :--- | :--- | :--- |
| `alexander@launchpad-os.com` | `DemoPass123!` | `SUPER_ADMIN` | TechSolutions Inc. |
| `elena.rostova@techsolutions.io` | `DemoPass123!` | `ORG_ADMIN` | TechSolutions Inc. |
| `marcus.c@devhub.org` | `DemoPass123!` | `DEVELOPER` | TechSolutions Inc. |
| `viewer@launchpad-os.com` | `DemoPass123!` | `VIEWER` | TechSolutions Inc. |
| `user@launchpad-os.com` | `DemoPass123!` | `USER` | TechSolutions Inc. |

---

## 5. Transitioning to Company Production Server Later

When the project is ready to deploy to the company's permanent server:

1. **Zero Code Changes:** The application dynamically reads `process.env.DATABASE_URL`. No source code modifications are necessary.
2. **Server Environment Variable:** Set the production database connection string on the server:
   ```bash
   export DATABASE_URL="postgresql://company_prod_user:StrongPassword@company-db-host:5432/launchpad_prod?schema=public&sslmode=require"
   ```
3. **Execute Production Migration:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
   This safely creates all 32 tables and indexes on the company's database without risk to local data.
4. **Environment Isolation:** Local development data in `launchpad_dev` remains strictly on your machine and cannot contaminate company production databases.
