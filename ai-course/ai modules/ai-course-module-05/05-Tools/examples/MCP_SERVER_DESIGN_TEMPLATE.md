# MCP Server Design Template

> Fill this in *before* writing the server. The conversation is the design — implementation should be straightforward once these sections are clear.

---

## Server identity

**Server name:** _(verb-noun-ish; lowercase + hyphens; this is what shows up in the agent's tool list)_

**One-line purpose:** _(what does this server let an LLM do that it couldn't do as well otherwise?)_

**Underlying backend:** _(CLI / REST API / DB / library — what you're wrapping)_

**Transport:** _(stdio for local single-client; HTTP for shared/multi-client)_

---

## Tools

For each tool, complete the section below. Keep the tool count small and the boundaries clean.

### Tool: `<tool_name>`

**Name:** _(verb_noun; clear and unambiguous)_

**Description (read by the LLM — this is the activation signal):**

_(2–4 sentences. What does this do? What inputs does it take? What output should the LLM expect? Under what conditions should the LLM choose this tool over an adjacent one?)_

**Input schema:**

| Field | Type | Required | Description |
|---|---|---|---|
| _name_ | _string/int/etc._ | yes/no | _what it means; constraints_ |

**Output:**

_(Format and structure. JSON? Plain text? What fields, in what shape?)_

**Errors handled:**

- _(situation 1: e.g. "term not found" → returns {error: "not_found", ...})_
- _(situation 2: e.g. "backend unreachable" → returns {error: "service_error", status: ...})_

### Tool: `<next_tool>`

_(repeat the block for each tool)_

---

## Granularity check

- Are any two tools really doing the same job at different granularity? Combine.
- Is any single tool taking a complex "action type" parameter that the LLM has to figure out? Split.

---

## Error categories you'll handle

| Category | Example in this server | How you'll signal it |
|---|---|---|
| Validation | _e.g. empty `term` string_ | _e.g. schema rejection before handler runs_ |
| Service | _e.g. backend subprocess fails / API 5xx_ | _e.g. structured {error: ..., detail: ...} response_ |
| Not found | _e.g. term not in graph_ | _e.g. structured {error: "not_found", term: ...}_ |

---

## Testing plan

- MCP Inspector invocations to confirm each tool works against known inputs
- MCP Inspector invocations to confirm each tool handles bad inputs (missing required field, unknown identifier, malformed value)
- One end-to-end test invoking the server from your coding agent with a natural-language prompt

---

## Configuration in your harness

- Harness you'll register this in: _(Claude Code / Cline / Codex CLI / Goose / other)_
- Registration command or config snippet: _(filled in after MCP Inspector confirms the server works)_

---

## Open questions

_(Capture anything you're unsure about before you start coding. The goal is to surface decisions early so they don't get baked in accidentally.)_
