/**
 * Configs Namespace Resolver - Version 1
 * Translates resolver actions to REST API calls
 */

async function resolve(fetch, apiUrl, { action, params }) {
  let url, method, body;
  // console.log(`Resolving action: ${action} with params: ${JSON.stringify(params)}`);
  // Translate resolver actions to REST endpoints
  switch (action) {
    case 'list':
      url = `${apiUrl}/api/configurations`;
      method = 'GET';
      break;
      
    case 'get':
      if (!params?.id) {
        return { status: 400, error: 'ID is required for get action' };
      }
      url = `${apiUrl}/api/configurations/${params.id}`;
      method = 'GET';
      break;
      
    case 'create':
      if (!params?.key || !params?.value) {
        return { status: 400, error: 'key and value are required' };
      }
      url = `${apiUrl}/api/configurations`;
      method = 'POST';
      body = {
        key: params.key,
        value: params.value,
        description: params.description || null
      };
      break;
      
    case 'update':
      if (!params?.id) {
        return { status: 400, error: 'ID is required for update action' };
      }
      url = `${apiUrl}/api/configurations/${params.id}`;
      method = 'PUT';
      body = {
        value: params.value,
        description: params.description || null
      };
      break;
      
    case 'delete':
      if (!params?.id) {
        return { status: 400, error: 'ID is required for delete action' };
      }
      url = `${apiUrl}/api/configurations/${params.id}`;
      method = 'DELETE';
      break;
      
    default:
      return { status: 400, error: `Unknown action: ${action}` };
  }
  
  // Make the REST API call
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  // Handle 204 No Content
  if (response.status === 204) {
    return { status: 204 };
  }
  
  const data = await response.json();
  return { status: response.status, data };
}

module.exports = { resolve };
