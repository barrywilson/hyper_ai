import json
import subprocess
import time
import socket
import pytest
import httpx
from pathlib import Path
from mcp.shared.memory import create_connected_server_and_client_session

from http_server.main import build_server


def _pick_free_port() -> int:
    with socket.socket() as s:
        s.bind(("", 0))
        return s.getsockname()[1]


@pytest.fixture
def running_api(monkeypatch):
    repo_root = Path(__file__).resolve().parents[6]
    kg_dir = repo_root / "modules/05-Tools/deliverables/examples/knowledge-graph"
    subprocess.run(["uv", "run", "knowledge-graph", "import"], cwd=kg_dir, check=True)
    port = _pick_free_port()
    proc = subprocess.Popen(
        ["uv", "run", "uvicorn", "api.main:app", "--port", str(port), "--log-level", "warning"],
        cwd=kg_dir,
    )
    # Wait for /health to respond
    base = f"http://127.0.0.1:{port}"
    for _ in range(30):
        try:
            r = httpx.get(f"{base}/health", timeout=0.5)
            if r.status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.2)
    else:
        proc.terminate()
        raise RuntimeError("REST API did not come up in time")
    monkeypatch.setenv("KG_API_BASE_URL", base)
    yield base
    proc.terminate()
    proc.wait(timeout=5)


@pytest.mark.asyncio
async def test_ping(running_api):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("ping", {"message": "hi"})
        assert "Pong: hi" in result.content[0].text


@pytest.mark.asyncio
async def test_lookup_term(running_api):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("lookup_term", {"term": "ConfigurationItem"})
        payload = json.loads(result.content[0].text)
        assert payload["id"] == "configuration_item"


@pytest.mark.asyncio
async def test_lookup_term_not_found(running_api):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("lookup_term", {"term": "missing"})
        payload = json.loads(result.content[0].text)
        assert payload["error"] == "not_found"


@pytest.mark.asyncio
async def test_get_related_terms(running_api):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("get_related_terms", {"term": "feature_flag"})
        payload = json.loads(result.content[0].text)
        assert len(payload) >= 2


@pytest.mark.asyncio
async def test_list_domain_areas(running_api):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("list_domain_areas", {})
        payload = json.loads(result.content[0].text)
        assert "config_service" in payload


@pytest.mark.asyncio
async def test_validate_knowledge_graph(running_api):
    server = build_server()
    async with create_connected_server_and_client_session(server) as session:
        result = await session.call_tool("validate_knowledge_graph", {})
        payload = json.loads(result.content[0].text)
        assert payload["valid"] is True
