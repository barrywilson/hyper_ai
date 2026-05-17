# knowledge-graph

> Provided backend for the Module 5 Domain Language MCP exercise — YAML domain knowledge, imported into SQLite, queryable via CLI or REST.

## Overview

`knowledge-graph` is the **deterministic data layer** beneath the `domain-lang-mcp` reference server. It owns the YAML files that describe the config-service domain (Applications, ConfigurationItems, Environments, FeatureFlags and their relationships), imports them into a local SQLite database, and exposes that data through two surfaces: a Typer CLI and a FastAPI REST service.

What `knowledge-graph` is *not*: the MCP server. That lives in the sibling `domain-lang-mcp/` package and wraps the surfaces here. The split is deliberate — the MCP server should depend on a stable interface, not on implementation details of the data layer.

## Architecture

```
knowledge/{nodes,edges}/*.yaml   ← human-authored source of truth
            │
            ▼  uv run knowledge-graph import
   SQLite store (knowledge.db)
            │
            ├──► Typer CLI: lookup / related / list-areas / validate
            │       (JSON output by default; --format table for humans)
            │
            └──► FastAPI REST API: /lookup, /related, /areas, /validate, /health
                  (started via `./api-server`; serves on port 8000)
```

The CLI and the REST API are siblings, not layered — both query the same SQLite store directly through the shared `cli.storage.Storage` class.

## YAML schema

### Nodes — `knowledge/nodes/*.yaml`

```yaml
nodes:
  - id: configuration_item        # stable identifier, lowercase + underscores
    type: domain_term             # category (free-form; convention is `domain_term`)
    area: config_service          # logical grouping; used by list-areas
    name: ConfigurationItem       # display name
    definition: >                 # multi-line OK
      A key/value pair scoped to an Application and an Environment.
    aliases:                      # alternative ways to refer to this term
      - config item
      - config entry
    warnings:                     # surface to the consumer (LLM) when the term is fetched
      - Do not confuse with FeatureFlag.
    source_files:                 # where the term is implemented
      - svc/api/config.py
    documentation:                # where the term is documented
      - docs/ABOUT.md
```

### Edges — `knowledge/edges/*.yaml`

```yaml
edges:
  - from: application
    to: configuration_item
    relationship: owns            # free-form; convention is verb-ish
```

Edges are directed. `lookup` resolves by id, name, or alias; `related` returns edges *from* the term.

## Why SQLite

- **Zero infrastructure** — single file; no daemon; works the same on every developer's machine
- **Stdlib in Python** — no SDK to install
- **First-class drivers in every major language** — Python `sqlite3`, Node 22+ `node:sqlite`, Go `database/sql`, Rust `rusqlite`, etc.
- **Trivially inspectable**: `sqlite3 knowledge.db ".tables"` or `.schema` from the command line

**An anti-pattern to avoid:** querying SQLite directly from your MCP server. The whole point of `domain-lang-mcp` wrapping the CLI (or REST API) is to keep the MCP layer decoupled from the data layer. If you bypass the CLI, you've baked in an implementation detail.

## Using the CLI

```bash
# One-time setup (re-run after YAML changes)
uv sync
uv run knowledge-graph import         # populates knowledge.db from YAML
uv run knowledge-graph validate       # confirms no orphan edges / missing refs

# Queries
uv run knowledge-graph lookup ConfigurationItem
uv run knowledge-graph lookup app                       # alias resolution
uv run knowledge-graph related feature_flag
uv run knowledge-graph list-areas

# Add --format table for human-readable output
uv run knowledge-graph lookup ConfigurationItem --format table
```

The CLI emits JSON by default — that's the format the MCP server's subprocess wrapper consumes.

## Using the REST API

```bash
# Start it (port 8000)
./api-server

# In another terminal
curl -s http://localhost:8000/health | jq .
curl -s "http://localhost:8000/lookup?term=ConfigurationItem" | jq .
curl -s "http://localhost:8000/related?term=feature_flag" | jq .
curl -s http://localhost:8000/areas | jq .

# Interactive OpenAPI docs
open http://localhost:8000/docs
```

The REST API is what `domain-lang-mcp/http_server/` wraps.

## Architecture-vs-implementation note

The knowledge graph could be backed by anything — Neo4j, a managed GraphRAG service, a vector store, an in-memory dict for tests. Today's SQLite-and-Python implementation is one possibility, not the only one. The MCP server in `../domain-lang-mcp/` consumes the CLI (or REST API) over a stable interface — swap the implementation under it and the agent calling the MCP doesn't notice.

That's the educational point: MCPs are interfaces. Implementations are interchangeable.

## Running the tests

```bash
uv run pytest -v
```

Expected: 26 tests passing across storage, importer, CLI, and REST endpoint suites.
