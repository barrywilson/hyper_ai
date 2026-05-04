const { Kafka } = require('kafkajs');
const EventEmitter = require('events');

class KafkaEmitter extends EventEmitter { }
const kafkaEvents = new KafkaEmitter();
const kafka = new Kafka({
  clientId: 'config-ui',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 5 // Stop retrying after a few attempts so it doesn't hang forever
  }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'config-ui-group' });

let kafkaReady = false;

async function createTopicIfNeeded() {
  const admin = kafka.admin();

  try {
    await admin.connect();

    // Check if topic exists
    const topics = await admin.listTopics();

    if (!topics.includes('config-events')) {
      console.log('📝 Creating config-events topic...');
      await admin.createTopics({
        topics: [{
          topic: 'config-events',
          numPartitions: 3,
          replicationFactor: 1
        }]
      });
      console.log('✅ Topic created');
    } else {
      console.log('✅ Topic config-events already exists');
    }

  } finally {
    await admin.disconnect();
  }
}

async function startKafka() {
  const KAFKA_TIMEOUT = 15000; // 15 second timeout

  try {
    console.log('🔌 Connecting to Kafka at:', process.env.KAFKA_BROKERS || 'localhost:9092');

    // Wrap connection in timeout
    await Promise.race([
      (async () => {
        try {
          // Connect producer and consumer
          await producer.connect();
          console.log('  ✓ Producer connected');

          await consumer.connect();
          console.log('  ✓ Consumer connected');

          // Create topic if it doesn't exist
          await createTopicIfNeeded();

          // Subscribe to config-events topic
          await consumer.subscribe({
            topic: 'config-events',
            fromBeginning: false,
          });
          console.log('  ✓ Subscribed to config-events topic');
        } catch (err) {
          console.error('  ❌ Background Kafka connection task failed:', err.message);
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Kafka connection timeout after 15s')), KAFKA_TIMEOUT)
      )
    ]);

    console.log('✅ Kafka connected');

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const key = message.key?.toString();

        console.log('📨 Kafka message received:', {
          topic,
          partition,
          offset: message.offset,
          key,
          value: value.substring(0, 100) + (value.length > 100 ? '...' : ''),
        });

        // Parse and handle the message
        try {
          const parsedMessage = JSON.parse(value);
          kafkaEvents.emit('message', parsedMessage);
        } catch (error) {
          console.error('Failed to parse Kafka message:', error);
        }
      },
    });

    kafkaReady = true;
    console.log('✅ Kafka consumer running');

  } catch (error) {
    console.error('❌ Kafka connection failed:', error.message);
    kafkaReady = false;
    throw error;
  }
}


async function publishEvent(eventType, data) {
  // Silently skip if Kafka not ready
  // if (!kafkaReady) {
  //   console.warn('⚠️  Kafka not ready, skipping event publish');
  //   return;
  // }

  try {
    // Ensure data has required fields
    if (!data || typeof data !== 'object') {
      console.warn('⚠️  Invalid data for event publish, skipping');
      return;
    }

    await producer.send({
      topic: 'config-events',
      messages: [{
        key: data.key || data.id?.toString() || 'unknown',
        value: JSON.stringify({
          eventId: generateId(),
          eventType,
          timestamp: new Date().toISOString(),
          version: '1.0',
          source: 'config-ui',
          data,
        }),
      }],
    });
    console.log(`📤 Published event: ${eventType}`);
  } catch (error) {
    // Log error but don't throw - prevents service restart
    console.error('❌ Failed to publish event (non-fatal):', error.message);
  }
}

async function shutdown() {
  console.log('🛑 Shutting down Kafka...');
  await consumer.disconnect();
  await producer.disconnect();
  console.log('✅ Kafka disconnected');
}

function isReady() {
  return kafkaReady;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  startKafka,
  publishEvent,
  shutdown,
  isReady,
  kafkaEvents,
};
