"""FastAPI app for the knowledge-graph REST API."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from cli.storage import NodeNotFoundError, Storage


def _storage() -> Storage:
    db_path = Path(os.environ.get("KG_DB_PATH", "knowledge.db"))
    return Storage(db_path)


def create_app() -> FastAPI:
    app = FastAPI(
        title="Knowledge Graph API",
        description="REST surface over the knowledge-graph SQLite store.",
        version="0.1.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    @app.get("/lookup")
    def lookup(term: str = Query(..., min_length=1)) -> dict:
        try:
            node = _storage().lookup(term)
        except NodeNotFoundError:
            raise HTTPException(status_code=404, detail={"error": "not_found", "term": term})
        return {
            "id": node.id,
            "type": node.type,
            "area": node.area,
            "name": node.name,
            "definition": node.definition,
            "aliases": node.aliases,
            "warnings": node.warnings,
            "source_files": node.source_files,
            "documentation": node.documentation,
        }

    @app.get("/related")
    def related(term: str = Query(..., min_length=1)) -> list[dict]:
        try:
            edges = _storage().get_related(term)
        except NodeNotFoundError:
            raise HTTPException(status_code=404, detail={"error": "not_found", "term": term})
        return [
            {"from": e.from_node, "to": e.to_node, "relationship": e.relationship}
            for e in edges
        ]

    @app.get("/areas")
    def areas() -> list[str]:
        return _storage().list_areas()

    @app.get("/validate")
    def validate() -> dict:
        issues = _storage().validate_consistency()
        return {"valid": not issues, "issues": issues}

    return app
