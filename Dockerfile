# Multi-stage Dockerfile for LaunchPad OS Monorepo

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-libc6-compat libc6-compat
COPY package.json turbo.json package-lock.json* ./

# Installer stage
FROM base AS installer
COPY packages ./packages
COPY apps ./apps
RUN npm install

# Build API stage
FROM installer AS api-builder
RUN npm run build --filter=@launchpad/api

# Build Web stage
FROM installer AS web-builder
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build --filter=@launchpad/web

# API Runner
FROM node:20-alpine AS api-runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=api-builder /app/apps/api/dist ./dist
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/apps/api/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main.js"]

# Web Runner
FROM node:20-alpine AS web-runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000
COPY --from=web-builder /app/apps/web/.next ./
COPY --from=web-builder /app/apps/web/public ./public
COPY --from=web-builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
