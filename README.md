# Cool AI built API

A modern API service for managing application configurations using the **API Resolver Pattern**. Built with Node.js, Express, MySQL, and vanilla JavaScript custom elements.

## Features

- ✅ Full CRUD operations for configurations
- ✅ API Resolver Pattern (dynamic namespace/version loading)
- ✅ Web-based UI with custom elements
- ✅ Docker-based MySQL database
- ✅ Comprehensive test suite with Jest

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, Vanilla JavaScript (Custom Elements)
- **Database**: MySQL 8.0 (Docker)
- **Testing**: Jest

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose

## Installation

### 1. Clone and install

```bash
cd config-service
npm install
```

### 2. Start database

```bash
cd ..
docker-compose up -d
```

### 3. Verify database

```bash
docker exec -it mysql_sample mysql -u my_user -p sample_db -e "SELECT * FROM configurations;"
```

### 4. Configure environment

The `.env` file is already created with default values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=my_user
DB_PASSWORD=my_password
DB_NAME=sample_db
PORT=3000
```

## Usage

### Start server

```bash
npm start
```

Server runs on `http://localhost:3000`

### Development mode

```bash
npm run dev
```

### Run tests

```bash
npm test
```

## Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Restart database
docker-compose restart

# Remove database and volumes
docker-compose down -v

# Access MySQL shell
docker exec -it mysql_sample mysql -u my_user -p sample_db
```

## API Architecture: Resolver Pattern

**Single Endpoint:**
```
POST /api/resolve
```

**Request Structure:**
```json
{
  "namespace": "ai.course.config",
  "version": "v1",
  "action": "list",
  "params": {}
}
```

**Server Dynamically Loads:**
```javascript
const resolver = require(`./resolvers/${namespace}.${version}`);
const result = await resolver.resolve({ action, params });
```

### Client Usage

```javascript
// Initialize API client
const configApi = createApi({
  namespace: 'ai.course.config',
  version: 'v1',
  baseUrl: '/api'
});

// List all configurations
const configs = await configApi('list');

// Get single configuration
const config = await configApi('get', { id: 1 });

// Create configuration
const newConfig = await configApi('create', {
  key: 'app_name',
  value: 'MyApp',
  description: 'Application name'
});

// Update configuration
const updated = await configApi('update', {
  id: 1,
  value: 'UpdatedValue',
  description: 'Updated description'
});

// Delete configuration
await configApi('delete', { id: 1 });
```

## Frontend: Custom Elements

### Slot-Like Behavior

```html
<app-header>
  <div slot="title">
    <h1>Configuration Service</h1>
  </div>
  <div slot="actions">
    <a href="admin.html">⚙️ Admin Dashboard</a>
  </div>
</app-header>
```

### Conditional Rendering

```html
<!-- Read-only view -->
<config-table id="config-table" readonly></config-table>

<!-- Editable view -->
<config-table id="config-table"></config-table>
```

### Single Event Pattern

```javascript
document.addEventListener('config-action', (e) => {
  const { action, id } = e.detail;
  if (action === 'edit') editConfiguration(id);
  else if (action === 'delete') deleteConfiguration(id);
});
```

## Web Interface

- **Main Page** (`http://localhost:3000`) - Read-only configuration viewer
- **Admin Dashboard** (`http://localhost:3000/admin.html`) - Full CRUD operations

## Project Structure

```
config-service/
├── src/
│   ├── server.js              # Express server with resolver endpoint
│   ├── db.js                  # Database connection pool
│   ├── resolvers/             # API resolvers (dynamically loaded)
│   │   └── ai.course.config.v1.js
│   └── public/
│       ├── elements/          # Custom elements
│       │   ├── app-header.js
│       │   ├── app-message.js
│       │   ├── app-loading.js
│       │   └── config-table.js
│       ├── api-client.js
│       ├── index.html
│       ├── admin.html
│       └── style.css
├── templates/                 # Reusable templates & guidelines
├── tests/
│   └── config.test.js
├── package.json
├── .env
└── README.md
```

## Database Schema

```sql
CREATE TABLE configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Error Handling

- `200 OK` - Successful request
- `400 Bad Request` - Validation error or duplicate key
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

```json
{
  "error": "Configuration with key 'app_name' already exists"
}
```

## License

ISC
