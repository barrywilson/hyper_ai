"""
Tests for database connection management
"""

from unittest.mock import MagicMock, patch

import pytest
from ulid import ULID as StandardULID

from api.db_connection import (
    DatabasePool,
    get_db_pool,
)


class TestDatabasePool:
    """Tests for critical database connection scenarios."""

    @pytest.fixture
    def db_pool(self):
        """Create a DatabasePool instance for testing."""
        return DatabasePool()

    @patch("api.db_connection.settings")
    def test_invalid_database_url_rejected(self, mock_settings, db_pool):
        """Critical: Invalid database URLs should be caught before connection attempts."""
        mock_settings.database_url = "mysql://user:pass@localhost/db"

        with pytest.raises(ValueError, match="Unsupported database URL format"):
            db_pool.initialize()

    @patch("api.db_connection.settings")
    def test_asyncpg_url_converted_to_psycopg2(self, mock_settings, db_pool):
        """Critical: URL format conversion for compatibility."""
        mock_settings.database_url = "postgresql+asyncpg://user:pass@localhost/db"

        with patch("api.db_connection.ThreadedConnectionPool") as mock_pool_class:
            mock_pool_class.return_value = MagicMock()
            db_pool.initialize()

            # Verify the URL was converted
            call_args = mock_pool_class.call_args
            assert call_args[1]["dsn"] == "postgresql://user:pass@localhost/db"
            db_pool.close()

    @pytest.mark.asyncio
    async def test_connection_fails_when_pool_not_initialized(self, db_pool):
        """Critical: Should fail fast when database not initialized."""
        with pytest.raises(RuntimeError, match="Database pool not initialized"):
            async with db_pool.get_connection():
                pass

    @pytest.mark.asyncio
    async def test_active_connection_count_stable_when_yield_raises(self, db_pool):
        """Regression: an exception inside the with-block must not double-cleanup.

        Previously both the except and finally branches decremented
        _active_connections and called putconn — so any error inside the
        yielded block left the counter at -1 and returned the connection
        twice.
        """
        fake_pool = MagicMock()
        fake_conn = MagicMock()
        fake_pool.getconn.return_value = fake_conn
        fake_pool.maxconn = 5
        db_pool._pool = fake_pool

        with pytest.raises(RuntimeError, match="boom"):
            async with db_pool.get_connection() as conn:
                assert conn is fake_conn
                # Counter should be 1 while the connection is held
                assert db_pool._active_connections == 1
                raise RuntimeError("boom")

        # After the exception: counter back to 0, putconn called exactly once
        assert db_pool._active_connections == 0
        assert fake_pool.putconn.call_count == 1


class TestJSONUtilities:
    """Tests for JSON serialization - critical for API data integrity."""

    def test_ulid_serialization_for_api_responses(self):
        """Critical: ULID objects must serialize correctly for API responses."""
        ulid_str = "01FQCFTGXVJ3DGVPQZCRTYFWM1"
        standard_ulid = StandardULID.from_str(ulid_str)
        # The ULID.__str__() method returns the actual ULID string
        str_result = str(standard_ulid)
        assert str_result == ulid_str


class TestDependencyInjection:
    """Tests for FastAPI dependency injection."""

    @pytest.mark.asyncio
    async def test_get_db_pool_returns_singleton(self):
        """Critical: FastAPI should get the same database pool instance."""
        from api.db_connection import db_pool as global_pool

        result = await get_db_pool()
        assert result == global_pool
        result.close()
