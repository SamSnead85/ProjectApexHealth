# ═══════════════════════════════════════════════════════════════════════════════
# Apex Health Platform - Frontend Dockerfile (React + Vite → nginx)
# ═══════════════════════════════════════════════════════════════════════════════
# Multi-stage build: compiles the React SPA with Vite, then serves with nginx.
# nginx is configured for SPA routing (all routes → index.html) and security.
#
# Build:  docker build -t apex-web .
# Run:    docker run -p 80:80 apex-web
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Build the React Application ────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for dependency layer caching
COPY package.json package-lock.json* ./

RUN npm ci

# Copy all source files
COPY . .

# Build the production bundle (outputs to dist/)
RUN npm run build

# ─── Stage 2: Serve with nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS prod

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration for SPA routing
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the built React app from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Security: run nginx as non-root (nginx.conf is configured for this)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expose port 80
EXPOSE 80

# Switch to non-root user
USER nginx

# Health check: verify nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
