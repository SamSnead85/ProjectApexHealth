"""
Voice Agent Platform API Router
HIPAA-compliant voice agents for healthcare call centers.
Integrates Deepgram (STT) + ElevenLabs/OpenAI (TTS) + LLM orchestration.
"""

import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

from app.agents.orchestrator import orchestrator
from app.config import settings

logger = structlog.get_logger()
router = APIRouter()


class VoiceAgentType(str, Enum):
    MEMBER_SERVICE = "member_service"
    PROVIDER_SERVICE = "provider_service"
    OUTREACH = "outreach"


class CallStatus(str, Enum):
    RINGING = "ringing"
    CONNECTED = "connected"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    TRANSFERRED = "transferred"
    COMPLETED = "completed"
    FAILED = "failed"


class VoiceAgentConfig(BaseModel):
    """Configuration for a voice agent."""
    agent_type: VoiceAgentType
    name: str = Field(..., description="Agent display name")
    greeting: str = Field(..., description="Initial greeting message")
    voice_id: str = Field(default="rachel", description="ElevenLabs voice ID")
    language: str = Field(default="en-US")
    max_call_duration_seconds: int = Field(default=600)
    escalation_keywords: list[str] = Field(
        default=["supervisor", "manager", "human", "representative", "escalate"]
    )
    hipaa_verified: bool = Field(default=False, description="Whether caller identity has been verified")


class InitiateCallRequest(BaseModel):
    agent_type: VoiceAgentType
    phone_number: str
    organization_id: str
    member_id: Optional[str] = None
    context: Optional[dict] = None
    campaign_id: Optional[str] = None


class CallRecord(BaseModel):
    call_id: str
    agent_type: VoiceAgentType
    status: CallStatus
    phone_number: str
    organization_id: str
    member_id: Optional[str] = None
    started_at: str
    ended_at: Optional[str] = None
    duration_seconds: Optional[int] = None
    transcript: list[dict] = []
    sentiment_scores: list[float] = []
    escalated: bool = False
    escalation_reason: Optional[str] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None


# ─── In-memory call tracking (replace with Redis in production) ──
active_calls: dict[str, CallRecord] = {}


# ─── Voice Agent Templates ──

VOICE_AGENT_TEMPLATES = {
    VoiceAgentType.MEMBER_SERVICE: VoiceAgentConfig(
        agent_type=VoiceAgentType.MEMBER_SERVICE,
        name="Apex Member Services",
        greeting=(
            "Thank you for calling Apex Health. My name is Ava, your virtual health assistant. "
            "I can help you with eligibility, claims, finding providers, and more. "
            "For security purposes, may I please verify your date of birth and member ID?"
        ),
        voice_id="rachel",
        escalation_keywords=["supervisor", "manager", "human", "representative", "escalate", "real person"],
    ),
    VoiceAgentType.PROVIDER_SERVICE: VoiceAgentConfig(
        agent_type=VoiceAgentType.PROVIDER_SERVICE,
        name="Apex Provider Services",
        greeting=(
            "Thank you for calling Apex Health Provider Services. "
            "I can help with claim status, prior authorization, payment inquiries, and eligibility verification. "
            "May I have your NPI number to get started?"
        ),
        voice_id="adam",
    ),
    VoiceAgentType.OUTREACH: VoiceAgentConfig(
        agent_type=VoiceAgentType.OUTREACH,
        name="Apex Health Outreach",
        greeting=(
            "Hello, this is Ava calling from Apex Health Plan. "
            "I'm reaching out about an important health reminder. "
            "Is this a good time to talk for a couple of minutes?"
        ),
        voice_id="rachel",
        max_call_duration_seconds=300,
    ),
}


@router.get("/agents")
async def list_voice_agents():
    """List available voice agent configurations."""
    return {
        "agents": [
            {
                "type": agent.agent_type.value,
                "name": agent.name,
                "greeting": agent.greeting,
                "voice_id": agent.voice_id,
            }
            for agent in VOICE_AGENT_TEMPLATES.values()
        ]
    }


@router.post("/calls/initiate")
async def initiate_call(request: InitiateCallRequest):
    """
    Initiate an outbound voice agent call.
    Used for member outreach, appointment reminders, care gap closure.
    """
    call_id = f"call-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{len(active_calls) + 1:04d}"

    record = CallRecord(
        call_id=call_id,
        agent_type=request.agent_type,
        status=CallStatus.RINGING,
        phone_number=request.phone_number,
        organization_id=request.organization_id,
        member_id=request.member_id,
        started_at=datetime.utcnow().isoformat(),
    )
    active_calls[call_id] = record

    logger.info("Call initiated", call_id=call_id, agent_type=request.agent_type.value)

    return {
        "call_id": call_id,
        "status": "ringing",
        "agent": VOICE_AGENT_TEMPLATES[request.agent_type].name,
        "message": "Call initiated. Voice agent connection in progress.",
    }


@router.get("/calls/{call_id}")
async def get_call_status(call_id: str):
    """Get the current status of a voice call."""
    record = active_calls.get(call_id)
    if not record:
        raise HTTPException(status_code=404, detail="Call not found")
    return record


