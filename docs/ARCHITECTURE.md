# 🏗️ LaunchPad OS Architecture Documentation

LaunchPad OS is an enterprise-grade, white-label Business Application Platform designed to support dual operating modes: **Standalone Mode** for startups and **Integration Hub Mode** for enterprises.

---

## 🏛️ High-Level System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               LaunchPad OS Frontend (Next.js 15)       │
                    │               Brown & Beige SaaS UI System             │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               LaunchPad OS API Gateway (NestJS)        │
                    │               Auth (JWT/OAuth), RBAC, Validation       │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
                     ▼                                                     ▼
      ┌─────────────────────────────┐                       ┌─────────────────────────────┐
      │     MODE 1: STANDALONE      │                       │ MODE 2: INTEGRATION HUB     │
      │  Internal PostgreSQL DB     │                       │ Dynamic Connector Registry  │
      │  Prisma Canonical Entities  │                       │ (SAP, Oracle, Salesforce)   │
      └─────────────────────────────┘                       └──────────────┬──────────────┘
                                                                           │
                                                                           ▼
                                                            ┌─────────────────────────────┐
                                                            │ Existing Enterprise Backend │
                                                            │ (SAP S/4HANA, Oracle, etc.) │
                                                            └─────────────────────────────┘
```

---

## 🔄 Dual Operating Modes

### 1. Standalone Mode
- **Target**: Small businesses and startups.
- **Data Flow**: `Customer -> LaunchPad Next.js Web -> LaunchPad NestJS API -> PostgreSQL (Prisma)`.
- **Backend Role**: LaunchPad acts as the authoritative database and full backend server.

### 2. Integration Hub Mode
- **Target**: Medium and large enterprises with existing CRM, ERP (SAP, Oracle, Salesforce, Microsoft Dynamics).
- **Data Flow**: `Customer -> LaunchPad Next.js Web -> LaunchPad NestJS API -> Integration Hub -> Selected Connector -> Enterprise System`.
- **Backend Role**: LaunchPad acts as a modern UI portal and API Orchestration & Transformation layer. Business data remains inside client enterprise databases.

---

## 🔌 Integration Hub Core Engine

1. **Tenant Identification**: Resolves tenant configuration from headers (`X-Tenant-ID`) or subdomains.
2. **Connector Resolution**: Dynamically instantiates the target connector (`SAPConnector`, `SalesforceConnector`, `GenericRestConnector`) from `ConnectorRegistry` based on database metadata.
3. **Payload Transformation**: Maps LaunchPad's Canonical Schema (e.g. `firstName`, `lastName`) to Enterprise Schema (e.g. `NAME_FIRST`, `NAME_LAST`) and vice versa.
4. **Error & Retry Handling**: Built-in exponential backoff and circuit breaking.
