# Implementation Guide

## Directory Structure

```
config-service/
├── src/
│   ├── server.js          # Express app setup & startup
│   ├── db.js              # MySQL connection & pool
│   ├── public/
│   │   ├── index.html     # Main UI page
│   │   ├── style.css      # Styling
│   │   └── app.js         # Frontend logic
│   └── routes/
│       └── config.js      # API route handlers
├── tests/
│   └── config.test.js     # Jest test suite
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables
└── README.md              # User documentation
```

## Key Files & Their Purposes

### src/server.js

**Purpose**: Initialize Express app, configure middleware, start listening

**Key elements**:
- Express app creation
- Middleware setup (CORS, JSON parsing)
- Route registration (`/api/configs`)
- Error handling middleware
- Server listen on `PORT` (default 3000)

**Pattern**: Standard Express setup; minimal configuration

### src/db.js

**Purpose**: Establish and manage MySQL connection

**Key elements**:
- Connection pool configuration
- Connection testing on startup
- Export pool for use in routes
- Error handling for connection failures

**Pattern**: Singleton pool pattern; reused across routes

### src/routes/config.js

**Purpose**: Implement all CRUD API endpoints

**Structure**:
- Each endpoint is an async route handler
- Request validation before database query
- SQL prepared statements (parameterized)
- Consistent error responses
- JSON response bodies

**Validation rules**:
- `key`: required, string, max 255 chars, must be unique
- `value`: optional, string, max 65535 chars (TEXT type)
- `description`: optional, string

**Error codes**:
- 400: Validation failure, missing field, duplicate key
- 404: Config not found
- 500: Database/server error

### src/public/config-client.js

**Purpose**: Client library providing clean abstractions for API consumption

**Key elements**:
- UMD pattern for universal module support (works in browsers and Node.js)
- `ConfigClient` class with methods for CRUD operations
- Custom `ConfigClientError` for consistent error handling
- Request timeout enforcement via `AbortController`
- Input validation before API calls
- Parameterized safety (no string concatenation)

**Methods**:
- `list()` — Get all configurations
- `get(id)` — Get single configuration
- `getByKey(keyName)` — Convenience method by key name
- `create(data)` — Create new configuration
- `update(id, data)` — Update existing configuration
- `delete(id)` — Delete configuration

**Error handling**: Throws `ConfigClientError` with structured properties: `message`, `status`, `response`, `url`, `timestamp`

**Usage**: See "Client Library Consumption" section below

## Client Library Consumption

All frontend code should use the ConfigClient library instead of raw `fetch()` calls.

### Initialization

```javascript
// Load library first (in HTML)
<script src="config-client.js"></script>

// Initialize in your app
const configClient = new ConfigClient({
    baseUrl: '/api/configs',    // optional, default shown
    timeout: 10000              // optional, default: 5000
});
```

### Usage Patterns

**List all configs**:
```javascript
const configs = await configClient.list();
// → [{ id: 1, key: '...', ... }, ...]
```

**Get single config**:
```javascript
try {
    const config = await configClient.get(1);
} catch (error) {
    if (error.status === 404) {
        // Handle not found
    }
}
```

**Create config**:
```javascript
const newConfig = await configClient.create({
    key: 'app_name',
    value: 'MyApp',
    description: 'Application name'  // optional
});
```

**Update config**:
```javascript
const updated = await configClient.update(1, {
    value: 'NewValue',
    description: 'Updated description'  // optional
});
```

**Delete config**:
```javascript
await configClient.delete(1);
```

**Error handling**:
```javascript
try {
    await configClient.list();
} catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    console.error(`Response:`, error.response);
}
```

### Current Consumers

1. **admin.html** — Professional admin dashboard using client library
2. **index.html + app.js** — Main app interface using client library

### Benefits of Library Abstraction

- **Single responsibility**: All API logic in one place
- **Breaking change safety**: Update library; apps work without changes
- **Consistent errors**: All consumers handle errors the same way
- **Testability**: Can mock ConfigClient in tests
- **Future enhancements**: Add caching, retries, metrics in library without changing consumers

