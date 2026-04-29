# Dev Containers Guide

## What are Dev Containers?

Dev Containers let you use a Docker container as your development environment. Your entire dev setup (tools, dependencies, extensions) is defined in code and runs in a container, ensuring everyone on your team has an identical environment.

## Why Use Them?

- **Consistency**: Same environment for everyone
- **Fast Onboarding**: New devs start coding in minutes
- **Isolation**: Keep project dependencies separate
- **No Local Setup**: No need to install multiple tool versions on your machine

## Quick Start

### Prerequisites
- Docker Desktop
- VS Code with "Dev Containers" extension

### Setup
1. Create `.devcontainer/devcontainer.json` in your project
2. Open project in VS Code
3. Click "Reopen in Container" when prompted

## Basic Configuration

**devcontainer.json** - Main config file:

```json
{
  "name": "My Project",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint"]
    }
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}
```

**Key Properties:**
- `image`: Docker image to use
- `customizations.vscode.extensions`: VS Code extensions to auto-install
- `forwardPorts`: Ports to expose from container
- `postCreateCommand`: Run after container is created

## Common Examples

### Node.js
```json
{
  "name": "Node.js",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}
```

### Python
```json
{
  "name": "Python",
  "image": "mcr.microsoft.com/devcontainers/python:3.11",
  "postCreateCommand": "pip install -r requirements.txt"
}
```

### With Database (docker-compose.yml)
```yaml
services:
  app:
    image: mcr.microsoft.com/devcontainers/javascript-node:18
    volumes:
      - ..:/workspace:cached
    command: sleep infinity
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
```

```json
{
  "name": "Full Stack",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace"
}
```

## Features

Add tools without custom Dockerfiles:

```json
{
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {"version": "18"},
    "ghcr.io/devcontainers/features/python:1": {"version": "3.11"}
  }
}
```

Browse features: [containers.dev/features](https://containers.dev/features)

## Common Commands

- **Reopen in Container**: `F1` → `Dev Containers: Reopen in Container`
- **Rebuild**: `F1` → `Dev Containers: Rebuild Container`
- **Reopen Locally**: `F1` → `Dev Containers: Reopen Folder Locally`

## Troubleshooting

**Container won't start**: Check Docker Desktop is running, view logs with `F1` → `Dev Containers: Show Container Log`

**Slow on Windows**: Use WSL 2 backend, store files in WSL filesystem

**Extensions not working**: Add them to `devcontainer.json` and rebuild

## Resources

- [Official Docs](https://code.visualstudio.com/docs/devcontainers/containers)
- [Sample Configs](https://github.com/microsoft/vscode-dev-containers)
- [Dev Container Spec](https://containers.dev/)
