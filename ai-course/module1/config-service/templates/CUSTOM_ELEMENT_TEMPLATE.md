# Custom Element Template

## Simple Custom Element Pattern

Use this template to create new custom elements following the project's code style.

### Basic Template

```javascript
/**
 * [ElementName] Custom Element
 * [Brief description]
 */

// Helper functions (if needed)
const helperFunction = (param) => {
  // Pure function logic
  return result;
};

// Main render function
const render[ElementName] = (element, data) => {
  // Render logic
  element.innerHTML = `
    <div>
      ${data}
    </div>
  `;
  
  // Add event listeners if needed
  element.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      element.dispatchEvent(new CustomEvent('element-action', { 
        detail: { 
          action: e.target.dataset.action,
          value: e.target.dataset.value
        },
        bubbles: true 
      }));
    });
  });
};

// Register custom element
customElements.define('element-name', class extends HTMLElement {
  
  connectedCallback() {
    // Initialize element
    this.className = 'element-class';
    render[ElementName](this, this._data);
  }
  
  set data(value) {
    this._data = value;
    render[ElementName](this, value);
  }
  
  get data() {
    return this._data;
  }
  
  // Public methods
  show() {
    this.style.display = 'block';
  }
  
  hide() {
    this.style.display = 'none';
  }

});
```

## Advanced Pattern: Slot-Like Behavior

For components that need flexible content injection (like headers, layouts):

```javascript
/**
 * AppHeader Custom Element
 * Reusable header with slot-like behavior
 * 
 * Usage:
 * <app-header>
 *   <div slot="title">
 *     <h1>Page Title</h1>
 *     <p>Subtitle</p>
 *   </div>
 *   <div slot="actions">
 *     <a href="...">Link</a>
 *   </div>
 * </app-header>
 */

customElements.define('app-header', class extends HTMLElement {
  
  connectedCallback() {
    // Extract slot content before rendering
    const titleSlot = this.querySelector('[slot="title"]');
    const actionsSlot = this.querySelector('[slot="actions"]');
    
    // Store the innerHTML
    const titleContent = titleSlot ? titleSlot.innerHTML : '<h1>Default Title</h1>';
    const actionsContent = actionsSlot ? actionsSlot.innerHTML : '';
    
    // Render the header structure
    this.innerHTML = `
      <header>
        <div>
          ${titleContent}
        </div>
        <div class="nav-links">
          ${actionsContent}
        </div>
      </header>
    `;
  }
  
});
```

**Benefits:**
- Reusable across multiple pages
- Consistent structure with flexible content
- No need for Shadow DOM
- Simple slot-like behavior using `[slot="name"]` attributes

## Advanced Pattern: Conditional Rendering

For components that need different modes (like read-only vs editable):

```javascript
/**
 * DataTable Custom Element
 * Table with optional read-only mode
 */

const renderTable = (element, configurations) => {  
  const isReadonly = element.hasAttribute('readonly');
  
  const rows = configurations.map(config => `
    <tr>
      <td>${config.id}</td>
      <td>${config.name}</td>
      ${!isReadonly ? `
      <td>
        <div class="actions">
          <button data-action="edit" data-id="${config.id}">Edit</button>
          <button data-action="delete" data-id="${config.id}">Delete</button>
        </div>
      </td>
      ` : ''}
    </tr>
  `).join('');
  
  element.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          ${!isReadonly ? '<th>Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  
  // Only add event listeners if not readonly
  if (!isReadonly) {
    element.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        element.dispatchEvent(new CustomEvent('table-action', { 
          detail: { 
            action: e.target.dataset.action,
            id: parseInt(e.target.dataset.id)
          },
          bubbles: true 
        }));
      });
    });
  }
};

customElements.define('data-table', class extends HTMLElement {
  
  connectedCallback() {
    this.innerHTML = `<p>Loading...</p>`;
  }
  
  set data(configurations) {
    this._data = configurations;
    renderTable(this, configurations);
  }

});
```

**Usage:**
```html
<!-- Editable table -->
<data-table id="editTable"></data-table>

<!-- Read-only table -->
<data-table id="viewTable" readonly></data-table>
```

**Benefits:**
- Single component for multiple use cases
- Attribute-based configuration
- Cleaner codebase (no duplicate components)
- Easy to maintain

## Key Principles

### 1. Keep It Simple
- No bloat or over-engineering
- Minimal code, maximum clarity
- Only what's needed

### 2. Function-Based
- Use helper functions outside the element
- Keep render logic separate
- Pure functions where possible

### 3. Single Event Pattern
- Use one custom event with action payload
- Example: `element-action` with `{ action, value }`
- Easier to handle, more scalable

### 4. Clean API
- Simple public methods: `show()`, `hide()`, `update()`
- Data binding via properties: `element.data = value`
- Dispatch custom events for user actions

### 5. No Shadow DOM
- Use global styles
- Keep it simple
- Easier to debug

### 6. Slot-Like Behavior
- Read innerHTML before rendering
- Use `[slot="name"]` attributes for content areas
- Re-render with structured layout

### 7. Conditional Rendering
- Use attributes for modes: `readonly`, `disabled`, etc.
- Check with `element.hasAttribute('readonly')`
- Single component, multiple behaviors

## Examples from Project

