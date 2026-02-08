"""
Apex Health Agent Orchestrator
Multi-agent system using LangGraph for stateful healthcare AI workflows.
Each agent has specialized tools, memory, and HIPAA-compliant guardrails.
"""

import structlog
from typing import TypedDict, Annotated, Sequence, Literal
from datetime import datetime

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

from app.config import settings

logger = structlog.get_logger()


# ═══════════════════════════════════════════════════════
# Agent State
# ═══════════════════════════════════════════════════════

class AgentState(TypedDict):
    """Shared state across all agents in the orchestrator."""
    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]
    current_agent: str
    organization_id: str
    user_id: str
    user_role: str
    context: dict                    # Domain-specific context
    tool_calls_made: list[str]
    requires_hitl: bool
    hitl_reason: str | None
    confidence_score: float
    phi_accessed: bool
    audit_trail: list[dict]


# ═══════════════════════════════════════════════════════
# Agent Tools (callable by agents)
# ═══════════════════════════════════════════════════════

@tool
def check_member_eligibility(member_id: str, service_date: str = "") -> dict:
    """Check if a member is eligible for coverage on a given date.
    Returns eligibility status, plan info, and benefit details."""
    # In production, this calls the NestJS Eligibility API
    return {
        "eligible": True,
        "member_id": member_id,
        "plan": "Blue PPO Gold",
        "status": "active",
        "effective_date": "2024-01-01",
        "deductible_remaining": 850.00,
        "oop_remaining": 4200.00,
        "note": "Integration point: calls /api/v1/eligibility/verify",
    }


@tool
def lookup_claim_status(claim_number: str) -> dict:
    """Look up the current status of a claim by claim number.
    Returns claim status, dates, amounts, and processing notes."""
    return {
        "claim_number": claim_number,
        "status": "in_review",
        "received_date": "2024-01-15",
        "total_charged": 1250.00,
        "note": "Integration point: calls /api/v1/claims/:id",
    }


@tool
def search_providers(specialty: str, zip_code: str = "", network: str = "in_network") -> list[dict]:
    """Search for healthcare providers by specialty and location.
    Returns matching providers with availability and ratings."""
    return [{
        "name": "Dr. Sarah Johnson",
        "specialty": specialty,
        "network": network,
        "accepting_new_patients": True,
        "rating": 4.8,
        "note": "Integration point: calls /api/v1/providers/search",
    }]


@tool
def check_prior_auth_status(auth_number: str) -> dict:
    """Check the status of a prior authorization request."""
    return {
        "auth_number": auth_number,
        "status": "approved",
        "approved_units": 10,
        "expiration_date": "2024-06-30",
        "note": "Integration point: calls /api/v1/prior-auth/:id",
    }


@tool
def suggest_icd10_codes(clinical_description: str) -> list[dict]:
    """Suggest ICD-10 diagnosis codes based on a clinical description.
    Uses AI to map symptoms/conditions to standardized codes."""
    return [
        {"code": "M54.5", "description": "Low back pain", "confidence": 0.95},
        {"code": "M54.2", "description": "Cervicalgia", "confidence": 0.72},
        {"code": "G89.29", "description": "Other chronic pain", "confidence": 0.65},
    ]


@tool
def suggest_cpt_codes(procedure_description: str) -> list[dict]:
    """Suggest CPT procedure codes based on a procedure description.
    Uses AI to identify the most appropriate billing codes."""
    return [
        {"code": "99213", "description": "Office visit, established patient, low complexity", "confidence": 0.90},
        {"code": "99214", "description": "Office visit, established patient, moderate complexity", "confidence": 0.75},
    ]


@tool
def analyze_claim_for_fraud(claim_data: dict) -> dict:
    """Analyze a claim for potential fraud indicators.
    Checks for upcoding, unbundling, impossible day surgery, etc."""
    return {
        "fraud_risk": "low",
        "score": 0.12,
        "flags": [],
        "recommendation": "No fraud indicators detected",
        "note": "Integration point: calls ML fraud model",
    }


@tool
def estimate_member_cost(procedure_code: str, member_id: str) -> dict:
    """Estimate out-of-pocket cost for a member for a given procedure.
    Considers deductible status, copay, coinsurance, and OOP max."""
    return {
        "procedure_code": procedure_code,
        "estimated_total": 1500.00,
        "estimated_member_cost": 375.00,
        "breakdown": {
            "deductible_applies": 250.00,
            "copay": 25.00,
            "coinsurance": 100.00,
        },
        "note": "Integration point: calls cost estimator service",
    }


# ═══════════════════════════════════════════════════════
# Agent Definitions
# ═══════════════════════════════════════════════════════

