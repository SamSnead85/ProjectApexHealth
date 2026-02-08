"""
Shared test fixtures for AI services.
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create a test client with mocked dependencies."""
    # Import here to avoid import-time side effects
    from app.main import app
    return TestClient(app)


@pytest.fixture
def sample_claim_data():
    """Sample claim data for testing AI analysis."""
    return {
        "claimId": "CLM-2024-000001",
        "type": "professional",
        "memberId": "AHP100001",
        "providerId": "1234567890",
        "diagnosisCodes": ["M54.5"],
        "procedureCodes": ["99214"],
        "chargedAmount": 225.00,
        "serviceDate": "2024-01-15",
    }


@pytest.fixture
def sample_document_data():
    """Sample document metadata for testing document intelligence."""
    return {
        "documentId": "doc-001",
        "fileName": "cms_1500_claim.pdf",
        "mimeType": "application/pdf",
        "category": "claim_form",
    }


@pytest.fixture
def sample_chat_message():
    """Sample chat message for testing agent orchestration."""
    return {
        "message": "What is the status of claim CLM-2024-000001?",
        "sessionId": "test-session-001",
        "context": {
            "userId": "user-001",
            "organizationId": "00000000-0000-0000-0000-000000000001",
            "role": "claims_processor",
        },
    }
