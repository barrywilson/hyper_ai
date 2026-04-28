# Coding Guidelines

## Project Philosophy: Keep It Simple

**Core Principle:** Write minimal, clear code. No bloat, no over-engineering.

## General Rules

### 1. No Classes (Except Custom Elements)
```javascript
// ❌ Don't
class ConfigService {
  constructor() { }
  getData() { }
}

// ✅ Do
function getData() {
  // Simple function
}
```

### 2. Pure Functions
```javascript
// ✅ Do
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
```

### 3. No Inline Styles in HTML (Except Rare Cases)
```html
<!-- ❌ Don't (usually) -->
<div style="color: red; padding: 10px;">Text</div>

<!-- ✅ Do -->
<div class="error-message">Text</div>

<!-- ✅ OK for one-off positioning/layout -->
<div style="text-align: right;">
  <a href="admin.html">Admin</a>
</div>
```

### 4. No Inline Event Handlers
```html
<!-- ❌ Don't -->
<button onclick="handleClick()">Click</button>

<!-- ✅ Do -->
<button data-action="click" data-id="123">Click</button>
```

### 5. Single Event Pattern
```javascript
// ❌ Don't - Multiple events
element.dispatchEvent(new CustomEvent('item-edit', { ... }));
element.dispatchEvent(new CustomEvent('item-delete', { ... }));
element.dispatchEvent(new CustomEvent('item-view', { ... }));

// ✅ Do - Single event with action
element.dispatchEvent(new CustomEvent('item-action', { 
  detail: { 
    action: 'edit', // or 'delete', 'view'
    id: 123 
  },
  bubbles: true
}));
```

## Architecture Patterns

### API Resolver Pattern

**Client:**
```javascript
const api = createApi({
  namespace: 'ai.course.config',
  version: 'v1',
  baseUrl: '/api'
});

await api('list');
await api('get', { id: 1 });
```

**Server:**
```javascript
// Dynamically loads: ./resolvers/ai.course.config.v1.js
const resolver = require(`./resolvers/${namespace}.${version}`);
const result = await resolver.resolve({ action, params, mappings });
```

**Resolver:**
```javascript
async function resolve({ action, params, mappings }) {
  switch (action) {
    case 'list': return { status: 200, data: rows };
    case 'get': return { status: 200, data: row };
    // etc
  }
}
```

### Custom Element Pattern

**Basic Element:**
```javascript
const renderElement = (element, data) => {
  element.innerHTML = `<div>${data}</div>`;
};

customElements.define('my-element', class extends HTMLElement {
  set data(value) {
    this._data = value;
    renderElement(this, value);
  }
});
```

**Slot-Like Behavior (for layouts):**
```javascript
customElements.define('app-header', class extends HTMLElement {
  connectedCallback() {
    const titleSlot = this.querySelector('[slot="title"]');
    const actionsSlot = this.querySelector('[slot="actions"]');
    
    const titleContent = titleSlot ? titleSlot.innerHTML : '<h1>Default</h1>';
    const actionsContent = actionsSlot ? actionsSlot.innerHTML : '';
    
    this.innerHTML = `
      <header>
        <div>${titleContent}</div>
        <div class="nav-links">${actionsContent}</div>
      </header>
    `;
  }
});
```

**Conditional Rendering (for modes):**
```javascript
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
  
  if (!isReadonly) {
    // Add event listeners only when editable
  }
};
```

**Usage:**
```html
<!-- Reusable header -->
<app-header>
  <div slot="title">
    <h1>My Page</h1>
  </div>
  <div slot="actions">
    <a href="admin.html">Admin</a>
  </div>
</app-header>

<!-- Read-only table -->
<data-table id="table" readonly></data-table>
```

## File Organization

```
src/
├── public/
│   ├── elements/          # Custom elements
│   │   ├── app-header.js  # Reusable header (~40 lines)
│   │   ├── app-message.js # Message display (~35 lines)
│   │   ├── app-loading.js # Loading indicator (~25 lines)
│   │   └── config-table.js # Data table (~75 lines)
│   ├── api-client.js      # Universal API client
│   ├── index.html         # Main page (with inline script)
│   ├── admin.html         # Admin page (with inline script)
│   └── style.css          # Unified styles
├── resolvers/             # API resolvers
│   └── namespace.v1.js
├── server.js              # Express server
└── db.js                  # Database connection
```

## Page Organization

### Simple Pages: Inline Scripts
For pages with minimal logic (~50 lines), use inline `<script>` tags:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Configuration Service</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <app-header>
      <div slot="title">
        <h1>Configuration Service</h1>
        <p>View configurations</p>
      </div>
      <div slot="actions">
        <a href="admin.html">Admin Dashboard</a>
      </div>
    </app-header>
    
    <main>
      <config-table id="config-table" readonly></config-table>
    </main>
  </div>
  
  <script src="api-client.js"></script>
  <script src="elements/app-header.js"></script>
  <script src="elements/config-table.js"></script>
  <script>
    // Simple page logic inline
    const configApi = createApi({
      namespace: 'ai.course.config',
      version: 'v1',
      baseUrl: '/api'
    });
    
    const configTable = document.getElementById('config-table');
    
    document.addEventListener('DOMContentLoaded', async () => {
      const configurations = await configApi('list');
      configTable.data = configurations;
    });
  </script>
</body>
</html>
```

**Benefits:**
- One less HTTP request
- Logic co-located with markup
- Easier to understand page behavior
- Perfect for simple read-only views

### Complex Pages: External Scripts
For pages with complex logic (>100 lines), use external scripts:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <app-header>
      <div slot="title">
        <h1>Admin Dashboard</h1>
      </div>
      <div slot="actions">
        <a href="index.html">Back</a>
      </div>
    </app-header>
    
    <main>
      <config-table id="config-table"></config-table>
    </main>
  </div>
  
  <script src="api-client.js"></script>
  <script src="elements/app-header.js"></script>
  <script src="elements/config-table.js"></script>
  <script src="admin.js"></script>
</body>
</html>
```