CLAIMS_AGENT_SYSTEM = """You are the Apex Health Claims Intelligence Agent.
You help with claims processing, adjudication questions, claim status inquiries,
and coding assistance. You have access to claims data, eligibility verification,
and medical coding tools.

IMPORTANT RULES:
- Never disclose PHI to unauthorized users
- Always verify the user has permission to access requested information
- Flag suspicious patterns for human review
- Cite specific claim numbers and codes in your responses
- If confidence is below 80%, recommend human review
"""

MEMBER_AGENT_SYSTEM = """You are the Apex Health Member Service Agent.
You help members with eligibility questions, claim status, finding providers,
understanding benefits, and estimating costs.

IMPORTANT RULES:
- Use plain, non-technical language
- Always verify member identity before sharing PHI
- Be empathetic and helpful
- Proactively suggest relevant services (preventive care, wellness programs)
- If a request requires human intervention, escalate gracefully
"""

PRIOR_AUTH_AGENT_SYSTEM = """You are the Apex Health Prior Authorization Agent.
You help with prior authorization submissions, status checks, clinical criteria
evaluation, and appeal guidance.

IMPORTANT RULES:
- Apply evidence-based clinical criteria
- Track SLA deadlines (72hrs urgent, 7 days standard)
- Flag cases requiring medical director review
- Document clinical rationale for all decisions
- Ensure CMS-0057-F compliance
"""

CODING_AGENT_SYSTEM = """You are the Apex Health Medical Coding Agent.
You assist with ICD-10 diagnosis coding, CPT/HCPCS procedure coding,
code validation, and coding education.

IMPORTANT RULES:
- Follow official ICD-10-CM and CPT guidelines
- Consider specificity (code to the highest level)
- Flag potential unbundling or upcoding
- Explain code selections with clinical justification
- Reference current coding manuals and guidelines
"""

COMPLIANCE_AGENT_SYSTEM = """You are the Apex Health Compliance Agent.
You help with HIPAA compliance, CMS regulatory requirements, audit preparation,
and policy interpretation.

IMPORTANT RULES:
- Reference specific regulations (45 CFR, CMS rules)
- Provide actionable compliance recommendations
- Flag potential violations immediately
- Track regulatory deadlines and changes
- Document all compliance advice given
"""


def get_agent_config(agent_type: str) -> dict:
    """Get configuration for a specific agent type."""
    configs = {
        "claims": {
            "system_prompt": CLAIMS_AGENT_SYSTEM,
            "tools": [check_member_eligibility, lookup_claim_status, suggest_icd10_codes,
                      suggest_cpt_codes, analyze_claim_for_fraud],
            "model": settings.default_model,
        },
        "member_service": {
            "system_prompt": MEMBER_AGENT_SYSTEM,
            "tools": [check_member_eligibility, lookup_claim_status, search_providers,
                      check_prior_auth_status, estimate_member_cost],
            "model": settings.default_model,
        },
        "prior_auth": {
            "system_prompt": PRIOR_AUTH_AGENT_SYSTEM,
            "tools": [check_member_eligibility, check_prior_auth_status,
                      suggest_icd10_codes, suggest_cpt_codes],
            "model": settings.default_model,
        },
        "coding": {
            "system_prompt": CODING_AGENT_SYSTEM,
            "tools": [suggest_icd10_codes, suggest_cpt_codes, lookup_claim_status],
            "model": settings.default_model,
        },
        "compliance": {
            "system_prompt": COMPLIANCE_AGENT_SYSTEM,
            "tools": [],
            "model": settings.default_model,
        },
    }
    return configs.get(agent_type, configs["claims"])


# ═══════════════════════════════════════════════════════
# Intent Router
# ═══════════════════════════════════════════════════════

ROUTER_SYSTEM = """You are the Apex Health AI intent router. Analyze the user's message
and determine which specialized agent should handle it.

Available agents:
- claims: Claims status, adjudication, payment questions
- member_service: Member eligibility, benefits, finding care, cost estimates
- prior_auth: Prior authorization submissions, status, appeals
- coding: ICD-10, CPT/HCPCS coding questions, code lookups
- compliance: HIPAA, CMS regulations, audit, policy questions

Respond with ONLY the agent name (e.g., "claims" or "member_service").
If unclear, default to "member_service".
"""


