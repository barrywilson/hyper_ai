# Configuration Service Project

## Purpose

Build a lightweight, web-based API service for managing application configurations. Designed to be simple, observable, and maintainable without heavy dependencies or complex infrastructure.

## Project Scope

**What it does:**
- RESTful CRUD API for configuration key-value pairs
- Web UI for viewing, creating, updating, and deleting configurations
- MySQL database for persistence
- Jest test suite for reliability

**What it doesn't do:**
- Authentication/authorization (not a security layer)
- Configuration versioning or rollback
- Role-based access control
- Advanced filtering or search (basic UI only)
- External integrations (standalone service)

## User Personas

1. **Developer**: Uses API to read/write app configs; uses web UI to test/debug
2. **DevOps Engineer**: Deploys service via Docker; monitors health; manages database
3. **System Admin**: Uses web UI to manage configurations without API knowledge

## Core Principles

- **Minimal dependencies**: No heavy frameworks or ORMs
- **Direct SQL**: Simple, observable database queries
- **Single responsibility**: Manages configurations, nothing more
- **Test-driven**: Comprehensive test suite ensures reliability
- **Docker-native**: Runs in containers; MySQL via Docker Compose

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, Vanilla JavaScript (no frameworks)
- **Database**: MySQL 8.0
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose

## Implementation Constraints

- Minimal dependencies (express, mysql2, cors, dotenv)
- No ORM (direct SQL)
- No external APIs
- Single database connection (no connection pooling yet)
- No authentication

## Key Decisions Made

1. **Column naming**: Used `key_name` instead of `key` to avoid MySQL reserved words
2. **No ORM**: Direct SQL for clarity and control
3. **Vanilla JS frontend**: No build step, direct browser execution
4. **Simple architecture**: Monolithic structure, suitable for learning

## Team & Collaboration

This is an educational project designed to teach:
- Full-stack development patterns
- RESTful API design
- Database integration
- Testing strategies
- Docker containerization
- Context framework usage for AI assistants
