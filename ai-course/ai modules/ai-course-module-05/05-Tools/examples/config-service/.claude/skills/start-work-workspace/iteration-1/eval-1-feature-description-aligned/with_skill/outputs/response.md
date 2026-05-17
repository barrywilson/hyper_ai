## Where we are

You're on `main` with the feature-flags work item officially opened: `ae83e20 chore: workflow_status — feature-flags is the active work item` and `298a56a plan: add feature-flags work item and design docs`. `WORKFLOW_STATUS.md` and `docs/001-feature-flags.md` both confirm the active task is **Criteria 1: Feature Flag Domain Model and API Contract**, currently in **BUILD & ASSESS — In Progress**. The PLAN stage is committed (design + plan docs landed in `298a56a`); no schema or endpoint code has been written yet against the flag model. Note: recent commits are on `main`, but the work item lists `feature/feature-flags` as the branch — you may want to switch branches before editing.

## Scope

**Files to modify:**
- `svc/api/schemas.py` — add `FeatureFlag` and feature-flag-bearing config schemas (Pydantic v2 `ConfigDict` style already in use)
- `svc/api/schemas_test.py` — schema validation cases for the new flag shape
- `docs/001-feature-flags.md` — flip Criteria 1 status / record contract decisions

**Files to read (for context, won't be edited yet):**
- `docs/plans/2026-04-30-feature-flags-design.md` — recommended domain model (`feature_flags.<key>.{enabled, description, owner}`) and API direction
- `docs/plans/2026-04-30-feature-flags.md` — task breakdown
- `memory/ARCHITECTURE.md`, `memory/IMPLEMENTATION.md` — current API surface and validation rules so the new schema fits the existing pattern
- `svc/api/repository.py`, `svc/api/endpoints.py` — to confirm the existing per-application configuration storage shape before extending it

**New files:** none yet for Criteria 1 — the design recommends layering flags into existing configuration documents rather than introducing a new store. Hold off on new modules until contract is settled.

## Watch out for

- **Branch mismatch.** Work item says `feature/feature-flags`, but recent commits (including the plan and workflow_status updates) are on `main`. Confirm where you actually want to land changes before editing.
- **Test status is stale.** `.pytest_cache` last modified 2026-05-06 21:30 (yesterday); the script does not run the suite. Run `make test` before assuming green.
- **No open TODO/FIXME markers** in the touched files — that's a clean signal, not an omission.
- **Recent unrelated tightening on shared schema files.** `svc/api/schemas.py` has had several recent fixes (`4d5b664` description trim, `3724a0f` ULID 26-char base32, `758884a` Pydantic v2 ConfigDict refactor, `d030aaf` 1000-char description cap). Any new flag schemas should match those validation conventions rather than reintroducing looser rules.
- **Design doc constraint to honor.** Per `2026-04-30-feature-flags-design.md`: `enabled` is required boolean, `description`/`owner` optional, missing flag != disabled, defer rollout/audience fields. Don't drift from this in the contract.

## Recommended starting point

Open `svc/api/schemas.py` alongside `docs/plans/2026-04-30-feature-flags-design.md` and draft a `FeatureFlag` Pydantic model (`enabled: bool`, optional `description`, optional `owner`) plus a flag-key validation rule, then add a failing test in `svc/api/schemas_test.py` covering "missing `enabled` rejected" and "extra fields rejected". That gives you a concrete contract to push the rest of Criteria 1 against.
