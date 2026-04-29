const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'config-ui',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'config-ui-group' });

let kafkaReady = false;

async function startKafka() {
  try {
    console.log('🔌 Connecting to Kafka...');
    
    // Connect producer and consumer
    await producer.connect();
    await consumer.connect();
    
    console.log('✅ Kafka connected');
    
    // Subscribe to config-events topic
    await consumer.subscribe({
      topic: 'test',
      fromBeginning: false,
    });
    
    console.log('📡 Subscribed to test topic');
    
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
          //add logic here to call back to clients via websocket or other means
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
  if (!kafkaReady) {
    console.warn('⚠️  Kafka not ready, skipping event publish');
    return;
  }
  
  try {
    await producer.send({
      topic: 'config-events',
      messages: [{
        key: data.key,
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
    console.error('Failed to publish event:', error);
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
};
