"""
Tests for the main FastAPI application wiring and contract.
"""

from typing import Any

import pytest
from fastapi.testclient import TestClient

from api import main


class _FakeMigrationManager:
    async def run_migrations(self) -> None:
        return None


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    """Create a test client with startup side effects disabled."""

    monkeypatch.setattr(main.db_pool, "initialize", lambda: None)
    monkeypatch.setattr(main.db_pool, "close", lambda: None)

    async def fake_get_migration_manager(_: Any) -> _FakeMigrationManager:
        return _FakeMigrationManager()

    monkeypatch.setattr(main, "get_migration_manager", fake_get_migration_manager)

    with TestClient(main.svc) as test_client:
        yield test_client


def test_health_endpoint_returns_documented_payload(client: TestClient) -> None:
    """Health endpoint should expose the module 2 continuation contract."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "config-service",
        "version": main.settings.app_version,
    }


def test_health_endpoint_appears_as_typed_schema_in_openapi(client: TestClient) -> None:
    """Health endpoint should publish a structured schema in OpenAPI."""
    response = client.get("/openapi.json")

    assert response.status_code == 200

    health_schema = response.json()["paths"]["/health"]["get"]["responses"]["200"]["content"][
        "application/json"
    ]["schema"]

    assert health_schema["$ref"] == "#/components/schemas/HealthResponse"


def test_cors_preflight_allows_local_ui_origin(client: TestClient) -> None:
    """CORS middleware should allow the local UI origin used by module 2."""
    response = client.options(
        "/api/v1/applications",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"
