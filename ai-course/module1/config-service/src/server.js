const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Resolver - Universal endpoint for all API requests
app.post('/api/resolve', async (req, res) => {
  const { namespace, version, action, ...params } = req.body;
  
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
    
    // Execute the resolver
    const result = await resolver.resolve(action, params);
    
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
    
    // Handle database errors
    console.error('Resolver error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Configuration key already exists' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export for testing
module.exports = app;