### app-header.js (~40 lines)
```javascript
/**
 * AppHeader Custom Element
 * Reusable header component with slot-like behavior
 */

customElements.define('app-header', class extends HTMLElement {
  
  connectedCallback() {
    // Extract slot content before rendering
    const titleSlot = this.querySelector('[slot="title"]');
    const actionsSlot = this.querySelector('[slot="actions"]');
    
    // Store the innerHTML
    const titleContent = titleSlot ? titleSlot.innerHTML : '<h1>Configuration Service</h1><p>Manage your application configurations</p>';
    const actionsContent = actionsSlot ? actionsSlot.innerHTML : '';
    
    // Render the header structure
    this.innerHTML = `
      <header>
        <div>
          ${titleContent}
        </div>
        <div class="nav-links">
          ${actionsContent}
        </div>
      </header>
    `;
  }
  
});
```

### app-message.js (~35 lines)
```javascript
const renderMessage = (element, text, type) => {
  if (!text) {
    element.className = 'message';
    element.textContent = '';
    return;
  }
  
  element.className = `message ${type}`;
  element.textContent = text;
  
  if (type === 'success') {
    setTimeout(() => {
      element.className = 'message';
      element.textContent = '';
    }, 5000);
  }
};

customElements.define('app-message', class extends HTMLElement {
  show(text, type) {
    renderMessage(this, text, type);
  }
  
  hide() {
    renderMessage(this, '', '');
  }
});
```

### app-loading.js (~25 lines)
```javascript
const renderLoading = (element, show) => {
  element.style.display = show ? 'block' : 'none';
};

customElements.define('app-loading', class extends HTMLElement {
  connectedCallback() {
    this.className = 'loading';
    this.textContent = 'Loading...';
    this.style.display = 'none';
  }
  
  show() {
    renderLoading(this, true);
  }
  
  hide() {
    renderLoading(this, false);
  }
});
```

### config-table.js (~75 lines with readonly support)
```javascript
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const renderTable = (element, configurations) => {
  const isReadonly = element.hasAttribute('readonly');
  
  const rows = configurations.map(config => `
    <tr>
      <td>${config.id}</td>
      <td><strong>${escapeHtml(config.key)}</strong></td>
      <td>${escapeHtml(config.value)}</td>
      ${!isReadonly ? `
      <td>
        <button data-action="edit" data-id="${config.id}">Edit</button>
        <button data-action="delete" data-id="${config.id}">Delete</button>
      </td>
      ` : ''}
    </tr>
  `).join('');
  
  element.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Key</th>
          <th>Value</th>
          ${!isReadonly ? '<th>Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  
  if (!isReadonly) {
    element.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        element.dispatchEvent(new CustomEvent('config-action', { 
          detail: { 
            action: e.target.dataset.action,
            id: parseInt(e.target.dataset.id)
          },
          bubbles: true 
        }));
      });
    });
  }
};

customElements.define('config-table', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<p>Loading configurations...</p>`;
  }
  
  set data(configurations) {
    this._data = configurations;
    renderTable(this, configurations);
  }
});
```

## Usage Pattern

### 1. Create Element File
```
src/public/elements/my-element.js
```

### 2. Add to HTML
```html
<my-element id="myElement"></my-element>
<script src="elements/my-element.js"></script>
```

### 3. Use in JavaScript (Inline or External)
```html
<script>
  const myElement = document.getElementById('myElement');
  
  // Set data
  myElement.data = someData;
  
  // Call methods
  myElement.show();
  myElement.hide();
  
  // Listen for events
  document.addEventListener('element-action', (e) => {
    const { action, value } = e.detail;
    // Handle action
  });
</script>
```

## Page Organization Patterns

### Simple Read-Only Page (Inline Script)
For simple pages with minimal logic (~50 lines), use inline scripts:

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

### Complex Interactive Page (External Script)
For complex pages with lots of logic (>100 lines), use external scripts:

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
      <data-table id="table"></data-table>
    </main>
  </div>
  
  <script src="api-client.js"></script>
  <script src="elements/app-header.js"></script>
  <script src="elements/data-table.js"></script>
  <script src="admin.js"></script>
</body>
</html>
```

## Anti-Patterns to Avoid

❌ **Don't over-engineer**
- No complex state management
- No unnecessary abstractions
- No bloated code

❌ **Don't use Shadow DOM**
- Keep styles global
- Easier to debug
- Simpler implementation

❌ **Don't create multiple events**
- Use single event with action payload
- More scalable
- Easier to handle

❌ **Don't use inline handlers**
- Use data attributes and event delegation
- Cleaner HTML
- Better separation

❌ **Don't create separate files for tiny scripts**
- Use inline `<script>` tags for simple pages
- Only create external files when logic is complex
- Keep it simple!

## Checklist for New Elements

- [ ] Create file in `elements/` directory
- [ ] Use helper functions for logic
- [ ] Implement render function
- [ ] Register with `customElements.define()`
- [ ] Add simple public API methods
- [ ] Use single custom event pattern
- [ ] Consider slot-like behavior for flexible content
- [ ] Consider conditional rendering for multiple modes
- [ ] Add to HTML with proper script order
- [ ] Test in browser
- [ ] Keep it simple!

## When to Use Each Pattern

### Basic Pattern
- Simple display components
- No content injection needed
- Single purpose

### Slot-Like Behavior
- Layout components (headers, footers, cards)
- Need flexible content areas
- Reusable across pages with different content

### Conditional Rendering
- Components with multiple modes
- Read-only vs editable views
- Enabled vs disabled states
- Avoid duplicating similar components