**When to use external scripts:**
- Complex form handling
- Multiple event listeners
- State management
- Modal dialogs
- Search/filter logic
- >100 lines of JavaScript

## Code Style

### JavaScript
- Use `const` and `let`, never `var`
- Arrow functions for simple functions
- Regular functions for complex logic
- Descriptive variable names
- Comments for complex logic only

### HTML
- Semantic elements
- Custom elements for reusable components
- Minimal inline styles (only for one-off positioning)
- No inline scripts (except page-specific logic in `<script>` tags)

### CSS
- Single stylesheet for entire app
- BEM-like naming for clarity
- Mobile-first responsive design
- Use CSS variables for theming

## Testing Approach

### Manual Testing
1. Test in browser
2. Check console for errors
3. Verify all CRUD operations
4. Test edge cases

### Keep It Simple
- No complex test frameworks initially
- Focus on working code
- Add tests when needed, not preemptively

## Documentation

### Code Comments
```javascript
// ❌ Don't - Obvious comments
const name = 'John'; // Set name to John

// ✅ Do - Explain why, not what
const timeout = 5000; // Auto-hide success messages after 5s
```

### Function Documentation
```javascript
/**
 * Load all configurations from API
 */
async function loadConfigurations() {
  // Implementation
}
```

## Common Patterns

### Error Handling
```javascript
try {
  const result = await api('action', params);
  message.show('Success!', 'success');
} catch (error) {
  console.error('Error:', error);
  message.show(error.message, 'error');
}
```

### Loading States
```javascript
async function loadData() {
  try {
    loading.show();
    const data = await api('list');
    element.data = data;
  } catch (error) {
    message.show(error.message, 'error');
  } finally {
    loading.hide();
  }
}
```

### Form Handling
```javascript
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const data = {
    field1: input1.value.trim(),
    field2: input2.value.trim()
  };
  
  if (!data.field1) {
    message.show('Field is required', 'error');
    return;
  }
  
  await api('create', data);
  form.reset();
  loadData();
}
```

## Performance

### Keep It Fast
- Minimal JavaScript
- No heavy frameworks
- Efficient DOM updates
- Use event delegation

### Optimize When Needed
- Don't prematurely optimize
- Profile before optimizing
- Focus on user experience

## Security

### Input Validation
- Validate on client AND server
- Escape HTML output
- Use parameterized queries
- Sanitize user input

### Best Practices
```javascript
// Escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Parameterized queries
await pool.query('SELECT * FROM table WHERE id = ?', [id]);
```

## Deployment

### Environment Variables
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_NAME=database
PORT=3000
```

### Docker
- Use docker-compose for development
- Keep Dockerfile simple
- Document all services

## Key Takeaways

1. **Keep it simple** - No unnecessary complexity
2. **Function-based** - Pure functions, minimal classes
3. **Single events** - One event with action payload
4. **Modular** - Separate concerns clearly
5. **Reusable** - Custom elements for UI components
6. **Slot-like behavior** - Flexible content injection without Shadow DOM
7. **Conditional rendering** - Single component, multiple modes
8. **Inline scripts for simple pages** - Co-locate logic with markup
9. **External scripts for complex pages** - Separate when logic is substantial
10. **Dynamic** - Load resolvers on-demand
11. **Testable** - Easy to test and debug
12. **Documented** - Clear templates and guidelines

## When in Doubt

Ask yourself:
- Is this the simplest solution?
- Can I remove any code?
- Is this reusable?
- Will this be easy to maintain?
- Should this be inline or external?
- Can one component handle multiple modes?

**If the answer is no, simplify!**

## Elegant Code Patterns

### ✅ Reusable Components with Slots
```html
<!-- Same component, different content -->
<app-header>
  <div slot="title"><h1>Page 1</h1></div>
  <div slot="actions"><a href="/">Home</a></div>
</app-header>

<app-header>
  <div slot="title"><h1>Page 2</h1></div>
  <div slot="actions"><a href="/admin">Admin</a></div>
</app-header>
```

### ✅ Single Component, Multiple Modes
```html
<!-- Same component, different behavior -->
<config-table id="viewTable" readonly></config-table>
<config-table id="editTable"></config-table>
```

### ✅ Inline Scripts for Simplicity
```html
<!-- No separate file needed for 30 lines -->
<script>
  const api = createApi({ namespace: 'data', version: 'v1', baseUrl: '/api' });
  document.addEventListener('DOMContentLoaded', async () => {
    const data = await api('list');
    document.getElementById('table').data = data;
  });
</script>
```

### ✅ Clean Event Handling
```javascript
// Single event, multiple actions
document.addEventListener('config-action', (e) => {
  const { action, id } = e.detail;
  if (action === 'edit') editConfig(id);
  else if (action === 'delete') deleteConfig(id);
});
```

## Anti-Patterns

### ❌ Duplicate Components
```javascript
// Don't create separate read-only and editable components
// Use one component with conditional rendering
```

### ❌ Separate Files for Tiny Scripts
```javascript
// Don't create index.js for 30 lines of code
// Use inline <script> tag instead
```

### ❌ Multiple Events for Same Component
```javascript
// Don't dispatch different events for each action
// Use single event with action payload
```

### ❌ Hardcoded Content in Components
```javascript
// Don't hardcode titles/content in components
// Use slot-like behavior for flexibility
```
