# LaunchPad OS — Staging Deployment Guide

**Version:** `v1.0.0-production`  
**Target Environment:** Staging / Pre-Production Cloud Infrastructure & Local Container Stack  
**Document Purpose:** Complete reference guide for deploying, configuring, and validating LaunchPad V1 in a staging environment.

---

## 1. Staging Architecture Overview

LaunchPad OS V1 staging environment mirrors the production containerized architecture, isolating test workloads and staging data from production while exercising the complete microservices/monolith API and Next.js frontend stack.

```
                    +---------------------------------------+
                    |        Cloudflare / Reverse Proxy     |
                    |         (HTTPS / SSL Termination)     |
                    +-------------------+-------------------+
                                        |
                  +---------------------+---------------------+
                  |                                           |
                  v                                           v
    +---------------------------+               +---------------------------+
    |     Next.js Frontend      |               |     NestJS Backend API    |
    |  staging.launchpad-os.com |               | api-stage.launchpad-os.com|
    |      (Port 3000)          |               |      (Port 4000)          |
    +---------------------------+               +-------------+-------------+
                                                              |
                                                              v
                                                +---------------------------+
                                                |     PostgreSQL DB 16      |
                                                |   (Staging Schema/RDS)    |
                                                +---------------------------+
```

---

## 2. Infrastructure & System Requirements

| Service Component | Staging Requirement | Provider Options |
| :--- | :--- | :--- |
| **Frontend** | Node.js 20.x runtime / Container | Vercel, AWS ECS, GCP Cloud Run, Render |
| **Backend API** | Node.js 20.x runtime / Container | AWS ECS Fargate, GCP Cloud Run, Render, VPS |
| **Database** | PostgreSQL 16.0+ | AWS RDS, GCP Cloud SQL, Managed Postgres, Container |
| **Memory / CPU** | 2 vCPU, 4 GB RAM (Minimum) | Cloud instance / container specs |
| **SSL / Domain** | Wildcard / Staging Subdomains | Let's Encrypt / AWS Certificate Manager |

---

## 3. Environment Variables Configuration

Copy environment templates to staging environment files:

```bash
# Copy frontend template
cp .env.production.example .env.staging

# Copy backend template
cp backend/.env.production.example backend/.env.staging
```

### 3.1 Backend Staging Variables (`backend/.env.staging`)

```ini
PORT=4000
NODE_ENV=staging

# PostgreSQL Connection String (Staging Database)
DATABASE_URL="postgresql://launchpad_stage_user:StagingPassword123!@staging-db.launchpad-os.internal:5432/launchpad_staging?schema=public"

# Cryptographically Generated JWT Secret (Min 64 base64 chars)
JWT_SECRET="K7vN9xB2mQ4wL8pZ1yC3vF6rT0uI5oP7aS3dF9gH1jK4lM6nB8vC2xZ0yU4iO6p"

# Allowed Staging CORS Origins
CORS_ORIGIN="https://staging.launchpad-os.com,https://admin-staging.launchpad-os.com,http://localhost:3000"

# Rate Limiting Parameters
RATE_LIMIT_MAX=2000
RATE_LIMIT_WINDOW_MS=60000

# Stripe Monetization Test Credentials (Sandbox Mode)
STRIPE_SECRET_KEY="sk_test_51Mz...CHANGE_TO_YOUR_STRIPE_TEST_KEY"
STRIPE_WEBHOOK_SECRET="whsec_test_...CHANGE_TO_YOUR_STRIPE_WEBHOOK_TEST_SECRET"

# Platform Revenue Share Commission (15%)
PLATFORM_COMMISSION_RATE=0.15

# Sensitive Data Encryption Key (32-byte hex for AES-256-GCM)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

### 3.2 Frontend Staging Variables (`.env.staging`)

```ini
NODE_ENV=production
PORT=3000

# Public Backend API Gateway FQDN
NEXT_PUBLIC_API_URL=https://api-stage.launchpad-os.com

# Telemetry Disabled
NEXT_TELEMETRY_DISABLED=1
```

---

## 4. Database Migration & Initialization

> [!WARNING]
> **MIGRATION RULE**: Always use `npx prisma migrate deploy` in staging and production environments. **NEVER** use `npx prisma db push` as it can cause non-versioned schema drift or unintended data loss.

1. **Verify Database Connectivity & Migration Status**:
   ```bash
   cd backend
   npx prisma migrate status
   ```

2. **Execute Versioned Database Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Staging Database**:
   ```bash
   npx ts-node prisma/seed.ts
   ```

---

## 5. Building & Deploying Containers

### 5.1 Docker Compose Staging Launch

To launch the complete staging container stack locally or on a staging VPS:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d --build
```

### 5.2 Standalone Node Production Runner

If deploying directly to Node.js application servers (e.g. AWS EC2, DigitalOcean Droplet, Render):

**Backend API**:
```bash
cd backend
npm ci
npx prisma generate
npm run build
npm run start:prod
```

**Frontend Application**:
```bash
npm ci
npm run build
npm run start
```

---

## 6. Health & Readiness Probes

Validate container startup and database connectivity:

- **Liveness Probe**:
  ```bash
  curl -i http://localhost:4000/health/liveness
  # Expected Response: HTTP/1.1 200 OK -> {"status":"ok","uptime":...,"timestamp":...}
  ```

- **Readiness Probe**:
  ```bash
  curl -i http://localhost:4000/health/readiness
  # Expected Response: HTTP/1.1 200 OK -> {"status":"ok","database":"connected","timestamp":...}
  ```

- **Swagger API Docs**:
  Access `http://localhost:4000/api/docs` in browser.

---

## 7. Multi-Cloud Staging Deployment Procedures

### 7.1 AWS Deployment (ECS Fargate + RDS PostgreSQL)
1. Provision PostgreSQL RDS instance inside VPC private subnet.
2. Store secrets (`DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`) in AWS Secrets Manager.
3. Push Docker images (`launchpad-backend:v1.0.0-production`, `launchpad-frontend:v1.0.0-production`) to AWS ECR.
4. Deploy ECS Fargate tasks with Application Load Balancer (ALB) and ACM SSL Certificate.

### 7.2 GCP Deployment (Cloud Run + Cloud SQL)
1. Create GCP Cloud SQL PostgreSQL instance.
2. Store environment variables in GCP Secret Manager.
3. Build and push containers to Artifact Registry:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/launchpad-backend:v1.0.0-production ./backend
   gcloud builds submit --tag gcr.io/PROJECT_ID/launchpad-frontend:v1.0.0-production .
   ```
4. Deploy Cloud Run services with Cloud SQL Auth Proxy connector.

### 7.3 Render Deployment
1. Create PostgreSQL Managed Database on Render.
2. Create Web Service for Backend (`dockerfile: backend/Dockerfile`, set environment variables).
3. Create Web Service for Frontend (`dockerfile: Dockerfile`, set `NEXT_PUBLIC_API_URL`).

---

## 8. Rollback Procedure

If a staging deployment encounters critical errors:

1. **Revert Containers**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   git checkout tags/v1.0.0-production~1
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
2. **Database Rollback**:
   Restore staging PostgreSQL snapshot from automated pre-deployment backup.
