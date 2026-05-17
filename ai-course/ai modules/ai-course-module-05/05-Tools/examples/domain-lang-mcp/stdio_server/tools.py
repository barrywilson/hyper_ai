"""Tool implementations for the stdio MCP server.

Each tool that talks to the `knowledge-graph` CLI takes a `kg_json` (or
`run_kg`) keyword argument that defaults to the real subprocess-based
runner. Tests inject a fake runner to exercise the JSON-wrapping,
error-mapping, and edge-case logic without spawning a real CLI process.
The integration tests in `main_test.py` exercise the full subprocess
path end-to-end via MCP's in-memory client.
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path


class CLIInvocationError(Exception):
    """Raised when the knowledge-graph CLI fails in an unexpected way."""


def _project_dir() -> Path:
    return Path(os.environ.get("KG_PROJECT_DIR", "."))


async def _run_kg(*args: str) -> tuple[int, str, str]:
    """Run `uv run knowledge-graph <args>` inside KG_PROJECT_DIR."""
    proc = await asyncio.create_subprocess_exec(
        "uv", "run", "knowledge-graph", *args,
        cwd=_project_dir(),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    return proc.returncode, stdout.decode(), stderr.decode()


async def _kg_json(*args: str) -> dict | list:
    """Run a KG command and parse its JSON output (allowing non-zero for not_found)."""
    rc, stdout, stderr = await _run_kg(*args)
    if rc not in (0, 1):
        raise CLIInvocationError(f"unexpected exit code {rc}: {stderr.strip()}")
    try:
        return json.loads(stdout)
    except json.JSONDecodeError as exc:
        raise CLIInvocationError(
            f"could not parse CLI output as JSON: {stdout[:200]!r} (stderr: {stderr.strip()})"
        ) from exc


async def ping(message: str) -> str:
    return f"Pong: {message}"


async def lookup_term(term: str, kg_json=_kg_json) -> str:
    payload = await kg_json("lookup", term, "--format", "json")
    return json.dumps(payload)


async def get_related_terms(term: str, kg_json=_kg_json) -> str:
    payload = await kg_json("related", term, "--format", "json")
    return json.dumps(payload)


async def list_domain_areas(kg_json=_kg_json) -> str:
    payload = await kg_json("list-areas", "--format", "json")
    return json.dumps(payload)


async def validate_knowledge_graph(run_kg=_run_kg) -> str:
    rc, stdout, stderr = await run_kg("validate")
    if rc == 0:
        return json.dumps({"valid": True, "issues": []})
    # Non-zero means issues; the CLI emitted them on stdout (per Phase 3 fix)
    issues = [line for line in stdout.strip().splitlines() if line]
    return json.dumps({"valid": False, "issues": issues})
