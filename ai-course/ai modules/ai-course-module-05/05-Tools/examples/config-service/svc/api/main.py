"""
Config Service API

A centralized HTTP API service for managing application configurations.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .db_connection import db_pool
from .endpoints import router as api_router
from .migrations import get_migration_manager
from .schemas import ErrorResponse
from .settings import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting up Config Service API")
    db_pool.initialize()

    # Run database migrations
    migration_manager = await get_migration_manager(db_pool)
    await migration_manager.run_migrations()

    yield

    # Shutdown
    logger.info("Shutting down Config Service API")
    db_pool.close()


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


# Create FastAPI application
svc = FastAPI(
    title="Config Service API",
    description="Centralized configuration management service",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

svc.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    # Wildcards combined with allow_credentials=True grant whitelisted origins
    # broader access than this API's surface needs. List explicit methods and
    # headers matching the actual endpoints/clients.
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Include API routes
svc.include_router(api_router, prefix="/api/v1", tags=["Configuration Management"])


@svc.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return a generic ErrorResponse for any unhandled exception.

    Endpoints used to wrap their bodies with `except Exception: raise
    HTTPException(500, str(e))`, which leaked psycopg2 internals to clients.
    Those wrappers were removed; this handler ensures the response shape
    still matches the documented `500: ErrorResponse` in each endpoint's
    OpenAPI declaration, while keeping the payload free of internal details.
    The exception itself is logged server-side for operators.
    """
    logger.exception("Unhandled exception in %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(detail="Internal server error").model_dump(),
    )


@svc.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="config-service",
        version=settings.app_version,
    )


@svc.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint with basic service information.

    Returns:
        Dict containing welcome message and documentation links.
    """
    return {
        "message": "Config Service API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting Config Service API on {settings.host}:{settings.port}")

    uvicorn.run(
        "main:svc",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
