const API_URL = 'http://localhost:3000/api/config';

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
    fetchConfigurations();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    configForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
}

// Fetch all configurations
async function fetchConfigurations() {
    try {
        showLoading(true);
        hideMessage();
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch configurations');
        }
        
        const configurations = await response.json();
        renderConfigurations(configurations);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to load configurations', 'error');
    } finally {
        showLoading(false);
    }
}

// Render configurations in table
function renderConfigurations(configurations) {
    if (configurations.length === 0) {
        configTbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No configurations found. Add your first configuration above.
                </td>
            </tr>
        `;
        return;
    }
    
    configTbody.innerHTML = configurations.map(config => `
        <tr>
            <td>${config.id}</td>
            <td><strong>${escapeHtml(config.key)}</strong></td>
            <td>${escapeHtml(config.value)}</td>
            <td>${config.description ? escapeHtml(config.description) : '-'}</td>
            <td>${formatDate(config.created_at)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-edit" onclick="editConfiguration(${config.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteConfiguration(${config.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        key: configKey.value.trim(),
        value: configValue.value.trim(),
        description: configDescription.value.trim()
    };
    
    if (!formData.key || !formData.value) {
        showMessage('Key and value are required', 'error');
        return;
    }
    
    try {
        if (isEditing) {
            await updateConfiguration(configId.value, formData);
        } else {
            await createConfiguration(formData);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Create new configuration
async function createConfiguration(formData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create configuration');
        }
        
        showMessage('Configuration created successfully', 'success');
        resetForm();
        fetchConfigurations();
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Update configuration
async function updateConfiguration(id, formData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update configuration');
        }
        
        showMessage('Configuration updated successfully', 'success');
        resetForm();
        fetchConfigurations();
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Edit configuration
async function editConfiguration(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch configuration');
        }
        
        const config = await response.json();
        
        // Populate form
        configId.value = config.id;
        configKey.value = config.key;
        configValue.value = config.value;
        configDescription.value = config.description || '';
        
        // Update UI
        isEditing = true;
        formTitle.textContent = 'Edit Configuration';
        submitBtn.textContent = 'Update Configuration';
        cancelBtn.style.display = 'block';
        
        // Scroll to form
        configForm.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to load configuration for editing', 'error');
    }
}

// Delete configuration
async function deleteConfiguration(id) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete configuration');
        }
        
        showMessage('Configuration deleted successfully', 'success');
        fetchConfigurations();
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// Reset form
function resetForm() {
    configForm.reset();
    configId.value = '';
    isEditing = false;
    formTitle.textContent = 'Add New Configuration';
    submitBtn.textContent = 'Add Configuration';
    cancelBtn.style.display = 'none';
    hideMessage();
}

// Show message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(hideMessage, 5000);
    }
}

// Hide message
function hideMessage() {
    messageDiv.className = 'message';
    messageDiv.textContent = '';
}

// Show/hide loading
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
