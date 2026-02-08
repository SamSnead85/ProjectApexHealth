# ═══════════════════════════════════════════════════════════════════════════════
# Apex Health Platform - AI Services Dockerfile (Python / FastAPI)
# ═══════════════════════════════════════════════════════════════════════════════
# Multi-stage build optimized for ML workloads.
#
# Stages:
#   1. builder  - Install Python dependencies and build wheels
#   2. prod     - Slim runtime with only compiled packages
#
# Build:  docker build -t apex-ai-services .
# Run:    docker run -p 8000:8000 --env-file .env apex-ai-services
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Build Dependencies ─────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies needed for building native Python packages
# (numpy, scikit-learn, asyncpg, Pillow, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python packages into a virtual environment for clean copying
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM python:3.11-slim AS prod

# Install only runtime system libraries (no compilers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    libpng16-16 \
    tesseract-ocr \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Security: run as non-root user
RUN groupadd --system --gid 1001 aiservice && \
    useradd --system --uid 1001 --gid aiservice aiservice

WORKDIR /app

# Copy the virtual environment from builder (contains all installed packages)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source code
COPY --chown=aiservice:aiservice . .

# Set production environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBUG=false

# Expose the AI services port
EXPOSE 8000

# Switch to non-root user
USER aiservice

# Health check: verify FastAPI is responding on /health
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn - 4 workers for production workloads
# Workers can be overridden via WEB_CONCURRENCY environment variable
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--loop", "uvloop", \
     "--http", "httptools", \
     "--access-log"]
