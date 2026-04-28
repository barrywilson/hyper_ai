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
- `key_name`: required, string, max 255 chars, must be unique
- `value`: optional, string, max 65535 chars (TEXT type)
- `description`: optional, string

**Error codes**:
- 400: Validation failure, missing field, duplicate key
- 404: Config not found
- 500: Database/server error

### src/public/app.js

**Purpose**: Frontend logic for config management UI

**Key functions**:
- `loadConfigs()` — Fetch and display all configs
- `addConfig()` — Handle form submission for new configs
- `updateConfig()` — Update existing config
- `deleteConfig()` — Delete config with confirmation

**UI Patterns**:
- Table display of configs
- Form below table for new entries
- Inline edit buttons per row
- Confirmation dialogs for destructive actions
- Success/error messages via alerts (can improve)

**Fetch pattern**: Use `fetch()` API with proper headers and error handling

### src/public/index.html

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
if (!req.body.key_name || req.body.key_name.trim() === '') {
  return res.status(400).json({ error: 'key_name is required' });
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
