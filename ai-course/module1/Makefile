.PHONY: help install start test dev docker-up docker-down clean admin db-setup logs kafka-up kafka-down kafka-topics kafka-ui kafka-consume kafka-produce kafka-status kafka-logs kafka-shell

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
	@echo "  docker-up    Start all Docker containers (db, api, ui, kafka)"
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
	@echo "Kafka Targets:"
	@echo "  kafka-up     Start Kafka (KRaft mode)"
	@echo "  kafka-down   Stop Kafka"
	@echo "  kafka-consume Tail config-events topic"
	@echo "  kafka-produce Send test message"
	@echo "  kafka-status Check Kafka health"
	@echo "  kafka-logs   View Kafka logs"
	@echo "  kafka-shell  Open Kafka shell"
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

# ============================================
# Kafka Commands
# ============================================

# Start Kafka service
kafka-up:
	@echo "🚀 Starting Kafka (KRaft mode)..."
	docker-compose up -d kafka
	@echo "⏳ Waiting for Kafka to be ready..."
	@sleep 5
	@echo "✅ Kafka started"
	@echo ""
	@echo "Kafka: localhost:9092"
	@echo "Topics auto-create on first use"

# Stop Kafka service
kafka-down:
	@echo "Stopping Kafka..."
	docker-compose stop kafka
	@echo "✅ Kafka stopped"

# Consume messages from config-events topic
kafka-consume:
	@echo "📨 Consuming messages from config-events topic..."
	@echo "Press Ctrl+C to stop"
	@echo ""
	docker exec -it kafka kafka-console-consumer \
		--bootstrap-server localhost:9092 \
		--topic config-events \
		--from-beginning \
		--property print.key=true \
		--property key.separator=" : "

# Produce a test message to config-events topic
kafka-produce:
	@echo "📤 Sending test message to config-events topic..."
	@echo ""
	@echo '{"eventId":"test-123","eventType":"config.created","timestamp":"'$$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","version":"1.0","source":"manual-test","data":{"id":999,"key":"test_key","value":"test_value","description":"Test configuration"}}' | \
	docker exec -i kafka kafka-console-producer \
		--bootstrap-server localhost:9092 \
		--topic config-events \
		--property "parse.key=true" \
		--property "key.separator=:" \
		--property "key=test_key"
	@echo ""
	@echo "✅ Test message sent!"
	@echo "Run 'make kafka-consume' to view it"

# Check Kafka broker health
kafka-status:
	@echo "Kafka Broker Status"
	@echo "==================="
	@echo ""
	@docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1 && \
		echo "✅ Kafka broker is healthy" || \
		echo "❌ Kafka broker is not responding"
	@echo ""
	@echo "Topics:"
	@docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null || echo "No topics found"
	@echo ""
	@echo "Consumer Groups:"
	@docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list 2>/dev/null || echo "No consumer groups found"

# View Kafka logs
kafka-logs:
	@echo "Showing Kafka logs (Ctrl+C to exit)..."
	docker-compose logs -f kafka

# Open Kafka container shell
kafka-shell:
	@echo "Opening Kafka container shell..."
	docker exec -it kafka bash

# List all Kafka topics with details
kafka-list-topics:
	@echo "Kafka Topics"
	@echo "============"
	@docker exec kafka kafka-topics \
		--bootstrap-server localhost:9092 \
		--list
	@echo ""
	@echo "Topic Details:"
	@docker exec kafka kafka-topics \
		--bootstrap-server localhost:9092 \
		--describe

# Delete a Kafka topic (use with caution)
kafka-delete-topic:
	@echo "⚠️  Delete Kafka Topic"
	@echo "====================="
	@read -p "Enter topic name to delete: " topic; \
	docker exec kafka kafka-topics \
		--bootstrap-server localhost:9092 \
		--delete \
		--topic $$topic

# Reset Kafka (delete all data)
kafka-reset:
	@echo "⚠️  WARNING: This will delete all Kafka data!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Stopping Kafka..."; \
		docker-compose down kafka; \
		echo "✅ Kafka reset complete"; \
		echo "Run 'make kafka-up' to restart"; \
	else \
		echo "Cancelled"; \
	fi
