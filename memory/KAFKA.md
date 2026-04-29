# Kafka Architecture & Design

## Overview

This document describes the Kafka integration architecture for the Configuration Service, enabling event-driven patterns, real-time configuration updates, and distributed system coordination.

## Architecture Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                    Configuration Service                       │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Frontend   │◄────────┤   Backend    │                     │
│  │  (HTML/JS)   │  HTTP   │  (Express)   │                     │
│  └──────────────┘         └───────┬──────┘                     │
│                                    │                           │
│                            ┌───────▼──────┐                    │
│                            │  MySQL DB    │                    │
│                            └───────┬──────┘                    │
└────────────────────────────────────┼──────────────────────────┘
                                     │
                         ┌───────────▼───────────┐
                         │   Kafka Producer      │
                         │  (Event Publisher)    │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │      Apache Kafka Cluster       │
                    │  ┌──────────────────────────┐   │
                    │  │  config-events (topic)   │   │
                    │  │  - config.created        │   │
                    │  │  - config.updated        │   │
                    │  │  - config.deleted        │   │
                    │  └──────────────────────────┘   │
                    │  ┌──────────────────────────┐   │
                    │  │  config-changes (topic)  │   │
                    │  │  - Change Data Capture   │   │
                    │  └──────────────────────────┘   │
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
         ┌──────────▼──────────┐   ┌─────────▼──────────┐
         │  Kafka Consumers    │   │  External Systems  │
         │  - Cache Updater    │   │  - Microservices   │
         │  - Audit Logger     │   │  - Analytics       │
         │  - Notification Svc │   │  - Monitoring      │
         └─────────────────────┘   └────────────────────┘
