/**
 * AppHeader Custom Element
 * Reusable header component with slot-like behavior
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
    
    const actionsSlot = this.querySelector('[slot="actions"]');
      
    const actionsContent = actionsSlot ? actionsSlot.innerHTML : '';
    const titleContent = this.getAttribute('heading') || '';
    const subtitleContent = this.getAttribute('subheading') || '';
    // Render the header structure
    this.innerHTML = `
      <header>
      <div>              
            <h1>
            ${titleContent}
            </h1>
            <p>
            ${subtitleContent}
            </p>
        </div>
        <div style="text-align: right;" class="nav-links">
          ${actionsContent}
        </div>       
      </header>
    `;
  }
  
});
