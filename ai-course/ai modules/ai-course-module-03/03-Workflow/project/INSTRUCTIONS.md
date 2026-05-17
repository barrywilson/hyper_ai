# Module 3: Defining and using a collaborative workflow

## Table of Contents
- What you're adding in this module
- Learning objectives
- The task: feature flags
- Alternatives
- Exercise 1: Document your environments and scripts
- Exercise 2: Define your workflow
- Exercise 3: Create your first work item
- Exercise 4: Execute the workflow
- Exercise 5: Reflect and adapt

## What you're adding in this module

In Module 2 you built **semantic memory** — documents that tell your assistant what the project is: its purpose, architecture, and implementation choices. That gives your assistant orientation.

In this module you add two more layers:

**Procedural memory** — how things work: the commands to run tests, apply migrations, start services. Without this, your assistant guesses. `memory/ENV_SCRIPTS.md` is where this lives.

**Episodic memory** — what happened: a record of work done over time. Each feature or task gets a work item file that captures the acceptance criteria, the decisions made, and the outcome. Crucially, once a task is committed, the working scaffolding (implementation plans, stage tracking details) gets purged — you keep the acceptance criteria and the outcome, not the noise.

Together, these three layers — semantic, procedural, episodic — form a context framework that your assistant can navigate confidently, and that will carry forward into agentic workflows in Phase 2.

## Learning objectives

- Design a collaborative workflow your assistant can follow
- Document the scripts and environment your assistant needs to be effective
- Use the workflow to deliver a real feature — per-application feature flags
- Experience the reflect/adapt loop in practice

## The task: feature flags

In Module 1 you built a Config Service API with a real database. In Module 2 you added a context framework and an Admin UI. In Module 3, you'll extend both using a disciplined process.

The feature: **per-application feature flags**.

Each application already has configuration name/value pairs. Feature flags are a natural extension — boolean flags that enable or disable functionality per application.

You'll implement this using a structured workflow that you define in this module. The feature itself touches the API (new endpoints, a new table) and optionally the Admin UI. It's a realistic scope — not trivial, not overwhelming.

> **Tech choice**: The workflow and tooling exercises in this module reference a Python/TypeScript stack to match the module examples. If your service uses a different language, adapt the commands accordingly — the process is the same.

## Exercise 1: `memory/ENV_SCRIPTS.md`

Before your assistant can help you build anything, it needs to know how to run your project. This is your **procedural memory** — the how. Without it your assistant will guess at commands, run the wrong ones, or ask you every time.

Create `memory/ENV_SCRIPTS.md` and document:

- **Environments**: What environments exist (local, CI, etc.)? What ports do things run on?
- **Environment variables**: List all variables from your `.env` or equivalent. What do they control?
- **Developer scripts**: Every command used during development — how to start the API, run tests, apply migrations, build the UI. Include `make` targets, `npm` scripts, `uv` commands, whatever your stack uses.
- **When to go off-script**: Under what circumstances is it acceptable to run something other than the documented commands?

The module examples include a worked version of `memory/ENV_SCRIPTS.md` — read it for the kind of depth that's useful here.

Update your `AGENTS.md` to include a reference to `memory/ENV_SCRIPTS.md`.

> **Quality gates**: From this module on, your quality checks must pass cleanly before a task is done — no skipped tests, no ignored warnings. `make test`, `make lint`, `make format`, and any type checks your stack uses must all be green. Document these commands in `ENV_SCRIPTS.md` so your assistant can run them without being told.

## Exercise 2: `memory/WORKFLOW_STATUS.md`

This is your **episodic memory** structure — the framework for capturing what happens as you work, and when to let go of it.

Define the stages your assistant will follow for every piece of work. A four-stage pattern works well:

1. **PLAN** — break the work into testable tasks; define test strategy and file changes before touching code
2. **BUILD & ASSESS** — implement and validate; tests, linting, type checking must all pass cleanly
3. **REFLECT & ADAPT** — assess what friction you hit; adjust remaining tasks or the process itself
4. **COMMIT & PICK NEXT** — commit with a clear message; update docs and READMEs; identify the next task

For each stage, document:
- What are the required inputs and outputs?
- What are the rules for moving to the next stage?
- Who decides when a stage is complete? (Hint: the user, not the assistant)

Also define:
- **Work item structure**: What goes in a `changes/XXX-name.md` file? Use the template in the examples as a reference.
- **Acceptance criteria format**: Given-When-Then works well — it forces you to define observable behaviour.
- **Status tracking**: Keep a lightweight pointer in `WORKFLOW_STATUS.md`; all the detail lives in the work item file.
- **Purge discipline**: Once a task is committed, delete the stage tracking details (PLAN, BUILD & ASSESS notes) from the work item. Keep the acceptance criteria and whether it's complete. The code is the truth; the working scaffolding is noise.

Update `AGENTS.md` to reference `memory/WORKFLOW_STATUS.md`.

> **See the example**: `deliverables/examples/config-service/memory/WORKFLOW_STATUS.md` shows one fully worked version. You don't have to copy it — but it's useful to read before writing your own.

## Exercise 3: Create your first work item

Copy the work item template and create `changes/001-feature-flags.md`.

Fill in:
- **Story**: As an application developer, I want feature flags per application, so that I can enable or disable functionality without deploying code changes.
- **Acceptance criteria**: Write 3–5 Given-When-Then scenarios. Think about: creating a flag, retrieving flags for an application, updating a flag's value, and any Admin UI changes.
- **Notes**: Anything useful — schema decisions, migration approach, which endpoints are needed.

Leave the stage tracking sections (PLAN, BUILD & ASSESS, etc.) blank for now. You'll fill them in as you work.

Commit the work item file before you start building.

## Exercise 4: Execute the workflow

Work through your stages using the feature flags work item.

Start with **PLAN**:
- Open a new conversation with your assistant. Verify it auto-loads `AGENTS.md` and reads the memory files.
- Ask it to help plan the first acceptance criteria task. It should define: what tests are needed, what files will change.
- Review the plan. Correct anything that doesn't match your architecture or preferences.
- Commit the updated work item before moving to BUILD.

Move to **BUILD & ASSESS**:
- Implement the planned task. Monitor your assistant — redirect if it goes out of scope.
- Run your quality checks. Everything must pass cleanly before the stage is done.
- Update the work item file with progress.

Move to **REFLECT & ADAPT**:
- What friction did you hit? Was the plan accurate?
- Do any remaining tasks need to change?
- Update your workflow document if you spotted a gap.

Move to **COMMIT & PICK NEXT**:
- Commit with a clear conventional commit message.
- Review the README files in every folder you touched or added code to. Update them if what they describe no longer matches what's there. This is how your project's knowledge graph stays accurate — a quick check at the end of each task, not a big documentation effort at the end of the project.
- Purge the stage tracking details from the work item. Keep the acceptance criteria; delete the working notes.
- Identify the next task and update the work item.

Repeat for each acceptance criteria task. You don't need to complete all of them in this module — working through 2–3 tasks is enough to feel the rhythm.

## Exercise 5: Reflect and adapt

The reflect/adapt stage isn't just for tasks — it applies to the workflow itself.

After working through a few tasks:

- What parts of the workflow felt too heavy? Too light?
- Did your assistant follow the process or drift? What caused the drift?
- Is `ENV_SCRIPTS.md` complete enough that your assistant never had to ask how to run something?
- Could you pick up where you left off in a fresh conversation using only "what's our status?" — with no extra explanation?
- What would you change before using this workflow on a real project?

Update your memory documents based on what you learned. That's the point.
