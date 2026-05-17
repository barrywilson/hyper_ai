"""Unit tests for the HTTP MCP tool functions.

These tests exercise the status-code branching and JSON wrapping in
`tools.py` by injecting a fake `get` runner. They do not make real HTTP
requests — the end-to-end HTTP path is covered by the integration tests
in `main_test.py`.
"""

import json

import pytest

from http_server import tools


def _async_returning(status, body):
    """Build an async callable that records its args and returns (status, body)."""
    calls: list[tuple[str, dict]] = []

    async def fake(path, **params):
        calls.append((path, params))
        return status, body

    fake.calls = calls
    return fake


@pytest.mark.asyncio
async def test_ping_returns_pong():
    result = await tools.ping("hi")
    assert result == "Pong: hi"


@pytest.mark.asyncio
async def test_lookup_term_returns_body_on_200():
    fake = _async_returning(200, {"id": "settlement", "name": "Settlement"})
    result = await tools.lookup_term("Settlement", get=fake)
    assert json.loads(result) == {"id": "settlement", "name": "Settlement"}
    assert fake.calls == [("/lookup", {"term": "Settlement"})]


@pytest.mark.asyncio
async def test_lookup_term_returns_not_found_on_404():
    fake = _async_returning(404, {})
    result = await tools.lookup_term("missing", get=fake)
    assert json.loads(result) == {"error": "not_found", "term": "missing"}


@pytest.mark.asyncio
async def test_lookup_term_returns_service_error_on_5xx():
    fake = _async_returning(500, {"detail": "boom"})
    result = json.loads(await tools.lookup_term("anything", get=fake))
    assert result["error"] == "service_error"
    assert result["status"] == 500
    assert result["body"] == {"detail": "boom"}


@pytest.mark.asyncio
async def test_get_related_terms_returns_edges_on_200():
    fake = _async_returning(
        200,
        [
            {"from": "a", "to": "b", "relationship": "owns"},
        ],
    )
    result = await tools.get_related_terms("a", get=fake)
    assert json.loads(result) == [{"from": "a", "to": "b", "relationship": "owns"}]
    assert fake.calls == [("/related", {"term": "a"})]


@pytest.mark.asyncio
async def test_get_related_terms_returns_not_found_on_404():
    fake = _async_returning(404, {})
    result = await tools.get_related_terms("missing", get=fake)
    assert json.loads(result) == {"error": "not_found", "term": "missing"}


@pytest.mark.asyncio
async def test_get_related_terms_returns_service_error_on_5xx():
    fake = _async_returning(503, {"detail": "down"})
    result = json.loads(await tools.get_related_terms("anything", get=fake))
    assert result["error"] == "service_error"
    assert result["status"] == 503


@pytest.mark.asyncio
async def test_list_domain_areas_returns_list_on_200():
    fake = _async_returning(200, ["billing", "config_service"])
    result = await tools.list_domain_areas(get=fake)
    assert json.loads(result) == ["billing", "config_service"]
    assert fake.calls == [("/areas", {})]


@pytest.mark.asyncio
async def test_list_domain_areas_returns_service_error_on_5xx():
    fake = _async_returning(502, {})
    result = json.loads(await tools.list_domain_areas(get=fake))
    assert result["error"] == "service_error"
    assert result["status"] == 502


@pytest.mark.asyncio
async def test_validate_returns_payload_on_200():
    fake = _async_returning(200, {"valid": True, "issues": []})
    result = await tools.validate_knowledge_graph(get=fake)
    assert json.loads(result) == {"valid": True, "issues": []}
    assert fake.calls == [("/validate", {})]


@pytest.mark.asyncio
async def test_validate_returns_service_error_on_5xx():
    fake = _async_returning(500, {})
    result = json.loads(await tools.validate_knowledge_graph(get=fake))
    assert result["error"] == "service_error"
    assert result["status"] == 500
