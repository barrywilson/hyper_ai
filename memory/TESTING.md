# Testing Patterns

## Philosophy

**Integration testing over unit testing.** Use containers for ephemeral setup - no mocking needed.

## Core Principles

- **Real dependencies**: Test against actual MySQL, not mocks
- **Ephemeral setup**: Containers spin up/down for each test run
- **No mocking**: If you need to mock it, you're testing the wrong thing
- **Fast feedback**: Docker makes real integration tests fast enough
- **Confidence**: Tests prove the whole system works, not just isolated pieces

## Why Integration Over Unit

### The Problem with Unit Tests
- Mock everything → test mocks, not real behavior
- False confidence → tests pass, production breaks
- Brittle → change implementation, rewrite mocks
- Maintenance burden → more mock code than real code

### The Container Solution
- Real database → test actual SQL queries
- Real API → test actual HTTP requests
- Real behavior → confidence in production
- Ephemeral → clean state every run
- Fast → Docker makes it practical

## Testing Stack

- **Jest**: Test runner
- **Docker Compose**: Ephemeral MySQL
- **No mocks**: Real dependencies only

## Test Structure

### Setup Pattern

```javascript
beforeAll(async () => {
  // Container already running (docker-compose up -d)
  // Connect to real database
  // Start real server
});

afterAll(async () => {
  // Close connections
  // Container stays running for next test
});
```

### Test Pattern

```javascript
test('create configuration', async () => {
  // Make real HTTP request
  const response = await request(app)
    .post('/api/resolve')
    .send({
      namespace: 'ai.course.config',
      version: 'v1',
      action: 'create',
      params: { key: 'test', value: 'value' }
    });
  
  // Assert real response
  expect(response.status).toBe(200);
  expect(response.body.key).toBe('test');
  
  // Verify in real database
  const [rows] = await pool.query('SELECT * FROM configurations WHERE key = ?', ['test']);
  expect(rows[0].value).toBe('value');
});
```

## Ephemeral Setup

### Docker Compose

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: config_db
    ports:
      - "3306:3306"
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
```

### Workflow

```bash
# Start fresh
docker-compose down -v
docker-compose up -d

# Run tests (against real database)
npm test

# Clean up
docker-compose down -v
```

### Benefits

- **Clean state**: Every run starts fresh
- **No pollution**: Tests don't affect each other
- **Fast**: Containers start in seconds
- **Real**: Tests prove actual behavior

## What We Test

### Integration Tests (Primary)

- Full request/response cycle
- Database operations
- API resolver routing
- Error handling
- Validation logic

### Example Test Suite

```javascript
describe('Configuration API', () => {
  test('list all configurations', async () => {
    const response = await request(app)
      .post('/api/resolve')
      .send({ namespace: 'ai.course.config', version: 'v1', action: 'list' });
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('create configuration', async () => {
    const response = await request(app)
      .post('/api/resolve')
      .send({
        namespace: 'ai.course.config',
        version: 'v1',
        action: 'create',
        params: { key: 'new_key', value: 'new_value' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.key).toBe('new_key');
  });

  test('validation errors', async () => {
    const response = await request(app)
      .post('/api/resolve')
      .send({
        namespace: 'ai.course.config',
        version: 'v1',
        action: 'create',
        params: { value: 'no_key' }  // Missing required key
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

## What We Don't Test

- **Unit tests for simple functions**: If it's trivial, skip it
- **Mocked database calls**: Test real database or don't test
- **Implementation details**: Test behavior, not internals
- **100% coverage**: Test what matters, not everything

## Test Organization

```
config-service/
├── tests/
│   └── config.integration.test.js    # Integration tests only
└── src/
    └── ...                            # No unit test files
```

**One test file.** Integration tests cover everything.

## Running Tests

```bash
# Start database
docker-compose up -d

# Run tests
npm test

# Watch mode
npm test -- --watch

# Clean slate
docker-compose down -v && docker-compose up -d && npm test
```

## CI/CD Pattern

```yaml
# GitHub Actions example
- name: Start containers
  run: docker-compose up -d

- name: Wait for MySQL
  run: sleep 10

- name: Run tests
  run: npm test

- name: Cleanup
  run: docker-compose down -v
```

## Key Takeaways

1. **Integration > Unit**: Test the whole system, not pieces
2. **Real > Mocked**: Use actual dependencies via containers
3. **Ephemeral > Persistent**: Fresh state every run
4. **Fast enough**: Docker makes real tests practical
5. **Confidence**: Tests prove production will work

## Anti-Patterns to Avoid

❌ **Mocking the database**
```javascript
// Don't do this
jest.mock('../db');
db.query.mockResolvedValue([{ id: 1 }]);
```

✅ **Use real database**
```javascript
// Do this
const [rows] = await pool.query('SELECT * FROM configurations');
```

❌ **Unit testing everything**
```javascript
// Don't do this
test('validateKey returns true for valid key', () => {
  expect(validateKey('valid')).toBe(true);
});
```

✅ **Integration test the behavior**
```javascript
// Do this
test('API rejects invalid key', async () => {
  const response = await request(app)
    .post('/api/resolve')
    .send({ action: 'create', params: { key: '' } });
  expect(response.status).toBe(400);
});
```

## When to Write Tests

1. **New feature**: Write integration test first (TDD)
2. **Bug fix**: Write test that reproduces bug, then fix
3. **Refactor**: Tests prove behavior unchanged
4. **Don't test**: Trivial getters/setters, simple utilities

## Test Maintenance

- **Keep tests simple**: One assertion per test when possible
- **Clear names**: Test name describes behavior
- **No test helpers**: Inline everything for clarity
- **Delete bad tests**: If test doesn't add value, remove it

## Cost vs Value

**High value tests:**
- API endpoints (full request/response)
- Database operations (real SQL)
- Error handling (actual errors)
- Validation (real validation logic)

**Low value tests:**
- Simple functions (trivial logic)
- Mocked dependencies (testing mocks)
- Implementation details (brittle)
- 100% coverage (diminishing returns)

## Summary

**Test what matters. Use real dependencies. Keep it simple.**

Containers make integration testing fast and reliable. No mocking needed. High confidence in production behavior.