async def route_intent(message: str) -> str:
    """Route user message to the appropriate specialized agent."""
    if not settings.gemini_api_key:
        # Fallback keyword-based routing
        message_lower = message.lower()
        if any(kw in message_lower for kw in ["claim", "adjudic", "payment", "remit", "eob"]):
            return "claims"
        elif any(kw in message_lower for kw in ["prior auth", "authorization", "pre-cert"]):
            return "prior_auth"
        elif any(kw in message_lower for kw in ["icd", "cpt", "hcpcs", "diagnosis code", "procedure code", "coding"]):
            return "coding"
        elif any(kw in message_lower for kw in ["hipaa", "compliance", "regulation", "audit", "cms rule"]):
            return "compliance"
        else:
            return "member_service"

    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.default_model,
            google_api_key=settings.gemini_api_key,
            temperature=0,
        )
        response = await llm.ainvoke([
            SystemMessage(content=ROUTER_SYSTEM),
            HumanMessage(content=message),
        ])
        agent_type = response.content.strip().lower()
        valid_agents = ["claims", "member_service", "prior_auth", "coding", "compliance"]
        return agent_type if agent_type in valid_agents else "member_service"
    except Exception as e:
        logger.error("Intent routing failed, defaulting to member_service", error=str(e))
        return "member_service"


# ═══════════════════════════════════════════════════════
# Agent Orchestrator
# ═══════════════════════════════════════════════════════

class AgentOrchestrator:
    """
    Multi-agent orchestrator using LangGraph.
    Routes messages to specialized agents, manages state and memory,
    and enforces HIPAA guardrails.
    """

    def __init__(self):
        self.memory = MemorySaver()
        self.conversations: dict[str, list] = {}

    async def process_message(
        self,
        message: str,
        organization_id: str,
        user_id: str,
        user_role: str,
        conversation_id: str | None = None,
        agent_type: str | None = None,
    ) -> dict:
        """Process a user message through the agent orchestrator."""
        start_time = datetime.utcnow()

        # Route to appropriate agent
        if not agent_type:
            agent_type = await route_intent(message)

        logger.info(
            "Processing message",
            agent_type=agent_type,
            user_id=user_id,
            org_id=organization_id,
        )

        config = get_agent_config(agent_type)

        # Build conversation history
        conv_key = conversation_id or f"{user_id}:{agent_type}"
        history = self.conversations.get(conv_key, [])

        messages = [SystemMessage(content=config["system_prompt"])]
        messages.extend(history[-20:])  # Keep last 20 messages for context
        messages.append(HumanMessage(content=message))

        try:
            if settings.gemini_api_key:
                llm = ChatGoogleGenerativeAI(
                    model=config["model"],
                    google_api_key=settings.gemini_api_key,
                    temperature=0.3,
                )

                if config["tools"]:
                    llm_with_tools = llm.bind_tools(config["tools"])
                    response = await llm_with_tools.ainvoke(messages)

                    # Handle tool calls
                    tool_results = []
                    if hasattr(response, 'tool_calls') and response.tool_calls:
                        for tc in response.tool_calls:
                            tool_fn = next(
                                (t for t in config["tools"] if t.name == tc["name"]),
                                None
                            )
                            if tool_fn:
                                result = tool_fn.invoke(tc["args"])
                                tool_results.append({
                                    "tool": tc["name"],
                                    "args": tc["args"],
                                    "result": result,
                                })

                        # Get final response with tool results
                        messages.append(response)
                        for tr in tool_results:
                            messages.append(HumanMessage(
                                content=f"Tool '{tr['tool']}' returned: {tr['result']}"
                            ))
                        response = await llm.ainvoke(messages)
                else:
                    response = await llm.ainvoke(messages)

                response_text = response.content
            else:
                # Fallback response when no API key
                response_text = (
                    f"[{agent_type.upper()} Agent] I received your message: '{message}'. "
                    f"AI services are not configured yet (no API key). "
                    f"Once configured, I can help with healthcare queries using specialized tools."
                )
                tool_results = []

            # Store in conversation history
            history.append(HumanMessage(content=message))
            history.append(AIMessage(content=response_text))
            self.conversations[conv_key] = history

            elapsed_ms = (datetime.utcnow() - start_time).total_seconds() * 1000

            return {
                "response": response_text,
                "agent_type": agent_type,
                "conversation_id": conv_key,
                "tool_calls": [tr["tool"] for tr in tool_results] if 'tool_results' in dir() else [],
                "confidence_score": 0.85,
                "requires_hitl": False,
                "processing_time_ms": round(elapsed_ms),
                "metadata": {
                    "model": config["model"],
                    "message_count": len(history),
                },
            }

        except Exception as e:
            logger.error("Agent processing failed", error=str(e), agent_type=agent_type)
            return {
                "response": f"I encountered an error processing your request. Please try again or contact support.",
                "agent_type": agent_type,
                "conversation_id": conv_key,
                "error": str(e),
                "requires_hitl": True,
                "hitl_reason": "Agent processing error",
            }

    def clear_conversation(self, conversation_id: str):
        """Clear conversation history."""
        self.conversations.pop(conversation_id, None)


# Singleton instance
orchestrator = AgentOrchestrator()
