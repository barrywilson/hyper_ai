# API Resolver Template

## Server-Side Resolver Pattern

Use this template to create new API resolvers following the project's architecture.

### Resolver Template

```javascript
/**
 * [Namespace] Resolver - Version [X]
 * Handles all [namespace]-related actions
 */

const pool = require('../db');

async function resolve({ action, params, mappings }) {
  switch (action) {
    case 'list':
      const [rows] = await pool.query('SELECT * FROM table_name ORDER BY id');
      return { status: 200, data: rows };
      
    case 'get':
      if (!params.id) {
        return { status: 400, error: 'ID is required for get action' };
      }
      const [getRows] = await pool.query('SELECT * FROM table_name WHERE id = ?', [params.id]);
      if (getRows.length === 0) {
        return { status: 404, error: 'Resource not found' };
      }
      return { status: 200, data: getRows[0] };
      
    case 'create':
      if (!params.required_field) {
        return { status: 400, error: 'Required field is missing' };
      }
      const [createResult] = await pool.query(
        'INSERT INTO table_name (field1, field2) VALUES (?, ?)',
        [params.field1, params.field2]
      );
      const [createdRows] = await pool.query('SELECT * FROM table_name WHERE id = ?', [createResult.insertId]);
      return { status: 201, data: createdRows[0] };
      
    case 'update':
      if (!params.id) {
        return { status: 400, error: 'ID is required for update action' };
      }
      const [existingRows] = await pool.query('SELECT * FROM table_name WHERE id = ?', [params.id]);
      if (existingRows.length === 0) {
        return { status: 404, error: 'Resource not found' };
      }
      await pool.query(
        'UPDATE table_name SET field1 = ?, field2 = ? WHERE id = ?',
        [params.field1, params.field2, params.id]
      );
      const [updatedRows] = await pool.query('SELECT * FROM table_name WHERE id = ?', [params.id]);
      return { status: 200, data: updatedRows[0] };
      
    case 'delete':
      if (!params.id) {
        return { status: 400, error: 'ID is required for delete action' };
      }
      const [deleteCheck] = await pool.query('SELECT * FROM table_name WHERE id = ?', [params.id]);
      if (deleteCheck.length === 0) {
        return { status: 404, error: 'Resource not found' };
      }
      await pool.query('DELETE FROM table_name WHERE id = ?', [params.id]);
      return { status: 204 };
      
    default:
      return { status: 400, error: `Unknown action: ${action}` };
  }
}

module.exports = { resolve };
```

## Key Principles

### 1. Naming Convention
- File: `namespace.version.js`
- Example: `configs.v1.js`, `users.v1.js`, `settings.v2.js`
- Location: `src/resolvers/`

### 2. Standard Response Format
```javascript
// Success
{ status: 200, data: result }

// Error
{ status: 400, error: 'Error message' }

// No content
{ status: 204 }
```

### 3. Action Pattern
- `list` - Get all resources
- `get` - Get single resource by ID
- `create` - Create new resource
- `update` - Update existing resource
- `delete` - Delete resource

### 4. Validation
- Always validate required params
- Return 400 for missing/invalid data
- Return 404 for not found
- Return 500 for server errors

### 5. Database Access
- Import pool from `../db`
- Use parameterized queries
- Handle errors properly

## Server Integration

The server automatically loads resolvers:

```javascript
// server.js
app.post('/api/resolve', async (req, res) => {
  const { namespace, version, action, params, mappings } = req.body;
  
  // Dynamically load resolver
  const resolverPath = `./resolvers/${namespace}.${version}`;
  const resolver = require(resolverPath);
  
  // Execute
  const result = await resolver.resolve({ action, params, mappings });
  
  // Return response
  return res.status(result.status).json(result.data || { error: result.error });
});
```

## Client Usage

```javascript
// Create API client
const api = createApi({
  namespace: 'configs',
  version: 'v1',
  baseUrl: '/api'
});

// Use actions
await api('list');
await api('get', { id: 1 });
await api('create', { key_name: 'test', value: 'value' });
await api('update', { id: 1, value: 'new value' });
await api('delete', { id: 1 });
```

## Adding New Namespace

### 1. Create Resolver
```
src/resolvers/users.v1.js
```

### 2. Implement Actions
```javascript
async function resolve({ action, params, mappings }) {
  switch (action) {
    case 'list': // ...
    case 'get': // ...
    // etc
  }
}
```

### 3. Use from Client
```javascript
const userApi = createApi({
  namespace: 'users',
  version: 'v1',
  baseUrl: '/api'
});

await userApi('list');
```

**That's it!** No server.js changes needed.

## Benefits

✅ **Modular**: Each namespace is separate file
✅ **Scalable**: Add namespaces without touching server
✅ **Testable**: Test resolvers independently
✅ **Versioned**: Easy to maintain multiple API versions
✅ **Dynamic**: Loaded on-demand
✅ **Simple**: Clear, consistent pattern

## Anti-Patterns to Avoid

❌ **Don't hardcode in server.js**
- Use dynamic loading
- Keep server.js clean

❌ **Don't mix namespaces**
- One file per namespace/version
- Clear separation

❌ **Don't skip validation**
- Always validate inputs
- Return proper error codes

❌ **Don't use different response formats**
- Stick to standard format
- Consistency is key

## Checklist for New Resolvers

- [ ] Create file: `namespace.version.js`
- [ ] Import database pool
- [ ] Implement resolve function
- [ ] Add all CRUD actions
- [ ] Validate all inputs
- [ ] Return standard response format
- [ ] Handle errors properly
- [ ] Export resolve function
- [ ] Test with client
- [ ] Keep it simple!
