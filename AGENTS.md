---
description: "Configuration Service project context. Auto-loads project memory on every conversation. Use when working on config-service features, API routes, UI, testing, or database changes."
---

# Configuration Service - Project Context

## Core Principles for AI Assistants

### 1. Anti-Bloatware Rules (CRITICAL)
- **Keep it simple** - No bloatware, ever
- **The best code is no code** - The second best is minimal code that does the job
- **Strip down "comprehensive" solutions** - AI defaults to verbose; user wants minimal
- **No future-proofing** - Don't create infrastructure for features that don't exist yet
- **When user says "no junk," they mean it** - Don't offer multiple files/scripts as solution
- **One file > many files** - Single reference document beats 15+ batch scripts
- **Question complexity** - If it seems too complex, it probably is

### 2. Cost Awareness (EVERY LINE COSTS MONEY)
- **Bloat = wasted tokens = wasted money** - Every unnecessary line costs real money
- **Use Plan mode first** - Discuss options before implementing to avoid creating unwanted files
- **Don't create files that need deletion** - Think before generating
- **Avoid layers of abstraction** - Makefile → script → docker command = bloat
- **106 lines when 1 line works = waste** - Always seek the minimal solution

### 3. AI Behavior Patterns to Avoid
- **"Comprehensive" ≠ "Better"** - AI defaults to more; user wants less
- **Don't add abstraction layers** - Direct commands > wrapper scripts > wrapper Makefiles
- **Don't create for non-existent features** - Only build what's needed now
- **Reject verbose solutions** - No 515-line READMEs, no 212-line .gitignores
- **No framework-heavy defaults** - Keep dependencies minimal
- **Don't repeat mistakes** - If user says "don't do X," never do X again

### 4. Windows Development
- **No multiple batch files** - Don't create 15+ .bat files for each command
- **Single reference document** - Show actual commands in one .md file
- **User empowerment** - Let user run commands directly, don't over-automate
- **Optional make installation** - Suggest it, don't force alternatives

### 5. Decision Framework
Before generating code, ask:
1. **Is this actually needed?** - Or is it future-proofing?
2. **Can this be simpler?** - What's the minimal solution?
3. **Does this add value?** - Or is it just wrapping existing commands?
4. **Will this cost money to fix later?** - Avoid creating cleanup work

### 6. When User Pushes Back
- **"Too much bloat"** → Strip it down immediately, don't defend it
- **"No junk"** → Remove everything non-essential
- **"Too wordy"** → Cut explanations, focus on what not why
- **"This is too complex"** → Simplify, don't explain why it's complex

### 7. Project-Specific Rules
- **Node.js only** - No Python, no other languages unless explicitly requested
- **No extra dependencies** - Get approval before adding packages
- **Basic web/API structure** - Keep architecture simple
- **Ask questions** - Don't assume, clarify requirements first

## Auto-Loading Memory Files

This file directs the AI assistant to load the following context documents at the start of every conversation:

1. **[memory/ABOUT.md](./memory/ABOUT.md)** — Project purpose, scope, personas, and core principles
2. **[memory/ARCHITECTURE.md](./memory/ARCHITECTURE.md)** — System design, data flow, and technical patterns
3. **[memory/IMPLEMENTATION.md](./memory/IMPLEMENTATION.md)** — Implementation details, coding conventions, and best practices
4. **[memory/CLIENT_LIBRARY.md](./memory/CLIENT_LIBRARY.md)** — Client library design, API, and usage patterns
5. **[memory/TESTING.md](./memory/TESTING.md)** — Testing philosophy, integration over unit, ephemeral containers
6. **[memory/KAFKA.md](./memory/KAFKA.md)** — Kafka integration architecture, event-driven patterns, and streaming designs

## Quick Context

- **Project**: Configuration Service (Backend API + Frontend UI)
- **Purpose**: Lightweight web-based API for managing application configurations
- **Tech Stack**: Node.js, Express, MySQL, Jest
- **Architecture**: Separated frontend (port 8080) and backend (port 3000)
- **Status**: Complete basic service with separated frontend/backend architecture

## How to Use This File

**For AI Assistants**: On conversation start, read the memory files above to understand the project context.

**For Humans**: Update this file whenever you add a new context document to the `memory/` folder, or when project scope changes significantly.

## Related Files

- [ai-course/module1/config-service/](./ai-course/module1/config-service/) — Backend API service
- [ai-course/module1/config-ui/](./ai-course/module1/config-ui/) — Frontend UI service
- [ai-course/module1/docker-compose.yml](./ai-course/module1/docker-compose.yml) — Container orchestration
- [ai-course/module1/Makefile](./ai-course/module1/Makefile) — Development tasks

## Next Steps

- [ ] Complete memory/ARCHITECTURE.md (data flow, patterns)
- [ ] Complete memory/IMPLEMENTATION.md (coding conventions)
- [ ] Build Admin UI page (enhanced configuration management)
- [ ] Add Makefile (development tasks)
