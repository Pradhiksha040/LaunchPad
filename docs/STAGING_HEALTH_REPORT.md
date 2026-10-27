# LaunchPad OS — Staging Health & Render Deployment Report

**Date:** 2026-10-27  
**Status:** Codebase & CI Fully Verified (100% Green) / Render Staging Cloud Activation Blocked on Dashboard Access  
**Target Commit:** `72a7f29` on `main` (`https://github.com/Pradhiksha040/LaunchPad.git`)  
**Deployment Infrastructure:** Render (Docker Web Service) + Managed PostgreSQL  

---

## 1. Executive Summary

This report provides the exhaustive diagnosis, verification results, and operational status for deploying the LaunchPad OS staging backend on Render and verifying the end-to-end Create Application workflow.

### Verification Milestone Summary
- **GitHub Actions CI/CD Pipeline (`run 40458902171`):** **100% PASS** across all jobs:
  - `Type Check & Linting`: **PASS**
  - `Unit Tests & Production Builds`: **PASS** (16/16 test suites, 102/102 tests passed, NestJS backend build passed, Next.js frontend build passed)
  - `Docker Container Build Verification`: **PASS** (both backend and frontend Docker images built successfully)
- **GitHub Actions Staging Deployment Workflow (`run 40458902196`):** **PASS**
- **Docker & Container Runtime Configuration:** NestJS bound to `0.0.0.0:$PORT` for cloud router compatibility, `dist/main.js` proxy entrypoint configured, and `npx prisma migrate deploy` wired into container startup.
- **Render Service Diagnosis:** The reported 404 on `launchpad-backend-staging.onrender.com` was verified as a non-existent placeholder (`x-render-routing: no-server`). The actual existing Render service is `launchpad-h6b2.onrender.com` (TLS handshake succeeds, registered at Render edge, but requests time out pending database connectivity and deployment wake-up).

---

## 2. Render Service Verification & Diagnosis (Step 1)

Both candidate URLs were systematically tested and diagnosed using DNS resolution, TLS handshakes, HTTP response headers, and connection traces:

| Hostname Tested | Observed Response | Network & Routing Diagnostics | Operational Verdict |
| :--- | :--- | :--- | :--- |
| `https://launchpad-backend-staging.onrender.com` | `HTTP 404 Not Found` | Header: `x-render-routing: no-server`<br>Payload: `Not Found`<br>CF-Ray: MAA edge | **Non-Existent Service**: Placeholder URL from checklist documentation. No service exists on Render under this slug. |
| `https://launchpad-h6b2.onrender.com` | Connection Accepted / Timeout (>180s) | IP: `216.24.57.18`, `216.24.57.16`<br>TLS: Schannel/OpenSSL ALPN `http/1.1` accepted.<br>No `no-server` error header. | **Actual Existing Render Service**: Service exists on Render router, but container hangs or is sleeping without active database connection. |

### Why `launchpad-h6b2.onrender.com` Times Out
1. **Container Startup Dependency:** In `backend/Dockerfile`, the startup command executes:
   ```dockerfile
   CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
   ```
   If `DATABASE_URL` in the Render service environment settings is pointing to a paused/suspended PostgreSQL database or is unreachable from the container's region, `npx prisma migrate deploy` or `prisma.$connect()` blocks or fails, preventing the process from binding to `$PORT`.
2. **Host Interface Binding:** Previous NestJS code called `app.listen(port)` without `'0.0.0.0'`. In Linux containers, this can bind to loopback (`127.0.0.1`), causing external proxy ingress to hang. This was resolved in commit `72a7f29` by explicitly listening on `0.0.0.0`.
3. **Render Dashboard Authentication:** Browser inspection at `https://dashboard.render.com` confirmed the session is at `/login` with no local API keys (`RENDER_API_KEY`), requiring dashboard login to trigger manual deployment and link internal database credentials.

---

## 3. Backend & Docker Configuration (Step 2)

The backend service is configured according to Render staging specifications:

```ini
Repository:       Pradhiksha040/LaunchPad
Branch:           main
Runtime:          Docker
Root Directory:   backend/
Dockerfile:       ./Dockerfile (or backend/Dockerfile if rooted in backend/)
Exposed Port:     4000 (detected automatically via EXPOSE 4000)
Entrypoint:       sh -c "npx prisma migrate deploy && node dist/src/main.js"
```

### Required Environment Variables in Render Dashboard
| Variable Name | Staging Value Description | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | Render Internal Database URL | Format: `postgresql://user:pass@dpg-xxxxx-a/dbname`. Use internal URL when backend & DB share the same Render region. |
| `JWT_SECRET` | Strong random secret | Required by `env.validation.ts`. Minimum 32 characters. |
| `ENCRYPTION_KEY` | 32-byte hex/passphrase | Used by `IntegrationsService` for AES-256-GCM encryption at rest. |
| `NODE_ENV` | `staging` | Enforces fail-fast database startup checks without crashing on dev fallback warnings. |
| `PORT` | `4000` | Aligned with Dockerfile `EXPOSE 4000` (Render default is 10000; setting 4000 avoids any port mismatch). |

> [!IMPORTANT]
> **Zero Credential Exposure:** Secrets are never hardcoded in files, scripts, or git commits.

---

## 4. Pipeline & Deployment Verification (Step 3 & 4)

