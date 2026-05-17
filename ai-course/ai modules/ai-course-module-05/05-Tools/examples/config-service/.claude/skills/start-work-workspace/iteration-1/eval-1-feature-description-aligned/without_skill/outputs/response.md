Got it — picking up the feature flags work. Here is where things stand based on the working docs and memory files.

**Where the work item is**
- Work item: `docs/001-feature-flags.md`
- Active criterion: Criteria 1 — Feature Flag Domain Model and API Contract
- Stage: BUILD & ASSESS (PLAN was committed previously; embedded stage scaffolding has been purged per workflow discipline)
- Branch the plan calls for: `feature/feature-flags`
- Plan documents still in flight (kept until the whole work item ships):
  - `docs/plans/2026-04-30-feature-flags-design.md` — design + options analysis
  - `docs/plans/2026-04-30-feature-flags.md` — task-by-task implementation plan

**What Criteria 1 actually asks for**

"A documented schema exists for boolean flags, optional metadata, and validation rules that fit the current application/configuration model." So this criterion completes when the schema and contract are defined — not when full backend/UI/client work is done (those are Criteria 2–5).

The design doc commits to:
- Storing flags inside the existing per-application configuration document under a `feature_flags` key — no new table, no new persistence layer.
- Per-flag shape: `{ enabled: bool (required), description?: str, owner?: str }`.
- Rules: `enabled` required + boolean; `description` and `owner` optional; flag keys unique per application; missing flag is not equivalent to `false`; defer percentage rollout / targeting.
- API direction: preserve existing configuration endpoints, layer explicit feature-flag request/response shapes on top for cleaner UI/client contract.

**What Criteria 1 maps to in code**

Per `docs/plans/2026-04-30-feature-flags.md`, Criteria 1 corresponds to Task 1: Define the Feature Flag Schema:
- Edit `svc/api/schemas.py` — add Pydantic models for a single flag and the `feature_flags` collection.
- Edit `svc/api/schemas_test.py` — TDD: valid flag, missing `enabled`, non-boolean `enabled`, valid container with multiple flags.
- Run: `cd svc && uv run --active python -m pytest api/schemas_test.py -v`

`svc/api/schemas.py` already establishes the patterns to mirror (Pydantic v2, `Field(...)` with constraints, `field_validator` for cross-field rules, whitespace-trimming like `ApplicationCreate.description`, name-style regex like `ApplicationBase.name`'s `^[a-zA-Z0-9_\-]+$`).

**Suggested next step — two quick decisions before I write tests:**
1. Scope of Criteria 1: just value-shape models (`FeatureFlag` + collection), or also request/response wrappers? Plan's Task 1 reads as the former; Task 2 owns endpoint/repository contract.
2. Embedding: validate `feature_flags` as a typed section inside `ConfigurationUpdate.config`, or expose it as a sibling top-level field on a flag-specific request model? Design doc leans toward embedded.

Once settled I will start with failing tests in `svc/api/schemas_test.py` per the plan's Step 1, then the minimal Pydantic implementation in `svc/api/schemas.py`. Per `WORKFLOW_STATUS.md`, only you call stage transitions.
