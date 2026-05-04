/**
 * ConfigSearch Custom Element
 */
customElements.define('config-search', class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Search by key name...">
            </div>
        `;
        this.input = this.querySelector('#searchInput');
        this.input.addEventListener('input', (e) => {
            this.dispatchEvent(new CustomEvent('search', {
                detail: { query: e.target.value.toLowerCase() },
                bubbles: true,
                composed: true
            }));
        });
    }

    get value() {
        return this.input ? this.input.value : '';
    }

    set value(val) {
        if (this.input) this.input.value = val;
    }
});
