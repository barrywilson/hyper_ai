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
        
        async connectedCallback() {
            //get rid of tag and render children
            // Create layout structure
            // let tempInnerHTML = this.innerHTML
            this.loading = null;
            this.message = null;

            // Preserve existing nodes for view transitions
            const children = Array.from(this.childNodes);
            
            const container = document.createElement('div');
            container.className = 'container';
            if (this.id) container.id = this.id;
            
            children.forEach(child => container.appendChild(child));

            const footer = document.createElement('footer');
            footer.innerHTML = `
                <app-message id="${this.id}-message"></app-message>   
                <app-loading id="${this.id}-loading"></app-loading>  
                <p>${this.getAttribute('footer') || ''}</p>
            `;
            container.appendChild(footer);
            
            this.appendChild(container);
            
        
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = "style.css";
            document.head.appendChild(link);

            await this.loadScripts([
                "elements/app-message.js",
                "elements/app-loading.js"
            ]);

            this.loading = document.getElementById(this.id + '-loading');
            this.message = document.getElementById(this.id + '-message');

            this.dispatchEvent(new CustomEvent('layout-loaded', { bubbles: true, composed: true }));
        }

        loadScript(src) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        async loadScripts(scripts) {
            for (const src of scripts) {
                await this.loadScript(src);
            }
        }

        ShowProgress(show) {
            show ? this.loading.show() : this.loading.hide();
        }
        ShowMessage(message="") {
            message!="" ? this.message.show(message) : this.message.show(message);
        }

    });
