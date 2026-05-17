# domain-lang-mcp — Design Doc

A worked example of the `MCP_SERVER_DESIGN_TEMPLATE.md`, filled in for the Module 5 reference server.

---

## Server identity

**Server name:** `domain-lang-mcp`

**One-line purpose:** Expose authoritative domain-language knowledge about the config-service codebase to an AI assistant — what terms mean, how they relate, where they're implemented — so the assistant can give grounded answers instead of guessing.

**Underlying backend:** The `knowledge-graph` CLI (for the stdio variant) or REST API (for the HTTP variant), both backed by YAML files imported into SQLite.

**Transport:** Two variants — stdio (the canonical one) and HTTP (optional stretch). The interface is identical.

---

## Tools

### Tool: `ping`

**Name:** `ping`

**Description:** Connectivity sanity check. Returns "Pong: <message>" echoing back whatever message you send. Use this to verify the MCP server is reachable before invoking real tools.

**Input schema:**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | yes | Arbitrary text to echo |

**Output:** Plain string `Pong: <message>`.

**Errors handled:** None — the server itself failing means stdin/stdout or transport is broken, surfaced by the protocol.

### Tool: `lookup_term`

**Name:** `lookup_term`

**Description:** Look up the definition, aliases, warnings, and source-file references for a domain term in the knowledge graph. Pass the term, its alias, or its display name. Use this when the user mentions a domain concept and you need authoritative information about what it means in this codebase.

**Input schema:**

| Field | Type | Required | Description |
|---|---|---|---|
| `term` | string | yes | Identifier, name, or alias of a domain term |

**Output:** JSON object with fields `id`, `type`, `area`, `name`, `definition`, `aliases`, `warnings`, `source_files`, `documentation`. On miss: `{"error": "not_found", "term": "<input>"}`.

**Errors handled:**
- Term not found → `{"error": "not_found", "term": ...}` (not a service error — a clean negative result)
- Backend unreachable / unexpected exit code → `{"error": "service_error", ...}`

### Tool: `get_related_terms`

**Name:** `get_related_terms`

**Description:** List the relationships originating from a term in the knowledge graph. Use this when you've looked up a term and want to discover adjacent concepts, dependencies, or warnings stored as edges. Returns a list of `{from, to, relationship}` records.

**Input schema:**

| Field | Type | Required | Description |
|---|---|---|---|
| `term` | string | yes | Identifier of a domain term |

**Output:** JSON array of edge objects. Empty list if the term exists but has no outbound edges.

**Errors handled:**
- Term not found → `{"error": "not_found", "term": ...}`

### Tool: `list_domain_areas`

**Name:** `list_domain_areas`

**Description:** List the distinct domain areas defined in the knowledge graph. Use this for orientation when you're unfamiliar with the codebase's domain partitioning. Returns a list of area strings.

**Input schema:** (no parameters)

**Output:** JSON array of strings.

**Errors handled:** None expected; an empty list is a valid response.

### Tool: `validate_knowledge_graph`

**Name:** `validate_knowledge_graph`

**Description:** Check the knowledge graph for inconsistencies (orphan edges, missing node references). Returns `{valid: bool, issues: list[str]}`. Use this after editing YAML files to confirm the graph is still well-formed.

**Input schema:** (no parameters)

**Output:** JSON object: `{"valid": true, "issues": []}` or `{"valid": false, "issues": [...]}`.

**Errors handled:** None — validation either reports no issues or reports the list of issues found.

---

## Granularity check

- `lookup_term` returns the node record; `get_related_terms` returns the edges. Could be one fat tool with a "include_edges" flag — chose to keep them separate because they're distinct mental operations and the LLM picks more reliably between two narrow tools than one wide one.
- `list_domain_areas` and `validate_knowledge_graph` look similar (both no-arg, both return some kind of summary) but mean very different things — one is for orientation, the other for integrity. Separate tools, distinct descriptions.

---

## Error categories you'll handle

| Category | Example in this server | How you'll signal it |
|---|---|---|
| Validation | Empty `term` string | Schema rejection at the MCP layer before the handler runs |
| Service | `knowledge-graph` CLI not on PATH or backend API unreachable | `{"error": "service_error", ...}` with status and detail |
| Not found | Term not in graph | `{"error": "not_found", "term": ...}` — a clean negative, not an error |

---

## Testing plan

- MCP Inspector invocations of each tool with known good inputs (e.g. `lookup_term` with `ConfigurationItem`)
- MCP Inspector invocations with missing required fields (schema rejection)
- MCP Inspector invocations with unknown terms (clean "not_found" response)
- End-to-end: register in Claude Code, ask: *"What does `FeatureFlag` mean in this system? What's related to it?"* — the agent should chain `lookup_term` + `get_related_terms`.

---

## Configuration in your harness

- Harness: Claude Code (CLI)
- Registration:
  ```
  claude mcp add --transport stdio domain-lang "uv run domain-lang-mcp-stdio"
  ```
  With `KG_PROJECT_DIR` pointing at `modules/05-Tools/deliverables/examples/knowledge-graph/` so the subprocess wrapper can find the CLI.

---

## Open questions

- Should `lookup_term` also include the reverse edges ("what points at this term")? Decided not for v1 — keeps the response focused and the LLM can call `get_related_terms` on candidates if it wants.
- Should there be a `search_terms(query)` for substring matching? Skipped — small graph, alias matching already covers most discovery needs. A future iteration could add this if the graph grows.
