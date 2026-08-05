# 🚢 LaunchPad OS Deployment Guide

This guide covers local environment setup, multi-container Docker Compose deployment, and Kubernetes (K8s) production topology.

---

## 💻 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Pradhiksha040/LaunchPad.git
cd LaunchPad

# Install all monorepo dependencies
npm install

# Start PostgreSQL, Redis, RabbitMQ via Docker Compose
docker-compose up -d postgres redis rabbitmq

# Run database migrations & seed
npm run db:push
npm run db:seed

# Start Next.js Web App and NestJS API Server
npm run dev
```

---

## 🐳 2. Production Docker Deployment

```bash
# Build multi-stage production Docker image
docker build -t launchpad-os:latest .

# Run complete stack via Docker Compose
docker-compose up -d --build
```

---

## ☸️ 3. Kubernetes (K8s) Production Topology

Deploy LaunchPad OS to Kubernetes using standard manifests for:
- `launchpad-api-deployment.yaml` (Replicas: 3, Port: 4000)
- `launchpad-web-deployment.yaml` (Replicas: 3, Port: 3000)
- `launchpad-postgres-statefulset.yaml` (PostgreSQL 16)
- `launchpad-[#ingress].yaml` (TLS Ingress routing)
