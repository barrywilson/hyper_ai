"""Tool implementations for the HTTP MCP server (wraps the REST API).

Each tool that calls the REST API takes a `get` keyword argument that
defaults to the real `httpx`-based runner. Tests inject a fake to
exercise status-code branching and JSON wrapping without making real
HTTP requests. The integration tests in `main_test.py` exercise the
full HTTP path against a live `uvicorn` subprocess.
"""

from __future__ import annotations

import json
import os

import httpx


def _base_url() -> str:
    return os.environ.get("KG_API_BASE_URL", "http://localhost:8000").rstrip("/")


async def _get(path: str, **params) -> tuple[int, dict | list]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{_base_url()}{path}", params=params)
        try:
            body = response.json()
        except ValueError:
            body = {"error": "invalid_response", "text": response.text[:200]}
        return response.status_code, body


async def ping(message: str) -> str:
    return f"Pong: {message}"


async def lookup_term(term: str, get=_get) -> str:
    status, body = await get("/lookup", term=term)
    if status == 404:
        return json.dumps({"error": "not_found", "term": term})
    if status != 200:
        return json.dumps({"error": "service_error", "status": status, "body": body})
    return json.dumps(body)


async def get_related_terms(term: str, get=_get) -> str:
    status, body = await get("/related", term=term)
    if status == 404:
        return json.dumps({"error": "not_found", "term": term})
    if status != 200:
        return json.dumps({"error": "service_error", "status": status, "body": body})
    return json.dumps(body)


async def list_domain_areas(get=_get) -> str:
    status, body = await get("/areas")
    if status != 200:
        return json.dumps({"error": "service_error", "status": status})
    return json.dumps(body)


async def validate_knowledge_graph(get=_get) -> str:
    status, body = await get("/validate")
    if status != 200:
        return json.dumps({"error": "service_error", "status": status})
    return json.dumps(body)
