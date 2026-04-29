/**
 * ConfigTable Custom Element
 * Simple function-based custom element
 */

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
      <td>${config.description ? escapeHtml(config.description) : '-'}</td>
      <td>${new Date(config.created_at).toLocaleDateString()}</td>
      ${!isReadonly ? `
      <td>
        <div class="actions">
          <button class="btn btn-edit" data-action="edit" data-id="${config.id}">Edit</button>
          <button class="btn btn-danger" data-action="delete" data-id="${config.id}">Delete</button>
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
          <th>Key</th>
          <th>Value</th>
          <th>Description</th>
          <th>Created</th>
          ${!isReadonly ? '<th>Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  
  // Single event listener for all buttons (only if not readonly)
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



// Register custom element
customElements.define('config-table', class extends HTMLElement {
  
  connectedCallback = function() {
    this.innerHTML = `<p>Loading configurations...</p>`;
  };
  
  set data(configurations) {
    this._data = configurations;
    renderTable(this, configurations);
  };

});
