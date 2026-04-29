# Kafka - Simple Training Setup

**Minimal Kafka for learning - no bloat.**

## What You Have

✅ **1 Kafka container** (KRaft mode - no ZooKeeper)  
✅ **Auto-create topics** (no init scripts needed)  
✅ **localhost:9092** (one port to remember)

## Start Kafka

```bash
docker-compose up -d kafka
```

Wait 5 seconds, then you're ready.

## Test It Works

### Inside Container
```bash
docker exec -it kafka bash
cd /opt/kafka/bin
```

### Create Topic (optional - auto-creates anyway)
```bash
/opt/kafka/bin/kafka-topics.sh --create \
  --topic test \
  --bootstrap-server localhost:9092
```

### Produce Messages
```bash
/opt/kafka/bin/kafka-console-producer.sh \
  --topic test \
  --bootstrap-server localhost:9092
```
Type messages, press Enter. Ctrl+C to exit.

### Consume Messages
```bash
/opt/kafka/bin/kafka-console-consumer.sh \
  --topic test \
  --from-beginning \
  --bootstrap-server localhost:9092
```

## Node.js Connection

### When Node runs OUTSIDE container (localhost):
```javascript
const kafka = new Kafka({
  brokers: ['localhost:9092']
});
```

### When Node runs INSIDE another container:
```javascript
const kafka = new Kafka({
  brokers: ['kafka:9092']  // Use service name
});
```

## Mental Model

```
Node.js Producer/Consumer  →  Kafka (1 container)  →  Topics
```

That's it. Everything you need to learn Kafka.

## What's NOT Here (Intentionally)

❌ ZooKeeper (old Kafka only)  
❌ Multiple brokers (cluster)  
❌ Replication configs  
❌ Schema Registry  
❌ Kafka Connect  
❌ Security (SASL/SSL)  
❌ Kubernetes  
❌ Kafka UI (use CLI tools)

**Why?** You don't need them for learning. Add complexity later when you actually need it.

## Common Commands

```bash
# List topics
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

# Describe topic
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic test

# Delete topic
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic test

# Check Kafka health
docker exec kafka /opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# View logs
docker logs -f kafka
```

## Stop Kafka

```bash
docker-compose stop kafka
```

## Reset Everything

```bash
docker-compose down kafka
```

Data is ephemeral - perfect for learning.

## Next Steps

1. Start Kafka
2. Create 1 topic
3. Write 1 Node consumer
4. Write 1 Node producer
5. Send messages

Then expand from there. Keep it simple.
