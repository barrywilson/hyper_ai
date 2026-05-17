.PHONY: help install test format up run-svc db-migrate db-reset coverage-svc coverage-svc-report clean

help: ## Show this help message
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s - %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install svc dependencies using uv
	cd svc && uv sync --dev --active && cd ..

test: ## Run svc tests with pytest
	cd svc && uv run --active python -m pytest && cd ..

format: ## Run ruff formatter
	cd svc && uv run --active ruff format . && cd ..

up: ## Start services using docker-compose
	cd svc && docker-compose up -d && cd ..

run-svc: ## Start development server
	cd svc && uv run --active python -m uvicorn api.main:svc --host 0.0.0.0 --port 8000 --reload && cd ..

db-migrate: ## Apply database migrations
	cd svc && uv run --active python -m api.cli migrate && cd ..

db-reset: ## Reset database (drop and recreate)
	cd svc && uv run --active python -m api.cli reset && cd ..

coverage-svc: ## Run tests with coverage analysis
	cd svc && uv run --active pytest --cov=api --cov-report=term-missing --cov-report=html --cov-fail-under=80 && cd ..

coverage-svc-report: ## Generate detailed coverage report
	cd svc && uv run --active pytest --cov=api --cov-report=html --cov-report=term && cd ..
	@echo "Coverage report generated in htmlcov/index.html"

clean: ## Clean up generated files and containers
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name ".coverage" -delete 2>/dev/null || true