```

## Kafka Integration Patterns

### 1. Event Sourcing Pattern

**Purpose**: Capture all configuration changes as immutable events

**Topic**: `config-events`

**Event Schema**:
```json
{
  "eventId": "uuid-v4",
  "eventType": "config.created|config.updated|config.deleted",
  "timestamp": "2026-04-29T17:30:00Z",
  "version": "1.0",
  "source": "config-service",
  "data": {
    "id": 1,
    "key": "app_name",
    "value": "MyApp",
    "description": "Application name",
    "previousValue": "OldApp",  // Only for updates
    "userId": "user123",         // Future: who made the change
    "metadata": {
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

**Benefits**:
- Complete audit trail
- Event replay capability
- Time-travel debugging
- Analytics and reporting

### 2. Change Data Capture (CDC) Pattern

**Purpose**: Stream database changes to Kafka for real-time synchronization

**Topic**: `config-changes`

**Implementation Options**:

#### Option A: Application-Level CDC
```javascript
// In config service after DB write
async function createConfig(key, value, description) {
  const result = await db.query(
    'INSERT INTO configurations (key, value, description) VALUES (?, ?, ?)',
    [key, value, description]
  );
  
  // Publish CDC event
  await kafkaProducer.send({
    topic: 'config-changes',
    messages: [{
      key: key,
      value: JSON.stringify({
        operation: 'INSERT',
        table: 'configurations',
        data: { id: result.insertId, key, value, description },
        timestamp: new Date().toISOString()
      })
    }]
  });
  
  return result;
}
```

#### Option B: Database-Level CDC (Debezium)
```yaml
# Debezium MySQL Connector
connector.class: io.debezium.connector.mysql.MySqlConnector
database.hostname: mysql
database.port: 3306
database.user: debezium
database.password: dbz
database.server.id: 184054
database.server.name: config-db
table.include.list: config_db.configurations
```

**Benefits**:
- Guaranteed consistency
- No code changes needed (Option B)
- Real-time data pipeline
- Supports multiple consumers

### 3. CQRS (Command Query Responsibility Segregation)

**Purpose**: Separate read and write models for better scalability

```
┌─────────────────────────────────────────────────────┐
│                  Write Model                         │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Commands   │────────►│  MySQL DB    │         │
│  │ (Create/     │         │  (Source of  │         │
│  │  Update/     │         │   Truth)     │         │
│  │  Delete)     │         └──────┬───────┘         │
│  └──────────────┘                │                  │
└──────────────────────────────────┼──────────────────┘
                                   │ Publish Events
                    ┌──────────────▼──────────────┐
                    │      Kafka (Event Bus)      │
                    └──────────────┬──────────────┘
                                   │ Subscribe
┌──────────────────────────────────▼──────────────────┐
│                  Read Model                          │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Queries    │◄────────┤  Redis Cache │         │
│  │ (List/Get)   │         │  (Optimized  │         │
│  │              │         │   for reads) │         │
│  └──────────────┘         └──────────────┘         │
└─────────────────────────────────────────────────────┘
```

**Implementation**:
```javascript
// Write side - publishes to Kafka
POST /api/resolve { action: 'create', ... }
  → MySQL INSERT
  → Kafka publish to 'config-events'

// Read side - consumes from Kafka, updates cache
Kafka Consumer
  → Listens to 'config-events'
  → Updates Redis cache
  → Invalidates stale entries

// Queries read from cache
POST /api/resolve { action: 'list' }
  → Redis GET (fast)
  → Fallback to MySQL if cache miss
```

**Benefits**:
- Scalable reads (cache layer)
- Eventual consistency
- Reduced database load
- Better performance

### 4. Pub/Sub Notification Pattern

**Purpose**: Notify external systems of configuration changes

**Topic**: `config-notifications`

**Use Cases**:
- Send email when critical config changes
- Trigger webhooks to external services
- Update monitoring dashboards
- Refresh application caches

**Consumer Example**:
```javascript
// Notification Service Consumer
const consumer = kafka.consumer({ groupId: 'notification-service' });

await consumer.subscribe({ topic: 'config-events' });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    
    if (event.eventType === 'config.updated' && 
        event.data.key.startsWith('critical_')) {
      // Send alert
      await sendEmail({
        to: 'admin@example.com',
        subject: `Critical Config Changed: ${event.data.key}`,
        body: `Value changed from ${event.data.previousValue} to ${event.data.value}`
      });
    }
  }
});
```

## Topic Design

### Topic: `config-events`

**Purpose**: Domain events for configuration lifecycle

**Partitioning Strategy**: By configuration key (ensures ordering per key)

**Retention**: 30 days (configurable)

**Replication Factor**: 3 (for production)

**Event Types**:
- `config.created`
- `config.updated`
- `config.deleted`
- `config.validated`
- `config.rollback`

### Topic: `config-changes`

**Purpose**: Change Data Capture stream

**Partitioning Strategy**: By table primary key

**Retention**: 7 days (shorter, for sync only)

**Replication Factor**: 3

**Schema**: Debezium CDC format or custom

### Topic: `config-snapshots`

**Purpose**: Periodic full snapshots for rebuilding state

**Partitioning Strategy**: Single partition (ordered snapshots)

**Retention**: 90 days

**Compaction**: Enabled (keep latest snapshot per key)

## Producer Design

### Configuration Service Producer

```javascript
// kafka-producer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'config-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({
  allowAutoTopicCreation: false,
  transactionalId: 'config-service-producer',
  maxInFlightRequests: 5,
  idempotent: true
});

async function publishConfigEvent(eventType, data) {
  const event = {
    eventId: generateUUID(),
    eventType,
    timestamp: new Date().toISOString(),
    version: '1.0',
    source: 'config-service',
    data
  };

  await producer.send({
    topic: 'config-events',
    messages: [{
      key: data.key,  // Partition by config key
      value: JSON.stringify(event),
      headers: {
        'event-type': eventType,
        'correlation-id': data.correlationId || generateUUID()
      }
    }]
  });
}

module.exports = { producer, publishConfigEvent };
```

### Integration with Resolver

```javascript
// In config-service/src/handlers/configs.js
const { publishConfigEvent } = require('./kafka-producer');

async function handleCreate(params) {
  const { key, value, description } = params;
  
  // Start transaction
  await db.beginTransaction();
  
  try {
    // Write to database
    const result = await db.query(
      'INSERT INTO configurations (key, value, description) VALUES (?, ?, ?)',
      [key, value, description]
    );
    
    // Publish event
    await publishConfigEvent('config.created', {
      id: result.insertId,
      key,
      value,
      description
    });
    
    // Commit transaction
    await db.commit();
    
    return { id: result.insertId, key, value, description };
  } catch (error) {
    await db.rollback();
    throw error;
  }
}
```

## Consumer Design

### Cache Updater Consumer

```javascript
// consumers/cache-updater.js
const { Kafka } = require('kafkajs');
const Redis = require('ioredis');

const kafka = new Kafka({
  clientId: 'cache-updater',
  brokers: [process.env.KAFKA_BROKERS]
});

const consumer = kafka.consumer({ 
  groupId: 'cache-updater-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

async function run() {
  await consumer.connect();
  await consumer.subscribe({ 
    topic: 'config-events',
    fromBeginning: false 
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      
      switch (event.eventType) {
        case 'config.created':
        case 'config.updated':
          await redis.hset(
            'configs',
            event.data.key,
            JSON.stringify(event.data)
          );
          break;
          
        case 'config.deleted':
          await redis.hdel('configs', event.data.key);
          break;
      }
      
      console.log(`Cache updated for key: ${event.data.key}`);
    }
  });
}

run().catch(console.error);
```

### Audit Logger Consumer

```javascript
// consumers/audit-logger.js
const { Kafka } = require('kafkajs');
const fs = require('fs').promises;

const consumer = kafka.consumer({ 
  groupId: 'audit-logger-group'
});

await consumer.subscribe({ topic: 'config-events' });

await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    
    const auditEntry = {
      timestamp: event.timestamp,
      eventType: event.eventType,
      key: event.data.key,
      oldValue: event.data.previousValue,
      newValue: event.data.value,
      userId: event.data.userId
    };
    
    // Write to audit log file
    await fs.appendFile(
      'audit.log',
      JSON.stringify(auditEntry) + '\n'
    );
    
    // Or write to separate audit database
    await auditDb.insert('audit_trail', auditEntry);
  }
});
```

## Error Handling & Reliability

### Producer Error Handling

```javascript
async function publishConfigEvent(eventType, data) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await producer.send({
        topic: 'config-events',
        messages: [{
          key: data.key,
          value: JSON.stringify({ eventType, data })
        }]
      });
      return; // Success
    } catch (error) {
      attempt++;
      console.error(`Kafka publish failed (attempt ${attempt}):`, error);
      
      if (attempt >= maxRetries) {
        // Fallback: Write to dead letter queue or local file
        await writeToDeadLetterQueue({ eventType, data, error });
        throw new Error('Failed to publish event after retries');
      }
      
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Consumer Error Handling

```javascript
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    try {
      const event = JSON.parse(message.value.toString());
      await processEvent(event);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Send to dead letter topic
      await producer.send({
        topic: 'config-events-dlq',
        messages: [{
          key: message.key,
          value: message.value,
          headers: {
            ...message.headers,
            'error': error.message,
            'original-topic': topic,
            'original-partition': partition.toString()
          }
        }]
      });
      
      // Don't throw - commit offset to avoid reprocessing
    }
  }
});
```

### Transactional Guarantees

```javascript
// Exactly-once semantics with transactions
const producer = kafka.producer({
  transactionalId: 'config-service-txn',
  idempotent: true
});

