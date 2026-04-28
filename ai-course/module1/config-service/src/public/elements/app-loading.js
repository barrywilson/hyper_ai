/**
 * AppLoading Custom Element
 * Simple loading indicator
 */

const renderLoading = (element, show) => {
  element.style.display = show ? 'block' : 'none';
};

// Register custom element
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
