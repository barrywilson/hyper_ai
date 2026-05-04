const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const kafka = require('./kafka');

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

    // // // Dynamically load resolver based on namespace and version
    try {
      const resolverPath = `./resolvers/${namespace}.${version}`;
      const resolver = require(resolverPath);
      const resolvedUrl = API_URLS[`${namespace}.${version}`];
      // console.log(resolverPath, resolvedUrl);
      // Execute the resolver
      const result = await resolver.resolve(fetch, resolvedUrl, { action, params });

      // Handle the result
      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      // Publish event if mutation action was successful
      if (['create', 'update', 'delete'].includes(action)) {
        kafka.publishEvent(action, params)
      }

      if (result.status === 204) {
        return res.status(204).send();
      }

      return res.status(result.status).json(result.data);

    } catch (error) {
      // Handle resolver not found
      console.error('Resolver error:', error);
      if (error.code === 'MODULE_NOT_FOUND') {
        return res.status(400).json({
          error: `Unknown namespace: ${namespace} or version: ${version}`
        });
      }

      // Return error message, not error object (prevents serialization issues)
      return res.status(500).json({
        error: error.message || 'Resolver execution failed'
      });

    }

  } catch (error) {
    console.error('API proxy error:', error);
    // Return error message, not error object
    res.status(500).json({ 
      error: error.message || 'Failed to reach backend API' 
    });
  }
});

// SSE Endpoint for UI notifications
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send initial connected message
  res.write('data: {"connected":true}\n\n');

  // Listener for new messages from Kafka
  const listener = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  // Subscribe to the kafkaEvents emitter
  kafka.kafkaEvents.on('message', listener);

  // Clean up on client disconnect
  req.on('close', () => {
    kafka.kafkaEvents.off('message', listener);
  });
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
    // Start Express server immediately so the UI is accessible
    app.listen(PORT, () => {
      console.log(`\n🚀 Config UI Server Started`);
      console.log(`   HTTP: http://localhost:${PORT}`);
      console.log(`   Resolver: ✅ Dynamic loading enabled\n`);
    });

    // Start Kafka asynchronously in the background
    kafka.startKafka().then(() => {
      console.log(`   Kafka: ✅ Connected in background`);
    }).catch((error) => {
      console.error('   Kafka background connection failed:', error.message);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📛 SIGTERM received, shutting down gracefully...');
  await kafka.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📛 SIGINT received, shutting down gracefully...');
  await kafka.shutdown();
  process.exit(0);
});

// Start the server
start();