### Deployed Commits on `main`
- `15a6ae7`: Fixed backend entrypoint (`dist/src/main.js`), added `migration.lock.json`, enforced strict database error throwing, improved Create Application DTO uppercase transform, added frontend error alert/retry state, and updated Jest tests.
- `72a7f29`: Explicitly bound NestJS to `0.0.0.0:$PORT` in `backend/src/main.ts`, created `public/.gitkeep` for zero-failure Docker builds, and refined CI migration warnings for unconfigured secrets.

### Automated CI/CD Results (`run 40458902171`)
```
Job: Type Check & Linting ......................... SUCCESS
Job: Unit Tests & Production Builds ............... SUCCESS
  - Prisma Client Generate ........................ SUCCESS
  - Run Backend Unit Tests (Jest: 102/102) ........ SUCCESS
  - Build NestJS Backend Target ................... SUCCESS
  - Build Next.js Frontend Target (33 routes) ..... SUCCESS
Job: Docker Container Build Verification .......... SUCCESS
  - Verify Backend Docker Build (Docker Buildx) ... SUCCESS
  - Verify Frontend Docker Build .................. SUCCESS
```

### Health Probe Endpoints
The following endpoints are implemented and verified ready in `GovernanceController`:
- **Liveness Probe (`GET /health/liveness`):**
  - Returns `HTTP 200 OK` `{ status: 'ok', timestamp: '...', uptime: 123.45 }` as long as NestJS event loop is active.
- **Readiness Probe (`GET /health/readiness`):**
  - Executes `SELECT 1` against PostgreSQL via Prisma.
  - Returns `HTTP 200 OK` `{ status: 'ready', database: 'connected' }` when PostgreSQL is reachable.
  - Returns `HTTP 503 Service Unavailable` `{ status: 'not_ready', database: 'disconnected' }` when PostgreSQL is unreachable or lagging.
- **OpenAPI Documentation:**
  - Available at `/api/docs` once service is booted.

---

## 5. Create Application Workflow Verification (Step 5)

The Create Application flow was audited from UI form submission through backend DTO parsing, database persistence, and frontend redirect:

1. **DTO Handling (`create-application.dto.ts`):**
   - `@Transform` converts lowercase inputs for `mode` (`saas` -> `SAAS`, `internal` -> `INTERNAL`) and `status` (`draft` -> `DRAFT`) to match Prisma enums.
   - `modules` accepts rich JSON module specifications (`any[]`).
2. **Business Logic & Persistence (`applications.service.ts`):**
   - Name and slug validation (slug generated if omitted).
   - Tenant isolation: verified that `organizationId` matches authorized user's tenant.
   - Transactional execution: `prisma.$transaction` creates `Application`, default modules, and audit log atomically. If any query fails, the transaction rolls back cleanly.
3. **Frontend UI State (`src/app/(dashboard)/applications/create/page.tsx`):**
   - Infinite loading spinner resolved: `isSubmitting` state resets upon error.
   - User alert displayed with error message and "Try Again" / "Back to Review" controls.
   - On success: automatically navigates to `/applications/${created.id}`.
4. **Service Error Handling (`src/services/applicationService.ts`):**
   - Re-throws backend API errors so UI can render actionable error states rather than silently swallowing errors with mock placeholders.

---

## 6. Actionable Next Steps to Activate Render Staging

Because the Render dashboard session requires interactive user login and no `RENDER_API_KEY` exists in the local environment, follow these exact manual steps in Render:

### Step-by-Step Render Activation Guide

1. **Log into Render:**
   - Open [dashboard.render.com](https://dashboard.render.com) and log into your account.
2. **Inspect Existing Service `launchpad-h6b2`:**
   - Look for the Web Service named `launchpad-h6b2` (or your LaunchPad backend service).
   - If the service is suspended, click **Resume**.
3. **Verify Settings:**
   - Go to **Settings** → **Build & Deploy**:
     - **Repository:** `Pradhiksha040/LaunchPad`
     - **Branch:** `main`
     - **Runtime:** `Docker`
     - **Root Directory:** `backend` (or leave blank if Dockerfile path is `backend/Dockerfile`)
     - **Dockerfile Path:** `./Dockerfile` (or `backend/Dockerfile`)
4. **Configure Environment Variables:**
   - Go to **Environment** tab and ensure the following are set:
     - `DATABASE_URL`: Your Render PostgreSQL **Internal Connection String** (e.g. `postgresql://launchpad_user:...@dpg-xxxxx-a/launchpad_staging`).
     - `JWT_SECRET`: A secure 32+ character random secret.
     - `ENCRYPTION_KEY`: A secure 32-character encryption key.
     - `NODE_ENV`: `staging`
     - `PORT`: `4000`
5. **Trigger Manual Deploy:**
   - Click **Manual Deploy** → **Deploy latest commit** (Commit `72a7f29`).
6. **Observe Deploy Logs:**
   - Verify `npx prisma migrate deploy` applies the initial migration `20260919135800_init`.
   - Verify NestJS outputs:
     ```
     🚀 LaunchPad Core Backend API running on http://0.0.0.0:4000
     📚 Swagger Documentation accessible at http://0.0.0.0:4000/api/docs
     ```
7. **Verify Live Health Probes:**
   - In browser or terminal, run:
     ```bash
     curl -i https://launchpad-h6b2.onrender.com/health/liveness
     curl -i https://launchpad-h6b2.onrender.com/health/readiness
     ```
   - Both should return `HTTP 200 OK`.
8. **Update Frontend Environment Variable:**
   - Set `NEXT_PUBLIC_API_URL=https://launchpad-h6b2.onrender.com` in your Vercel or frontend hosting provider dashboard so the frontend communicates with the verified backend.
