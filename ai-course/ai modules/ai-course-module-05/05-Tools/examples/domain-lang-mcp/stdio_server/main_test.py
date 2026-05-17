import json
import subprocess
from pathlib import Path

import pytest
from mcp.shared.memory import create_connected_server_and_client_session

from stdio_server.main import build_server


@pytest.fixture
def knowledge_graph_project(monkeypatch):
    """Point the MCP at the sibling knowledge-graph package, injecting a test
    fixture node so lookups can verify subprocess wiring against a known value.
    Cleans up afterwards by removing the test YAML and re-importing.
    """
    repo_root = Path(__file__).resolve().parents[6]  # ai-course/
    kg_dir = repo_root / "modules/05-Tools/deliverables/examples/knowledge-graph"
    test_yaml = kg_dir / "knowledge" / "nodes" / "_test_application.yaml"
    test_yaml.write_text("""
nodes:
  - id: test_application
    name: TestApplication
    area: test
    type: domain_term
    definition: A test fixture node.
    aliases: [test_app]
""")
    subprocess.run(["uv", "run", "knowledge-graph", "import"], cwd=kg_dir, check=True)
    monkeypatch.setenv("KG_PROJECT_DIR", str(kg_dir))
    yield kg_dir
    test_yaml.unlink(missing_ok=True)
    subprocess.run(["uv", "run", "knowledge-graph", "import"], cwd=kg_dir, check=True)


@pytest.mark.asyncio
async def test_ping_returns_pong():
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("ping", {"message": "hello"})
        assert "Pong: hello" in result.content[0].text


@pytest.mark.asyncio
async def test_ping_tool_is_listed():
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        tools = await session.list_tools()
        names = {t.name for t in tools.tools}
        assert "ping" in names


@pytest.mark.asyncio
async def test_lookup_term_found(knowledge_graph_project):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("lookup_term", {"term": "TestApplication"})
        payload = json.loads(result.content[0].text)
        assert payload["id"] == "test_application"
        assert payload["definition"].startswith("A test fixture")


@pytest.mark.asyncio
async def test_lookup_term_unknown(knowledge_graph_project):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("lookup_term", {"term": "definitely_not_a_term"})
        payload = json.loads(result.content[0].text)
        assert payload["error"] == "not_found"


@pytest.mark.asyncio
async def test_get_related_terms(knowledge_graph_project):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("get_related_terms", {"term": "feature_flag"})
        payload = json.loads(result.content[0].text)
        assert isinstance(payload, list)
        assert len(payload) >= 2
        for edge in payload:
            assert set(edge.keys()) == {"from", "to", "relationship"}


@pytest.mark.asyncio
async def test_list_domain_areas(knowledge_graph_project):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("list_domain_areas", {})
        payload = json.loads(result.content[0].text)
        assert "config_service" in payload
        assert "feature_flags" in payload


@pytest.mark.asyncio
async def test_validate_knowledge_graph(knowledge_graph_project):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("validate_knowledge_graph", {})
        payload = json.loads(result.content[0].text)
        assert payload["valid"] is True
        assert payload["issues"] == []
