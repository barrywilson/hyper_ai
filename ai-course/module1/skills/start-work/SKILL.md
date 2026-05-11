---
description: "Orientation skill. Run when starting a work session on the config-service project to get a grounded context snapshot before writing any code."
---

# start-work

## When to use

Invoke this skill at the **start of a coding session** — before writing any code. It orients you on what changed recently, what's running (or broken), and where to pick up.

## What it does

1. **Git snapshot** — recent commits (last 10) on the working tree, plus any uncommitted changes
2. **Infrastructure check** — runs `docker-compose ps` to see which containers are up/down/restarting
3. **Memory file scan** — reads the `memory/` folder to surface project context (ABOUT, ARCHITECTURE, KAFKA, etc.)
4. **Code health flags** — scans for commented-out code blocks (e.g. `// kafka.`, `// await`) that may indicate incomplete work
5. **Orientation brief** — produces a short summary: files in scope, infrastructure status, suggested starting point

## Output

A markdown brief printed to the console covering:

- **Recent changes**: what files moved and why
- **Infrastructure status**: container health at a glance
- **Open concerns**: commented-out code, TODO markers, failing tests
- **Suggested starting point**: where to focus first

## Activation

Say: **"start work"** or **"orient me on the project"**
