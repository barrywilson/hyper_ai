# Agent Instructions

This project has a context framework in `memory/`. Read these files at the start of each conversation:

- `memory/ABOUT.md` — project purpose, personas, business constraints, target users
- `memory/ARCHITECTURE.md` — system design, components, patterns, key technical decisions, API surface
- `memory/IMPLEMENTATION.md` — tech stack, languages, dependencies, testing strategy, version constraints
- `memory/ENV_SCRIPTS.md` — environments, ports, command invocations, deployment workflow
- `memory/WORKFLOW_STATUS.md` — the four-stage development process and current task status

Load all five before asking any questions about the project. For implementation tasks, `WORKFLOW_STATUS.md` defines the process to follow — read it before planning any work.

## File ownership boundaries

When you discover a new fact about the project, store it in the file whose scope it belongs to:

| Fact type                                  | Lives in                  |
|--------------------------------------------|---------------------------|
| What the project is for, who uses it       | `ABOUT.md`                |
| Architectural patterns, design decisions   | `ARCHITECTURE.md`         |
| API endpoints and their semantics          | `ARCHITECTURE.md`         |
| Languages, frameworks, library choices     | `IMPLEMENTATION.md`       |
| Testing approach and conventions           | `IMPLEMENTATION.md`       |
| Ports, env vars, dev/prod commands         | `ENV_SCRIPTS.md`          |
| Local setup and run instructions           | `ENV_SCRIPTS.md`          |
| Active work item, current stage, status    | `WORKFLOW_STATUS.md`      |
| Process discipline (purge, branch, commit) | `WORKFLOW_STATUS.md`      |

If a fact spans two files (e.g., "we use ULIDs and the database stores them as VARCHAR(26)" is both implementation and architecture), record it in the file whose scope it most clearly belongs to and add a short cross-reference (one line) in the other if useful. Don't duplicate prose.

Future-work TODOs do **not** live in these files. Track future work as Given-When-Then work items in `docs/` per the workflow framework.
