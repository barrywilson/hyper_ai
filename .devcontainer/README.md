# Dev Container Setup for Config UI

## Overview

This dev container is configured for **config-ui development only**. It provides a clean, isolated Node.js 20 environment for working on the frontend UI service.

## What's Included

- **Node.js 20** runtime
- **ESLint** extension for code quality
- **Port 8080** forwarded for the UI
- **Automatic npm install** on container creation

## How to Use

### 1. Start the Dev Container

In VS Code:
1. Press `F1` or `Ctrl+Shift+P`
2. Select **"Dev Containers: Reopen in Container"**
3. Wait for the container to build and start
4. Dependencies will install automatically

### 2. Start Required Services Manually

The dev container only runs config-ui. You need to start the backend services manually in a **separate terminal** (outside the container):

```bash
cd ai-course/module1
docker-compose up db config-service
```

This starts:
- **MySQL database** on port 3306
- **Config Service API** on port 3000

### 3. Run the Config UI

Inside the dev container terminal:

```bash
npm start
```

The UI will be available at `http://localhost:8080`

### 4. Run Tests

Inside the dev container:

```bash
npm test
```

## Architecture

```
┌─────────────────────────────────────┐
│   Dev Container (config-ui)         │
│   - Node.js 20                      │
│   - Port 8080                       │
│   - Your workspace                  │
└─────────────────┬───────────────────┘
                  │
                  │ HTTP calls to localhost:3000
                  │
┌─────────────────▼───────────────────┐
│   Docker Compose (manual)           │
│   - MySQL (port 3306)               │
│   - Config Service (port 3000)      │
└─────────────────────────────────────┘
```

## Benefits

✅ **Simple and focused** - only config-ui code in your workspace  
✅ **Clean environment** - consistent Node.js 20 setup  
✅ **Isolated dependencies** - no conflicts with your local machine  
✅ **Easy to start/stop** - just rebuild the container  

## Troubleshooting

### Can't connect to config-service

Make sure the backend services are running:
```bash
docker-compose ps
```

You should see `config_service_dev` and `mysql_sample` running.

### Port 8080 already in use

Stop any other services using port 8080:
```bash
docker-compose down
```

### Need to reinstall dependencies

Inside the dev container:
```bash
npm install
```

Or rebuild the container:
- Press `F1` → **"Dev Containers: Rebuild Container"**

## Next Steps

- Edit files in `ai-course/module1/config-ui/`
- Changes are reflected immediately (volume mounted)
- Run tests with `npm test`
- View UI at `http://localhost:8080`
