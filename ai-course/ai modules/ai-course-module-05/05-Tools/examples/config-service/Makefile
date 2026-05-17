.PHONY: help install install-svc install-ui test test-svc test-ui test-client-lib format lint up run-svc run-ui db-migrate db-reset ui-build client-build coverage-ui coverage-svc coverage-svc-report clean seed-history

help: ## Show this help message
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s - %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: install-svc install-ui ## Install all dependencies

install-svc: ## Install svc dependencies using uv
	cd svc && uv sync --dev --active && cd ..

install-ui: ## Install UI dependencies using npm
	cd ui && npm install && cd ..

test: test-svc test-ui ## Run all tests

test-svc: ## Run svc tests with pytest
	cd svc && uv run --active python -m pytest && cd ..

test-ui: client-build test-client-lib ## Run ui tests with vitest
	cd ui && npm run test && cd ..

test-client-lib: ## Run @config-client library tests with vitest
	cd ui/@config-client && npx vitest run && cd ../..

format: ## Run ruff formatter
	cd svc && uv run --active ruff format . && cd ..

lint: ## Run ruff linting checks
	cd svc && uv run --active ruff check . && cd ..

up: ## Start services using docker-compose
	cd svc && docker compose up -d && cd ..

run-svc: ## Start development server
	cd svc && uv run --active python -m uvicorn api.main:svc --host 0.0.0.0 --port 8000 --reload && cd ..

run-ui: ## Start UI development server
	cd ui && npm run dev && cd ..

db-migrate: ## Apply database migrations
	cd svc && uv run --active python -m api.cli migrate && cd ..

db-reset: ## Reset database (drop and recreate)
	cd svc && uv run --active python -m api.cli reset && cd ..

client-build: ## Build config-client library
	cd ui/@config-client && npm run build && cd ../..

ui-build: client-build ## Build UI for production
	cd ui && npm run build && cd ..

coverage-ui: ## Run UI tests with coverage analysis
	cd ui && npm run test:coverage && cd ..

coverage-svc: ## Run tests with coverage analysis
	cd svc && uv run --active pytest --cov=api --cov-report=term-missing --cov-report=html --cov-fail-under=80 && cd ..

coverage-svc-report: ## Generate detailed coverage report
	cd svc && uv run --active pytest --cov=api --cov-report=html --cov-report=term && cd ..
	@echo "Coverage report generated in htmlcov/index.html"

seed-history: ## Materialise the demo git history from history.bundle
	@if [ -d .git ]; then \
		echo "  .git/ already exists. Refusing to overwrite. Remove it first if you really want to re-seed."; \
		exit 1; \
	fi
	git init -b main
	git fetch ./history.bundle main
	git reset --hard FETCH_HEAD
	@grep -qxF 'history.bundle' .gitignore || echo 'history.bundle' >> .gitignore
	@echo
	@echo "  Demo history materialised. Try: git log --oneline"

clean: ## Clean up generated files and containers
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name ".coverage" -delete 2>/dev/null || true
