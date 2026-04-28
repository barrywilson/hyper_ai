/**
 * Configuration Service Web App
 * 
 * Simple web interface for managing configurations.
 * Uses unified API pattern for all requests.
 */

// Initialize API
const api = createApi('/api/config');

// DOM Elements
const configForm = document.getElementById('config-form');
const configId = document.getElementById('config-id');
const configKey = document.getElementById('config-key');
const configValue = document.getElementById('config-value');
const configDescription = document.getElementById('config-description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const configTbody = document.getElementById('config-tbody');
const messageDiv = document.getElementById('message');
const loadingDiv = document.getElementById('loading');

// State
let isEditing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfigurations();
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    configForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
}

/**
 * Load all configurations from API
 */
async function loadConfigurations() {
    try {
        showLoading(true);
        hideMessage();
        
        const configurations = await api('GET');
        renderConfigurations(configurations);
        
    } catch (error) {
        console.error('Error loading configurations:', error);
        showMessage('Failed to load configurations: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Render configurations in table
 */
function renderConfigurations(configurations) {
    if (!configurations || configurations.length === 0) {
        configTbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
                    No configurations found. Add your first configuration above.
                </td>
            </tr>
        `;
        return;
    }
    
    configTbody.innerHTML = configurations.map(config => `
        <tr>
            <td>${config.id}</td>
            <td><strong>${escapeHtml(config.key_name)}</strong></td>
            <td>${escapeHtml(config.value)}</td>
            <td>${config.description ? escapeHtml(config.description) : '-'}</td>
            <td>${formatDate(config.created_at)}</td>
            <td>
                <div class="actions" style="display: flex; gap: 5px;">
                    <button class="btn btn-edit" style="background: #4ecdc4; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;" onclick="editConfiguration(${config.id})">Edit</button>
                    <button class="btn btn-delete" style="background: #ff6b6b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;" onclick="deleteConfiguration(${config.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const keyName = configKey.value.trim();
    const value = configValue.value.trim();
    const description = configDescription.value.trim();
    
    if (!keyName || !value) {
        showMessage('Key name and value are required', 'error');
        return;
    }
    
    try {
        if (isEditing) {
            // Update existing configuration
            const id = parseInt(configId.value);
            await api('PUT', {
                id,
                data: {
                    value,
                    description: description || null
                }
            });
            showMessage('Configuration updated successfully', 'success');
        } else {
            // Create new configuration
            await api('POST', {
                data: {
                    key_name: keyName,
                    value,
                    description: description || null
                }
            });
            showMessage('Configuration created successfully', 'success');
        }
        
        resetForm();
        loadConfigurations();
    } catch (error) {
        console.error('Error saving configuration:', error);
        showMessage(error.message, 'error');
    }
}

/**
 * Edit an existing configuration
 */
async function editConfiguration(id) {
    try {
        const config = await api('GET', { id });
        
        configId.value = config.id;
        configKey.value = config.key_name;
        configKey.disabled = true; // Don't allow key name changes
        configValue.value = config.value;
        configDescription.value = config.description || '';
        
        isEditing = true;
        formTitle.textContent = 'Edit Configuration';
        submitBtn.textContent = 'Update Configuration';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        configForm.scrollIntoView({ behavior: 'smooth' });
        configValue.focus();
    } catch (error) {
        console.error('Error loading configuration:', error);
        showMessage(error.message, 'error');
    }
}

/**
 * Delete a configuration
 */
async function deleteConfiguration(id) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
        return;
    }
    
    try {
        await api('DELETE', { id });
        showMessage('Configuration deleted successfully', 'success');
        loadConfigurations();
    } catch (error) {
        console.error('Error deleting configuration:', error);
        showMessage(error.message, 'error');
    }
}

/**
 * Reset form to initial state
 */
function resetForm() {
    configForm.reset();
    configId.value = '';
    configKey.disabled = false;
    isEditing = false;
    formTitle.textContent = 'Add New Configuration';
    submitBtn.textContent = 'Add Configuration';
    cancelBtn.style.display = 'none';
    hideMessage();
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

/**
 * Show message (success or error)
 */
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(hideMessage, 5000);
    }
}

/**
 * Hide message
 */
function hideMessage() {
    messageDiv.className = 'message';
    messageDiv.textContent = '';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
