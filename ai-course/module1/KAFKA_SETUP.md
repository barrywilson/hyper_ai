# Kafka Setup Guide

This guide will help you set up and learn Apache Kafka with the Configuration Service project.

## 🎯 What You'll Learn

- **Kafka Fundamentals**: Topics, partitions, producers, consumers
- **Event-Driven Architecture**: Publishing and consuming events
- **Real-World Patterns**: Event sourcing, CQRS, CDC
- **Monitoring**: Using Kafka UI to visualize message flow
- **Production Skills**: Error handling, retries, dead letter queues

## 🚀 Quick Start

### 1. Start Kafka Services

```bash
# Start Kafka, Zookeeper, and Kafka UI
make kafka-up

# Wait for services to be ready (about 10 seconds)
```

This starts:
- **Zookeeper** on port 2181 (coordination service)
- **Kafka Broker** on ports 9092 (internal) and 9093 (external)
- **Kafka UI** on port 8090 (web interface)

### 2. Initialize Topics

```bash
# Create the initial topics
make kafka-topics
```

This creates 4 topics:
- `config-events` - Domain events (6 partitions, 30-day retention)
- `config-changes` - Change Data Capture (3 partitions, 7-day retention)
- `config-snapshots` - State snapshots (1 partition, 90-day retention, compacted)
- `config-events-dlq` - Dead Letter Queue (3 partitions, 30-day retention)

### 3. Open Kafka UI

```bash
# Open Kafka UI in your browser
make kafka-ui
```

Or visit: http://localhost:8090

## 📊 Kafka UI Features

The Kafka UI provides a visual interface to:

- **View Topics**: See all topics, partitions, and message counts
- **Browse Messages**: Search and inspect message contents
- **Monitor Consumers**: Track consumer groups and lag
- **Check Brokers**: View broker health and configuration
- **Real-Time Metrics**: See throughput and performance stats

## 🧪 Testing Kafka

### Send a Test Message

```bash
# Produce a test event to config-events topic
make kafka-produce
```

This sends a sample `config.created` event. You can view it in Kafka UI!

### Consume Messages

```bash
# Tail the config-events topic (shows all messages)
make kafka-consume
```

Press `Ctrl+C` to stop consuming.

## 📋 Available Commands

### Core Commands

```bash
make kafka-up          # Start Kafka services
make kafka-down        # Stop Kafka services
make kafka-topics      # Initialize topics
make kafka-ui          # Open Kafka UI in browser
make kafka-status      # Check Kafka health
```

### Testing Commands

```bash
make kafka-produce     # Send test message
make kafka-consume     # Tail config-events topic
make kafka-logs        # View Kafka container logs
```

### Advanced Commands

```bash
make kafka-shell       # Open Kafka container shell
make kafka-list-topics # List all topics with details
make kafka-reset       # Delete all Kafka data (⚠️ destructive)
make kafka-setup       # Full setup (start + initialize)
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Configuration Service                   │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   Frontend   │◄────────┤   Backend    │             │
│  │  (HTML/JS)   │  HTTP   │  (Express)   │             │
│  └──────────────┘         └───────┬──────┘             │
│                                    │                     │
│                            ┌───────▼──────┐             │
│                            │  MySQL DB    │             │
│                            └───────┬──────┘             │
└────────────────────────────────────┼─────────────────────┘
                                     │
                         ┌───────────▼───────────┐
                         │   Kafka Producer      │
                         │  (Future: Publish     │
                         │   config events)      │
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
                    └────────────┬────────────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Kafka Consumers    │
                      │  (Future: Cache     │
                      │   updater, audit    │
                      │   logger, etc.)     │
                      └─────────────────────┘
```

## 📚 Learning Path

### Phase 1: Kafka Basics (Current)
✅ Start Kafka cluster  
✅ Create topics  
✅ Explore Kafka UI  
✅ Send/receive test messages  

**Learn**: Topics, partitions, brokers, messages

