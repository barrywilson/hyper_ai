# System Architecture

## Overview

Configuration Service is a three-tier monolithic application:

```
┌─────────────────────────────────────────┐
│         Frontend (HTML/CSS/JS)          │
│    Static files served via Express      │
└──────────────────┬──────────────────────┘
                   │ HTTP REST API
┌──────────────────▼──────────────────────┐
│      Backend (Express.js Server)        │
│  - Routes & controllers                 │
│  - Input validation                     │
│  - Error handling                       │
└──────────────────┬──────────────────────┘
                   │ SQL Queries
┌──────────────────▼──────────────────────┐
│       MySQL Database (Docker)           │
│  - configurations table                 │
│  - Simple persistence                   │
└─────────────────────────────────────────┘
```

## Data Flow

### Read Configuration Flow
1. User opens browser → loads `index.html`
2. `app.js` runs on page load
3. Sends GET `/api/configs` to backend
4. Backend queries MySQL
5. Returns JSON array of configurations
6. Frontend renders in table

### Create/Update Flow
1. User submits form
2. `app.js` sends POST/PUT to backend
3. Backend validates input
4. Backend executes SQL INSERT/UPDATE
5. Backend returns success/error JSON
6. Frontend updates UI

### Delete Flow
1. User clicks delete button
2. `app.js` sends DELETE request
3. Backend executes SQL DELETE
4. Frontend removes row from table

## Database Schema

### `configurations` Table

```sql
CREATE TABLE configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key_name VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Notes:**
- `key_name` used instead of `key` (MySQL reserved word)
- `UNIQUE` constraint prevents duplicate keys
- Timestamps auto-track creation/updates

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/configs` | List all configurations |
| GET | `/api/configs/:id` | Get single configuration |
| POST | `/api/configs` | Create new configuration |
| PUT | `/api/configs/:id` | Update configuration |
| DELETE | `/api/configs/:id` | Delete configuration |

## Request/Response Format

### GET /api/configs

**Response:**
```json
[
  {
    "id": 1,
    "key_name": "app_name",
    "value": "MyApp",
    "description": "Application name",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

### POST /api/configs

**Request:**
```json
{
  "key_name": "api_timeout",
  "value": "30000",
  "description": "API request timeout in milliseconds"
}
```

**Response:** Same structure as GET

## Service Dependencies

### External
- MySQL database (Docker container)
- Node.js runtime

### npm Packages

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mysql2 | MySQL client driver |
| cors | Cross-Origin Resource Sharing |
| dotenv | Environment variables |
| jest | Testing framework (dev) |
| supertest | HTTP assertion library (dev) |

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Description of what went wrong"
}
```

HTTP status codes:
- 200: Success
- 400: Bad request (validation error)
- 404: Not found
- 500: Server error

## Deployment & Containerization

### Docker Compose

- **config-service**: Node.js app on port 3000
- **mysql**: Database on port 3306

### Environment Variables

Loaded from `.env` file:
```
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=config_db
NODE_ENV=development
PORT=3000
```

## Testing Strategy

### Unit Tests (Jest)
- Test individual route handlers
- Mock database calls
- Validate input validation logic

### Integration Tests (Supertest)
- Test full request-response cycle
- Use real test database
- Verify database state changes

### Test File Location
`config-service/tests/config.test.js`

## Performance Considerations

- No caching layer (future enhancement)
- No pagination (assumes small config set)
- No database connection pooling (single connection)
- Direct SQL (no query optimization yet)

## Security Notes

- No authentication/authorization
- No input sanitization against SQL injection (parameterized queries used)
- CORS enabled (all origins)
- Not suitable for production without enhancements
