"""Unit tests for the stdio MCP tool functions.

These tests exercise the JSON-wrapping, error-mapping, and edge-case logic
in `tools.py` by injecting a fake `kg_json` / `run_kg` runner. They do not
spawn a real `knowledge-graph` subprocess — the end-to-end subprocess path
is covered by the in-memory integration tests in `main_test.py`.
"""

import json

import pytest

from stdio_server import tools


def _async_returning(value):
    """Build an async callable that records its args and returns `value`."""
    calls: list[tuple] = []

    async def fake(*args):
        calls.append(args)
        return value

    fake.calls = calls
    return fake


@pytest.mark.asyncio
async def test_ping_returns_pong():
    result = await tools.ping("hello")
    assert result == "Pong: hello"


@pytest.mark.asyncio
async def test_lookup_term_serializes_payload():
    fake = _async_returning(
        {"id": "settlement", "name": "Settlement", "definition": "Final amount"}
    )
    result = await tools.lookup_term("Settlement", kg_json=fake)
    assert json.loads(result) == {
        "id": "settlement",
        "name": "Settlement",
        "definition": "Final amount",
    }
    assert fake.calls == [("lookup", "Settlement", "--format", "json")]


@pytest.mark.asyncio
async def test_lookup_term_passes_through_not_found():
    fake = _async_returning({"error": "not_found", "term": "missing"})
    result = await tools.lookup_term("missing", kg_json=fake)
    assert json.loads(result) == {"error": "not_found", "term": "missing"}


@pytest.mark.asyncio
async def test_get_related_terms_serializes_list():
    fake = _async_returning(
        [
            {"from": "a", "to": "b", "relationship": "owns"},
            {"from": "a", "to": "c", "relationship": "has"},
        ]
    )
    result = await tools.get_related_terms("a", kg_json=fake)
    assert json.loads(result) == [
        {"from": "a", "to": "b", "relationship": "owns"},
        {"from": "a", "to": "c", "relationship": "has"},
    ]
    assert fake.calls == [("related", "a", "--format", "json")]


@pytest.mark.asyncio
async def test_get_related_terms_passes_through_not_found():
    fake = _async_returning({"error": "not_found", "term": "missing"})
    result = await tools.get_related_terms("missing", kg_json=fake)
    assert json.loads(result) == {"error": "not_found", "term": "missing"}


@pytest.mark.asyncio
async def test_list_domain_areas_serializes_list():
    fake = _async_returning(["billing", "config_service"])
    result = await tools.list_domain_areas(kg_json=fake)
    assert json.loads(result) == ["billing", "config_service"]
    assert fake.calls == [("list-areas", "--format", "json")]


@pytest.mark.asyncio
async def test_validate_returns_valid_status_when_rc_zero():
    async def fake(*args):
        return (0, "knowledge graph is valid\n", "")

    result = await tools.validate_knowledge_graph(run_kg=fake)
    assert json.loads(result) == {"valid": True, "issues": []}


@pytest.mark.asyncio
async def test_validate_returns_issues_when_rc_nonzero():
    async def fake(*args):
        return (
            1,
            "edge references missing 'foo'\nedge references missing 'bar'\n",
            "",
        )

    result = await tools.validate_knowledge_graph(run_kg=fake)
    assert json.loads(result) == {
        "valid": False,
        "issues": [
            "edge references missing 'foo'",
            "edge references missing 'bar'",
        ],
    }


@pytest.mark.asyncio
async def test_validate_ignores_blank_lines_in_issues():
    async def fake(*args):
        return (1, "issue one\n\nissue two\n   \n", "")

    result = await tools.validate_knowledge_graph(run_kg=fake)
    assert json.loads(result) == {
        "valid": False,
        "issues": ["issue one", "issue two"],
    }
