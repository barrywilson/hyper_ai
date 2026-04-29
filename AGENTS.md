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

## Quick Context

- **Project**: Configuration Service API
- **Purpose**: Lightweight web-based API for managing application configurations
- **Tech Stack**: Node.js, Express, MySQL, Jest
- **Status**: Complete basic service; enhancing with admin UI

## How to Use This File

**For AI Assistants**: On conversation start, read the memory files above to understand the project context.

**For Humans**: Update this file whenever you add a new context document to the `memory/` folder, or when project scope changes significantly.

## Related Files

- [config-service/README.md](./config-service/README.md) — User-facing project documentation
- [config-service/src/](./config-service/src/) — Implementation directory
- [config-service/tests/](./config-service/tests/) — Test suite
- [docker-compose.yml](./docker-compose.yml) — Database setup

## Next Steps

- [ ] Complete memory/ARCHITECTURE.md (data flow, patterns)
- [ ] Complete memory/IMPLEMENTATION.md (coding conventions)
- [ ] Build Admin UI page (enhanced configuration management)
- [ ] Add Makefile (development tasks)
