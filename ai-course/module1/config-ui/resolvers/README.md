# Frontend Resolvers

This directory contains resolver modules that translate resolver pattern requests to REST API calls.

## How It Works

The frontend server dynamically loads resolvers based on the `namespace` and `version` in the request:

```javascript
POST /api/resolve
{
  "namespace": "ai.course.config",
  "version": "v1",
  "action": "list",
  "params": {}
}
```

The server loads: `./resolvers/ai.course.config.v1.js`

## Resolver Structure

Each resolver module must export a `resolve` function:

```javascript
async function resolve(fetch, apiUrl, { action, params }) {
  // Translate action to REST API call
  // Return { status, data } or { status, error }
}

module.exports = { resolve };
```

### Parameters

- **fetch**: node-fetch function for making HTTP requests
- **apiUrl**: Backend API URL (from environment)
- **action**: The action to perform (e.g., 'list', 'create', 'update')
- **params**: Action parameters (e.g., { id: 1, key: 'app_name' })

### Return Value

Return an object with:
- `status`: HTTP status code (200, 201, 204, 400, 404, 500)
- `data`: Response data (for successful requests)
- `error`: Error message (for failed requests)

## Adding a New API

### Step 1: Create Backend REST API

Add REST endpoints to the backend service (e.g., `/api/users`).

### Step 2: Create Resolver Module

Create a new resolver file: `namespace.version.js`

Example: `my.api.users.v1.js`

```javascript
/**
 * Users API Resolver - Version 1
 * Translates resolver actions to REST API calls
 */

async function resolve(fetch, apiUrl, { action, params }) {
  let url, method, body;
  
  switch (action) {
    case 'list':
      url = `${apiUrl}/api/users`;
      method = 'GET';
      break;
      
    case 'get':
      if (!params?.id) {
        return { status: 400, error: 'ID is required' };
      }
      url = `${apiUrl}/api/users/${params.id}`;
      method = 'GET';
      break;
      
    case 'create':
      if (!params?.name || !params?.email) {
        return { status: 400, error: 'name and email are required' };
      }
      url = `${apiUrl}/api/users`;
      method = 'POST';
      body = {
        name: params.name,
        email: params.email
      };
      break;
      
    case 'update':
      if (!params?.id) {
        return { status: 400, error: 'ID is required' };
      }
      url = `${apiUrl}/api/users/${params.id}`;
      method = 'PUT';
      body = {
        name: params.name,
        email: params.email
      };
      break;
      
    case 'delete':
      if (!params?.id) {
        return { status: 400, error: 'ID is required' };
      }
      url = `${apiUrl}/api/users/${params.id}`;
      method = 'DELETE';
      break;
      
    default:
      return { status: 400, error: `Unknown action: ${action}` };
  }
  
  // Make the REST API call
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (response.status === 204) {
    return { status: 204 };
  }
  
  const data = await response.json();
  return { status: response.status, data };
}

module.exports = { resolve };
```

### Step 3: Use in Client

```javascript
const usersApi = createApi({
  namespace: 'my.api.users',
  version: 'v1',
  baseUrl: '/api'
});

// Use it
const users = await usersApi('list');
const user = await usersApi('get', { id: 1 });
await usersApi('create', { name: 'John', email: 'john@example.com' });
```

## Existing Resolvers

### ai.course.config.v1.js

Handles configuration management:
- `list` - Get all configurations
- `get` - Get one configuration by ID
- `create` - Create new configuration
- `update` - Update configuration by ID
- `delete` - Delete configuration by ID

Maps to backend REST API: `/api/configurations`

## Benefits

1. **Modular**: Each API has its own resolver module
2. **Versioned**: Support multiple API versions (v1, v2, etc.)
3. **Dynamic**: No server restart needed to add new resolvers
4. **Flexible**: Can add custom logic, caching, rate limiting per resolver
5. **Backward Compatible**: Client code uses resolver pattern, server translates to REST

## Best Practices

1. **Naming Convention**: Use `namespace.version.js` format
2. **Validation**: Validate required parameters before making API calls
3. **Error Handling**: Return appropriate status codes and error messages
4. **Documentation**: Add JSDoc comments explaining the resolver
5. **Consistency**: Follow the same structure across all resolvers

## Example Client Usage

```javascript
// Initialize API client
const api = createApi({
  namespace: 'ai.course.config',
  version: 'v1',
  baseUrl: '/api'
});

// List all
const configs = await api('list');

// Get one
const config = await api('get', { id: 1 });

// Create
const newConfig = await api('create', {
  key: 'app_name',
  value: 'MyApp',
  description: 'Application name'
});

// Update
const updated = await api('update', {
  id: 1,
  value: 'UpdatedApp',
  description: 'Updated description'
});

// Delete
await api('delete', { id: 1 });
```

## Troubleshooting

**Resolver not found error:**
- Check file naming: `namespace.version.js`
- Ensure file is in `resolvers/` directory
- Verify namespace and version in client request

**API call fails:**
- Check backend API is running
- Verify API_URL environment variable
- Check backend REST endpoint exists
- Review backend logs for errors

**Validation errors:**
- Ensure required parameters are provided
- Check parameter names match resolver expectations
- Verify data types are correct
