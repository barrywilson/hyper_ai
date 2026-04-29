# Configuration Client Library

## Purpose

Provide a clean, typed JavaScript abstraction layer for consuming the Configuration Service API. Applications use the client library instead of making raw HTTP calls, ensuring:

- **Consistency**: All apps use the same error handling and request patterns
- **Safety**: Breaking API changes handled at the client layer; consumers unaffected
- **Observability**: Single place to add logging, metrics, retry logic
- **Maintainability**: Decouples frontend code from API implementation details

## Design Principles

1. **Zero dependencies** — Vanilla JS, works in any browser
2. **Simple API** — Intuitive method names matching REST operations
3. **Consistent errors** — Standardized error objects with context
4. **Minimal** — Core CRUD only; no caching/retries (future extensions)
5. **Browsers-first** — Works in browser and Node.js (for SSR/testing)

## Architecture

### Single File Distribution

**File**: `config-service/src/public/config-client.js`

- Self-contained, no dependencies
- Can be loaded via `<script>` tag or imported as ES6 module
- UMD pattern for universal module support
- Exports `ConfigClient` class

### API Design

#### ConfigClient Class

The main entry point providing CRUD operations:

```javascript
const client = new ConfigClient({
  baseUrl: 'http://localhost:3000/api/configs', // default
  timeout: 5000                                  // default
});
```

#### Methods

```javascript
// Read operations
client.list()               // Get all configurations
client.get(id)              // Get single configuration
client.getByKey(keyName)    // Get by key name (convenience)

// Write operations
client.create(data)         // Create new configuration
client.update(id, data)     // Update configuration
client.delete(id)           // Delete configuration

// Utility
client.setBaseUrl(url)      // Change API endpoint at runtime
client.setDefaults(options) // Change timeout, headers, etc.
```

### Error Handling

All methods return Promises. Errors are standardized:

```javascript
// Successful call
const config = await client.get(1);
// → { id: 1, key: '...', value: '...', ... }

// Error call
try {
  await client.get(999);
} catch (error) {
  console.error(error.message);      // 'Configuration not found'
  console.error(error.status);       // 404
  console.error(error.response);     // Full response object
}
```

#### Error Object Structure

```javascript
{
  message: string,          // User-friendly error message
  status: number,           // HTTP status code
  response: object,         // Full response from API
  url: string,             // API endpoint that failed
  timestamp: Date          // When error occurred
}
```

### Request/Response Format

#### List All Configurations

```javascript
const configs = await client.list();
// → [{ id: 1, key: 'app_name', value: 'MyApp', ... }, ...]
```

#### Get Single Configuration

```javascript
const config = await client.get(1);
// → { id: 1, key: 'app_name', value: 'MyApp', description: '...', created_at: '...', updated_at: '...' }
```

#### Create Configuration

```javascript
const newConfig = await client.create({
  key: 'api_timeout',
  value: '30000',
  description: 'Timeout in ms'
});
// → { id: 2, key: 'api_timeout', value: '30000', ... }
```

#### Update Configuration

```javascript
const updated = await client.update(1, {
  value: 'UpdatedValue',
  description: 'New description'
});
// → { id: 1, key: 'app_name', value: 'UpdatedValue', ... }
```

#### Delete Configuration

```javascript
await client.delete(1);
// → Returns successfully; no response body
```

## Implementation Details

### Constructor Options

```javascript
new ConfigClient({
  baseUrl: string,         // Default: '/api/configs'
  timeout: number,         // Default: 5000 (ms)
  headers: object          // Default: { 'Content-Type': 'application/json' }
})
```

### Internal Request Handling

1. **Validation**: Check required parameters before sending
2. **Request**: Use `fetch()` with standard headers
3. **Timeout**: Enforce request timeout via `AbortController`
4. **Response parsing**: Convert to JSON; handle non-JSON responses
5. **Error mapping**: Convert HTTP errors to `ConfigClientError` instances

### Success Criteria

- All requests include proper `Content-Type: application/json`
- Timeouts throw `ConfigClientError` with `status: 0`
- 4xx/5xx responses throw `ConfigClientError` with appropriate status
- 2xx responses return parsed JSON (or null for DELETE)
- No exceptions for missing properties; use sensible defaults

## Usage Example

```javascript
// Initialize client
const configClient = new ConfigClient({
  baseUrl: 'http://localhost:3000/api/configs',
  timeout: 10000
});

// Load all configurations
try {
  const configs = await configClient.list();
  console.log(`Loaded ${configs.length} configurations`);
  
  // Update a specific configuration
  const updated = await configClient.update(configs[0].id, {
    value: 'NewValue'
  });
  console.log('Updated:', updated.key);
} catch (error) {
  console.error(`Error: ${error.message} (${error.status})`);
}
```

## Integration: Admin UI

The Admin Dashboard (`admin.html`) will be refactored to use the client library:

**Before**:
```javascript
const response = await fetch('/api/configs');
const configs = await response.json();
```

**After**:
```javascript
const configClient = new ConfigClient();
const configs = await configClient.list();
```

Benefits:
1. Cleaner, more readable code
2. Single place to update for API changes
3. Consistent error handling across the app
4. Easier to test (can mock ConfigClient)

## Future Extensions (Not in v1)

- **Caching**: Return cached results for repeated `list()` calls
- **Request deduplication**: Merge concurrent `list()` calls
- **Retry logic**: Automatic retry for transient failures
- **Metrics**: Track request counts, latencies, errors
- **Offline mode**: Queue writes when offline; sync when back
- **TypeScript types**: Ship `.d.ts` file for type safety
- **Plugin system**: Allow middleware for custom behavior

## File Structure

```
config-service/
├── src/
│   └── public/
│       ├── config-client.js      ← Client library (new)
│       ├── admin.html            ← Updated to use library
│       ├── index.html            ← Can also use library
│       ├── app.js                ← Update to use library
│       ├── style.css
│       └── ... (other files)
└── ... (other files)
```

## Testing the Client

### Browser Console Testing

```javascript
const client = new ConfigClient();

// Test list
client.list().then(configs => console.log('✅ List:', configs.length));

// Test create
client.create({ key: 'test', value: 'value' })
  .then(config => console.log('✅ Create:', config.id))
  .catch(err => console.error('❌ Create failed:', err.message));

// Test error handling
client.get(9999)
  .catch(err => console.log('✅ Error handling:', err.status, err.message));
```

### Integration Testing

Admin UI will serve as integration test:
- Load page → calls `client.list()`
- Add config → calls `client.create()`
- Edit config → calls `client.update()`
- Delete config → calls `client.delete()`

## Adoption Plan

1. **Phase 1** (immediate):
   - Build `config-client.js` with core CRUD
   - Refactor Admin UI to use it
   - Document in README

2. **Phase 2** (next iteration):
   - Refactor main `index.html` / `app.js` to use library
   - Add usage examples to README
   - Create quick-start guide

3. **Phase 3** (future):
   - Publish to npm as `@config-service/client`
   - Add TypeScript definitions
   - Add advanced features (caching, retries)

## Backward Compatibility

- Client library is additive; doesn't break existing API
- Admin UI can use library while main app uses raw API (during transition)
- API endpoints unchanged; only consumption method changes
