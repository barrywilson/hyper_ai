/**
 * Configuration Service Client Library
 * 
 * Simple client for the Configuration Service API.
 * 
 * Usage:
 *   const client = createConfigClient('/api/configs');
 *   const configs = await client.list();
 *   await client.create({ key_name: 'app_name', value: 'MyApp' });
 */

function createConfigClient(baseUrl = '/api/configs') {
  baseUrl = baseUrl.replace(/\/$/, '');

  async function request(path, options = {}) {
    const response = await fetch(baseUrl + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return {
    list: () => request(''),
    
    get: (id) => request(`/${id}`),
    
    getByKey: async (keyName) => {
      const configs = await request('');
      return configs.find(c => c.key_name === keyName) || null;
    },
    
    create: (data) => request('', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
    update: (id, data) => request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
    delete: (id) => request(`/${id}`, {
      method: 'DELETE'
    })
  };
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createConfigClient;
} else if (typeof window !== 'undefined') {
  window.createConfigClient = createConfigClient;
}
