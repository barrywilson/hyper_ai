# Module 2: Creating and using a context framework

## Table of Contents
- Why a context framework?
- Learning objectives
- Exercise 1: Assistant collaboration on basic context
- Exercise 2: Create the next context document
- Exercise 3: Auto-load the context framework using a rule
- Exercise 4: Create additional context documents
- Exercise 5: Build the Admin UI
- Before you move on
- Extra Credit

## Why a context framework?

Your assistant starts every conversation with no memory of what you built last week. Without context, every session starts from scratch — re-explaining the project, re-establishing preferences, re-discovering what you already decided.

A context framework fixes that. It's a small set of documents that keep your assistant oriented across sessions: what the project is, how it's structured, what conventions you follow. These are the files your assistant reads before asking a single question.

Think of this as **semantic memory** — persistent knowledge about the codebase that the whole team (including your assistant) can rely on. In Module 3 you'll add **procedural memory** (how to run things) and **episodic memory** (how work gets tracked over time). In Phase 2, this framework becomes the foundation your pair agent reads to understand the project before taking action.

For now: keep it small, intentional, and accurate. Three well-maintained files beat twenty stale ones.

## Learning objectives

- Build narrative and code-related context documents with varying levels of AI assistance
- Write and configure a file that auto-loads context at the start of every conversation
- Build context framework assets that can be used in future projects
- Evaluate the differences in tone, precision, and cost between different models during collaboration

## Exercise 1: Assistant collaboration on basic context
  - Remember to plan first, then act
  - Don't (accidentally) be overly ambitious

### Create `memory/ABOUT.md`
> What do you and the assistant need to know about this project that will inform decisions around priority, design, and quality.

Examples: name, description, justification, personas, domain context, scope

You can give the folder any name, but let's use `memory/` for now.

This context will be incorporated during planning sessions. We don't need to be overly comprehensive here. Remember, the goal of this content is to help the assistant be more precise and to mitigate any high-level ambiguity about the project.

#### Steps

1. **Create the `memory/ABOUT.md` file**

    ```sh
    mkdir memory && touch memory/ABOUT.md
    ```

2. **Define the document's structure & initial content**

- Open `memory/ABOUT.md` in your editor and add some of the content and/or create headers for the sections you would like included.

- Another option is to include placeholders along with instructions for the assistant that they should apply when they are reading and updating the file. If you do this, be sure you make it easy to delineate between the placeholders/instructions and content it should not edit.

- If you do this step and spend a bit of time on this document, it's recommended you at least stage (or commit) your changes before moving on to the next step.

3. **Collaborate with the assistant**

- Ensure your Git working tree is clean and open the `memory/ABOUT.md` in your editor. Choose a model for planning and document writing.

- Construct a prompt that contains all of the information needed to complete the document and requests the assistant provide a plan for how they would edit the doc. This may be a voice message recording transcript or a hand-typed prompt with concise formatting and terse statements. One will cost more (tokens), but precision will depend on the quality of the prompt and the model fulfilling it.

- Send the prompt with an `@` reference to the file (`@memory/ABOUT.md`) so the assistant doesn't have to spend more tokens searching for it.

- Review the changes and decide to revert them and try again after some edits or accept them and continue to the next step.
  - Does the content reflect _your_ understanding of the project, or did the assistant invent plausible-sounding details?
  - Is the tone concise and actionable, or verbose and generic?
  - Would a future assistant (or a new team member) be better oriented after reading this?

- Save and commit changes.

## Exercise 2: Create the next context document

### What's on top?
> What is the first thing you would like to change or get clear about regarding the code base?

Examples: testing approach, pattern choice, data storage, api routes, new non-functional behaviour

Based on what you would like to change, select the most appropriate document to describe these decisions.

- **For Planning**
  - `memory/DOMAIN.md`
  - `memory/ARCHITECTURE.md`
- **For Changing/acting**
  - `memory/IMPLEMENTATION.md`
  - `memory/TESTING.md`

Follow the same collaborative, plan-first, process used to create `ABOUT.md`. However, this time, based on the document, give the assistant all of the appropriate `@file/paths` so it can use what it learns to populate the document.

### Collaborate with the assistant

This context may be incorporated during planning or act sessions.

We should be as comprehensive as needed, but no more so. Remember, the goal of this content is to help the assistant be more precise without too much fluff that isn't actionable.

