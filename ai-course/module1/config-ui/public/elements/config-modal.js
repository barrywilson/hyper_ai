/**
 * ConfigModal Custom Element
 */

customElements.define('config-modal', class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="configModal" class="modal">
                <div class="modal-content">
                    <button class="close-btn" id="closeModal">&times;</button>
                    <div class="modal-header" id="modalTitle">Add New Configuration</div>
                    
                    <form id="configForm">
                        <input type="hidden" id="configId">
                        
                        <div class="form-group">
                            <label for="key">Key Name *</label>
                            <input type="text" id="key" required placeholder="e.g., app_name">
                        </div>

                        <div class="form-group">
                            <label for="configValue">Value *</label>
                            <textarea id="configValue" required placeholder="Configuration value"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="description">Description</label>
                            <input type="text" id="description" placeholder="Optional description">
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Configuration</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.modal = this.querySelector('#configModal');
        this.form = this.querySelector('#configForm');
        this.modalTitle = this.querySelector('#modalTitle');
        this.idInput = this.querySelector('#configId');
        this.keyInput = this.querySelector('#key');
        this.valueInput = this.querySelector('#configValue');
        this.descInput = this.querySelector('#description');

        this.querySelector('#closeModal').addEventListener('click', () => this.close());
        this.querySelector('#cancelBtn').addEventListener('click', () => this.close());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    openAdd() {
        this.modalTitle.textContent = 'Add New Configuration';
        this.form.reset();
        this.idInput.value = '';
        this.modal.classList.add('active');
        this.keyInput.disabled = false;
        this.keyInput.focus();
    }

    openEdit(config) {
        this.modalTitle.textContent = 'Edit Configuration';
        this.idInput.value = config.id;
        this.keyInput.value = config.key;
        this.keyInput.disabled = true;
        this.valueInput.value = config.value;
        this.descInput.value = config.description || '';
        
        this.modal.classList.add('active');
        this.valueInput.focus();
    }

    close() {
        this.modal.classList.remove('active');
        this.form.reset();
        this.keyInput.disabled = false;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const id = this.idInput.value;
        const key = this.keyInput.value.trim();
        const value = this.valueInput.value.trim();
        const description = this.descInput.value.trim();

        if (!key || !value) {
            return;
        }

        this.dispatchEvent(new CustomEvent('save-config', {
            detail: { id, key, value, description },
            bubbles: true,
            composed: true
        }));
    }
});