await producer.connect();

const transaction = await producer.transaction();

try {
  // Send multiple messages atomically
  await transaction.send({
    topic: 'config-events',
    messages: [{ key: 'key1', value: 'event1' }]
  });
  
  await transaction.send({
    topic: 'config-audit',
    messages: [{ key: 'key1', value: 'audit1' }]
  });
  
  await transaction.commit();
} catch (error) {
  await transaction.abort();
  throw error;
}
```

## Monitoring & Observability

### Key Metrics to Track

**Producer Metrics**:
- Message send rate
- Send latency (p50, p95, p99)
- Error rate
- Retry count
- Buffer utilization

**Consumer Metrics**:
- Message consumption rate
- Processing latency
- Consumer lag (messages behind)
- Rebalance frequency
- Error rate

**Topic Metrics**:
- Message throughput
- Partition count
- Replication lag
- Disk usage
- Retention compliance

### Monitoring Implementation

```javascript
// Prometheus metrics
const { register, Counter, Histogram, Gauge } = require('prom-client');

const messagesProduced = new Counter({
  name: 'kafka_messages_produced_total',
  help: 'Total messages produced',
  labelNames: ['topic', 'status']
});

const producerLatency = new Histogram({
  name: 'kafka_producer_latency_seconds',
  help: 'Producer send latency',
  labelNames: ['topic'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

const consumerLag = new Gauge({
  name: 'kafka_consumer_lag',
  help: 'Consumer lag in messages',
  labelNames: ['topic', 'partition', 'consumer_group']
});

// Instrument producer
async function publishConfigEvent(eventType, data) {
  const start = Date.now();
  
  try {
    await producer.send({ topic: 'config-events', messages: [...] });
    messagesProduced.inc({ topic: 'config-events', status: 'success' });
  } catch (error) {
    messagesProduced.inc({ topic: 'config-events', status: 'error' });
    throw error;
  } finally {
    producerLatency.observe(
      { topic: 'config-events' },
      (Date.now() - start) / 1000
    );
  }
}
```

## Deployment Notes

**For Training**: See `ai-course/module1/KAFKA_SIMPLE.md` for minimal Docker setup (1 Kafka container, KRaft mode).

**For Production**: Use managed Kafka services (Confluent Cloud, AWS MSK, Azure Event Hubs) or Kubernetes operators (Strimzi).

## Migration Strategy

### Phase 1: Dual Write (No Breaking Changes)
1. Add Kafka producer to config service
2. Write to both MySQL and Kafka
3. No consumers yet - just collecting events
4. Monitor and validate event quality

### Phase 2: Add Consumers (Parallel Processing)
1. Deploy cache-updater consumer
2. Deploy audit-logger consumer
3. Consumers process events in parallel
4. Original system still works without Kafka

### Phase 3: CQRS Implementation (Gradual Shift)
1. Add Redis cache layer
2. Route reads to cache (with MySQL fallback)
3. Measure performance improvements
4. Gradually increase cache reliance

### Phase 4: Full Event-Driven (Optional)
1. Add more consumers (notifications, webhooks)
2. Implement event replay capabilities
3. Add event sourcing for audit trail
4. Consider removing direct MySQL reads for queries

## Best Practices

### 1. Message Design
- **Use schemas**: Avro or JSON Schema for validation
- **Include metadata**: Timestamps, correlation IDs, versions
- **Keep messages small**: < 1MB per message
- **Use meaningful keys**: For partitioning and ordering

### 2. Topic Management
- **Naming convention**: `<domain>-<entity>-<event-type>`
- **Partition strategy**: Balance between parallelism and ordering
- **Retention policy**: Based on use case (events vs CDC)
- **Compaction**: For snapshot/state topics

### 3. Consumer Groups
- **One group per application**: Multiple instances scale horizontally
- **Idempotent processing**: Handle duplicate messages
- **Offset management**: Commit after successful processing
- **Error handling**: Dead letter queues for failed messages

### 4. Security
- **Authentication**: SASL/SCRAM or mTLS
- **Authorization**: ACLs for topics and consumer groups
- **Encryption**: TLS for data in transit
- **Audit**: Log all access and operations

### 5. Performance
- **Batch processing**: Process multiple messages together
- **Compression**: Use snappy or lz4
- **Connection pooling**: Reuse producer/consumer instances
- **Async operations**: Non-blocking I/O

## Future Enhancements

### 1. Schema Registry
- Centralized schema management
- Schema evolution and compatibility
- Automatic serialization/deserialization

### 2. Kafka Streams
- Real-time stream processing
- Aggregations and joins
- Stateful processing

### 3. Kafka Connect
- Pre-built connectors for databases
- No-code data integration
- Scalable data pipelines

### 4. Event Replay
- Time-travel debugging
- Rebuild state from events
- Disaster recovery

### 5. Multi-Region Replication
- Cross-datacenter replication
- Disaster recovery
- Global event distribution

## References

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [KafkaJS Library](https://kafka.js.org/)
- [Confluent Platform](https://docs.confluent.io/)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
