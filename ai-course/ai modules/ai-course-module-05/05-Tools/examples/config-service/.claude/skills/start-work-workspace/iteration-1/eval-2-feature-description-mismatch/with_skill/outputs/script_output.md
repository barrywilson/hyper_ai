## Branch

main

## Recent commits

ae83e20 chore: workflow_status — feature-flags is the active work item
298a56a plan: add feature-flags work item and design docs
f7667d4 docs: align memory files with current API surface and validation rules
4d5b664 fix: trim whitespace from Application description
6618e98 fix: db_connection — prevent double cleanup on error path
7751b0b fix: tighten CORS allow_methods/headers from wildcard
3724a0f fix: tighten ULID validation to 26-char base32
758884a refactor: schemas — adopt Pydantic v2 ConfigDict style
9dc729f test: cover schema validation edge cases
d030aaf feat: enforce 1000-char max on Application description

## Touched files (last 10 commits)

docs/001-feature-flags.md
docs/plans/2026-04-30-feature-flags-design.md
docs/plans/2026-04-30-feature-flags.md
memory/ARCHITECTURE.md
memory/IMPLEMENTATION.md
memory/WORKFLOW_STATUS.md
svc/api/db_connection.py
svc/api/main.py
svc/api/schemas_test.py
svc/api/schemas.py

## Per-file recent history

### docs/001-feature-flags.md
298a56a plan: add feature-flags work item and design docs

### docs/plans/2026-04-30-feature-flags-design.md
298a56a plan: add feature-flags work item and design docs

### docs/plans/2026-04-30-feature-flags.md
298a56a plan: add feature-flags work item and design docs

### memory/ARCHITECTURE.md
f7667d4 docs: align memory files with current API surface and validation rules
3724a0f fix: tighten ULID validation to 26-char base32
52aa0e0 feat: initial config-service scaffold

### memory/IMPLEMENTATION.md
f7667d4 docs: align memory files with current API surface and validation rules
52aa0e0 feat: initial config-service scaffold

### memory/WORKFLOW_STATUS.md
ae83e20 chore: workflow_status — feature-flags is the active work item
52aa0e0 feat: initial config-service scaffold

### svc/api/db_connection.py
6618e98 fix: db_connection — prevent double cleanup on error path
52aa0e0 feat: initial config-service scaffold

### svc/api/main.py
7751b0b fix: tighten CORS allow_methods/headers from wildcard
52aa0e0 feat: initial config-service scaffold

### svc/api/schemas_test.py
4d5b664 fix: trim whitespace from Application description
3724a0f fix: tighten ULID validation to 26-char base32
9dc729f test: cover schema validation edge cases
52aa0e0 feat: initial config-service scaffold

### svc/api/schemas.py
4d5b664 fix: trim whitespace from Application description
3724a0f fix: tighten ULID validation to 26-char base32
758884a refactor: schemas — adopt Pydantic v2 ConfigDict style
d030aaf feat: enforce 1000-char max on Application description
c0fa4eb fix: tighten Application name regex to exclude unsafe chars


## Open TODO/FIXME/HACK markers


## Workflow status

## Current Status

### Active Work Item
- **Work Item File**: [docs/001-feature-flags.md](../docs/001-feature-flags.md)
- **Current Task**: Criteria 1: Feature Flag Domain Model and API Contract
- **Current Stage**: BUILD & ASSESS 🔄 In Progress
- **Plan Documents** (kept until the work item completes):
  - [docs/plans/2026-04-30-feature-flags-design.md](../docs/plans/2026-04-30-feature-flags-design.md)
  - [docs/plans/2026-04-30-feature-flags.md](../docs/plans/2026-04-30-feature-flags.md)
- **Last Updated**: 2026-05-07

### When Active
When working on a story, this section will show:
- **Work Item File**: `docs/XXX-story-name.md` (link to active working document)
- **Current Task**: Task number and brief description from acceptance criteria
- **Current Stage**: PLAN / BUILD & ASSESS / REFLECT & ADAPT / COMMIT & PICK NEXT
- **Last Updated**: YYYY-MM-DD

