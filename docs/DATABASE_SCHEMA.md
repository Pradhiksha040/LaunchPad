# 🗄️ LaunchPad OS Database Schema Documentation

LaunchPad OS uses PostgreSQL with Prisma ORM to provide multi-tenant data storage, RBAC permissions, organization tenant settings, and canonical entity models.

---

## 📐 Entity Relationship (ER) Summary

```
Organization (1) ──── (1) TenantConfig
Organization (1) ──── (N) User ──── (N) Role (via UserRole)
Organization (1) ──── (N) Customer
Organization (1) ──── (N) Product
Organization (1) ──── (N) Order
Organization (1) ──── (N) Appointment
Organization (1) ──── (N) Invoice
Organization (1) ──── (N) Employee
Organization (1) ──── (N) Workflow
Organization (1) ──── (N) Secret
Organization (1) ──── (N) FeatureFlag
```

---

## 📊 Core Tables

### `Organization`
Stores organization metadata, root domain, and industry classification.
- `id` (UUID, Primary Key)
- `name` (String)
- `domain` (String, Unique)
- `industry` (Enum: HEALTHCARE, CRM, HRMS, E_COMMERCE, etc.)

### `TenantConfig`
Stores tenant operating mode (STANDALONE vs INTEGRATION_HUB), active connector type (SAP, Oracle, Salesforce, REST), and field mapping JSON definitions.
- `id` (UUID, Primary Key)
- `organizationId` (UUID, Foreign Key)
- `mode` (Enum: STANDALONE | INTEGRATION_HUB)
- `connectorType` (Enum: GENERIC_REST | GRAPHQL | SOAP | SAP | ORACLE | SALESFORCE | MICROSOFT_DYNAMICS | CUSTOM)
- `connectorEndpoint` (String, Optional)
- `fieldMappings` (JSON, Stores Canonical -> Enterprise Key mapping)

### Canonical Tables (`Customer`, `Product`, `Order`, `Appointment`, `Invoice`, `Employee`, `Student`, `Vendor`, `Supplier`)
All canonical tables include `organizationId` for strict tenant isolation and `externalId` for tracking mapped entity IDs in legacy ERP systems (SAP VBELN, Salesforce Account ID, etc.).
