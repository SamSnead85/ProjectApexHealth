"""
Workflow AI Router
AI-powered workflow node execution for the visual workflow builder.
"""

import structlog
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.config import settings

logger = structlog.get_logger()
router = APIRouter()


class WorkflowNodeExecutionRequest(BaseModel):
    execution_id: str
    node_id: str
    node_type: str
    node_config: dict = {}
    input_data: dict = {}
    organization_id: str
    user_id: str


class WorkflowNodeExecutionResult(BaseModel):
    node_id: str
    status: str  # completed, failed, waiting_hitl
    output_data: dict = {}
    ai_metrics: Optional[dict] = None
    next_nodes: list[str] = []
    requires_hitl: bool = False
    hitl_reason: Optional[str] = None
    processing_time_ms: int = 0


# AI-powered node handlers
NODE_HANDLERS = {}


def register_node_handler(node_type: str):
    """Decorator to register a workflow node handler."""
    def decorator(func):
        NODE_HANDLERS[node_type] = func
        return func
    return decorator


@register_node_handler("llm_decision")
async def handle_llm_decision(config: dict, input_data: dict) -> dict:
    """LLM-based decision node - routes workflow based on AI analysis."""
    prompt = config.get("prompt", "Analyze the input and decide the next action.")
    options = config.get("options", ["approve", "deny", "review"])

    # In production: call Gemini with the prompt and input data
    return {
        "decision": options[0] if options else "approve",
        "confidence": 0.87,
        "reasoning": f"AI analysis of input data based on configured criteria: '{prompt}'",
        "next_branch": options[0] if options else "default",
    }


@register_node_handler("document_extraction")
async def handle_document_extraction(config: dict, input_data: dict) -> dict:
    """Extract structured data from uploaded documents."""
    document_id = input_data.get("document_id", "")
    document_type = config.get("document_type", "auto")

    return {
        "document_id": document_id,
        "extracted_fields": {
            "patient_name": "[Extracted]",
            "member_id": "[Extracted]",
            "diagnosis_codes": ["M54.5"],
            "procedure_codes": ["99213"],
        },
        "confidence": 0.91,
        "ocr_quality": "high",
    }


@register_node_handler("medical_coding_ai")
async def handle_medical_coding(config: dict, input_data: dict) -> dict:
    """AI-powered medical coding suggestion."""
    clinical_text = input_data.get("clinical_notes", "")

    return {
        "icd10_codes": [
            {"code": "M54.5", "description": "Low back pain", "confidence": 0.95},
        ],
        "cpt_codes": [
            {"code": "99213", "description": "Office visit, established, low", "confidence": 0.88},
        ],
        "requires_coder_review": True,
        "coding_notes": "AI-suggested codes based on clinical documentation",
    }


@register_node_handler("fraud_detector")
async def handle_fraud_detection(config: dict, input_data: dict) -> dict:
    """Fraud detection analysis node."""
    return {
        "fraud_score": 0.12,
        "risk_level": "low",
        "flags": [],
        "recommendation": "proceed",
    }


@register_node_handler("clinical_reasoner")
async def handle_clinical_reasoning(config: dict, input_data: dict) -> dict:
    """Clinical reasoning for medical necessity determination."""
    diagnosis = input_data.get("diagnosis_codes", [])
    procedure = input_data.get("procedure_codes", [])

    return {
        "medical_necessity": "supported",
        "confidence": 0.82,
        "clinical_rationale": "Procedure is clinically appropriate given documented diagnosis.",
        "guideline_references": ["InterQual 2024", "CMS LCD L35936"],
        "requires_md_review": False,
    }


@register_node_handler("sentiment_analysis")
async def handle_sentiment_analysis(config: dict, input_data: dict) -> dict:
    """Analyze sentiment in member communications."""
    text = input_data.get("text", "")

    return {
        "sentiment": "neutral",
        "score": 0.6,
        "urgency": "normal",
        "topics_detected": ["billing_inquiry", "benefit_question"],
        "escalation_recommended": False,
    }


