Here's where things stand, based on `memory/WORKFLOW_STATUS.md` and the active work item file.

**Active work item: Feature Flags (`docs/001-feature-flags.md`)**

- Branch: `feature/feature-flags`, last updated 2026-05-07.
- Stage 1 (PLAN): committed. Plan docs kept under `docs/plans/` until the work item completes:
  - `docs/plans/2026-04-30-feature-flags-design.md`
  - `docs/plans/2026-04-30-feature-flags.md`
- Current stage: **BUILD & ASSESS — In Progress**
- Active criterion: **Criteria 1 — Feature Flag Domain Model and API Contract**
- Criteria 2–5 (backend mgmt, UI admin, client consumption, rollout/QA) are still Not Started.

**Recent commits (from session-start status):**
- `ae83e20` chore: workflow_status — feature-flags is the active work item
- `298a56a` plan: add feature-flags work item and design docs
- `f7667d4` docs: align memory files with current API surface and validation rules
- `4d5b664` fix: trim whitespace from Application description
- `6618e98` fix: db_connection — prevent double cleanup on error path

Working tree shows `.gitignore` modified and `.claude/` untracked — unrelated to the feature work.

**Concrete next step.** Per `docs/plans/2026-04-30-feature-flags.md`, you're at the start of execution, so the next move is **Task 1: Define the Feature Flag Schema** (TDD against `svc/api/schemas.py`):

1. Add failing tests in `svc/api/schemas_test.py` for: a valid flag with `enabled`; missing `enabled`; non-boolean `enabled`; a `feature_flags` container with multiple flags.
2. `cd svc && uv run --active python -m pytest api/schemas_test.py -v` (confirm red).
3. Add Pydantic models for a single flag and the `feature_flags` collection in `svc/api/schemas.py`.
4. Re-run pytest (confirm green).
5. Commit as `feat: define feature flag schema`.

Want me to start Task 1 by writing the failing schema tests?
