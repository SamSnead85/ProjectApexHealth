# ═══════════════════════════════════════════════════════════════════════════════
# Apex Health Platform - NestJS API Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════
# Multi-stage build for minimal production image size and attack surface.
#
# Stages:
#   1. deps     - Install production + dev dependencies
#   2. build    - Compile TypeScript → JavaScript
#   3. prod     - Slim runtime with only production deps + compiled output
#
# Build:  docker build -t apex-api .
# Run:    docker run -p 3000:3000 --env-file .env apex-api
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Install Dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install build tools needed for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching.
# Only re-installs when package.json or lock file changes.
COPY package.json package-lock.json* ./

RUN npm ci

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the NestJS application (compiles TS to JS in dist/)
RUN npm run build

# Prune dev dependencies after build to keep only production deps
RUN npm prune --production

# ─── Stage 3: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS prod

# Security: run as non-root user
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy only what's needed for runtime
COPY --from=build --chown=nestjs:nestjs /app/dist ./dist
COPY --from=build --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nestjs /app/package.json ./package.json

# Set production environment
ENV NODE_ENV=production
ENV API_PORT=3000

# Expose the API port
EXPOSE 3000

# Switch to non-root user
USER nestjs

# Health check: verify the API is responding
# Uses the /api/v1/health endpoint which checks DB, Redis, and memory
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); \
    const req = http.request({hostname:'localhost',port:3000,path:'/api/v1/health',timeout:5000}, \
    (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); \
    req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["node", "dist/main"]
