"""
Agent Orchestrator API Router
Multi-agent chat, intent routing, and conversation management.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.agents.orchestrator import orchestrator

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., description="User message to process")
    organization_id: str = Field(..., description="Organization ID for data scoping")
    user_id: str = Field(..., description="Authenticated user ID")
    user_role: str = Field(default="member", description="User's role")
    conversation_id: Optional[str] = Field(None, description="Continue existing conversation")
    agent_type: Optional[str] = Field(None, description="Force specific agent (claims, member_service, prior_auth, coding, compliance)")


class ChatResponse(BaseModel):
    response: str
    agent_type: str
    conversation_id: str
    tool_calls: list[str] = []
    confidence_score: float = 0.0
    requires_hitl: bool = False
    hitl_reason: Optional[str] = None
    processing_time_ms: int = 0
    metadata: dict = {}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the AI agent orchestrator.
    
    The orchestrator automatically routes to the appropriate specialized agent:
    - **Claims Agent**: Claims status, adjudication, payment queries
    - **Member Service Agent**: Eligibility, benefits, finding care
    - **Prior Auth Agent**: Authorization submissions and status
    - **Medical Coding Agent**: ICD-10, CPT/HCPCS coding assistance
    - **Compliance Agent**: HIPAA, CMS regulations, audit support
    """
    result = await orchestrator.process_message(
        message=request.message,
        organization_id=request.organization_id,
        user_id=request.user_id,
        user_role=request.user_role,
        conversation_id=request.conversation_id,
        agent_type=request.agent_type,
    )
    return ChatResponse(**result)


@router.delete("/conversations/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear a conversation's history."""
    orchestrator.clear_conversation(conversation_id)
    return {"success": True, "message": "Conversation cleared"}


@router.get("/agents")
async def list_agents():
    """List available specialized agents and their capabilities."""
    return {
        "agents": [
            {
                "type": "claims",
                "name": "Claims Intelligence Agent",
                "description": "Claims processing, adjudication, status inquiries, and payment questions",
                "tools": ["check_member_eligibility", "lookup_claim_status", "suggest_icd10_codes",
                         "suggest_cpt_codes", "analyze_claim_for_fraud"],
            },
            {
                "type": "member_service",
                "name": "Member Service Agent",
                "description": "Eligibility checks, benefit questions, provider search, cost estimates",
                "tools": ["check_member_eligibility", "lookup_claim_status", "search_providers",
                         "check_prior_auth_status", "estimate_member_cost"],
            },
            {
                "type": "prior_auth",
                "name": "Prior Authorization Agent",
                "description": "PA submissions, status checks, clinical criteria, appeals",
                "tools": ["check_member_eligibility", "check_prior_auth_status",
                         "suggest_icd10_codes", "suggest_cpt_codes"],
            },
            {
                "type": "coding",
                "name": "Medical Coding Agent",
                "description": "ICD-10 and CPT/HCPCS code lookup, validation, and suggestions",
                "tools": ["suggest_icd10_codes", "suggest_cpt_codes", "lookup_claim_status"],
            },
            {
                "type": "compliance",
                "name": "Compliance Agent",
                "description": "HIPAA compliance, CMS regulations, audit support, policy guidance",
                "tools": [],
            },
        ]
    }
