# Feature Flags Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add validated, application-level feature flag management to the Configuration Service using the existing configuration model.

**Architecture:** Store feature flags inside each application's configuration document under a structured `feature_flags` key. Add explicit backend validation and a clearer UI editing flow, while preserving the current repository and client-library patterns.

**Tech Stack:** FastAPI, Pydantic, psycopg2 repository layer, TypeScript Web Components, Vitest, pytest

---

### Task 1: Define the Feature Flag Schema

**Files:**
- Modify: `svc/api/schemas.py`
- Modify: `svc/api/schemas_test.py`
- Reference: `docs/001-feature-flags.md`

**Step 1: Write the failing test**

Add tests for:
- a valid flag object with `enabled`
- invalid flags missing `enabled`
- invalid flags where `enabled` is not boolean
- a valid `feature_flags` container with multiple flags

**Step 2: Run test to verify it fails**

Run: `cd svc && uv run --active python -m pytest api/schemas_test.py -v`

**Step 3: Write minimal implementation**

Add Pydantic models or validators that represent:
- a single feature flag
- a collection of flags under `feature_flags`

**Step 4: Run test to verify it passes**

Run: `cd svc && uv run --active python -m pytest api/schemas_test.py -v`

**Step 5: Commit**

```bash
git add svc/api/schemas.py svc/api/schemas_test.py
git commit -m "feat: define feature flag schema"
```

### Task 2: Add Backend Feature Flag Contract

**Files:**
- Modify: `svc/api/endpoints.py`
- Modify: `svc/api/repository.py`
- Modify: `svc/api/endpoints_test.py`
- Modify: `svc/api/repository_test.py`

**Step 1: Write the failing test**

Add tests for:
- reading feature flags for an application
- updating feature flags for an application
- returning `404` when the application does not exist
- rejecting malformed flag payloads

**Step 2: Run test to verify it fails**

Run: `cd svc && uv run --active python -m pytest api/endpoints_test.py api/repository_test.py -v`

**Step 3: Write minimal implementation**

Implement repository and endpoint behavior that reads and writes the `feature_flags` section using the existing configuration record.

**Step 4: Run test to verify it passes**

Run: `cd svc && uv run --active python -m pytest api/endpoints_test.py api/repository_test.py -v`

**Step 5: Commit**

```bash
git add svc/api/endpoints.py svc/api/repository.py svc/api/endpoints_test.py svc/api/repository_test.py
git commit -m "feat: add backend feature flag contract"
```

### Task 3: Add UI Feature Flag Management

**Files:**
- Modify: `ui/src/components/ConfigApp.ts`
- Modify: `ui/src/components/ConfigDetail.ts`
- Modify: `ui/src/components/*.test.ts`
- Modify: `ui/src/integration/component-interactions.test.ts`

**Step 1: Write the failing test**

Add tests for:
- displaying feature flags for the selected application
- toggling a boolean flag
- creating a new flag with validation
- handling API save errors

**Step 2: Run test to verify it fails**

Run: `cd ui && npm run test`

**Step 3: Write minimal implementation**

Add a focused feature-flag editing workflow instead of requiring raw JSON editing for the basic flag use case.

**Step 4: Run test to verify it passes**

Run: `cd ui && npm run test`

**Step 5: Commit**

```bash
git add ui/src/components ui/src/integration/component-interactions.test.ts
git commit -m "feat: add feature flag management UI"
```

### Task 4: Add Client Consumption Guidance

**Files:**
- Modify: `ui/@config-client/src/client.ts`
- Modify: `ui/@config-client/src/client.test.ts`
- Modify: `ui/@config-client/tests/integration.test.ts`
- Modify: `ui/@config-client/README.md`

**Step 1: Write the failing test**

Add tests for:
- retrieving configuration with feature flags
- distinguishing missing flags from disabled flags
- default fallback behavior in documented examples

**Step 2: Run test to verify it fails**

Run: `cd ui/@config-client && npm test`

**Step 3: Write minimal implementation**

Add the smallest useful typed helper or documentation pattern for consumers reading feature flags safely.

**Step 4: Run test to verify it passes**

Run: `cd ui/@config-client && npm test`

**Step 5: Commit**

```bash
git add ui/@config-client/src ui/@config-client/tests ui/@config-client/README.md
git commit -m "feat: add feature flag client guidance"
```

### Task 5: Final Verification and Workflow Cleanup

**Files:**
- Modify: `docs/001-feature-flags.md`
- Modify: `memory/WORKFLOW_STATUS.md`
- Review: touched README files

**Step 1: Run the full project verification**

Run:
- `make test`
- `cd ui && npm run type-check`
- `make lint`

**Step 2: Confirm acceptance criteria status**

Update the work item file to reflect completed tasks and current stage.

**Step 3: Purge stale stage details after commit**

Keep acceptance criteria and status, remove obsolete working scaffolding per the workflow rules.

**Step 4: Commit**

```bash
git add docs/001-feature-flags.md memory/WORKFLOW_STATUS.md
git commit -m "docs: finalize feature flag workflow status"
```
