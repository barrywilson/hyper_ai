/**
 * Configuration Service Client
 * 
 * Modern unified API pattern - single endpoint handler
 * 
 * Usage:
 *   const api = createApi('/api/configs');
 *   const configs = await api('GET');
 *   const config = await api('GET', { id: 1 });
 *   await api('POST', { data: { key_name: 'app', value: 'MyApp' } });
 *   await api('PUT', { id: 1, data: { value: 'Updated' } });
 *   await api('DELETE', { id: 1 });
 */

function createApi(baseUrl = '/api/config') {
  baseUrl = baseUrl.replace(/\/$/, '');

  return async function api(method, params = {}) {
    const { id, data } = params;
    const url = id ? `${baseUrl}/${id}` : baseUrl;
    
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createApi;
} else if (typeof window !== 'undefined') {
  window.createApi = createApi;
}
