# LaunchPad OS — Operations & Monitoring Runbook

**Version:** `v1.0.0-production`  

---

## 1. System Health Probes

LaunchPad exposes unauthenticated public health check endpoints for container orchestrators (Kubernetes / ECS / Docker Swarm) and load balancers:

### 1.1 Liveness Probe Endpoint
- **URL**: `GET /health/liveness`
- **Purpose**: Checks if the NestJS Node.js process is alive and responding.
- **Expected Response**: `200 OK`
  ```json
  {
    "status": "UP",
    "timestamp": "2026-09-17T16:54:28.000Z",
    "uptimeSeconds": 86400
  }
  ```

### 1.2 Readiness Probe Endpoint
- **URL**: `GET /health/readiness`
- **Purpose**: Checks database connectivity (executes `$queryRaw SELECT 1`).
- **Expected Response**: `200 OK`
  ```json
  {
    "status": "READY",
    "database": {
      "status": "CONNECTED",
      "latencyMs": 4
    }
  }
  ```

### 1.3 System Health Metrics (Protected)
- **URL**: `GET /governance/health` (Requires JWT bearer token)
- **Purpose**: Returns memory usage, active connection count, and service statuses.

---

## 2. Container & Server Logs Inspection

### View Backend Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100 backend
```

### View Frontend Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100 frontend
```

---

## 3. Incident Response & Troubleshooting Matrix

| Symptom / Alert | Probable Cause | Action Step |
| :--- | :--- | :--- |
| **`GET /health/readiness` returns 503** | PostgreSQL connection failure or pool exhaustion. | Check `docker logs launchpad-postgres-prod`, verify `DATABASE_URL` credentials & network latency. |
| **High API Error Rates (5xx)** | Unhandled server exceptions or third-party service timeout. | Inspect backend container logs for NestJS stack trace using `docker logs launchpad-backend-prod`. |
| **Stripe Webhook Signature Mismatch (400)** | Incorrect `STRIPE_WEBHOOK_SECRET` configuration. | Verify webhook secret in `backend/.env.production` matches Stripe Dashboard webhook endpoints. |
| **Rate Limit Triggered (429)** | Single IP or API Key exceeding request ceiling. | Adjust `RATE_LIMIT_MAX` or check for malicious bot traffic. |
