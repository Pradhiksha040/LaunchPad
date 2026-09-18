# LaunchPad OS — Production Deployment Guide

**Version:** `v1.0.0-production`  
**Target Environments:** Docker Compose, Kubernetes, AWS ECS, GCP Cloud Run  

---

## 1. Prerequisites & System Requirements

- **Operating System**: Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9 recommended)
- **Container Runtime**: Docker Engine `v24.0+` & Docker Compose `v2.20+`
- **Database**: PostgreSQL `16.0+` (Managed RDS / Cloud SQL / Containerized)
- **RAM**: Minimum 4 GB (8 GB recommended for production traffic)
- **CPU**: Minimum 2 vCPUs (4 vCPUs recommended)
- **Domain & SSL**: Valid FQDN (e.g., `app.launchpad-os.com` & `api.launchpad-os.com`) with TLS certificates (Let's Encrypt / AWS ACM).

---

## 2. Environment Setup & Configuration

1. **Clone Release Package**:
   ```bash
   git clone https://github.com/Pradhiksha040/LaunchPad.git -b v1.0.0-production
   cd LaunchPad
   ```

2. **Configure Production Environment Files**:
   - Copy root frontend template:
     ```bash
     cp .env.production.example .env.production
     ```
   - Copy backend template:
     ```bash
     cp backend/.env.production.example backend/.env.production
     ```

3. **Populate Secrets**:
   - Update `DATABASE_URL` with real database credentials.
   - Generate strong cryptographic secrets:
     ```bash
     # JWT Secret
     openssl rand -base64 48
     
     # Encryption Key (32-byte hex)
     openssl rand -hex 32
     ```
   - Set Stripe Live Keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

---

## 3. Database Migration & Initialization

Run database migrations against the production database **before starting application containers**:

```bash
cd backend
npx prisma migrate deploy
npx ts-node prisma/seed.ts
cd ..
```

> ⚠️ **CRITICAL**: Never run `npx prisma db push` in production as it can lead to accidental data loss or non-versioned schema drift.

---

## 4. Launching Container Stack

Deploy the production stack using Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Verify Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Inspect Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## 5. Reverse Proxy & SSL Configuration (Nginx Example)

Configure Nginx as a reverse proxy with Let's Encrypt TLS termination:

```nginx
server {
    listen 443 ssl http2;
    server_name api.launchpad-os.com;

    ssl_certificate /etc/letsencrypt/live/api.launchpad-os.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.launchpad-os.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Deployment Verification & Health Check

Verify service endpoints after deployment:

- **Liveness Probe**: `curl -I https://api.launchpad-os.com/health/liveness`
- **Readiness Probe**: `curl -I https://api.launchpad-os.com/health/readiness`
- **Swagger Documentation**: Access `https://api.launchpad-os.com/api/docs`
- **Frontend App UI**: Access `https://app.launchpad-os.com`
