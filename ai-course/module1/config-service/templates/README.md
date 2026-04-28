# Framework Templates

This directory contains reusable templates and guidelines for the Configuration Service project.

## Templates

### 1. [CUSTOM_ELEMENT_TEMPLATE.md](./CUSTOM_ELEMENT_TEMPLATE.md)
Template for creating new custom elements (Web Components).

**Use when:**
- Creating reusable UI components
- Need to encapsulate rendering logic
- Want clean, event-driven components

**Key features:**
- Simple, function-based approach
- No Shadow DOM (uses global styles)
- Single event pattern
- ~25-110 lines per element

### 2. [API_RESOLVER_TEMPLATE.md](./API_RESOLVER_TEMPLATE.md)
Template for creating new API resolvers (server-side).

**Use when:**
- Adding new API namespace
- Creating new API version
- Need CRUD operations for new resource

**Key features:**
- Dynamic loading (no server.js changes)
- Standard response format
- Built-in validation
- ~100-150 lines per resolver

### 3. [CODING_GUIDELINES.md](./CODING_GUIDELINES.md)
General coding standards and best practices.

**Covers:**
- Code style and patterns
- Architecture principles
- File organization
- Security best practices
- Common patterns

## Quick Start

### Creating a New Custom Element

1. Copy template from `CUSTOM_ELEMENT_TEMPLATE.md`
2. Create file: `src/public/elements/my-element.js`
3. Customize the template
4. Add to HTML: `<my-element id="myElement"></my-element>`
5. Add script: `<script src="elements/my-element.js"></script>`
6. Use in code: `myElement.data = value`

### Creating a New API Resolver

1. Copy template from `API_RESOLVER_TEMPLATE.md`
2. Create file: `src/resolvers/namespace.v1.js`
3. Implement CRUD actions
4. Use from client:
   ```javascript
   const api = createApi({
     namespace: 'namespace',
     version: 'v1',
     baseUrl: '/api'
   });
   await api('list');
   ```

## Project Philosophy

**Keep It Simple**
- No bloat or over-engineering
- Minimal code, maximum clarity
- Function-based approach
- Single event pattern
- No Shadow DOM

## Architecture Overview

```
Client (Browser)
├── api-client.js          → Universal API client
├── elements/              → Custom elements
│   ├── app-message.js     → Message display
│   ├── app-loading.js     → Loading indicator
│   └── config-table.js    → Data table
└── index.js               → App logic

Server (Node.js)
├── server.js              → Express + /api/resolve endpoint
├── resolvers/             → Dynamic API handlers
│   └── namespace.v1.js    → CRUD operations
└── db.js                  → Database connection
```

## Request Flow

```
Client                    Server                  Database
  |                         |                         |
  | POST /api/resolve       |                         |
  |------------------------>|                         |
  | { namespace, version,   |                         |
  |   action, params }      |                         |
  |                         |                         |
  |                         | Load resolver           |
  |                         | ./resolvers/ns.v1.js    |
  |                         |                         |
  |                         | Execute action          |
  |                         |------------------------>|
  |                         |                         |
  |                         |<------------------------|
  |                         | { status, data }        |
  |<------------------------|                         |
  | Response                |                         |
```

## Benefits

✅ **Modular**: Each component is independent
✅ **Scalable**: Add features without touching core
✅ **Testable**: Easy to test in isolation
✅ **Maintainable**: Clear structure and patterns
✅ **Simple**: No unnecessary complexity
✅ **Reusable**: Templates for common patterns

## Examples in Project

### Custom Elements
- `app-message.js` - Message display (~35 lines)
- `app-loading.js` - Loading indicator (~25 lines)
- `config-table.js` - Data table (~110 lines)

### API Resolvers
- `ai.course.config.v1.js` - Configuration CRUD (~150 lines)

### Utilities
- `api-client.js` - Universal API client (~55 lines)

## Getting Help

1. Check the relevant template
2. Review existing implementations
3. Follow the coding guidelines
4. Keep it simple!

## Contributing

When adding new features:
1. Follow existing patterns
2. Use the templates
3. Keep code minimal
4. Document if complex
5. Test thoroughly

## Version History

- **v1.0** - Initial templates
  - Custom Element Template
  - API Resolver Template
  - Coding Guidelines

---

**Remember:** The best code is no code. The second best is simple code.