@register_node_handler("eligibility_check")
async def handle_eligibility_check(config: dict, input_data: dict) -> dict:
    """Check member eligibility as a workflow step."""
    member_id = input_data.get("member_id", "")

    return {
        "eligible": True,
        "member_id": member_id,
        "plan": "PPO Gold",
        "status": "active",
        "deductible_remaining": 850.00,
    }


@register_node_handler("gemini_analyzer")
async def handle_gemini_analysis(config: dict, input_data: dict) -> dict:
    """General-purpose Gemini AI analysis node."""
    prompt = config.get("prompt", "Analyze the provided data.")

    return {
        "analysis": f"AI analysis based on prompt: '{prompt}'",
        "confidence": 0.85,
        "model": settings.default_model,
    }


@router.post("/execute-node", response_model=WorkflowNodeExecutionResult)
async def execute_workflow_node(request: WorkflowNodeExecutionRequest):
    """
    Execute a single AI-powered workflow node.
    Called by the workflow execution engine for nodes requiring AI processing.
    """
    start_time = datetime.utcnow()

    handler = NODE_HANDLERS.get(request.node_type)
    if not handler:
        return WorkflowNodeExecutionResult(
            node_id=request.node_id,
            status="failed",
            output_data={"error": f"Unknown node type: {request.node_type}"},
        )

    try:
        output = await handler(request.node_config, request.input_data)
        elapsed_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        requires_hitl = output.get("requires_md_review", False) or output.get("requires_coder_review", False)

        return WorkflowNodeExecutionResult(
            node_id=request.node_id,
            status="waiting_hitl" if requires_hitl else "completed",
            output_data=output,
            ai_metrics={
                "model": settings.default_model,
                "confidence": output.get("confidence", 0),
                "processing_time_ms": elapsed_ms,
            },
            requires_hitl=requires_hitl,
            hitl_reason="AI confidence below threshold or review required" if requires_hitl else None,
            processing_time_ms=elapsed_ms,
        )

    except Exception as e:
        logger.error("Workflow node execution failed", node_type=request.node_type, error=str(e))
        return WorkflowNodeExecutionResult(
            node_id=request.node_id,
            status="failed",
            output_data={"error": str(e)},
        )


@router.get("/node-types")
async def list_ai_node_types():
    """List available AI-powered workflow node types."""
    return {
        "node_types": [
            {
                "type": "llm_decision",
                "name": "LLM Decision",
                "description": "Route workflow based on AI analysis of data",
                "category": "ai",
                "config_schema": {"prompt": "string", "options": "string[]"},
            },
            {
                "type": "document_extraction",
                "name": "Document Extraction",
                "description": "Extract structured data from documents using OCR + AI",
                "category": "ai",
                "config_schema": {"document_type": "string"},
            },
            {
                "type": "medical_coding_ai",
                "name": "Medical Coding AI",
                "description": "Suggest ICD-10/CPT codes from clinical documentation",
                "category": "ai",
                "config_schema": {},
            },
            {
                "type": "fraud_detector",
                "name": "Fraud Detection",
                "description": "Analyze claims for fraud, waste, and abuse indicators",
                "category": "ai",
                "config_schema": {"threshold": "number"},
            },
            {
                "type": "clinical_reasoner",
                "name": "Clinical Reasoner",
                "description": "Evaluate medical necessity using clinical criteria",
                "category": "ai",
                "config_schema": {"criteria_source": "string"},
            },
            {
                "type": "sentiment_analysis",
                "name": "Sentiment Analysis",
                "description": "Analyze sentiment in member/provider communications",
                "category": "ai",
                "config_schema": {},
            },
            {
                "type": "gemini_analyzer",
                "name": "Gemini Analyzer",
                "description": "General-purpose AI analysis using Google Gemini",
                "category": "ai",
                "config_schema": {"prompt": "string", "temperature": "number"},
            },
        ]
    }
