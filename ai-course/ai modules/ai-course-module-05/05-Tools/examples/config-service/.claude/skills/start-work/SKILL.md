---
name: start-work
description: Use at the start of a coding session to orient against the actual current state of the Configuration Service repo before doing anything. Produces a grounded brief covering where the branch is, what was last touched, what tests are red, and a concrete recommended starting point. Trigger this whenever the user says "/start-work", "where were we", "let's pick this back up", "I'm starting on X", "what's the state of this branch", or otherwise opens a session intending to do work — even if they don't name the skill explicitly. Skip only when the user is mid-task and just wants help with one specific thing.
---

# start-work

Orient before you act. The point of this skill is to replace the usual "let me poke around the codebase" warm-up with a single grounded brief, so the user can decide what to do next instead of relying on a stale mental model.

This is a **Configuration Service**-tuned skill. It assumes the project conventions documented in `AGENTS.md`: a `memory/` directory, a four-stage workflow tracked in `memory/WORKFLOW_STATUS.md`, work items under `docs/NNN-*.md`, and `make` as the task runner. If you're invoked in a repo that doesn't have these, say so and offer to fall back to plain `git log`.

## When this skill triggers

- "/start-work [optional feature description]"
- "Where were we?" / "Let's pick this up" / "What's on this branch?"
- The user describes a feature they're about to start, before any implementation is in flight.

If implementation is already underway in this conversation, don't invoke this skill — they don't need orientation, they need execution help.

## What you do

### Step 1 — Run the gather script

Run `.claude/skills/start-work/scripts/gather_context.sh` from the repo root. It emits a single Markdown document on stdout with these sections:

- **Branch** — current branch name
- **Recent commits** — `git log --oneline -10`
- **Touched files (last 10 commits)** — flat list, deleted files filtered out
- **Per-file recent history** — last 5 commits per touched file (capped at 15 files)
- **Open TODO/FIXME/HACK markers** — comment-style markers only, in touched files
- **Workflow status** — the "Current Status" block from `memory/WORKFLOW_STATUS.md`
- **Active work item** — first ~80 lines of the most-recently-modified `docs/NNN-*.md`
- **Test status (cached)** — what `.pytest_cache` says about the last run; the script does **not** run the suite
- **Plan documents** — most recent files under `docs/plans/`

Don't second-guess what's there. The script's output is the source of truth — synthesise from it, don't go re-running git commands yourself unless something is missing.

### Step 2 — Reconcile with the user's intent

Two cases:

**A. User gave a feature description.** Compare what they're about to do against the script output:
- Does the active work item match? If they say "adding caching" but the work item says "feature flags", flag the mismatch — it's the most common drift after a context gap.
- Which touched files are likely involved? Pick a small, specific set (3–5). Be willing to add files the script didn't surface if you can justify it from the description.
- Before producing the final brief, briefly check: *"I've identified `[files]` as in scope and noticed `[possible mismatch]`. Anything obviously off before I continue?"* This is a one-line check, not a long preamble. Skip it if everything is clearly aligned.

**B. User just said "where were we" / no description.** No confirmation needed — there's nothing to validate against. Go straight to the brief, focused on the active work item and current stage.

### Step 3 — Produce the brief

Use exactly these four sections, in this order:

```
## Where we are
[Branch, current stage from WORKFLOW_STATUS, what recent commits show as in-flight.
2–4 sentences. Anchor in concrete commit subjects, not paraphrases.]

## Scope
Files to modify: [list]
Files to read: [list — for context, won't be edited]
New files: [list with brief reason — only if clearly needed]

## Watch out for
[Bullet list. Each bullet must come from script evidence:
 - failing tests (named) from cached results
 - open TODOs (file + line) in touched files
 - cross-cutting changes — files modified by recent commits unrelated to this work
 - infrastructure concerns visible in the work item or plan docs]

## Recommended starting point
[One specific next action, with one sentence on why. Should be small enough that
the user can act on it in the next 5 minutes without further planning.]
```

### Step 4 — Stay honest about what you don't know

If the script said `(no test cache found)` or `Last cached run: had failures` from days ago, **say so** in the "Watch out for" section. Don't invent test status. Same for empty TODOs ("none in touched files") — that's a useful signal, not something to omit.

## What to leave out

- Generic engineering advice ("remember to write tests", "consider edge cases"). The user knows; it's noise.
- Speculation. If the script didn't find evidence of something, don't lead with "you might also want to think about…".
- Long preambles ("Great, let me orient us…"). Open with `## Where we are` and let the structure speak.
- Re-summarising the script output verbatim. Synthesise.

## Why each section exists

- **Where we are** is the cheapest possible answer to "did the user lose context?". Often that's all they actually needed.
- **Scope** is the part that, if wrong, makes the user lose trust in the brief — that's why the optional confirmation step exists when there's a description to validate against.
- **Watch out for** is the section that distinguishes a useful brief from a generic one. Surfaced TODOs and recent unrelated changes are the things a fresh reader would miss.
- **Recommended starting point** forces a concrete action. Without it, the brief becomes orientation for its own sake.

## Failure modes to be aware of

- **The script fails or returns nearly nothing** (fresh repo, no commits, no `memory/` dir). Don't fake a brief. Tell the user what's missing and ask whether they want to proceed without that grounding.
- **The active work item is stale.** If `WORKFLOW_STATUS.md` says one thing but the recent commits clearly contradict it, surface the mismatch in "Watch out for" — don't paper over it.
- **Multiple work items modified recently.** Take the most recent `docs/NNN-*.md` as a default, but mention the others briefly so the user can correct you.
