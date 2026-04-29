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
# Start only Kafka stack
docker-compose up -d zookeeper kafka kafka-ui

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

# Stop specific services
docker-compose stop kafka kafka-ui zookeeper
```

### Check Status
```cmd
# List running containers
docker ps

# Check logs
docker logs kafka-ui
docker logs kafka
docker logs config_service_dev
docker logs config_ui_dev

# Follow logs (Ctrl+C to exit)
docker logs -f kafka-ui
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
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

### List Topics
```cmd
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Consume Messages
```cmd
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic config-events --from-beginning
```

### Produce Test Message
```cmd
echo {"test":"message"} | docker exec -i kafka kafka-console-producer --bootstrap-server localhost:9092 --topic config-events
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

- **Kafka UI**: http://localhost:8090
- **Frontend UI**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **MySQL**: localhost:3306

## Quick Troubleshooting

### Port Already in Use
```cmd
# Find process using port 8090
netstat -ano | findstr :8090

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
