# LaunchPad OS — Environment Configuration Guide

**Version:** `v1.0.0-production`  

---

## 1. Overview

LaunchPad uses standard environment variables to configure system behavior, database connectivity, authentication parameters, CORS policy, rate limits, and third-party integrations (Stripe).

All production secrets **MUST** be supplied via environment variables or cloud secrets managers (AWS Secrets Manager, GCP Secret Manager, Vault) and **NEVER** hardcoded in source code or committed to repository files.

---

## 2. Backend Environment Variables (`backend/.env.production`)

| Variable Name | Required | Type | Default / Example | Description |
| :--- | :---: | :---: | :--- | :--- |
| `PORT` | Yes | Number | `4000` | HTTP port on which NestJS API Gateway listens. |
| `NODE_ENV` | Yes | String | `production` | Execution mode (`development`, `staging`, `production`). |
| `DATABASE_URL` | Yes | Connection String | `postgresql://user:pass@host:5432/dbname?schema=public` | PostgreSQL connection URL with database credentials & SSL mode. |
| `JWT_SECRET` | Yes | Secret String | Min 64 chars random string | Secret key for signing HMAC-SHA256 JWT access tokens. |
| `CORS_ORIGIN` | Yes | String List | `https://app.launchpad-os.com` | Comma-separated HTTPS frontend domains allowed for CORS. |
| `RATE_LIMIT_MAX` | No | Number | `1000` | Maximum API requests permitted within rate limit window. |
| `RATE_LIMIT_WINDOW_MS` | No | Number | `60000` | Rate limit window duration in milliseconds (default: 1 min). |
| `STRIPE_SECRET_KEY` | Conditional | Secret String | `stripe_secret_key_placeholder` | Stripe API Secret Key for processing monetization checkout sessions. |
| `STRIPE_WEBHOOK_SECRET` | Conditional | Secret String | `stripe_webhook_secret_placeholder` | Stripe Webhook Signing Secret for payload signature verification. |
| `PLATFORM_COMMISSION_RATE` | No | Decimal | `0.15` | Default platform commission rate (0.15 = 15%). |
| `ENCRYPTION_KEY` | Yes | Hex String | 32-byte hex string | Encryption key for AES-256-GCM symmetric encryption of credentials at rest. |

---

## 3. Frontend Environment Variables (`.env.production`)

| Variable Name | Required | Type | Default / Example | Description |
| :--- | :---: | :---: | :--- | :--- |
| `PORT` | Yes | Number | `3000` | HTTP port on which Next.js Node server listens. |
| `NODE_ENV` | Yes | String | `production` | Execution mode (`production`). |
| `NEXT_PUBLIC_API_URL` | Yes | URL String | `https://api.launchpad-os.com` | Public base URL of backend NestJS API Gateway accessed by browser client. |
| `NEXT_TELEMETRY_DISABLED` | No | Number | `1` | Disables Next.js anonymous telemetry data collection. |

---

## 4. Secret Generation Reference Commands

Generate strong cryptographically random keys for production:

```bash
# JWT Secret Key (64 characters base64)
openssl rand -base64 48

# Sensitive Data Encryption Key (32-byte hex for AES-256-GCM)
openssl rand -hex 32
```
