/**
 * DashboardStats Custom Element
 */
customElements.define('dashboard-stats', class extends HTMLElement {
    constructor() {
        super();
        this._data = [];
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="stats">
                <div class="stat-card">
                    <h3>Total Configs</h3>
                    <div class="value" id="totalConfigs">0</div>
                </div>
                <div class="stat-card">
                    <h3>Last Updated</h3>
                    <div class="value" id="lastUpdated" style="font-size: 16px;">—</div>
                </div>
            </div>
        `;
        this.totalConfigsEl = this.querySelector('#totalConfigs');
        this.lastUpdatedEl = this.querySelector('#lastUpdated');
        this.render();
    }

    set data(configurations) {
        this._data = configurations || [];
        if (this.totalConfigsEl && this.lastUpdatedEl) {
            this.render();
        }
    }

    render() {
        this.totalConfigsEl.textContent = this._data.length;

        if (this._data.length > 0) {
            // Assuming configurations are sorted by updated_at descending or similar
            // If they aren't sorted, we might need to find the max date
            const latest = new Date(this._data[0].updated_at);
            this.lastUpdatedEl.textContent = latest.toLocaleDateString();
        } else {
            this.lastUpdatedEl.textContent = '—';
        }
    }
});
