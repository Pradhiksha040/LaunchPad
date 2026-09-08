# LaunchPad OS — Reusable Application Platform Frontend

LaunchPad OS is an enterprise-grade reusable application development and deployment platform. Instead of rebuilding common capabilities (authentication, organizations, role-based access control, notification dispatching, file management, API routing, audit logging, and layout frames) for every business application, LaunchPad provides reusable core modules and templates to accelerate application delivery.

---

## 🌟 Product Vision & Operational Engine

LaunchPad OS explicitly supports two distinct operational modes:

### Mode 1 — Standalone Mode
For businesses that require complete application infrastructure.
```text
Customer
   ↓
LaunchPad Frontend
   ↓
LaunchPad Backend
   ↓
LaunchPad Database
```

### Mode 2 — Integration Hub Mode
For companies with pre-existing backends (e.g. PHP CRM, Python Django HRMS, Legacy Java VMS).
```text
LaunchPad Frontend
       ↓
Integration Hub
       ↓
Connector Layer
       ↓
Existing Customer Backend (PHP / Python / Java)
       ↓
Customer Database (Source of Truth)
```
> **Key Principle**: LaunchPad does not force customers to replace their existing backend systems. In Integration Hub Mode, existing systems remain the authoritative source of truth.

---

## 🎨 Visual Identity & Color System

Designed with a calm, premium **Pistachio Green + White + Deep Green** corporate aesthetic:

- **Primary Canvas / BG**: `#FFFFFF` (White)
- **Soft Mint**: `#F3F9F5` (Page sections, card backgrounds)
- **Pistachio**: `#DDEEDF` (Tags, module badges, selection highlights)
- **LaunchPad Green**: `#3F7659` (Primary CTAs, active links, main buttons)
- **Deep Green**: `#173C2D` (Headings, logo, strong text)
- **Soft Beige Accent**: `#F3EBDD` (Secondary accent)

**Color Ratio**: `70% White/Neutral / 20% Soft Mint/Pistachio / 10% Deep Green/Primary Green`

---

## 🚀 Key Features & Modules

- **LaunchPad Control Center**: Dashboard monitoring active applications, connector health, API traffic, and deployment logs.
- **7-Step Application Creation Wizard**: Multi-step builder (App Details -> Mode Selection -> Template -> Core Modules -> Custom Branding -> Review -> Animated Build Process).
- **Template Marketplace**: Pre-configured enterprise templates (Visitor Management, Content OS, CRM Portal, HRMS, School Management, Healthcare, E-Commerce).
- **Integration Hub & Connector Registry**: Architecture visualizer, REST/Webhook connectors, and live endpoint connection tester with latency display.
- **Visual Builders**: Visual Page Builder, Form Builder, and Workflow Builder.
- **Identity & Access Management**: Users, Multi-tenant Organizations, and Role-Based Access Control (RBAC) Permission Matrix.
- **Interactive Demos**:
  - **Visitor Management System (VMS)**: Standalone Mode generated application.
  - **Existing PHP CRM Hub**: Integration Hub Mode with live API data mapping.
  - **Existing Python HRMS**: Integration Hub Mode with Django API sync.
- **Theme Builder & Settings**: Live dynamic CSS custom variable customization.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS v3 + CSS custom variables (`--lp-primary`, `--lp-pistachio`, etc.)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Animations**: Framer Motion / Tailwind CSS Keyframes
- **State & Services**: API-ready mock service layer (`src/services/`)

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                           # Landing Page
│   ├── login/                             # Login Page
│   └── (dashboard)/
│       ├── dashboard/                     # Control Center
│       ├── applications/                  # Apps Catalog & App Detail ([id])
│       │   └── create/                    # 7-Step Application Creation Wizard
│       ├── templates/                     # Template Marketplace
│       ├── integrations/                  # Integration Hub & Connectors
│       ├── builders/                      # Page, Form, and Workflow Builders
│       ├── users/                         # Users & Permission Matrix
│       ├── organizations/                 # Multi-Tenant Organizations
│       ├── analytics/                     # Enterprise Analytics
│       ├── reports/                       # Data Exports & Reports
│       ├── billing/                       # SaaS Billing Plans
│       ├── audit-logs/                    # Security Audit Logs
│       ├── api-management/                # Developer API Keys
│       ├── developer/                     # Developer Portal & Security Center
│       ├── settings/                      # Settings & Theme Builder
│       └── demos/                         # Interactive Demos (VMS, PHP CRM, Python HRMS)
├── components/
│   ├── navigation/                        # Sidebar & Navbar
│   └── ui/                                # Base UI components
├── context/
│   └── BrandingContext.tsx                # Dynamic CSS variable context
├── mock/
│   └── data.ts                            # Typed enterprise mock data
├── services/                              # Async API-Ready Mock Service Layer
├── types/
│   └── index.ts                           # Comprehensive TypeScript interfaces
└── styles/
    └── globals.css                        # CSS variable declarations
```

---

## 💻 Installation & Local Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Verify Build & Linting**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 🔌 API-Ready Architecture Note

> **Note**: This repository currently contains the **LaunchPad OS frontend and mock services**. Real backend APIs and database integrations will be connected in the next development phase without changing the frontend UI components.
