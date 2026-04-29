# Windows Command Reference

Quick reference for running Configuration Service commands on Windows without `make`.

## Prerequisites

- Docker Desktop installed and running
- Node.js installed
- Navigate to `ai-course/module1/` directory before running commands

## Essential Docker Commands

### Start All Services
```cmd
docker-compose up -d
```

### Start Specific Services
```cmd
# Start only Kafka
docker-compose up -d kafka

# Start only database
docker-compose up -d db

# Start backend API
docker-compose up -d config-service

# Start frontend UI
docker-compose up -d config-ui
```

### Stop Services
```cmd
# Stop all services
docker-compose down

# Stop Kafka
docker-compose stop kafka
```

### Check Status
```cmd
# List running containers
docker ps

# Check logs
docker logs kafka
docker logs config_service_dev
docker logs config_ui_dev

# Follow logs (Ctrl+C to exit)
docker logs -f kafka
```

### Clean Up
```cmd
# Stop and remove containers + volumes
docker-compose down -v

# Remove all stopped containers
docker container prune -f
```

## Kafka Commands

### Check Kafka Status
```cmd
docker exec kafka /opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### List Topics
```cmd
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
```

### Consume Messages
```cmd
docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic config-events --from-beginning
```

### Produce Test Message
```cmd
echo {"test":"message"} | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic config-events
```

## Application Commands

### Install Dependencies
```cmd
cd config-service
npm install
cd ..

cd config-ui
npm install
cd ..
```

### Start Backend (Local)
```cmd
cd config-service
npm start
```

### Start Frontend (Local)
```cmd
cd config-ui
npm start
```

### Run Tests
```cmd
cd config-service
npm test
```

## Access Points

- **Kafka**: localhost:9092
- **Frontend UI**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **MySQL**: localhost:3306

## Quick Troubleshooting

### Port Already in Use
```cmd
# Find process using port 9092
netstat -ano | findstr :9092

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Container Won't Start
```cmd
# Check logs
docker logs <container-name>

# Restart container
docker restart <container-name>

# Remove and recreate
docker-compose up -d --force-recreate <service-name>
```

### Database Connection Issues
```cmd
# Check MySQL is ready
docker exec mysql_sample mysqladmin ping -u root -proot_password

# Access MySQL shell
docker exec -it mysql_sample mysql -u root -proot_password sample_db
```

## Using Make (Optional)

If you install `make` for Windows, all Makefile commands work:

**Install via Chocolatey:**
```cmd
choco install make
```

**Install via Scoop:**
```cmd
scoop install make
```

Then use commands like:
```cmd
make kafka-up
make kafka-ui
make status
```

See `Makefile` for all available commands.
