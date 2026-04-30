/**
 * <app-layout> - Page Layout Component
 * 
 * Provides consistent page structure with:
 * - View transitions
 * - Container wrapper
 * - Header and main content slots
 * - Automatic script loading
 * 
 * Usage:
 *   <app-layout>
 *     <app-header slot="header" heading="Title"></app-header>
 *     <section>Page content here</section>
 *   </app-layout>
 */

class AppLayout extends HTMLElement {
  connectedCallback() {
    //get rid of tag and render children
    // Create layout structure
    // let tempInnerHTML = this.innerHTML
    this.outerHTML = `
      <div class="container">      
      ${this.innerHTML}
       <footer>
            <p>${this.getAttribute('footer') || ''}</p>
        </footer>
      </div>
    `;
    
 
       const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "style.css";
        document.head.appendChild(link);
  }
  




}

customElements.define('app-layout', AppLayout);
