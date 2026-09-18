# LaunchPad OS — Operational Troubleshooting Guide

**Version:** `v1.0.0-production`  

---

## 1. Common Issues & Solutions

### 1.1 Backend Container Crashes on Startup
- **Symptom**: Container logs show `Environment variable validation failed`.
- **Cause**: Missing mandatory environment variables (`JWT_SECRET`, `DATABASE_URL`).
- **Solution**: Copy `.env.production.example` to `backend/.env.production` and populate all required fields.

### 1.2 Prisma Migration Pending Error
- **Symptom**: Database queries fail or return unknown column errors.
- **Cause**: Schema changes committed without deploying migrations.
- **Solution**: Execute `cd backend && npx prisma migrate deploy`.

### 1.3 CORS Error on Browser Requests
- **Symptom**: Browser console displays `Cross-Origin Request Blocked`.
- **Cause**: `CORS_ORIGIN` in `backend/.env.production` does not include the frontend origin domain.
- **Solution**: Add the exact frontend origin URL (e.g., `https://app.launchpad-os.com`) to `CORS_ORIGIN`.

### 1.4 Webhook 400 Bad Request Error
- **Symptom**: Stripe Webhook delivery fails with 400 response code.
- **Cause**: Raw request payload signature validation failed.
- **Solution**: Ensure raw request body is passed un-parsed to signature verifier and `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard.
