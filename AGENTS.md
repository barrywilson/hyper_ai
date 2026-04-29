---
description: "Configuration Service project context. Auto-loads project memory on every conversation. Use when working on config-service features, API routes, UI, testing, or database changes."
---

# Configuration Service - Project Context

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
