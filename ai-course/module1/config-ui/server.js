const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Resolver Proxy - Translates resolver pattern to REST API calls
app.post('/api/resolve', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { namespace, version, action, params } = req.body;
    
    // Only handle configs namespace for now
    if (namespace !== 'ai.course.config' || version !== 'v1') {
      return res.status(400).json({ error: `Unknown namespace: ${namespace} or version: ${version}` });
    }
    
    let url, method, body;
    
    // Translate resolver actions to REST endpoints
    switch (action) {
      case 'list':
        url = `${API_URL}/api/configurations`;
        method = 'GET';
        break;
        
      case 'get':
        if (!params?.id) {
          return res.status(400).json({ error: 'ID is required for get action' });
        }
        url = `${API_URL}/api/configurations/${params.id}`;
        method = 'GET';
        break;
        
      case 'create':
        if (!params?.key || !params?.value) {
          return res.status(400).json({ error: 'key and value are required' });
        }
        url = `${API_URL}/api/configurations`;
        method = 'POST';
        body = {
          key: params.key,
          value: params.value,
          description: params.description || null
        };
        break;
        
      case 'update':
        if (!params?.id) {
          return res.status(400).json({ error: 'ID is required for update action' });
        }
        url = `${API_URL}/api/configurations/${params.id}`;
        method = 'PUT';
        body = {
          value: params.value,
          description: params.description || null
        };
        break;
        
      case 'delete':
        if (!params?.id) {
          return res.status(400).json({ error: 'ID is required for delete action' });
        }
        url = `${API_URL}/api/configurations/${params.id}`;
        method = 'DELETE';
        break;
        
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
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
      return res.status(204).send();
    }
    
    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Failed to reach backend API' });
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`UI server running on http://localhost:${PORT}`);
  console.log(`Proxying API requests to ${API_URL}`);
  console.log('Resolver pattern → REST API translation enabled');
});
