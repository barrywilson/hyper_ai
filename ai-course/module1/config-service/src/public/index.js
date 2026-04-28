/**
 * Configuration Service Web App
 * 
 * Simple web interface for managing configurations.
 * Uses server-side resolver pattern - all requests POST to resolver.
 */

// Initialize configApi with resolver pattern
const configApi = createApi({
    namespace: 'ai.course.config',
    version: 'v1',
    baseUrl: '/api'
});

// DOM Elements
const configForm = document.getElementById('config-form');
const configId = document.getElementById('config-id');
const configKey = document.getElementById('config-key');
const configValue = document.getElementById('config-value');
const configDescription = document.getElementById('config-description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const message = document.getElementById('message');
const loadingDiv = document.getElementById('loading');

// State
let isEditing = false;
let configTable = document.getElementById('config-table');

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
    
    // Listen for single custom element event
    document.addEventListener('config-action', (e) => {
        const { action, id } = e.detail;
        if (action === 'edit') {
            editConfiguration(id);
        } else if (action === 'delete') {
            deleteConfiguration(id);
        }
    });
}

/**
 * Load all configurations from API
 */
async function loadConfigurations() {
    try {
        loadingDiv.show();
        message.hide();
        
        const configurations = await configApi('list');
        
        if (configTable) {
            configTable.data = configurations;
        }
        
    } catch (error) {
        console.error('Error loading configurations:', error);
        message.show('Failed to load configurations: ' + error.message, 'error');
    } finally {
        loadingDiv.hide();
    }
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
        message.show('Key name and value are required', 'error');
        return;
    }
    
    try {
        if (isEditing) {
            // Update existing configuration
            const id = parseInt(configId.value);
            await configApi('update', {
                id,
                value,
                description: description || null
            });
            message.show('Configuration updated successfully', 'success');
        } else {
            // Create new configuration
            await configApi('create', {
                key_name: keyName,
                value,
                description: description || null
            });
            message.show('Configuration created successfully', 'success');
        }
        
        resetForm();
        loadConfigurations();
    } catch (error) {
        console.error('Error saving configuration:', error);
        message.show(error.message, 'error');
    }
}

/**
 * Edit an existing configuration
 */
async function editConfiguration(id) {
    try {
        const config = await configApi('get', { id });
        
        configId.value = config.id;
        configKey.value = config.key_name;
        configKey.disabled = true;
        configValue.value = config.value;
        configDescription.value = config.description || '';
        
        isEditing = true;
        formTitle.textContent = 'Edit Configuration';
        submitBtn.textContent = 'Update Configuration';
        cancelBtn.style.display = 'inline-block';
        
        configForm.scrollIntoView({ behavior: 'smooth' });
        configValue.focus();
    } catch (error) {
        console.error('Error loading configuration:', error);
        message.show(error.message, 'error');
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
        await configApi('delete', { id });
        message.show('Configuration deleted successfully', 'success');
        loadConfigurations();
    } catch (error) {
        console.error('Error deleting configuration:', error);
        message.show(error.message, 'error');
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
    message.hide();
}