## Frontend Patterns

**Purpose**: Static HTML page structure

**Sections**:
1. Header with title
2. Configurations table (id: `configsTable`)
3. Form for adding new configs (id: `configForm`)
4. Script references to `app.js`

**CSS classes**:
- `.container`: Main content wrapper
- `.config-table`: Table styling
- `.btn-*`: Button styles

### tests/config.test.js

**Purpose**: Comprehensive Jest test suite

**Test structure**:
- Setup: Start test server before all tests
- Teardown: Close connections after all tests
- Individual test cases for each endpoint

**Testing patterns**:
- Use `supertest` for HTTP assertions
- Test happy path (success) and error cases
- Validate response structure and status codes
- Clean up database state between tests

**Coverage areas**:
- GET all configs
- GET single config (found & not found)
- POST new config (success & validation)
- PUT update config (success & validation)
- DELETE config (success & not found)

## Coding Conventions

### SQL Queries

**Use parameterized queries exclusively**:
```javascript
// ✅ Good: Protected against SQL injection
const query = 'SELECT * FROM configurations WHERE id = ?';
const [rows] = await pool.query(query, [id]);

// ❌ Bad: String concatenation (SQL injection risk)
const query = `SELECT * FROM configurations WHERE id = ${id}`;
```

**Query style**:
- Use `pool.query()` from `mysql2/promise`
- Destructure results: `const [rows] = await pool.query(...)`
- Use lowercase SQL keywords (convention)

### Error Handling

**Pattern**: Try-catch with consistent error responses
```javascript
try {
  // operation
  res.status(200).json(result);
} catch (error) {
  console.error('Error context:', error);
  res.status(500).json({ error: 'Friendly error message' });
}
```

### Validation

**Input validation before database operations**:
```javascript
if (!req.body.key || req.body.key.trim() === '') {
  return res.status(400).json({ error: 'key is required' });
}
```

### Async/Await

- Always use `async/await` for database operations
- Use `try-catch` for error handling
- Never use `.then()` chains

## Frontend Patterns

### DOM Manipulation

- Use `document.getElementById()` for specific elements
- Use `document.querySelectorAll()` for multiple elements
- Build HTML strings for dynamic content

### Form Handling

```javascript
document.getElementById('configForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Get form data
  // Send to API
  // Update UI
  // Clear form
});
```

### Fetch Pattern

```javascript
const response = await fetch('/api/configs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
if (!response.ok) {
  throw new Error(await response.json().error);
}
return response.json();
```

## Environment Variables

**Required .env file**:
```
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=config_db
NODE_ENV=development
PORT=3000
```

**Loading**: `dotenv.config()` in `server.js`

**Access**: `process.env.VAR_NAME`

## Testing Practices

### Setup & Teardown

```javascript
beforeAll(async () => {
  // Start server
});

afterAll(async () => {
  // Close connections
});
```

### Test Case Pattern

```javascript
test('GET /api/configs returns all configurations', async () => {
  const response = await request(app).get('/api/configs');
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
```

### Database State

- Use fresh test database per test suite
- Clean up test data in `afterAll`
- Don't rely on test execution order

## Dependencies & Versions

- **node**: v14+ (v18 recommended)
- **mysql**: 8.0 (Docker)
- **express**: ^4.17.0
- **mysql2**: ^3.0.0
- **jest**: ^29.0.0 (dev)
- **supertest**: ^6.3.0 (dev)

## Build & Run Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Watch tests (development)
npm test -- --watch
```

## Development Workflow

1. Create feature branch
2. Write tests first (TDD)
3. Implement code to pass tests
4. Run full test suite
5. Manual testing in browser
6. Create PR with test results

## Future Enhancements

- [ ] Pagination for large config sets
- [ ] Database connection pooling
- [ ] Caching layer (Redis)
- [ ] Authentication/authorization
- [ ] Audit logging
- [ ] Configuration versioning
- [ ] Advanced search/filtering
- [ ] API rate limiting
- [ ] Metrics & monitoring
