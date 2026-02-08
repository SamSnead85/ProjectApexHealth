"""
Apex Health AI Services - FastAPI Application
Agent orchestration, voice agents, document intelligence, and ML services.
"""

import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import agents, voice, documents, predictions, workflows

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("Starting Apex Health AI Services", version="1.0.0")
    # Initialize connections, load models, etc.
    yield
    logger.info("Shutting down Apex Health AI Services")


app = FastAPI(
    title="Apex Health AI Services",
    description=(
        "Enterprise healthcare AI platform providing:\n"
        "- **Agent Orchestrator** - Multi-agent system for claims, prior auth, coding\n"
        "- **Voice Agent Platform** - HIPAA-compliant voice agents for call centers\n"
        "- **Document Intelligence** - OCR, classification, data extraction\n"
        "- **Predictive Analytics** - Fraud detection, cost prediction, risk scoring\n"
        "- **Workflow AI** - Intelligent workflow node execution"
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_url, settings.api_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(documents.router, prefix="/api/v1/documents/ai", tags=["document-intelligence"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(workflows.router, prefix="/api/v1/workflows/ai", tags=["workflow-ai"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "apex-ai-services",
        "version": "1.0.0",
    }
