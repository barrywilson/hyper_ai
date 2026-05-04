const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const kafka = require('./kafka');

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
    console.log('Received API resolver request:', req.body);

    const { namespace, version, action, params } = req.body;
    console.log(`Received resolver request: namespace=${namespace}, version=${version}, action=${action}`);
    // // Validate required fields
    if (!namespace || !version || !action) {
      return res.status(400).json({
        error: 'Missing required fields: namespace, version, action'
      });
    }

    // // Dynamically load resolver based on namespace and version
    try {
      const resolverPath = `./resolvers/${namespace}.${version}`;
      const resolver = require(resolverPath);
      const resolvedUrl = API_URLS[`${namespace}.${version}`];
      // console.log(resolverPath, resolvedUrl);
      // Execute the resolver
      const result = await resolver.resolve(fetch, resolvedUrl, { action, params });

      // Handle the result
      if (result.error) {
        res.status(result.status).json({ error: result.error });
      }

      if (result.status === 204) {
        res.status(204).send();
      }

      res.status(result.status).json(result.data);

    } catch (error) {
      // Handle resolver not found
      console.error('Resolver error:', error);
      if (error.code === 'MODULE_NOT_FOUND') {
        res.status(400).json({
          error: `Unknown namespace: ${namespace} or version: ${version}`
        });
      }

      res.status(400).json({
        error
      });

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

// Startup function with Kafka integration
async function start() {
  try {
    // Start Kafka first
    // await kafka.startKafka();

    // Then start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Config UI Server Started`);
      console.log(`   HTTP: http://localhost:${PORT}`);
      // console.log(`   Kafka: ${kafka.isReady() ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`   Resolver: ✅ Dynamic loading enabled\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📛 SIGTERM received, shutting down gracefully...');
  // await kafka.shutdown();?
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📛 SIGINT received, shutting down gracefully...');
  await kafka.shutdown();
  process.exit(0);
});

// Start the server
start();
