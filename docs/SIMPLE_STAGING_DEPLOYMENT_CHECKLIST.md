# LaunchPad V1 — Simple Staging Deployment Checklist

**Stack Architecture:**
- **Frontend App**: Vercel (Next.js 14)
- **Backend API**: Render (NestJS Docker Web Service)
- **Database**: Managed PostgreSQL (Render Postgres / Neon / Supabase)
- **Release Version**: `v1.0.0-production`

---

## 1. Prerequisites & Required Accounts

Before beginning deployment, ensure you have active accounts on the following platforms:

- [ ] **GitHub Account**: Access to repository `Pradhiksha040/LaunchPad`
- [ ] **Render Account**: [render.com](https://render.com) (Free / Hobby tier is sufficient for staging)
- [ ] **Vercel Account**: [vercel.com](https://vercel.com) (Free / Hobby tier is sufficient for staging)

---

## 2. Secure Secret Generation Reference

Run these commands in your local terminal to generate strong cryptographic secrets. **Do NOT save real secrets in Git repositories or commit them to source code.**

```bash
# 1. Generate JWT Secret Key (Min 64 base64 chars)
openssl rand -base64 48

# 2. Generate Sensitive Data Encryption Key (32-byte hex for AES-256-GCM)
openssl rand -hex 32
```

---

## 3. Step-by-Step Manual Setup Checklist

### Step 1: Provision Managed PostgreSQL Database (Render)
1. Log into **Render Dashboard** → Click **New +** → Select **PostgreSQL**.
2. **Configuration**:
   - **Name**: `launchpad-staging-db`
   - **Database**: `launchpad_staging`
   - **User**: `launchpad_user`
   - **Region**: Select region closest to your users (e.g. Oregon / Frankfurt / Singapore)
   - **Instance Type**: Free / Starter
3. Click **Create Database**.
4. **Copy Internal & External Connection Strings**:
   - **External Database URL**: `postgresql://launchpad_user:<PASSWORD>@<HOST>.render.com/launchpad_staging?ssl=true` (Save for local migration step).
   - **Internal Database URL**: `postgresql://launchpad_user:<PASSWORD>@<INTERNAL_HOST>/launchpad_staging` (Used by Render backend service).

---

### Step 2: Deploy NestJS Backend Service (Render)
1. In **Render Dashboard** → Click **New +** → Select **Web Service**.
2. Connect your GitHub repository (`Pradhiksha040/LaunchPad`).
3. **Service Configuration**:
   - **Name**: `launchpad-backend-staging`
   - **Language / Runtime**: **Docker**
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context Directory**: `backend`
   - **Branch**: `main` (or tag `v1.0.0-production`)
   - **Region**: Same region as database
4. **Environment Variables** (Add in Render Environment Settings tab):

   | Key | Value / Instructions |
   | :--- | :--- |
   | `NODE_ENV` | `staging` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | *Paste your Render Internal Database URL* |
   | `JWT_SECRET` | *Paste generated 64+ char base64 key* |
   | `ENCRYPTION_KEY` | *Paste generated 32-byte hex key* |
   | `CORS_ORIGIN` | `https://launchpad-frontend-staging.vercel.app` *(update once Vercel URL is created)* |
   | `RATE_LIMIT_MAX` | `2000` |
   | `RATE_LIMIT_WINDOW_MS` | `60000` |

5. Click **Create Web Service**.
6. Render will build the Docker container and deploy. Note your Render backend URL (e.g. `https://launchpad-backend-staging.onrender.com`).

---

### Step 3: Run Database Migrations & Seed Baseline Data
Execute versioned schema migration from your local machine targeting the Managed PostgreSQL Database:

```bash
cd backend

# Set DATABASE_URL to your Render External Database URL
export DATABASE_URL="postgresql://launchpad_user:<PASSWORD>@<HOST>.render.com/launchpad_staging?ssl=true"

# Deploy versioned schema migration (NEVER use db push)
npx prisma migrate deploy

# Seed baseline system roles, templates, and default org
npx ts-node prisma/seed.ts
```

---

### Step 4: Deploy Next.js Frontend (Vercel)
1. Log into **Vercel Dashboard** → Click **Add New...** → Select **Project**.
2. Import repository `Pradhiksha040/LaunchPad`.
3. **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. **Environment Variables** (Add under Project Settings → Environment Variables):

   | Key | Value / Instructions |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `NEXT_PUBLIC_API_URL` | *Paste your Render Backend URL* (e.g. `https://launchpad-backend-staging.onrender.com`) |
   | `NEXT_TELEMETRY_DISABLED` | `1` |

5. Click **Deploy**. Vercel will build the frontend and generate your public staging deployment URL (e.g. `https://launchpad-frontend-staging.vercel.app`).

---

### Step 5: Update CORS Policy on Backend
1. Return to **Render Dashboard** → Select `launchpad-backend-staging` → **Environment**.
2. Update `CORS_ORIGIN` to include your exact Vercel URL:
   `https://launchpad-frontend-staging.vercel.app`
3. Save changes (Render will automatically redeploy the backend service).

---

## 4. Post-Deployment Verification Probes

Once Vercel and Render deployments complete, verify all operational probes:

1. **Backend Liveness Probe**:
   `curl -i https://launchpad-backend-staging.onrender.com/health/liveness`
   *(Expected response: `HTTP 200 OK` with container uptime)*

2. **Backend Readiness & Database Connection Probe**:
   `curl -i https://launchpad-backend-staging.onrender.com/health/readiness`
   *(Expected response: `HTTP 200 OK` with database connected)*

3. **OpenAPI Swagger Specs**:
   Access `https://launchpad-backend-staging.onrender.com/api/docs` in browser.

4. **Frontend UI & E2E Smoke Test**:
   Open `https://launchpad-frontend-staging.vercel.app` in browser and verify:
   - Login page loads cleanly
   - Account creation / login works
   - Organization dashboard loads metrics
   - Application creation wizard completes
   - Multi-tenant isolation is active
