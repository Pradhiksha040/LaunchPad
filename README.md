# 🚀 LaunchPad OS — Enterprise White-Label Business Application Platform

LaunchPad OS is an enterprise-grade reusable application development and deployment platform with full NestJS + Prisma + PostgreSQL backend integration. Instead of rebuilding common capabilities (authentication, organizations, role-based access control, notification dispatching, file management, API routing, audit logging, and layout frames) for every business application, LaunchPad provides reusable core modules and templates to accelerate application delivery.

---

## 🌟 Key Operating Modes

LaunchPad OS supports two primary architectural operating modes:

### 1. 🏢 Standalone Mode
For businesses that require complete application infrastructure.
```text
Customer
   ↓
LaunchPad Frontend (Next.js 14+)
   ↓
LaunchPad Backend (NestJS + Swagger API)
   ↓
LaunchPad Database (PostgreSQL + Prisma ORM)
```

### 2. ⚡ Integration Hub Mode
For companies with pre-existing backends (e.g. PHP CRM, Python Django HRMS, Legacy Java VMS).
```text
LaunchPad Frontend
       ↓
Integration Hub API
       ↓
Connector Layer (REST / Webhook / DB)
       ↓
Existing Customer Backend (PHP / Python / Java)
       ↓
Customer Database (Source of Truth)
```

---

## 🎨 Visual Identity & Palette

Designed with a calm, premium **Pistachio Green + White + Deep Green** corporate aesthetic:

- **Primary Canvas / BG**: `#FFFFFF` (White)
- **Soft Mint**: `#F3F9F5` (Page sections, card backgrounds)
- **Pistachio**: `#DDEEDF` (Tags, module badges, selection highlights)
- **LaunchPad Green**: `#3F7659` (Primary CTAs, active links, main buttons)
- **Deep Green**: `#173C2D` (Headings, logo, strong text)
- **Soft Beige Accent**: `#F3EBDD` (Secondary accent)

---

## 🚀 Key Features & Modules

- **LaunchPad Control Center**: Dashboard monitoring active applications, connector health, API traffic, and deployment logs.
- **Dynamic Application Module System**: Template-specific module catalogs (VMS, CRM, HRMS, Content OS, School, Event, Healthcare, Ecommerce, etc.) with custom module creation, dependency resolution, and visibility/permission configuration.
- **Backend API & Data Persistence**: Connected NestJS REST API with Prisma ORM, JWT Auth, RBAC guards, and Audit Logging.
- **7-Step Application Creation Wizard**: Multi-step builder with animated deployment.
- **Template Marketplace**: Pre-configured enterprise templates.
- **Integration Hub & Connector Registry**: Architecture visualizer, REST/Webhook connectors, and live endpoint connection tester.
- **Visual Builders**: Visual Page Builder, Form Builder, and Workflow Builder.
- **Identity & Access Management**: Multi-tenant Organizations, Users, and RBAC Permission Matrix.

---

## 💻 Quick Start & Running Locally

### 1. Frontend Setup (Next.js 14+)
```bash
# Install dependencies
npm install

# Run frontend development server
npm run dev
# App will be accessible at http://localhost:3000
```

### 2. Backend Setup (NestJS + Prisma)
```bash
cd backend

# Install backend dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply migrations & seed database
npx prisma db seed

# Run backend development server
npm run start:dev
# API will be accessible at http://localhost:4000
# Swagger API Docs: http://localhost:4000/api/docs
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+, React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT, bcrypt, class-validator, Swagger OpenAPI
- **Architecture**: Modular Monorepo, REST API, Multi-tenant RBAC

---

## 📄 License

MIT © LaunchPad Platform Team
