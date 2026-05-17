Quick check before I draft the brief: you mentioned **Redis caching keyed by app ID**, but the active work item on this branch is **feature flags** (`docs/001-feature-flags.md`, BUILD & ASSESS in progress as of 2026-05-07, branch pointer `feature/feature-flags`). There's no Redis or caching work in the recent history. Is the caching idea a pivot away from feature flags, a parallel side-task, or did you mean to land it inside the feature-flag work? I'll draft the brief assuming a pivot, but flag the mismatch loudly.

## Where we are

On `main`. The most recent commits land the feature-flags work item: `298a56a plan: add feature-flags work item and design docs` followed by `ae83e20 chore: workflow_status — feature-flags is the active work item`. `WORKFLOW_STATUS.md` has Criteria 1 (Feature Flag Domain Model and API Contract) at BUILD & ASSESS in progress. Before that, the branch has been doing schema/validation hardening (`schemas.py`, ULID validation, CORS tightening, db_connection cleanup fix). Nothing in the last 10 commits touches caching, Redis, or any equivalent infrastructure.

## Scope

Files to modify: *(none yet — no Redis/caching code exists in the repo)*
- `svc/api/main.py` — likely where a cache layer or middleware would hook in
- `svc/api/db_connection.py` — pattern to mirror for a `redis_connection.py` lifecycle
- `memory/ARCHITECTURE.md` — needs an entry once the cache shape is decided

Files to read:
- `memory/ARCHITECTURE.md` and `memory/IMPLEMENTATION.md` — both refreshed in `f7667d4` to match the current API surface; read these before deciding where caching slots in
- `svc/api/db_connection.py` — for the existing connection-lifecycle / cleanup pattern (recently fixed in `6618e98` to avoid double cleanup; mirror that)
- `docs/plans/2026-04-30-feature-flags-design.md` — only because feature-flag reads are the obvious first cache consumer; worth knowing the planned shape before designing the key

New files (only if you proceed): a work item `docs/002-redis-caching.md` and a plan under `docs/plans/`, per the project's PLAN/BUILD/REFLECT/COMMIT workflow.

## Watch out for

- **Active work item mismatch.** `WORKFLOW_STATUS.md` says feature-flags is the in-flight work and Criteria 1 is mid-BUILD. Starting Redis caching means either pausing feature-flags (update `WORKFLOW_STATUS.md`) or scoping caching as a sub-task — don't silently leave the workflow pointing at the wrong thing.
- **No existing Redis dependency, client, or config.** This is greenfield infra: dependency, connection lifecycle, settings, docker-compose / dev story, and tests all need to land. The `db_connection.py` double-cleanup fix (`6618e98`) is a precedent for getting connection lifecycle right on the first pass.
- **Cache invalidation surface.** Keying by app ID means every write path that mutates an Application or its config must invalidate — i.e. anywhere `svc/api/main.py` and `svc/api/schemas.py` are touched on writes. Worth listing those endpoints before writing code.
- **Test status is stale, not green.** `.pytest_cache` was last touched 2026-05-06 21:30; the gather script didn't run the suite. Run `make test` before changing anything so any breakage you see later is yours.
- **No open TODO/FIXME markers** in the touched files — the script confirmed this, so there's no pre-existing tech-debt anchor for caching to attach to.

## Recommended starting point

Decide the workflow question first: open `memory/WORKFLOW_STATUS.md` and `docs/001-feature-flags.md`, and tell me whether Redis caching pauses feature-flags, lives alongside it, or replaces it. That decision changes whether the next step is a new `docs/002-redis-caching.md` work item or a scoped sub-task on 001 — and it's the only thing blocking a real plan.
