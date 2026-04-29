/**
 * AppMessage Custom Element
 * Simple message display
 */

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

// Register custom element
customElements.define('app-message', class extends HTMLElement {
  
  show(text, type) {
    renderMessage(this, text, type);
  }
  
  hide() {
    renderMessage(this, '', '');
  }

});
