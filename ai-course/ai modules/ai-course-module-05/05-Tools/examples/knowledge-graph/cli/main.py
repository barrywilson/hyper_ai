"""Knowledge graph CLI."""

from __future__ import annotations

import json
import sys
from dataclasses import asdict
from enum import Enum
from pathlib import Path

import typer

from cli.importer import import_yaml_tree, ImportError as KGImportError
from cli.storage import Storage, NodeNotFoundError


class Format(str, Enum):
    json = "json"
    table = "table"

app = typer.Typer(help="Knowledge graph CLI for the Module 5 Domain Language MCP.")

DEFAULT_DB = "knowledge.db"
DEFAULT_KNOWLEDGE_DIR = "knowledge"


def _storage(db: Path) -> Storage:
    s = Storage(db)
    s.initialize_schema()
    return s


@app.command("import")
def import_cmd(
    knowledge_dir: Path = typer.Option(
        Path(DEFAULT_KNOWLEDGE_DIR),
        "--knowledge-dir",
        help="Directory containing knowledge/{nodes,edges}/*.yaml.",
    ),
    db: Path = typer.Option(Path(DEFAULT_DB), "--db", help="SQLite output path."),
):
    """Import YAML knowledge files into SQLite."""
    if db.exists():
        db.unlink()
    storage = _storage(db)
    try:
        result = import_yaml_tree(knowledge_dir, storage)
    except KGImportError as exc:
        typer.echo(f"import failed: {exc}", err=True)
        raise typer.Exit(code=1)
    typer.echo(f"imported {result.nodes_imported} nodes")
    typer.echo(f"imported {result.edges_imported} edge(s)")


@app.command("validate")
def validate_cmd(
    db: Path = typer.Option(Path(DEFAULT_DB), "--db", help="SQLite path."),
):
    """Check the knowledge graph for missing references and inconsistencies."""
    storage = _storage(db)
    issues = storage.validate_consistency()
    if not issues:
        typer.echo("knowledge graph is valid")
        return
    for issue in issues:
        typer.echo(issue)
    raise typer.Exit(code=1)


@app.command("lookup")
def lookup_cmd(
    term: str = typer.Argument(..., help="Term, alias, or name to look up."),
    format: Format = typer.Option(Format.json, "--format", help="Output format."),
    db: Path = typer.Option(Path(DEFAULT_DB), "--db", help="SQLite path."),
):
    """Look up a single term."""
    storage = _storage(db)
    try:
        node = storage.lookup(term)
    except NodeNotFoundError:
        typer.echo(json.dumps({"error": "not_found", "term": term}))
        raise typer.Exit(code=1)
    if format is Format.json:
        typer.echo(json.dumps(asdict(node), ensure_ascii=False))
    else:
        typer.echo(f"{node.name} ({node.area})")
        typer.echo(f"  {node.definition}")
        if node.aliases:
            typer.echo(f"  aliases: {', '.join(node.aliases)}")
        if node.warnings:
            for w in node.warnings:
                typer.echo(f"  ⚠ {w}")
        if node.source_files:
            typer.echo(f"  source: {', '.join(node.source_files)}")


@app.command("related")
def related_cmd(
    term: str = typer.Argument(..., help="Term to find relationships for."),
    format: Format = typer.Option(Format.json, "--format", help="Output format."),
    db: Path = typer.Option(Path(DEFAULT_DB), "--db", help="SQLite path."),
):
    """List edges from this term to other terms."""
    storage = _storage(db)
    try:
        edges = storage.get_related(term)
    except NodeNotFoundError:
        typer.echo(json.dumps({"error": "not_found", "term": term}))
        raise typer.Exit(code=1)
    payload = [
        {"from": e.from_node, "to": e.to_node, "relationship": e.relationship}
        for e in edges
    ]
    if format is Format.json:
        typer.echo(json.dumps(payload, ensure_ascii=False))
    else:
        if not payload:
            typer.echo("no relationships")
            return
        for item in payload:
            typer.echo(f"  {item['from']} --{item['relationship']}--> {item['to']}")


@app.command("list-areas")
def list_areas_cmd(
    format: Format = typer.Option(Format.json, "--format", help="Output format."),
    db: Path = typer.Option(Path(DEFAULT_DB), "--db", help="SQLite path."),
):
    """List the distinct domain areas in the graph."""
    storage = _storage(db)
    areas = storage.list_areas()
    if format is Format.json:
        typer.echo(json.dumps(areas, ensure_ascii=False))
    else:
        for area in areas:
            typer.echo(f"  {area}")


if __name__ == "__main__":  # pragma: no cover
    app()
