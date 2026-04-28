/**
 * Universal API Client
 * 
 * Radical design: Server-side API resolver pattern
 * Client always POSTs to resolver, server handles routing
 * 
 * Usage:
 *   const api = createApi({
 *     namespace: 'configs',
 *     version: 'v1',
 *     baseUrl: '/api'
 *   });
 *   
 *   const configs = await api('list');
 *   const config = await api('get', { id: 1 });
 *   await api('create', { key_name: 'app', value: 'MyApp' });
 *   await api('update', { id: 1, value: 'Updated' });
 *   await api('delete', { id: 1 });
 */

function createApi({ namespace, version = 'v1', baseUrl = '/api' }) {
  const resolverUrl = `${baseUrl}/resolve`;

  return async function api(action, params = {}) {
    const payload = {
      namespace,
      version,
      action,
      ...params
    };

    const response = await fetch(resolverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

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
