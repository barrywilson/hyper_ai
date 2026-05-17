# Pairing Skill — Design Document Example
**`start-work` skill | For reference — this is what a completed design doc looks like**

> This is the filled-in version of the skill design template, using the `start-work` demo skill as the example. Use it as a reference when filling in your own design doc.

---

## Skill overview

**Skill name:**
```
/start-work
```

**One-line description:**
Orients you before starting a new piece of work — gathers what's actually happening in the codebase right now and produces a grounded brief so you can hit the ground running.

**When would you invoke this?**
At the start of a work session, especially after a gap. You might have a feature in mind, or you might just want to know where you left off. The skill works both ways: give it a description of what you're about to do, or just ask it "where were we?"

---

## Inputs

**Explicit inputs:**

| Input | Description | Required? |
|-------|-------------|-----------|
| Feature description | A brief description of what you're about to work on | No — if omitted, the skill focuses on "where did we leave off" |

**Implicit inputs:**

| Input | Where it comes from | Why it's needed |
|-------|---------------------|-----------------|
| Recent commit history | Script: `git log` on the branch | Shows what's been done and what the trajectory has been |
| File-level commit history | Script: `git log -- <files>` for each candidate file | Shows how the specific files you'll touch have been evolving |
| Current test status | Script: runs the project's test command | Tells you what's green and what's red before you start |
| Open TODO/FIXME comments | Script: grep in recently touched files | Surfaces debt and unfinished work left by the previous session |
| Work context note | Script: reads `WORK_CONTEXT.md` if it exists | Captures notes left intentionally from the last session |

---

## What the LLM does

**Step 1:** Read the feature description (if provided) and the codebase structure. Identify the files most likely to be involved in this piece of work — what will need to be modified, what will be read, what new files might need to be created.

**Step 2:** Read the script output. Reconcile the initial file list with what the script found: recent activity, failing tests, open TODOs, any work context notes. Adjust the scope assessment based on what's actually happening.

**Step 3:** Synthesise the orientation brief. Produce a concrete, specific brief that covers: what's in scope, how recently touched files have been evolving, what infrastructure concerns to be aware of (state, caching, security, shared dependencies), and a specific recommended starting point.

---

## Output format

**Format:** Markdown sections

**Sections the output should always include:**

1. **Where we are** — current branch, what's in progress, what was done in recent sessions
2. **Scope** — files likely to be modified, files likely to be read, new files to create (with pattern suggestions)
3. **Watch out for** — recent changes to dependencies, failing tests, open TODOs, infrastructure concerns
4. **Recommended starting point** — one specific next action, with a brief reason why

**What should NOT be in the output:**
- Generic advice ("make sure to write tests") that isn't grounded in the actual codebase state
- Speculation about things the script didn't find evidence of
- A long preamble before the actual content

---

## Script responsibility

| Fact | How the script gets it | Format passed to LLM |
|------|----------------------|----------------------|
| Recent commits on branch | `git log --oneline -10` | Numbered list with hash + message |
| Files touched in last 10 commits | `git diff --name-only HEAD~10..HEAD` | Flat list of file paths |
| Recent commits per touched file | `git log --oneline -5 -- <file>` for each file | Per-file section with hash + message |
| Current test status | Run the project's test command, capture pass/fail summary | "X passing, Y failing" + names of failing tests |
| Open TODOs in touched files | `grep -n "TODO\|FIXME\|HACK"` in each recently touched file | Per-file list with line numbers |
| Work context note | `cat WORK_CONTEXT.md` if it exists | Raw content |

---

## Failure modes to consider

**If invoked by a human:**
They can read the output and spot if the skill got something wrong — for example, if it misidentified which files are in scope. They'll correct it before acting on it. Failure is recoverable.

**If invoked by the pair agent in Module 6:**
The brief feeds into subsequent agent steps. If the scope is wrong, the agent might focus on the wrong files. If a failing test is missed, the agent might not know to run it. Errors compound.

**Validation to include:**
- Explicitly flag if the test suite can't be run (missing setup, wrong directory) rather than silently omitting test status
- Confirm the file list with "I've identified X files as in scope — let me know if I've missed something obvious before I continue"

---

## How you'll know it's working

**Test invocation:**
```
/start-work We're adding per-app caching to the Config API. Should be stored in Redis, keyed by app ID.
```

**Expected output (rough sketch):**
```
## Where we are
You're on `feature/config-api-caching`. Recent commits show the Redis
connection is wired up and a basic cache layer is in place. The last
session ended with the expiry logic stubbed out but not implemented.

Two tests are currently failing: TestCacheExpiry, TestCacheEviction.

## Scope
Files to modify: cache.py, config_handler.py, redis_client.py
Files to read: app_registry.py (for the app ID format), settings.py
New files: likely a cache_keys.py for the namespacing logic

## Watch out for
- 3 open FIXMEs in cache.py — all related to the per-app key format
- config_handler.py was modified 2 days ago by a separate PR (auth changes) — check for merge conflicts
- Redis client has no connection retry logic — worth considering before production

## Recommended starting point
Implement the key namespacing in cache_keys.py first. The two failing
tests are both blocked on this — once it's right, they should pass and
you'll have a clear signal before moving to the expiry logic.
```

---

## Notes and decisions

- Decided not to require a ticket ID — the skill should work with zero input ("where were we?") as the primary invocation. Feature description is optional enrichment.
- File-level git history (not just branch history) was a deliberate choice — it shows how dependencies have been evolving, not just what's in the current branch.
- The test runner command will vary by project. The skill should try common defaults (`npm test`, `pytest`, `make test`) and gracefully skip if none work.
- Work context note (`WORK_CONTEXT.md`) is a convention we'll establish in Module 3. By Module 4, students should already know it. The skill reads it but doesn't require it.
