# 🚀 LaunchPad OS — Enterprise White-Label Business Application Platform

![LaunchPad OS Architecture](https://img.shields.io/badge/Architecture-Enterprise%20Dual--Mode-6F4E37)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-8B5E3C)
![NestJS](https://img.shields.io/badge/Backend-NestJS%20TypeScript-A67C52)
![Prisma](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Prisma-4E342E)
![License](https://img.shields.io/badge/License-MIT-2F241F)

**LaunchPad OS** is a production-ready, enterprise-grade, white-label Business Application Platform designed to help organizations build, deploy, and scale modern business applications across industries (Healthcare, CRM, HRMS, Education, Food Delivery, Logistics, Real Estate, E-Commerce, etc.) using reusable modules, industry starter templates, and dynamic integrations.

---

## 🌟 Key Operating Modes

LaunchPad OS supports two primary architectural operating modes:

### 1. 🏢 Standalone Mode
*Target: Startups and SMBs without existing software infrastructure.*
LaunchPad provides the complete application backend:
- **Frontend**: Next.js 15 with Brown & Beige executive design system
- **Backend**: NestJS REST API with Swagger OpenAPI documentation
- **Database**: PostgreSQL with Prisma ORM
- **Security**: JWT, OAuth2, API Keys & Granular RBAC
- **Services**: Payments, Notifications, Analytics, Media Storage, Workflows, Audit Logs

### 2. ⚡ Integration Hub Mode
*Target: Enterprises with legacy ERP/CRM systems (SAP, Oracle, Salesforce, Microsoft Dynamics, REST, GraphQL, SOAP).*
LaunchPad OS acts as a modern frontend portal & API Orchestration/Transformation Layer:
- **Tenant Configuration Driven**: Connectors are selected dynamically from tenant metadata stored in DB.
- **Canonical Data Model**: Automatic 2-way payload mapping between LaunchPad standard objects (Customer, Product, Order, Appointment, Invoice, Employee) and legacy schemas.
- **Enterprise Features**: Zero data migration required; business data stays in the client's core database.

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── web/                    # Next.js 15 Enterprise App with Brown/Beige theme & Framer Motion
│   └── api/                    # NestJS API backend with Prisma ORM, Auth, RBAC & Integration Hub
├── packages/
│   ├── shared/                 # Canonical Data Models, DTOs, Shared Enums & Utilities
│   ├── connectors/             # Connector Framework (SAP, Oracle, Salesforce, REST, GraphQL, SOAP)
│   ├── ui/                     # Shared UI Design System (Brown & Beige Palette)
│   ├── sdk/                    # LaunchPad OS JS/TS SDK Client
│   └── config/                 # Monorepo TSConfig, ESLint, and Prettier rules
├── docs/                       # Enterprise Documentation Suite (10 Comprehensive Guides)
├── docker-compose.yml          # Multi-container orchestration (Postgres, Redis, RabbitMQ)
├── Dockerfile                  # Production multi-stage Docker build
└── .github/workflows/ci.yml   # GitHub Actions CI/CD Pipeline
```

---

## 📚 Documentation Suite

Check the [`docs/`](./docs) directory for complete technical specifications:

- 🏗️ [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — High-level design, service interaction, request flow, and security.
- 📡 [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) — Endpoint documentation, payload schemas, error handling.
- 🗄️ [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) — Prisma ER schema, tables, relations, indexing strategies.
- 🔌 [`docs/INTEGRATION_GUIDE.md`](./docs/INTEGRATION_GUIDE.md) — Integration Hub setup, connector selection flow, request transformation.
- 🧰 [`docs/CONNECTOR_SDK.md`](./docs/CONNECTOR_SDK.md) — Guide for creating custom enterprise connectors using `BaseConnector`.
- 🚢 [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md) — Docker, Kubernetes (K8s), and CI/CD deployment instructions.
- 💻 [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) — Monorepo commands, architecture patterns, coding standards.
- 🤝 [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) — Branching strategy, commit conventions, PR approval flow.
- 🗺️ [`docs/ROADMAP.md`](./docs/ROADMAP.md) — Execution roadmap across Phase 1 through Phase 5.
- 📜 [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) — Release notes and version history.

---

## 🎨 Design System (Brown & Beige Executive Palette)

LaunchPad OS implements an enterprise brown & beige palette for a warm, high-end SaaS feel:

| Element | Color Code | Description |
| :--- | :--- | :--- |
| **Primary** | `#6F4E37` | Coffee Brown |
| **Secondary** | `#8B5E3C` | Warm Brown |
| **Accent** | `#A67C52` | Golden Brown |
| **Background** | `#F8F4EF` | Warm Beige |
| **Card BG** | `#FFFDF9` | Soft Cream |
| **Sidebar** | `#4E342E` | Deep Dark Espresso |
| **Borders** | `#D9CBB8` | Muted Beige Border |
| **Text Primary** | `#2F241F` | Dark Espresso Text |

---

## ⚙️ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Pradhiksha040/LaunchPad.git
cd LaunchPad

# 2. Install dependencies
npm install

# 3. Start local development environment
npm run dev

# 4. Access Web & API
# Frontend Web App: http://localhost:3000
# Backend API & Swagger: http://localhost:4000/api/docs
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL
- **Security**: JWT, OAuth2, API Keys, RBAC Guards, Secrets Manager
- **Infrastructure**: Docker, Docker Compose, Redis, RabbitMQ, S3 Storage

---

## 📄 License

MIT © LaunchPad Enterprise Architect Team
