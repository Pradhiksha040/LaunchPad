# LaunchPad OS — Developer & API Gateway Guide

**Version:** `v1.0.0-production`  

---

## 1. Developer Portal Overview (`/developer`)

LaunchPad provides a developer ecosystem for creating API keys, building custom integration connectors, defining incoming webhooks, and interacting with platform APIs.

---

## 2. Interactive Swagger OpenAPI Documentation

LaunchPad auto-generates interactive Swagger API documentation accessible at:
`http://localhost:4000/api/docs` (or `https://api.launchpad-os.com/api/docs` in production).

---

## 3. Authentication & API Key Usage

### 3.1 User Authentication (JWT)
Pass the bearer token in the HTTP Authorization header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### 3.2 Developer API Key Authentication
Pass your active developer API key:
```http
X-API-Key: lpd_live_abcdef1234567890
```

---

## 4. Rate Limiting Headers

All API responses return rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 994
X-RateLimit-Reset: 1789643722
```

When rate limits are exceeded, the API Gateway returns HTTP `429 Too Many Requests`.