### Phase 2: Producers (Next)
- [ ] Add KafkaJS dependency to config-service
- [ ] Create Kafka producer module
- [ ] Publish events when configs change
- [ ] See events in Kafka UI

**Learn**: Event publishing, message keys, serialization

### Phase 3: Consumers (After Producers)
- [ ] Create cache-updater consumer
- [ ] Process config events
- [ ] Update Redis cache
- [ ] Monitor consumer lag

**Learn**: Consumer groups, offset management, parallel processing

### Phase 4: Advanced Patterns
- [ ] Implement event sourcing
- [ ] Add CQRS with Redis
- [ ] Create dead letter queue handler
- [ ] Add transactions

**Learn**: Production patterns, reliability, scalability

## 🔧 Configuration

### Environment Variables

The config-service has these Kafka environment variables (in docker-compose.yml):

```yaml
KAFKA_ENABLED=false                          # Feature flag (disabled by default)
KAFKA_BROKERS=kafka:9092                     # Kafka broker address
KAFKA_CLIENT_ID=config-service               # Client identifier
KAFKA_TOPIC_CONFIG_EVENTS=config-events      # Events topic
KAFKA_TOPIC_CONFIG_CHANGES=config-changes    # CDC topic
KAFKA_TOPIC_CONFIG_SNAPSHOTS=config-snapshots # Snapshots topic
```

To enable Kafka in your application, set `KAFKA_ENABLED=true`.

### Topic Configuration

| Topic | Partitions | Retention | Purpose |
|-------|-----------|-----------|---------|
| config-events | 6 | 30 days | Domain events for config lifecycle |
| config-changes | 3 | 7 days | Change Data Capture stream |
| config-snapshots | 1 | 90 days | Periodic full snapshots (compacted) |
| config-events-dlq | 3 | 30 days | Dead Letter Queue for failed messages |

## 🐛 Troubleshooting

### Kafka Won't Start

```bash
# Check if containers are running
docker ps

# View Kafka logs
make kafka-logs

# Check Kafka status
make kafka-status
```

### Can't Connect to Kafka

```bash
# Verify Kafka is healthy
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Check if port 9093 is available
netstat -an | grep 9093
```

### Topics Not Created

```bash
# Manually run topic initialization
bash kafka-init.sh

# Or recreate topics
make kafka-topics
```

### Reset Everything

```bash
# Stop Kafka and delete all data
make kafka-reset

# Start fresh
make kafka-setup
```

## 📖 Additional Resources

### Documentation
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [KafkaJS Library](https://kafka.js.org/)
- [Confluent Platform](https://docs.confluent.io/)

### Project Documentation
- [memory/KAFKA.md](../../memory/KAFKA.md) - Comprehensive Kafka design patterns
- [memory/ARCHITECTURE.md](../../memory/ARCHITECTURE.md) - System architecture
- [memory/IMPLEMENTATION.md](../../memory/IMPLEMENTATION.md) - Implementation guide

### Patterns
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

## 🎓 Next Steps

1. **Explore Kafka UI**: Open http://localhost:8090 and familiarize yourself with the interface
2. **Send Test Messages**: Use `make kafka-produce` and watch them appear in the UI
3. **Read the Design**: Review [memory/KAFKA.md](../../memory/KAFKA.md) for implementation patterns
4. **Add Producer Code**: Start implementing Kafka producer in config-service
5. **Build Consumers**: Create consumer applications to process events

## 💡 Tips for Learning

- **Start Simple**: Get comfortable with topics and messages first
- **Use the UI**: Visual feedback helps understand concepts
- **Experiment**: Try different configurations and see what happens
- **Read Logs**: Kafka logs are very informative
- **Ask Questions**: The Kafka community is helpful

## 🎉 You're Ready!

Your Kafka environment is set up and ready for learning. Start with the basics, experiment with the UI, and gradually work through the learning phases.

**Happy Learning! 🚀**
