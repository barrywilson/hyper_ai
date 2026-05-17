## Where we are

You're on `main`, and the active work item is **001 Feature Flags** (per `memory/WORKFLOW_STATUS.md`, last updated 2026-05-07). The PLAN stage is committed — `298a56a plan: add feature-flags work item and design docs` landed the work item plus two design docs, and `ae83e20 chore: workflow_status — feature-flags is the active work item` flipped the pointer. Current stage is **BUILD & ASSESS — In Progress** on Criterion 1 (Feature Flag Domain Model and API Contract), but no implementation commits exist yet against that criterion. Note: the work item says branch should be `feature/feature-flags` but you're sitting on `main`, so build hasn't actually started.

## Scope

Files to modify:
- `svc/api/schemas.py` — add the feature flag schema
- `svc/api/schemas_test.py` — schema validation tests
- `svc/api/main.py` — wire the API contract once the schema lands
- `docs/001-feature-flags.md` — flip Criterion 1 status as work progresses

Files to read:
- `docs/plans/2026-04-30-feature-flags-design.md` — domain-model decisions
- `docs/plans/2026-04-30-feature-flags.md` — task breakdown
- `memory/ARCHITECTURE.md`, `memory/IMPLEMENTATION.md` — recently realigned with current API surface (`f7667d4`)

New files: none yet — Criterion 1 is schema work and should land in the existing `schemas.py` to match how Application/Configuration models are organised.

## Watch out for

- **You're on `main`, not `feature/feature-flags`.** The work item explicitly names that branch. Cut it before editing.
- **Test status is stale.** `.pytest_cache` was last touched 2026-05-06 21:30. Run `make test` to refresh the baseline before adding to `schemas_test.py`.
- **Recent tightening on the same files you'll edit.** `schemas.py` has had four recent fixes (whitespace trim, 26-char base32 ULID, Pydantic v2 `ConfigDict`, 1000-char description cap, name regex). Match those conventions when adding the feature-flag model.
- **No open TODO/FIXME/HACK markers** in any touched file.
- **`db_connection.py` got a double-cleanup fix (`6618e98`)** unrelated to feature flags — out of scope, but worth knowing the request lifecycle changed.

## Recommended starting point

Create the `feature/feature-flags` branch and open `docs/plans/2026-04-30-feature-flags-design.md` — that's the design doc committed in the PLAN stage but not yet acted on. Reading it is the 5-minute action that tells you exactly what the boolean-flag-first schema in `svc/api/schemas.py` needs to look like.
