# Module 5 Exercise: Build Your First MCP Server

## Goal

Build a stdio MCP server that wraps the provided `knowledge-graph` CLI and exposes its query surface as MCP tools. Test it with MCP Inspector, configure it in your coding agent, and use it. The server joins your **PAIR Agent's** repertoire in Module 6.

---

## Prerequisites

- A coding agent that supports MCP servers (Claude Code, Cline ≥3.48.0, Codex CLI, Goose, Kilo Code, OpenCode)
- `uv` installed (`uv --version`) — you already have it from M1–M4
- The `knowledge-graph` package built and imported:
  ```bash
  cd deliverables/examples/knowledge-graph
  uv sync
  uv run knowledge-graph import
  uv run knowledge-graph validate
  ```
- Familiarity with the MCP Inspector (`npx @modelcontextprotocol/inspector`)
- The MCP SDK for your chosen language ([Python](https://github.com/modelcontextprotocol/python-sdk), [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk), or any of the [community SDKs](https://github.com/modelcontextprotocol))

---

## The four-step process

1. **Design before you build** — fill in `deliverables/examples/MCP_SERVER_DESIGN_TEMPLATE.md` for the MCP server you're about to write. Reference `deliverables/examples/domain-lang-mcp-DESIGN.md` for a worked example.
2. **Scaffold a stdio MCP server** — in the language of your choice. Wrap the `knowledge-graph` CLI via subprocess.
3. **Implement the tools** — `ping`, `lookup_term`, `get_related_terms`, `list_domain_areas`, `validate_knowledge_graph`. Test each with MCP Inspector as you go.
4. **Configure it in your coding agent** — use Inspector's config-emit feature, register it, and invoke it via natural language.

The conversation with your agent during steps 1 and 2 is **more important than the typing**. Design well; the implementation falls out.

---

## Phase 1 — Project scaffold

**Example prompt for your AI assistant:**

> NOTE: edit before sending — replace `[language]` and adjust paths.

```
I need to create an MCP server using stdio transport. Help me set up a basic
project structure for a [Python|TypeScript|Go] MCP server in a folder called
`my-domain-lang-mcp/`.

Requirements:
- Use the official MCP SDK for my chosen language
- Set up the project with `[uv|npm|go]` for dependency management
- Create a stdio server that completes the MCP handshake
- Do NOT expose any tools, resources, or prompts yet — that comes in Phase 2
- Include proper error handling at the protocol layer

Please create an `IMPLEMENTATION_PLAN.md` first, then we'll work through it
together. The reference implementation lives at
`../examples/domain-lang-mcp/stdio_server/` — study it but don't copy it
verbatim.
```

Once you're happy with the plan, instruct your assistant to implement the scaffold in small chunks.

**Expected outcome:**
- Project directory with proper structure
- Server starts and completes handshake without errors
- Package config file (pyproject.toml, package.json, etc.)
- No tools exposed yet

**Verify by:** Running MCP Inspector against your server — the handshake should complete; the tool list should be empty.

---

## Phase 2 — `ping` tool

Add a `ping` tool that echoes a message. Trivial functionality; the point is to verify your tool-registration + schema pipeline before you wire in the real tools.

**Example prompt:**

```
Add a `ping` tool to my MCP server. It should:
- Accept a `message` parameter (string, required)
- Return "Pong: <message>"
- Be registered with the MCP server
- Have a clear schema and a description an LLM can act on

What does a good description look like for a connectivity-check tool?
```

**Expected outcome:**
- Inspector lists `ping` in the tool list
- Invoking `ping` with `message: "hello"` returns `"Pong: hello"`
- Invoking `ping` with no `message` returns a schema validation error

---

## Phase 3 — First real tool: `lookup_term`

This is the meaty phase. You're building the **subprocess wrapper** that calls `uv run knowledge-graph lookup <term> --format json` and the **MCP tool** that uses it. The wrapper pattern is the load-bearing piece — your other three tools will reuse it.

**Example prompt:**

```
I need to implement my first MCP tool that wraps a CLI command. The tool is
`lookup_term`, which should call:

    uv run knowledge-graph lookup <term> --format json

(run from `../examples/knowledge-graph/`; assume `KG_PROJECT_DIR` env var
points at that directory).

Implement:
- A robust subprocess-runner function I'll reuse for other tools
- The `lookup_term` MCP tool using the wrapper
- A schema for the `term` parameter (string, required)
- A description the LLM can act on (read `domain-lang-mcp-DESIGN.md` for an
  example)
- Error handling for: subprocess failure, CLI not on PATH, malformed JSON
  output, unknown term (the CLI exits 1 with `{"error": "not_found", ...}`)

Please write an `IMPLEMENTATION_PLAN.md` covering both the wrapper and the
first tool so I can test them together.
```

**Verify with Inspector by:**
- Invoking `lookup_term` with `term: "ConfigurationItem"` → JSON response with the node record
- Invoking `lookup_term` with `term: "nonsense"` → `{"error": "not_found", "term": "nonsense"}`
- Invoking `lookup_term` with no `term` → schema validation error
- Stopping the `knowledge-graph` CLI from being reachable (e.g. set `KG_PROJECT_DIR` to a bad path) and confirming the error response is *informative*, not a stack trace

**Expected outcome:**
- Subprocess wrapper that other tools will reuse
- Working `lookup_term`
- All four error cases above produce structured responses

---

## Phase 4 — Remaining tools

Implement `get_related_terms`, `list_domain_areas`, and `validate_knowledge_graph`. The wrapping pattern is the same; the learning is **description quality** and **consistent error handling**.

The CLI commands you're wrapping:

| MCP tool | CLI command |
|---|---|
| `get_related_terms` | `uv run knowledge-graph related <term> --format json` |
| `list_domain_areas` | `uv run knowledge-graph list-areas --format json` |
| `validate_knowledge_graph` | `uv run knowledge-graph validate` (no `--format`; the CLI exits 0 if valid, 1 with issues on stdout otherwise) |

**One of these three is optional** — the pattern is the lesson, not completeness. Pick the two that interest you most.

**Verify with Inspector:**
- `get_related_terms` for `feature_flag` returns at least three edges
- `list_domain_areas` returns `["config_service", "feature_flags"]`
- `validate_knowledge_graph` returns `{"valid": true, "issues": []}`

---

## Phase 5 — Configure in your coding agent

You've verified your server in Inspector. Now wire it into the harness you actually use.

**Use Inspector's config-emit feature** — it generates the registration snippet for common harnesses (Claude Code, Cline, Codex, Goose).

**For Claude Code (CLI):**

```bash
claude mcp add --transport stdio my-domain-lang \
  "uv run my-domain-lang-mcp-stdio" \
  --env KG_PROJECT_DIR=/absolute/path/to/knowledge-graph
claude mcp list
```

Then restart the Claude Code session (close + reopen) — harnesses cache the MCP discovery list at startup.

**For Cline:**
Open the MCP settings panel; paste the JSON snippet Inspector emitted.

**Verify by prompting your agent:**

```
What does ConfigurationItem mean in this system?
```

The agent should invoke `lookup_term` and synthesise an answer.

```
What's related to FeatureFlag?
```

The agent should invoke `get_related_terms` and summarise the edges.

If the agent doesn't pick your tool, that's the description's fault — revise it (verb + situation + when-to-use), restart, try again.

---

## Phase 6 — Optional HTTP stretch

If you have time and curiosity, build the HTTP variant:

1. Add an `http_server/` folder (or extend your existing server)
2. Wrap the `knowledge-graph` REST API (`./api-server` from `../examples/knowledge-graph/`) via your language's HTTP client
3. Use Streamable HTTP transport (the MCP SDK supports this directly; it's a few lines different from the stdio entry point)
4. Register both transports in your coding agent side-by-side

The architectural question worth thinking about: when would HTTP be the right choice? (Hint: not for this local-first knowledge graph. Multi-client or remote-deployment scenarios.)

The reference HTTP server lives at `../examples/domain-lang-mcp/http_server/` — study it for the wrapping pattern.

---

## Success criteria

You've completed the exercise when:

- ✅ Your MCP server starts and completes the handshake
- ✅ All four (or three + optional) tools appear in MCP Inspector with sensible descriptions and schemas
- ✅ Each tool produces the expected output for valid inputs
- ✅ Error handling works for: missing required fields, unknown terms, backend unreachable, malformed responses
- ✅ Your server is registered in your coding agent
- ✅ Your coding agent invokes your tools in response to natural-language prompts
- ✅ You've reflected on the experience in `INTEGRATE.md`

---

## A note on the PAIR Agent

What you build here is the **second piece** of your PAIR Agent (the M4 skill is the first). In Module 6 you'll assemble both into a working agent harness around the `config-service` codebase. Build something you actually want your agent to be able to reach for.
