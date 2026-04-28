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
- Slot-like behavior for flexible content
- Conditional rendering for multiple modes
- ~25-75 lines per element

**New patterns:**
- **Slot-like behavior**: Inject flexible content without Shadow DOM
- **Conditional rendering**: Single component, multiple modes (readonly, editable, etc.)
- **Inline scripts**: For simple pages (~50 lines), embed logic in HTML

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
- Elegant code examples

## Quick Start

### Creating a New Custom Element

#### Basic Element
1. Copy template from `CUSTOM_ELEMENT_TEMPLATE.md`
2. Create file: `src/public/elements/my-element.js`
3. Customize the template
4. Add to HTML: `<my-element id="myElement"></my-element>`
5. Add script: `<script src="elements/my-element.js"></script>`
6. Use in code: `myElement.data = value`

#### Element with Slot-Like Behavior
```javascript
// elements/app-header.js
customElements.define('app-header', class extends HTMLElement {
  connectedCallback() {
    const titleSlot = this.querySelector('[slot="title"]');
    const actionsSlot = this.querySelector('[slot="actions"]');
    
    this.innerHTML = `
      <header>
        <div>${titleSlot ? titleSlot.innerHTML : ''}</div>
        <div class="nav-links">${actionsSlot ? actionsSlot.innerHTML : ''}</div>
      </header>
    `;
  }
});
```

**Usage:**
```html
<app-header>
  <div slot="title">
    <h1>My Page</h1>
    <p>Subtitle</p>
  </div>
  <div slot="actions">
    <a href="admin.html">Admin</a>
  </div>
</app-header>
```

#### Element with Conditional Rendering
```javascript
// elements/data-table.js
const renderTable = (element, data) => {
  const isReadonly = element.hasAttribute('readonly');
  
  element.innerHTML = `
    <table>
      ${data.map(item => `
        <tr>
          <td>${item.name}</td>
          ${!isReadonly ? `<td><button>Edit</button></td>` : ''}
        </tr>
      `).join('')}
    </table>
  `;
};

customElements.define('data-table', class extends HTMLElement {
  set data(value) {
    renderTable(this, value);
  }
});
```

**Usage:**
```html
<!-- Read-only -->
<data-table id="viewTable" readonly></data-table>

<!-- Editable -->
<data-table id="editTable"></data-table>
```

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

### Creating a Simple Page

For pages with minimal logic (~50 lines), use inline scripts:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <app-header>
      <div slot="title">
        <h1>My Page</h1>
      </div>
      <div slot="actions">
        <a href="admin.html">Admin</a>
      </div>
    </app-header>
    
    <main>
      <data-table id="table" readonly></data-table>
    </main>
  </div>
  
  <script src="api-client.js"></script>
  <script src="elements/app-header.js"></script>
  <script src="elements/data-table.js"></script>
  <script>
    // Simple page logic inline
    const api = createApi({ namespace: 'data', version: 'v1', baseUrl: '/api' });
    const table = document.getElementById('table');
    
    document.addEventListener('DOMContentLoaded', async () => {
      const data = await api('list');
      table.data = data;
    });
  </script>
</body>
</html>
```

## Project Philosophy

**Keep It Simple**
- No bloat or over-engineering
- Minimal code, maximum clarity
- Function-based approach
- Single event pattern
- No Shadow DOM
- Slot-like behavior for flexibility
- Conditional rendering for reusability
- Inline scripts for simple pages

## Architecture Overview

```
Client (Browser)
├── api-client.js          → Universal API client
├── elements/              → Custom elements
│   ├── app-header.js      → Reusable header with slots (~40 lines)
│   ├── app-message.js     → Message display (~35 lines)
│   ├── app-loading.js     → Loading indicator (~25 lines)
│   └── config-table.js    → Data table with readonly mode (~75 lines)
└── index.html             → Simple page (with inline script)
└── admin.html             → Complex page (with inline script)

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
✅ **Flexible**: Slot-like behavior without Shadow DOM
✅ **DRY**: Single component, multiple modes
✅ **Elegant**: Minimal code, maximum clarity

## Examples in Project

### Custom Elements

#### app-header.js (~40 lines)
Reusable header with slot-like behavior. Used on both index.html and admin.html with different content.

**Features:**
- Flexible content injection via slots
- Consistent structure across pages
- No Shadow DOM needed

#### app-message.js (~35 lines)
Message display component with auto-hide for success messages.

#### app-loading.js (~25 lines)
Simple loading indicator with show/hide methods.

#### config-table.js (~75 lines)
Data table with conditional rendering for readonly mode.

**Features:**
- Single component for both views
- Attribute-based configuration (`readonly`)
- Conditional event listeners
- Used on index.html (readonly) and admin.html (editable)

### Pages

#### index.html (Read-Only View)
Simple page with inline script (~50 lines total JavaScript).

**Features:**
- No separate .js file needed
- Logic co-located with markup
- Uses `<config-table readonly>` for read-only view
- Uses `<app-header>` with custom content

#### admin.html (Admin Dashboard)
Complex page with inline script (~150 lines JavaScript).

**Features:**
- Modal dialogs for editing
- Search/filter functionality
- Full CRUD operations
- Uses `<config-table>` (editable mode)
- Uses `<app-header>` with different content

### API Resolvers
- `ai.course.config.v1.js` - Configuration CRUD (~150 lines)

### Utilities
- `api-client.js` - Universal API client (~55 lines)

## Elegant Patterns Demonstrated

### 1. Slot-Like Behavior
Same component, different content:
```html
<!-- index.html -->
<app-header>
  <div slot="title"><h1>Configuration Service</h1></div>
  <div slot="actions"><a href="admin.html">Admin</a></div>
</app-header>

<!-- admin.html -->
<app-header>
  <div slot="title"><h1>Admin Dashboard</h1></div>
  <div slot="actions"><a href="index.html">Back</a></div>
</app-header>
```

### 2. Conditional Rendering
Same component, different modes:
```html
<!-- index.html - read-only -->
<config-table id="config-table" readonly></config-table>

<!-- admin.html - editable -->
<config-table id="config-table"></config-table>
```

### 3. Inline Scripts
Simple pages don't need separate files:
```html
<script>
  // 30 lines of simple logic inline
  const api = createApi({ ... });
  document.addEventListener('DOMContentLoaded', async () => {
    const data = await api('list');
    table.data = data;
  });
</script>
```

### 4. Single Event Pattern
One event, multiple actions:
```javascript
document.addEventListener('config-action', (e) => {
  const { action, id } = e.detail;
  if (action === 'edit') editConfig(id);
  else if (action === 'delete') deleteConfig(id);
});
```

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
4. Consider reusability (slots, conditional rendering)
5. Use inline scripts for simple pages
6. Document if complex
7. Test thoroughly

## Version History

- **v1.0** - Initial templates
  - Custom Element Template
  - API Resolver Template
  - Coding Guidelines

- **v1.1** - Enhanced patterns
  - Added slot-like behavior pattern
  - Added conditional rendering pattern
  - Added inline script guidelines
  - Updated examples with real implementations
  - Documented elegant code patterns

---

**Remember:** The best code is no code. The second best is simple, elegant code.

## Key Principles

1. **Simplicity** - Minimal code, maximum clarity
2. **Reusability** - One component, multiple uses
3. **Flexibility** - Slots for content injection
4. **Modularity** - Conditional rendering for modes
5. **Pragmatism** - Inline scripts when appropriate
6. **Elegance** - Clean, readable, maintainable

**Look at the elegance of the code and follow these patterns!**
