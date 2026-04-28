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

### 3. No Inline Styles in HTML
```html
<!-- ❌ Don't -->
<div style="color: red; padding: 10px;">Text</div>

<!-- ✅ Do -->
<div class="error-message">Text</div>
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
  }
}));
```

## Architecture Patterns

### API Resolver Pattern

**Client:**
```javascript
const api = createApi({
  namespace: 'configs',
  version: 'v1',
  baseUrl: '/api'
});

await api('list');
await api('get', { id: 1 });
```

**Server:**
```javascript
// Dynamically loads: ./resolvers/configs.v1.js
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

**Element:**
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

**Usage:**
```html
<my-element id="myElement"></my-element>
<script src="elements/my-element.js"></script>
<script>
  const el = document.getElementById('myElement');
  el.data = someData;
</script>
```

## File Organization

```
src/
├── public/
│   ├── elements/          # Custom elements
│   │   ├── app-message.js
│   │   ├── app-loading.js
│   │   └── config-table.js
│   ├── api-client.js      # Universal API client
│   ├── index.html         # Main page
│   ├── index.js           # Main app logic
│   ├── admin.html         # Admin page
│   └── style.css          # Unified styles
├── resolvers/             # API resolvers
│   └── namespace.v1.js
├── server.js              # Express server
└── db.js                  # Database connection
```

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
- No inline styles
- No inline scripts (except small page-specific logic)

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
    loadingEl.style.display = 'block';
    const data = await api('list');
    element.data = data;
  } finally {
    loadingEl.style.display = 'none';
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
6. **Dynamic** - Load resolvers on-demand
7. **Testable** - Easy to test and debug
8. **Documented** - Clear templates and guidelines

## When in Doubt

Ask yourself:
- Is this the simplest solution?
- Can I remove any code?
- Is this reusable?
- Will this be easy to maintain?

**If the answer is no, simplify!**
