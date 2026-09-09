# 💻 LaunchPad OS Developer Guide

Welcome to the **LaunchPad OS Developer Guide**. This document outlines repository layout, coding standards, monorepo scripts, and testing procedures.

---

## 📂 Repository Workspace Structure

```
LaunchPad OS (Monorepo)
├── apps/
│   ├── web/               # Next.js 15 App Router Frontend (Brown & Beige Palette)
│   └── api/               # NestJS Enterprise API Server with Prisma ORM
├── packages/
│   ├── shared/            # Canonical Data Models, DTOs & Enums
│   ├── connectors/        # Connector Framework (SAP, Oracle, Salesforce, REST, etc.)
│   ├── ui/                # Shared UI Components & Design System
│   ├── sdk/               # JS/TS Client SDK
│   └── config/            # Monorepo TSConfig, ESLint, Prettier
```

---

## 📜 Monorepo Terminal Commands

```bash
# Build all workspaces
npm run build

# Run TypeScript type checking
npm run type-check

# Run linters across monorepo
npm run lint

# Run Jest unit & integration tests
npm run test
```
