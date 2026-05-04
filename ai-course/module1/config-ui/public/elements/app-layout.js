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



// Register custom element

    
customElements.define('app-layout', class extends HTMLElement {
    
    connectedCallback() {
        //get rid of tag and render children
        // Create layout structure
        // let tempInnerHTML = this.innerHTML
        this.loading=null;
        this.message=null;
        this.innerHTML = `
        <div class="container" id="${this.id}"> 
            
        ${this.innerHTML}

        <footer>
                <app-message id="${this.id}-message"></app-message>   
                <app-loading id="${this.id}-loading"></app-loading>  
                <p>${this.getAttribute('footer') || ''}</p>
            </footer>

        </div>
        `;
        
    
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "style.css";
        document.head.appendChild(link);

        this.loading = document.getElementById(this.id + '-loading');
        this.message = document.getElementById(this.id + '-message');
    }

    ShowProgress(show) {
        show ? this.loading.show() : this.loading.hide();
    }
    ShowMessage(message="") {
        message!="" ? this.message.show(message) : this.message.show(message);
    }

});