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

## Examples from Project

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

### config-table.js (~110 lines)
```javascript
const renderTable = (element, configurations) => {
  const rows = configurations.map(config => `
    <tr>
      <td>${config.id}</td>
      <td><button data-action="edit" data-id="${config.id}">Edit</button></td>
    </tr>
  `).join('');
  
  element.innerHTML = `<table><tbody>${rows}</tbody></table>`;
  
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
};

customElements.define('config-table', class extends HTMLElement {
  connectedCallback() {
    renderTable(this, this._data);
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

### 3. Use in JavaScript
```javascript
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

## Checklist for New Elements

- [ ] Create file in `elements/` directory
- [ ] Use helper functions for logic
- [ ] Implement render function
- [ ] Register with `customElements.define()`
- [ ] Add simple public API methods
- [ ] Use single custom event pattern
- [ ] Add to HTML with proper script order
- [ ] Test in browser
- [ ] Keep it simple!
