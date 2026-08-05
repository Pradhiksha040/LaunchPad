# 📡 LaunchPad OS API Reference

LaunchPad OS exposes a REST API documenting all canonical entity endpoints, authentication flows, organization management, integration hub orchestration, and AI setup wizard recommendations.

Base URL: `http://localhost:4000/api/v1`  
Swagger OpenAPI Interactive Docs: `http://localhost:4000/api/docs`

---

## 🔑 Authentication Endpoints

### 1. Register Organization & Super Admin
`POST /auth/register`

**Request Body:**
```json
{
  "email": "admin@apollohospital.org",
  "password": "SecurePassword123!",
  "firstName": "Apollo",
  "lastName": "Admin",
  "organizationName": "Apollo Hospitals",
  "domain": "apollo.launchpad.io",
  "industry": "HEALTHCARE",
  "mode": "INTEGRATION_HUB"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u_88192",
    "email": "admin@apollohospital.org",
    "firstName": "Apollo",
    "lastName": "Admin"
  },
  "organization": {
    "id": "org_99120",
    "name": "Apollo Hospitals",
    "domain": "apollo.launchpad.io",
    "mode": "INTEGRATION_HUB"
  }
}
```

---

### 2. Login User
`POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@apollohospital.org",
  "password": "SecurePassword123!"
}
```

---

## 🗄️ Canonical Resource Endpoints (Dual Mode Auto-Routed)

Header Required for Tenant Context: `X-Tenant-ID: <tenant_id_or_domain>`

### `GET /canonical/customers`
Retrieves customers list automatically from local DB (Standalone Mode) or enterprise backend (Integration Hub Mode).

### `POST /canonical/customers`
Creates a customer record with 2-way field transformation.

### `GET /canonical/orders`
Retrieves canonical orders list.

### `POST /canonical/orders`
Creates a canonical order payload.

---

## 🔌 Integration Hub Endpoints

### `GET /integration-hub/tenant-config`
Resolves active operating mode, connector type, and field mapping configuration for tenant.

### `POST /integration-hub/execute`
Executes custom action via active Enterprise Connector (SAP BAPI, Salesforce API, Oracle OIC).

---

## 🤖 AI Setup Wizard Endpoints

### `POST /ai-wizard/recommend`
Generates connector recommendation, 2-way field mapping schemas, and suggested starter modules.
