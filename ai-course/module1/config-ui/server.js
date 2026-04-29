const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const API_URLS = {
  "ai.course.config.v1": process.env.API_URL || 'http://localhost:3000'
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Resolver Proxy - Dynamically loads resolvers and translates to REST API calls
app.post('/api/resolve', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { namespace, version, action, params } = req.body;
    console.log(`Received resolver request: namespace=${namespace}, version=${version}, action=${action}`);
    // Validate required fields
    if (!namespace || !version || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: namespace, version, action' 
      });
    }
    
    // Dynamically load resolver based on namespace and version
    try {
      const resolverPath = `./resolvers/${namespace}.${version}`;
      const resolver = require(resolverPath);
      const resolvedUrl = API_URLS[`${namespace}.${version}`];
      // Execute the resolver
      const result = await resolver.resolve(fetch, resolvedUrl, { action, params });
      
      // Handle the result
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }
      
      if (result.status === 204) {
        return res.status(204).send();
      }
      
      return res.status(result.status).json(result.data);
      
    } catch (error) {
      // Handle resolver not found
      if (error.code === 'MODULE_NOT_FOUND') {
        return res.status(400).json({ 
          error: `Unknown namespace: ${namespace} or version: ${version}` 
        });
      }
      throw error;
    }
    
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
  console.log('Dynamic resolver loading enabled');
});
