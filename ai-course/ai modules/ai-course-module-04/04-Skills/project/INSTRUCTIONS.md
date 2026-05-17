# Module 4 Exercise: Author Your First Skill

## Goal

Build at least one working skill that supports a real piece of your workflow. Test it against the Configuration API you've been working in (or another project you already have). The skill you author here will join your **PAIR Agent's** repertoire in Module 6 — pick something you'll actually want to use.

---

## Prerequisites

- A skills-supporting harness (see the README's harness shortlist — Cline ≥3.48.0, Claude Code, Codex CLI, Goose, Kilo Code, or OpenCode)
- The Configuration API checked out and runnable (`make install && make up` from `deliverables/examples/config-service/`)
- *Optional but recommended:* the `skill-creator` skill installed in your harness — bundled with the example at `deliverables/examples/example-skills/skill-creator/` (Apache 2.0, mirrored from [`anthropics/skills`](https://github.com/anthropics/skills))

---

## The four options

Pick one. (Or pick **E** and propose your own with the same constraints.)

### A. `start-work` — Orientation skill

Gather a targeted context snapshot — recent commit history on relevant files, current test status, any open work-context notes — and produce a grounded orientation brief before starting a piece of work. Brief covers: files in scope, how they've been evolving, infrastructure concerns, suggested starting point.

This is the demo scenario. The reference implementation lives at `deliverables/examples/example-skills/start-work/` (bundled with the Configuration API example). If you pick this, the challenge is to make it *yours* — different output sections, different grounding sources, different invocation style.

### B. `draft-adr` — Architecture Decision Record drafter

Scan existing ADRs in the repo, extract titles, statuses, and key decisions already made. Feed this to the LLM so the new ADR doesn't contradict or duplicate prior decisions. The LLM then drafts the ADR from a rough description of the new decision.

Good for tech leads and architects who want decision-making to be a first-class part of the process.

### C. `launch-work-item` / `land-work-item` — Work-item process pair

A skill pair that brackets a unit of delivery. `launch-work-item` orients you on a specific work item — what's in scope, what context you need, what acceptance criteria you're aiming at. `land-work-item` runs the closing process — validates acceptance, captures what was learned, prunes the work-item file to outcomes, updates the memory files that drifted.

The landing skill is the bigger lift, and the one that rewards iteration: each delivery is a chance to refine the process for the next one. Pairs naturally with the Module 3 reflection cycle — landing well today makes launching well tomorrow easier.

### D. `assess-tests` — Test quality assessor

Beyond coverage percentages — analyse *how* the tests are designed. The script gathers the test suite structure and a sample of tests; the LLM assesses:

- Are tests tightly coupled to mocks, or using dependency injection?
- Are integration tests connecting to real infrastructure or faking it?
- What are the critical end-to-end paths, and are they covered?
- Obvious gaps in security or load testing?

Good for leads and architects who care about test quality, not just test quantity.

### E. Your own

Same constraints as A–D:

- The skill must be **testable immediately** against the Configuration API or another repo you already have
- It should be **scoped tightly** — one job, done well — not a Swiss-army-knife
- It should produce **observable output** you can read and judge
- Its description should be a **specific verb + situation** (the activation signal)

---

## The process

1. **Pick one option** (A–E).
2. **Open `deliverables/examples/SKILL_DESIGN_TEMPLATE.md`** and fill it in for your chosen skill. The conversation here is more important than the eventual code.
3. **If your skill needs a script** (most will), fill in `deliverables/examples/SCRIPT_DESIGN_TEMPLATE.md` too.
4. **Reference `deliverables/examples/start-work-DESIGN.md`** to see what a completed design doc looks like.
5. **Author the skill.** Two paths:
   - *Recommended:* invoke `skill-creator` (from `https://github.com/anthropics/skills`) and feed it your design doc as the spec
   - *Or:* work directly with your agent, handing it the design doc and asking it to author SKILL.md + script
6. **Install the skill** in your harness (location depends on your harness — Cline: `~/.cline/skills/`, Claude Code: `~/.claude/skills/`, etc.)
7. **Invoke it** against the Configuration API (or your own project). Iterate until it does something useful.
8. **Optional stretch:** build a second skill from another option.

> **Important constraint:** you don't write the script manually. You define the design clearly in markdown, then your agent writes the script. The exercise is the *design conversation*, not the typing.

---

## Submission

Post the following to Discord (or wherever your cohort coordinates):

- Your skill's `SKILL.md`
- Its `script.sh` (if any)
- Your filled-in design doc
- A short note answering the reflection questions in `INTEGRATE.md`

Reach out to one other person on the course who built a different skill. Compare design choices. This is the start of your PAIR Agent's repertoire — and the start of finding your guild.

---

## A note on the PAIR Agent

What you build here will be **used by your PAIR Agent in Module 6.** The agent assembles your skills (M4) and tools (M5) into a harness around your codebase. All four options carry forward — they all relate to process and software delivery, which is exactly the territory the PAIR Agent operates in.

So: pick something you'll actually reach for. The skill you author this week is the first piece of your agent.