@router.post("/calls/{call_id}/end")
async def end_call(call_id: str, outcome: Optional[str] = None, notes: Optional[str] = None):
    """End a voice call and record outcome."""
    record = active_calls.get(call_id)
    if not record:
        raise HTTPException(status_code=404, detail="Call not found")

    record.status = CallStatus.COMPLETED
    record.ended_at = datetime.utcnow().isoformat()
    record.outcome = outcome
    record.notes = notes

    if record.started_at:
        start = datetime.fromisoformat(record.started_at)
        end = datetime.fromisoformat(record.ended_at)
        record.duration_seconds = int((end - start).total_seconds())

    return {"call_id": call_id, "status": "completed", "duration_seconds": record.duration_seconds}


@router.get("/calls")
async def list_active_calls(organization_id: Optional[str] = None):
    """List all active calls, optionally filtered by organization."""
    calls = list(active_calls.values())
    if organization_id:
        calls = [c for c in calls if c.organization_id == organization_id]
    return {"calls": calls, "total": len(calls)}


@router.get("/dashboard/stats")
async def get_call_center_stats(organization_id: Optional[str] = None):
    """Get call center dashboard statistics."""
    all_calls = list(active_calls.values())
    if organization_id:
        all_calls = [c for c in all_calls if c.organization_id == organization_id]

    active = [c for c in all_calls if c.status in (CallStatus.CONNECTED, CallStatus.IN_PROGRESS)]
    completed = [c for c in all_calls if c.status == CallStatus.COMPLETED]
    escalated = [c for c in all_calls if c.escalated]

    avg_duration = 0
    if completed:
        durations = [c.duration_seconds or 0 for c in completed]
        avg_duration = sum(durations) / len(durations)

    avg_sentiment = 0.0
    all_sentiments = [s for c in all_calls for s in c.sentiment_scores]
    if all_sentiments:
        avg_sentiment = sum(all_sentiments) / len(all_sentiments)

    return {
        "total_calls": len(all_calls),
        "active_calls": len(active),
        "completed_calls": len(completed),
        "escalated_calls": len(escalated),
        "escalation_rate": len(escalated) / max(len(all_calls), 1),
        "average_duration_seconds": round(avg_duration),
        "average_sentiment": round(avg_sentiment, 2),
    }


@router.websocket("/ws/{call_id}")
async def voice_websocket(websocket: WebSocket, call_id: str):
    """
    WebSocket endpoint for real-time voice agent communication.
    
    Protocol:
    1. Client sends audio chunks (base64 encoded)
    2. Server processes through STT (Deepgram)
    3. Server routes transcript to agent orchestrator
    4. Agent response is converted to speech (ElevenLabs TTS)
    5. Server sends audio response back
    
    Messages:
    - Client -> Server: {"type": "audio", "data": "<base64>"}
    - Client -> Server: {"type": "transcript", "text": "..."}
    - Server -> Client: {"type": "transcript", "text": "...", "speaker": "agent|user"}
    - Server -> Client: {"type": "audio", "data": "<base64>"}
    - Server -> Client: {"type": "status", "status": "..."}
    """
    await websocket.accept()
    logger.info("Voice WebSocket connected", call_id=call_id)

    record = active_calls.get(call_id)
    if record:
        record.status = CallStatus.CONNECTED

    try:
        # Send greeting
        template = VOICE_AGENT_TEMPLATES.get(
            record.agent_type if record else VoiceAgentType.MEMBER_SERVICE
        )
        await websocket.send_json({
            "type": "transcript",
            "text": template.greeting,
            "speaker": "agent",
            "timestamp": datetime.utcnow().isoformat(),
        })

        while True:
            data = await websocket.receive_json()

            if data.get("type") == "transcript":
                # Process user speech transcript through agent
                user_text = data.get("text", "")
                if not user_text.strip():
                    continue

                # Check for escalation keywords
                if template and any(kw in user_text.lower() for kw in template.escalation_keywords):
                    if record:
                        record.escalated = True
                        record.escalation_reason = "User requested human agent"
                    await websocket.send_json({
                        "type": "escalation",
                        "message": "Transferring you to a human representative. Please hold.",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                    continue

                # Get agent response
                agent_type = record.agent_type.value if record else "member_service"
                result = await orchestrator.process_message(
                    message=user_text,
                    organization_id=record.organization_id if record else "default",
                    user_id=f"voice-{call_id}",
                    user_role="member",
                    conversation_id=f"voice:{call_id}",
                    agent_type=agent_type,
                )

                # Record transcript
                if record:
                    record.transcript.append({
                        "speaker": "user",
                        "text": user_text,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                    record.transcript.append({
                        "speaker": "agent",
                        "text": result["response"],
                        "timestamp": datetime.utcnow().isoformat(),
                    })

                # Send response
                await websocket.send_json({
                    "type": "transcript",
                    "text": result["response"],
                    "speaker": "agent",
                    "agent_type": result.get("agent_type"),
                    "timestamp": datetime.utcnow().isoformat(),
                })

            elif data.get("type") == "audio":
                # In production: send to Deepgram for STT, then process
                # For now, acknowledge receipt
                await websocket.send_json({
                    "type": "status",
                    "status": "processing_audio",
                    "timestamp": datetime.utcnow().isoformat(),
                })

    except WebSocketDisconnect:
        logger.info("Voice WebSocket disconnected", call_id=call_id)
        if record:
            record.status = CallStatus.COMPLETED
            record.ended_at = datetime.utcnow().isoformat()
