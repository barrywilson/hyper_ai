# Configuration Service - Frontend UI

Simple Express-based frontend server for the Configuration Service.

## Overview

This is the frontend UI server that serves the web interface for managing configurations. It runs on port 8080 and communicates with the backend API on port 3000.

## Features

- **Read-Only View** (`index.html`): View all configurations
- **Admin Dashboard** (`admin.html`): Full CRUD operations for configurations
- **Web Components**: Reusable UI elements (header, table, loading, messages)
- **API Client**: Universal client for backend communication

## Architecture

```
Frontend Server (Port 8080)
├── server.js (Express server)
└── public/
    ├── index.html (Read-only view)
    ├── admin.html (Admin dashboard)
    ├── api-client.js (API communication)
    ├── style.css (Styles)
    └── elements/ (Web components)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on port 3000

### Installation

```bash
npm install
```

### Running the Server

```bash
# Start the server
npm start

# Or with auto-reload (if using nodemon)
npm run dev
```

The UI will be available at `http://localhost:8080`

## Configuration

Environment variables (`.env`):

```
PORT=8080
API_URL=http://localhost:3000
```

## API Communication

The frontend uses the universal API client to communicate with the backend:

```javascript
const api = createApi({
  namespace: 'ai.course.config',
  version: 'v1',
  baseUrl: 'http://localhost:3000/api'
});

// Usage
await api('list');
await api('create', { key: 'app_name', value: 'MyApp' });
```

## Docker

The frontend runs in a Docker container as part of the docker-compose setup:

```bash
# Start all services (from module1 directory)
docker-compose up -d

# View logs
docker-compose logs config-ui
```

## Development

- Frontend runs on port 8080
- Backend API runs on port 3000
- Changes to files are reflected immediately (no build step)

## Project Structure

- `server.js` - Simple Express server for serving static files
- `public/` - All frontend assets
  - `index.html` - Main read-only view
  - `admin.html` - Admin dashboard with CRUD operations
  - `api-client.js` - Universal API client
  - `style.css` - Application styles
  - `elements/` - Custom web components

## Related

- Backend API: `../config-service/`
- Docker Compose: `../docker-compose.yml`
- Makefile: `../Makefile`
