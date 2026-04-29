.PHONY: help install start test dev docker-up docker-down clean admin db-setup logs

# Default target - show help
help:
	@echo "Configuration Service - Development Tasks"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  install      Install npm dependencies (backend + frontend)"
	@echo "  start        Start the backend API server"
	@echo "  start-ui     Start the frontend UI server"
	@echo "  start-all    Start both backend and frontend"
	@echo "  test         Run the test suite"
	@echo "  test-watch   Run tests in watch mode"
	@echo "  dev          Start server with auto-reload (nodemon)"
	@echo "  docker-up    Start all Docker containers (db, api, ui)"
	@echo "  docker-down  Stop all Docker containers"
	@echo "  docker-clean Remove Docker containers and volumes"
	@echo "  db-setup     Initialize database with sample data"
	@echo "  admin        Open admin dashboard in browser"
	@echo "  app          Open main app in browser"
	@echo "  logs         View Docker container logs"
	@echo "  clean        Remove node_modules and build artifacts"
	@echo "  reset        Full reset (clean + docker-clean)"
	@echo "  status       Show current service status"
	@echo ""

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd config-service && npm install
	@echo "Installing frontend dependencies..."
	cd config-ui && npm install
	@echo "✅ All dependencies installed"

# Start backend API server
start:
	@echo "Starting Backend API Service (port 3000)..."
	cd config-service && npm start

# Start frontend UI server
start-ui:
	@echo "Starting Frontend UI Service (port 8080)..."
	cd config-ui && npm start

# Start both services
start-all:
	@echo "Starting all services..."
	@echo "Note: Run 'make docker-up' first to start database"
	@echo "Backend API will run on port 3000"
	@echo "Frontend UI will run on port 8080"
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  Terminal 1: make start"
	@echo "  Terminal 2: make start-ui"

# Run test suite
test:
	@echo "Running test suite..."
	cd config-service && npm test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	cd config-service && npm test -- --watch

# Start with auto-reload (requires nodemon)
dev:
	@echo "Starting with auto-reload..."
	@echo "(Install nodemon first: npm install -g nodemon)"
	cd config-service && nodemon src/server.js

# Start Docker containers
docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "⏳ Waiting for MySQL to be ready..."
	@sleep 5
	@echo "✅ Docker containers started"
	@echo "MySQL is running on localhost:3306"

# Stop Docker containers
docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "✅ Docker containers stopped"

# Remove Docker containers and volumes
docker-clean:
	@echo "Removing Docker containers and volumes..."
	docker-compose down -v
	@echo "✅ Docker containers and volumes removed"

# Initialize database with sample data
db-setup:
	@echo "Setting up database..."
	docker-compose exec mysql mysql -u root -prootpassword config_db < init.sql
	@echo "✅ Database initialized with sample data"

# Open admin dashboard
admin:
	@echo "Opening admin dashboard..."
	@which open > /dev/null && open http://localhost:8080/admin.html || echo "Visit http://localhost:8080/admin.html in your browser"

# Open main app
app:
	@echo "Opening main app..."
	@which open > /dev/null && open http://localhost:8080 || echo "Visit http://localhost:8080 in your browser"

# Show logs
logs:
	@echo "Showing Docker logs (Ctrl+C to exit)..."
	docker-compose logs -f

# Clean node_modules and build artifacts
clean:
	@echo "Cleaning up..."
	cd config-service && rm -rf node_modules
	rm -rf config-service/.coverage
	@echo "✅ Cleaned up"

# Full reset
reset: docker-clean clean
	@echo "✅ Full reset complete"
	@echo "Run 'make install && make docker-up && make db-setup' to rebuild"

# Show service status
status:
	@echo "Configuration Service Status"
	@echo "==============================="
	@docker-compose ps 2>/dev/null || echo "Docker containers not running"
	@echo ""
	@echo "Port 3000: $(shell curl -s http://localhost:3000 > /dev/null && echo '✅ Running' || echo '❌ Not responding')"
	@echo "MySQL 3306: $(shell docker exec mysql mysqladmin ping -u root -prootpassword 2>/dev/null > /dev/null && echo '✅ Running' || echo '❌ Not running')"

# Development workflow shortcuts
setup: install docker-up db-setup
	@echo "✅ Setup complete! Run 'make start' to launch the server"

quick-start: docker-up start
	@echo "🚀 Starting Configuration Service"

lint:
	@echo "Linting code..."
	cd config-service && npm run lint 2>/dev/null || echo "Lint not configured. Consider adding eslint."

format:
	@echo "Formatting code..."
	cd config-service && npx prettier --write "src/**/*.js" 2>/dev/null || echo "Prettier not installed"

# Docker Compose commands
docker-logs:
	docker-compose logs mysql

docker-shell:
	docker-compose exec mysql bash

db-shell:
	docker-compose exec mysql mysql -u root -prootpassword config_db

# Diagnostics
diagnose:
	@echo "Configuration Service Diagnostics"
	@echo "===================================="
	@echo ""
	@echo "Node version:"
	@node --version
	@echo ""
	@echo "npm version:"
	@npm --version
	@echo ""
	@echo "Docker version:"
	@docker --version
	@echo ""
	@echo "Docker Compose version:"
	@docker-compose --version
	@echo ""
	@echo "Environment:"
	@echo "- PROJECT_DIR: $(shell pwd)"
	@echo "- CONFIG_SERVICE: $(shell [ -d 'config-service' ] && echo '✅ Found' || echo '❌ Not found')"
	@echo "- package.json: $(shell [ -f 'config-service/package.json' ] && echo '✅ Found' || echo '❌ Not found')"
	@echo "- node_modules: $(shell [ -d 'config-service/node_modules' ] && echo '✅ Installed' || echo '❌ Not installed')"
