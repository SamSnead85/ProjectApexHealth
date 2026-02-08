"""
Tests for the FastAPI application endpoints.
Tests verify that endpoints exist, accept correct inputs,
and return proper response shapes.
"""
import pytest
from unittest.mock import patch, AsyncMock


class TestHealthEndpoints:
    """Test health check and info endpoints."""

    def test_root_endpoint(self, client):
        """Root endpoint should return service info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data

    def test_health_endpoint(self, client):
        """Health endpoint should return healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAgentEndpoints:
    """Test AI agent chat endpoints."""

    def test_chat_endpoint_exists(self, client):
        """Chat endpoint should exist and accept POST."""
        response = client.post(
            "/api/v1/agents/chat",
            json={
                "message": "test",
                "sessionId": "test-session",
                "context": {"userId": "test", "organizationId": "test", "role": "admin"},
            },
        )
        # Should not be 404 or 405
        assert response.status_code != 404
        assert response.status_code != 405

    def test_chat_requires_message(self, client):
        """Chat endpoint should validate required fields."""
        response = client.post(
            "/api/v1/agents/chat",
            json={"sessionId": "test"},
        )
        assert response.status_code == 422  # Validation error


class TestPredictionEndpoints:
    """Test AI prediction endpoints."""

    def test_fraud_analysis_endpoint_exists(self, client):
        """Fraud analysis endpoint should exist."""
        response = client.post(
            "/api/v1/predictions/fraud",
            json={
                "claimId": "CLM-001",
                "claimData": {"chargedAmount": 500, "procedureCode": "99214"},
            },
        )
        assert response.status_code != 404

    def test_cost_prediction_endpoint_exists(self, client):
        """Cost prediction endpoint should exist."""
        response = client.post(
            "/api/v1/predictions/cost",
            json={
                "memberId": "AHP100001",
                "memberData": {"age": 45, "chronicConditions": ["diabetes"]},
            },
        )
        assert response.status_code != 404

    def test_risk_scoring_endpoint_exists(self, client):
        """Risk scoring endpoint should exist."""
        response = client.post(
            "/api/v1/predictions/risk-score",
            json={
                "memberId": "AHP100001",
                "memberData": {"age": 45, "diagnosisCodes": ["E11.65"]},
            },
        )
        assert response.status_code != 404


class TestDocumentEndpoints:
    """Test document intelligence endpoints."""

    def test_analyze_endpoint_exists(self, client):
        """Document analysis endpoint should exist."""
        response = client.post(
            "/api/v1/documents/analyze",
            json={
                "documentUrl": "https://example.com/doc.pdf",
                "documentType": "claim_form",
            },
        )
        assert response.status_code != 404

    def test_suggest_codes_endpoint_exists(self, client):
        """Medical code suggestion endpoint should exist."""
        response = client.post(
            "/api/v1/documents/suggest-codes",
            json={
                "clinicalText": "Patient presents with acute low back pain. MRI shows L4-L5 disc herniation.",
            },
        )
        assert response.status_code != 404


class TestWorkflowEndpoints:
    """Test AI workflow node execution endpoints."""

    def test_execute_node_endpoint_exists(self, client):
        """Workflow node execution endpoint should exist."""
        response = client.post(
            "/api/v1/workflows/execute-node",
            json={
                "nodeType": "llm_decision",
                "nodeConfig": {"prompt": "Should this claim be approved?"},
                "inputData": {"claimAmount": 500},
            },
        )
        assert response.status_code != 404
