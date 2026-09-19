# LaunchPad OS — Production Deployment Checklist

**Version:** `v1.0.0-production`  
**Target:** Production / Staging Readiness Gate  
**Document Purpose:** Mandatory pre-flight and post-flight verification criteria for launching LaunchPad V1.

---

## 1. Security & Credentials Gate

- [x] **No Secrets in Source Control**: `.env`, `.env.production`, and credential files are gitignored and omitted from Git history.
- [x] **Strong JWT Secret Key**: Cryptographically generated base64 string (`openssl rand -base64 48`) configured; default values rejected by bootstrap validation.
- [x] **Symmetric Encryption Key**: 32-byte hex key (`ENCRYPTION_KEY`) configured for AES-256-GCM data encryption at rest.
- [x] **Database Isolation**: PostgreSQL database credentials use strong password policies with strict user privileges.
- [x] **CORS Enforcement**: Explicit origin list enforced via `CORS_ORIGIN` matching exact HTTPS frontend domain(s).
- [x] **Rate Limiting**: Rate limiter enabled (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`) to protect API gateway endpoints.
- [x] **Stack Trace Suppression**: Global `HttpExceptionFilter` formats clean RFC-7807 responses without leaking internal stack traces in production mode.

---

## 2. Infrastructure & Environment Configuration Gate

- [x] **Docker Image Compilation**: Multi-stage production `Dockerfile` (frontend) and `backend/Dockerfile` build cleanly as non-root `node` user.
- [x] **Node.js Environment**: `NODE_ENV=production` set in application containers.
- [x] **Health Check Endpoints**:
  - `GET /health/liveness` returns 200 OK with container uptime.
  - `GET /health/readiness` returns 200 OK with verified PostgreSQL database connectivity.
- [x] **OpenAPI / Swagger Spec**: Accessible at `/api/docs` with bearer token authentication scheme.

---

## 3. Database Migration & Integrity Gate

- [x] **Migration Deployment Tool**: Strictly using `npx prisma migrate deploy` for zero-drift versioned schema updates.
- [x] **No Unsafe Tools**: `npx prisma db push` prohibited in pre-production/production environments.
- [x] **Schema Validation**: Prisma schema passes `npx prisma validate`.
- [x] **Seed Execution**: Baseline system seed script (`npx ts-node prisma/seed.ts`) populates initial admin role, system applications, default templates, and marketplace connectors.
- [x] **Tenant Data Isolation**: Database tables enforce `organizationId` foreign key isolation with indexed tenant filtering.

---

## 4. Multi-Tenant & RBAC Verification Gate

- [x] **Organization Isolation**: Verification that users in Organization A cannot read, mutate, or access applications, users, audit logs, or settings belonging to Organization B.
- [x] **Role-Based Access Control (RBAC)**: Fine-grained permissions enforced across system roles (`Super Admin`, `Org Admin`, `Application Developer`, `End User`).
- [x] **JWT Token Integrity**: Tokens contain valid payload (`userId`, `organizationId`, `role`) with expiration handling.

---

## 5. End-to-End Core Workflow Gate

- [x] **Authentication Flow**: User registration, login, JWT token issuance, and logout functionality.
- [x] **Organization Management**: Creation, settings configuration, and white-label branding customization.
- [x] **Application Lifecycle**: Application wizard (creation, template selection, module selection, and deployment).
- [x] **Integration Hub**: Third-party API connector enablement and configuration.
- [x] **Marketplace Flow**: Item browsing, category filtering, publishing, and license validation.
- [x] **Compliance Audit Logs**: Immutable audit log recording for system actions, security events, and user activities.

---

## 6. Post-Deployment Verification Protocol

1. Run `curl -i http://<BACKEND_HOST>:4000/health/liveness`
2. Run `curl -i http://<BACKEND_HOST>:4000/health/readiness`
3. Verify browser frontend loading at `http://<FRONTEND_HOST>:3000`
4. Inspect server container logs (`docker logs launchpad-backend-prod --tail 100`) for zero runtime exceptions.
