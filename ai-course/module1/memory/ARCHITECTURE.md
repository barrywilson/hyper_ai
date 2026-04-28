# System Architecture

## Overview

Configuration Service is a three-tier monolithic application with a modern **API Resolver Pattern**:

```
┌─────────────────────────────────────────┐
│         Frontend (HTML/CSS/JS)          │
│    Static files served via Express      │
└──────────────────┬──────────────────────┘
                   │ POST to /api/resolve
┌──────────────────▼──────────────────────┐
│      Backend (Express.js Server)        │
│  - API Resolver (routes requests)       │
│  - Namespace handlers                   │
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

## API Resolver Pattern

### Modern Architecture
All client requests POST to a single resolver endpoint: `/api/resolve`

The resolver routes requests based on:
- **namespace**: The API domain (e.g., 'configs', 'users', 'settings')
- **version**: API version (e.g., 'v1', 'v2')
- **action**: Operation to perform (e.g., 'list', 'get', 'create', 'update', 'delete')

### Request Format
```javascript
POST /api/resolve
{
  "namespace": "configs",
  "version": "v1",
  "action": "list",
  // ... additional parameters
}
```

### Benefits
1. **Single endpoint**: All requests go through one resolver
2. **Server-side routing**: Server intelligently routes to correct handler
3. **Simplified client**: No HTTP method complexity on client side
4. **Scalable**: Add new namespaces without changing client code
5. **Version control**: Built-in API versioning
6. **Easier testing**: Single endpoint to test and mock

## Data Flow

### Read Configuration Flow
1. User opens browser → loads `index.html`
2. `app.js` runs on page load
3. Calls `api('list')` which POSTs to `/api/resolve`:
   ```json
   {
     "namespace": "configs",
     "version": "v1",
     "action": "list"
   }
   ```
4. Resolver routes to configs handler
5. Backend queries MySQL
6. Returns JSON array of configurations
7. Frontend renders in table

### Create/Update Flow
1. User submits form
2. `app.js` calls `api('create', { key_name, value, description })`
3. POSTs to `/api/resolve` with action and data
4. Resolver routes to appropriate handler
5. Backend validates input
6. Backend executes SQL INSERT/UPDATE
7. Backend returns success/error JSON
8. Frontend updates UI

### Delete Flow
1. User clicks delete button
2. `app.js` calls `api('delete', { id })`
3. POSTs to `/api/resolve`
4. Resolver routes to delete handler
5. Backend executes SQL DELETE
6. Frontend removes row from table

## Client API

### Universal API Client (`config-client.js`)

```javascript
// Initialize API
const api = createApi({
    namespace: 'configs',
    version: 'v1',
    baseUrl: '/api'
});

// Usage
await api('list');                    // List all
await api('get', { id: 1 });          // Get one
await api('create', { key_name: ... }); // Create
await api('update', { id: 1, ... });  // Update
await api('delete', { id: 1 });       // Delete
```

### Key Features
- **Function-based**: No classes, pure functions
- **Single POST**: All requests POST to resolver
- **Action-based**: Actions describe intent (list, get, create, etc.)
- **Namespace isolation**: Each API has its own namespace
- **Version support**: Built-in versioning

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

## API Resolver Endpoint

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/resolve` | Universal resolver for all API requests |

### Resolver Request Format

```json
{
  "namespace": "configs",
  "version": "v1",
  "action": "list|get|create|update|delete",
  "id": 1,                    // Optional: for get/update/delete
  "key_name": "app_name",     // Optional: for create
  "value": "MyApp",           // Optional: for create/update
  "description": "..."        // Optional: for create/update
}
```

### Resolver Response Format

**Success:**
```json
{
  "id": 1,
  "key_name": "app_name",
  "value": "MyApp",
  "description": "Application name",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Error:**
```json
{
  "error": "Description of what went wrong"
}
```

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
- Test resolver routing logic
- Test individual action handlers
- Mock database calls
- Validate input validation logic

### Integration Tests (Supertest)
- Test full request-response cycle through resolver
- Use real test database
- Verify database state changes
- Test all actions through resolver endpoint

### Test File Location
`config-service/tests/config.test.js`

## Performance Considerations

- No caching layer (future enhancement)
- No pagination (assumes small config set)
- No database connection pooling (single connection)
- Direct SQL (no query optimization yet)
- Single resolver endpoint simplifies load balancing

## Security Notes

- No authentication/authorization
- No input sanitization against SQL injection (parameterized queries used)
- CORS enabled (all origins)
- Resolver validates namespace/version/action
- Not suitable for production without enhancements

## Architecture Benefits

### Why Resolver Pattern?

1. **Simplified Client**: One API function handles all operations
2. **Server-Side Intelligence**: Routing logic lives on server
3. **Easy Testing**: Mock single endpoint instead of multiple
4. **Scalability**: Add namespaces without client changes
5. **Versioning**: Built-in version support
6. **Consistency**: All requests follow same pattern
7. **Future-Proof**: Easy to add features (auth, rate limiting, etc.)
