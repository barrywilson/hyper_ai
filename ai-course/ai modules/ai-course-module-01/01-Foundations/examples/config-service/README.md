# Configuration Service

A centralized configuration management service that supports application configurations across the organization.

## Overview

This service (in `svc/`) provides HTTP API endpoints that applications can call to fetch their configuration data at runtime, eliminating the need for manual configuration inclusion in deployments.

## Features

- **Centralized Configuration**: Single source of truth for all application configurations
- **Runtime Access**: Applications fetch configuration at startup/runtime
- **Cross-Platform**: HTTP API supports web, desktop, and mobile applications
- **Health Monitoring**: Built-in health check endpoint

## Technology Stack

- **Python**: 3.13.5
- **Web Framework**: FastAPI 0.116.1
- **Database**: PostgreSQL 17.5
- **Package Manager**: uv
- **Testing**: pytest
- **Code Quality**: ruff (linting/formatting)

## Quick Start

### Prerequisites

- Make
- python3 + uv

### Development Setup

1. **Clone and Open** in VS Code:
   ```sh
   git clone <repository-url>
   cd config-service
   code .
   ```

2. **Install dependencies**:
   ```sh
   make install
   ```

   [Install instructions for `uv`](https://docs.astral.sh/uv/getting-started/installation/)

3. **Run tests**:
   ```sh
   make test
   ```

4. **Configure environment**:
   ```sh
   cd svc && cp .env.example .env && cd ..
   ```

5. **View other scripts**:
   ```sh
   make help
   ```

### Running the Service

```bash
# Start the database
make up

# Start the development service
make run-svc
```

The service will be available at:
- API: http://localhost:8000
- Health Check: http://localhost:8000/health
- API Documentation: http://localhost:8000/docs

## Environment Variables

Copy `.env.example` to `.env` before running the service or migrations:

```sh
cd svc && cp .env.example .env
```

Edit `.env` to set your database credentials and any other local overrides.
