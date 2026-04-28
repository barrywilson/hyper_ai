/**
 * Configuration Service Web App - Read-Only View
 * 
 * Simple web interface for viewing configurations.
 * Uses server-side resolver pattern - all requests POST to resolver.
 */

// Initialize configApi with resolver pattern
const configApi = createApi({
    namespace: 'ai.course.config',
    version: 'v1',
    baseUrl: '/api'
});

// DOM Elements
const message = document.getElementById('message');
const loading = document.getElementById('loading');
const configTable = document.getElementById('config-table');

// Initialize
document.addEventListener('DOMContentLoaded', () => {    
    loadConfigurations();
});

/**
 * Load all configurations from API
 */
async function loadConfigurations() {
    try {
        loading.show();
        message.hide();
        
        const configurations = await configApi('list');
        
        if (configTable) {
            configTable.data = configurations;
        }
        
    } catch (error) {
        console.error('Error loading configurations:', error);
        message.show('Failed to load configurations: ' + error.message, 'error');
    } finally {
        loading.hide();
    }
}