*All detailed tracking lives in the individual work item file. This status section only provides lightweight pointers.*

## Active work item

File: docs/001-feature-flags.md

# Work Item 001: Feature Flags

## Story Details

> As a **product engineer**, I want **application-level feature flags managed through the Configuration Service**, so that **I can enable, disable, and progressively roll out functionality without shipping new builds for every change**

### Notes
This work item defines how feature flags should fit into the existing Configuration Service without removing the workflow scaffolding already present in module 3. The immediate goal is to produce a complete implementation plan and workflow-ready task breakdown, not to ship the feature in this pass.

### Acceptance Criteria (Given-When-Then Format)

#### Criteria 1: Feature Flag Domain Model and API Contract
- **Given**: The Configuration Service already stores per-application configuration documents
- **When**: We define the feature flag shape and service contract
- **Then**: A documented schema exists for boolean flags, optional metadata, and validation rules that fit the current application/configuration model
- **Status**: ❌ Not Started

#### Criteria 2: Backend Feature Flag Management
- **Given**: The service has an agreed feature flag schema
- **When**: An engineer implements backend support
- **Then**: The API can create, update, read, and validate feature flags for an application using the existing configuration service patterns
- **Status**: ❌ Not Started

#### Criteria 3: UI Feature Flag Administration
- **Given**: Backend feature flag support exists
- **When**: An administrator opens the Configuration Service UI
- **Then**: They can view and edit feature flags for an application through a clear and validated management workflow
- **Status**: ❌ Not Started

#### Criteria 4: Client Consumption Pattern
- **Given**: Feature flags can be stored and retrieved
- **When**: A consuming application integrates with the `config-client`
- **Then**: The repository documents a safe client-side pattern for reading flags, handling missing values, and applying defaults
- **Status**: ❌ Not Started

#### Criteria 5: Rollout and Quality Validation
- **Given**: Feature flag functionality is implemented
- **When**: We validate the end-to-end workflow
- **Then**: Tests, documentation, and workflow artifacts demonstrate that feature flags can be managed safely and predictably
- **Status**: ❌ Not Started

## Current Task Focus

- **Active Criterion**: Criteria 1: Feature Flag Domain Model and API Contract
- **Stage**: BUILD & ASSESS 🔄 In Progress
- **Branch**: `feature/feature-flags`
- **Last Updated**: 2026-05-07

**PLAN stage**: ✅ committed.
- Plan documents (kept until the work item completes, per `WORKFLOW_STATUS.md` purge discipline):
  - [docs/plans/2026-04-30-feature-flags-design.md](plans/2026-04-30-feature-flags-design.md)
  - [docs/plans/2026-04-30-feature-flags.md](plans/2026-04-30-feature-flags.md)
- The embedded Stage 1 / 2 / 3 / 4 scaffolding that previously lived here has been purged. Only the acceptance-criteria block above and these stage pointers remain.

---

## Feature Flag Scope Notes

**Primary modeling goal**: Represent feature flags as a first-class configuration pattern while preserving the service's current application-centric configuration storage.

**Key questions for implementation planning:**
- How should simple boolean flags and richer rollout metadata coexist?
- What validation rules prevent malformed or ambiguous flag definitions?
- How should consuming applications distinguish "flag missing" from "flag explicitly disabled"?
- What defaulting and backward-compatibility behavior should the client expose?

**Recommended starting point**:
1. Support boolean flags first
2. Add optional metadata for description and ownership
3. Defer percentage rollout or audience targeting unless clearly needed

**Success Criteria**: The repository contains a workflow-ready story, acceptance criteria, and implementation plan that an engineer can execute incrementally without rethinking the overall design.

## Test status (cached)

.pytest_cache last modified: 2026-05-06 21:30
Note: full suite NOT run by this skill. Run 'make test' to refresh.

## Plan documents

docs/plans/2026-04-30-feature-flags.md
docs/plans/2026-04-30-feature-flags-design.md
