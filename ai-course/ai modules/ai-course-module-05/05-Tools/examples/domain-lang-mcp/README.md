# domain-lang-mcp

> Reference MCP servers (stdio + HTTP) for the Module 5 exercise — wrap the `knowledge-graph` backend so a coding agent can reach for domain knowledge.

## Overview

Two transport variants, identical tool surface:

- **`stdio_server/`** wraps the `knowledge-graph` CLI via subprocess. The natural choice for local single-user deployments.
- **`http_server/`** wraps the `knowledge-graph` REST API via `httpx`. The choice when you want multiple clients (or a remote service) to share one knowledge graph.

Both expose the **same five MCP tools**. That's the abstraction in action — the agent that consumes the MCP server doesn't care which transport is in use or what backend is under the hood. Today it's a local CLI + SQLite; tomorrow it could be a hosted service backed by Neo4j. The agent's call site doesn't change.

## Tool surface

| Tool | Purpose |
|---|---|
| `ping` | Connectivity sanity check; returns `Pong: <message>`. |
| `lookup_term` | Look up the definition, aliases, warnings, and source-file references for a domain term. |
| `get_related_terms` | List edges originating from a term in the knowledge graph. |
| `list_domain_areas` | List the distinct domain areas (orientation). |
| `validate_knowledge_graph` | Check the graph for orphan edges and missing references. |

For the full design (descriptions, schemas, error categories) see `../domain-lang-mcp-DESIGN.md`.

## Running with MCP Inspector

The stdio server needs to know where the `knowledge-graph` CLI lives. By convention, set `KG_PROJECT_DIR` to the sibling package:

```bash
cd ../knowledge-graph && uv run knowledge-graph import && cd -
KG_PROJECT_DIR=../knowledge-graph \
  npx @modelcontextprotocol/inspector uv run domain-lang-mcp-stdio
```

In the Inspector UI:
- List tools (confirm all five are present)
- Invoke `lookup_term` with `ConfigurationItem`
- Invoke `lookup_term` with `nonsense_term` and observe the `{"error": "not_found"}` response
- Invoke `get_related_terms` with `feature_flag`

For the HTTP variant — start the REST API first, then point the MCP at it:

```bash
# Terminal 1
cd ../knowledge-graph && ./api-server

# Terminal 2
KG_API_BASE_URL=http://localhost:8000 \
  npx @modelcontextprotocol/inspector uv run domain-lang-mcp-http
```

## Registering in your coding agent

### Claude Code (CLI)

```bash
claude mcp add --transport stdio domain-lang "uv run domain-lang-mcp-stdio" \
  --env KG_PROJECT_DIR=$PWD/../knowledge-graph
```

After registration, restart the session — Claude Code discovers MCP servers at startup.

### Cline / Kilo Code / others

Add an entry to the MCP settings (typically a JSON file the IDE exposes):

```json
{
  "mcpServers": {
    "domain-lang": {
      "command": "uv",
      "args": ["run", "domain-lang-mcp-stdio"],
      "cwd": "/absolute/path/to/domain-lang-mcp",
      "env": {
        "KG_PROJECT_DIR": "/absolute/path/to/knowledge-graph"
      }
    }
  }
}
```

The exercise's Phase 5 walks you through the registration step in detail; MCP Inspector also has a config-generation feature that emits the right snippet for each harness.

## HTTP variant — when and why

Use the HTTP variant when:

- You want multiple agents (or multiple users) to share one knowledge graph.
- You want to deploy the knowledge graph to a server and access it remotely.
- You want HTTP-friendly tooling (load balancers, observability, auth proxies) around the MCP.

For a single-user local-first setup, stdio is the right answer. The HTTP variant is here so you can experience the configuration difference and to make the architectural point that **transport and backend are independent concerns**.

## Architectural note

Both the stdio and HTTP servers expose the same five tools with identical names, descriptions, and schemas. This is *not* coincidence — it's the point. An agent that learned to use the stdio server can use the HTTP server with zero changes. The transport is a deployment concern; the tool contract is the interface.

If you ever find yourself diverging the tool surfaces between transports, stop and reconsider. The whole value proposition of MCP collapses when transports become incompatible.

## Running the tests

```bash
uv run pytest -v
```

Expected: 13 tests passing (7 stdio + 6 HTTP). The HTTP tests use a `running_api` fixture that spawns a real `uvicorn` subprocess of the knowledge-graph REST API — they take a few seconds because of that.