Examples of good and bad results are **very** helpful.

## Exercise 3: Auto-load the context framework using a rule

### Create `AGENTS.md`

Most AI-enabled coding tools have a mechanism to auto-load context at the start of every conversation. The cross-tool standard for this is `AGENTS.md` — a file in the root of your project that Cline, Claude Code, Codex, and most other tools recognise automatically.

Create it in the root of your project:

```sh
touch AGENTS.md
```

The contents should briefly describe the purpose of the context framework and direct the assistant to load each file. For example:

```md
# Agent Instructions

This project has a context framework in `memory/`. Read these files at the start of each conversation:

- `memory/ABOUT.md` — project purpose, personas, and constraints
- `memory/ARCHITECTURE.md` — patterns, data flow, and key decisions
- `memory/IMPLEMENTATION.md` — languages, versions, dependencies, preferences

Load files selectively when they are relevant to the current task.
```

Adapt the content to match the files you have created so far.

**`AGENTS.md` is a living document.** Every time you add a new context file — in this module or future ones — update `AGENTS.md` to reference it. It's the front door to your project's memory; keep it current.

### Ensure the context is being auto-loaded

Open a new conversation with your assistant and ask it to tell you about the goals for the project — without mentioning any files yourself. You should be able to see it reading the memory files into the context window automatically.

## Exercise 4: Create additional context documents

Collaborate with your assistant to appropriately fill in the contents of `memory/ARCHITECTURE.md` and `memory/IMPLEMENTATION.md`. Use collaboration patterns similar to those that created `memory/ABOUT.md` except this time include relevant `@file/paths` to source files that represent the overarching patterns and implementation details.

## Exercise 5: Build the Admin UI

Your Config Service API is running. Now it needs an admin interface — a simple web UI for managing applications and their configuration entries.

This is where your context framework earns its keep. Your assistant already knows the project, the API endpoints, and your implementation preferences. Use that to your advantage.

### Scope

Keep it tight:

- **List** all applications
- **View** the configuration entries for a selected application
- **Update** a configuration value

That's it for now. Resist scope creep.

### Steps

1. Create a `ui/` folder as a sibling to `svc/`.

2. Start a new conversation with your assistant. Your `AGENTS.md` should auto-load the context framework — verify it does by watching it read the memory files.

3. Ask your assistant to create an implementation plan for the Admin UI, referencing your API endpoint definitions. Use the Plan → Act pattern you've practiced.

4. Review the plan before acting. Does it reflect your tech choices from `memory/IMPLEMENTATION.md`? Does the scope match?

5. Implement. While your assistant builds, keep an eye on what it's doing. If it starts going beyond the agreed scope, stop it and redirect.

6. Get the UI talking to the API. The CORS middleware added to the config service should allow local development traffic through.

7. Commit frequently. If the result isn't what you wanted, you can always roll back and try a different approach.

8. Update your `memory/IMPLEMENTATION.md` and `memory/ARCHITECTURE.md` to reflect the UI you built. Then update `AGENTS.md` if you added any new context files.

### Reflection

- Did having the context framework change how you prompted, or what your assistant produced?
- How much did you need to correct versus accept?
- Where did the context help most — planning, implementation, or both?

## Before you move on

Make sure your project has a `Makefile` (or equivalent) with targets for the common development tasks in your stack — installing dependencies, running tests, starting the service, and anything else you reach for regularly. A Makefile makes these commands consistent and easy for your assistant to discover and use.

The module examples include a reference Makefile if you want a starting point. In Module 3 you'll document these scripts formally and lean on them heavily for quality gates. Better to have them in place now.

What to hold off on for now: elaborate task planning and multi-session tracking. Don't let your assistant create a detailed task list and check things off across sessions. Module 3 introduces a structured workflow for exactly this — save it for then.

## Extra Credit

### A web client library

Over the past week, you've been telling colleagues about the config service. Someone is ready to beta test it — but the long-term plan is for applications to consume a client library rather than the API directly. This provides a layer of abstraction and some safety from breaking changes.

Use your context framework to plan a client library for the web. The Admin UI you just built can be the first consumer.

### Context framework templates

Assuming this isn't the last time you'll be creating a context framework for a project, what templates and instructions can you create — collaborating with your assistant, of course — that will make this process easier next time?

Create these assets and try them when initialising a new project.
