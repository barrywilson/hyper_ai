# Cool AI built API

A modern, elegant API service for managing application configurations using the **API Resolver Pattern**. Built with Node.js, Express, MySQL, and vanilla JavaScript custom elements and to top it off leveraging containerisation to run mysql, node in containers.  This makes testing so much easier, integration, social tests are a no brainer when setup is ephemeral.

## ✨ Elegant Architecture Highlights

- 🎯 **API Resolver Pattern** - Dynamic, scalable server-side routing
- 🧩 **Custom Elements** - Reusable web components without frameworks
- 🎨 **Slot-Like Behavior** - Flexible content injection without Shadow DOM
- 🔄 **Conditional Rendering** - Single component, multiple modes
- 📝 **Inline Scripts** - Simple pages, co-located logic
- 🎭 **Single Event Pattern** - Clean, scalable event handling
- 🚀 **Zero Dependencies** - Pure vanilla JavaScript on frontend
- 📦 **Minimal Code** - ~40 lines per component, maximum clarity
- 📦 **Containers** - woop woop cool no mess.
## Features

- ✅ Full CRUD operations for configurations
- ✅ API Resolver Pattern (dynamic namespace/version loading)
- ✅ Web-based user interface with custom elements
- ✅ Read-only and editable views (same components)
- ✅ Direct SQL queries (no ORM)
- ✅ Input validation and error handling
- ✅ Comprehensive test suite with Jest
- ✅ Docker-based MySQL database (ephemeral for tests)
- ✅ Reusable component templates and guidelines

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, Vanilla JavaScript (Custom Elements)
- **Database**: MySQL 8.0 (Docker)
- **Testing**: Jest, Supertest
- **Architecture**: API Resolver Pattern

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd config-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Make sure Docker is running, then start the MySQL container from the parent directory:

```bash
cd ..
docker-compose up -d
```

### 4. Verify database data

To test that the database is set up correctly and contains the expected data, run this command:

```bash
docker exec -it mysql_sample mysql -u my_user -p sample_db -e "SELECT * FROM configurations;"

```
Enter the password when prompted.

```bash
For testing
docker compose down -v
docker compose up -d
```
You should see output showing the sample configurations (app_name, max_connections, debug_mode).

### 5. Configure environment variables

The `.env` file is already created with default values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=my_user
DB_PASSWORD=my_password
DB_NAME=sample_db
PORT=3000
```

Modify if needed for your environment.

## Usage

### Start the server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Development mode (with auto-reload)

```bash
npm run dev
```

### Run tests

```bash
npm test
```

Tests use the ephemeral database - no mocking needed!

### Run tests in watch mode

```bash
npm run test:watch
```

## Docker Commands

### Start the MySQL database

```bash
docker-compose up -d
```

### Stop the MySQL database

```bash
docker-compose down
```

### View database logs

```bash
docker-compose logs
```

### Restart the database

```bash
docker-compose restart
```

### Remove database and volumes (⚠️ This deletes all data)

```bash
docker-compose down -v
```

### Access MySQL shell inside container

```bash
docker exec -it mysql_sample mysql -u my_user -p sample_db
```

Enter the password when prompted (default: `my_password`).

## API Architecture: Resolver Pattern

### Why Resolver Pattern?

Traditional REST APIs require server changes for every new endpoint. The resolver pattern uses **dynamic loading** - add new features without touching the server!

### How It Works

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
// Server loads: ./resolvers/ai.course.config.v1.js
const resolver = require(`./resolvers/${namespace}.${version}`);
const result = await resolver.resolve({ action, params });
```

### Client Usage

**Initialize API Client:**
```javascript
const configApi = createApi({
  namespace: 'ai.course.config',
  version: 'v1',
  baseUrl: '/api'
});
```

**Make Calls:**
```javascript
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

### Benefits

✅ **Scalable** - Add new namespaces/versions without server changes
✅ **Versioned** - Multiple API versions coexist
✅ **Dynamic** - Resolvers loaded on-demand
✅ **Testable** - Easy to test in isolation
✅ **Maintainable** - Clear separation of concerns

## Frontend Architecture: Custom Elements

### Elegant Patterns

#### 1. Slot-Like Behavior
Reusable components with flexible content injection:

```html
<!-- Same component, different content -->
<app-header>
  <div slot="title">
    <h1>Configuration Service</h1>
    <p>View configurations</p>
  </div>
  <div slot="actions">
    <a href="admin.html">⚙️ Admin Dashboard</a>
  </div>
</app-header>

<app-header>
  <div slot="title">
    <h1>⚙️ Admin Dashboard</h1>
    <p>Configuration Management</p>
  </div>
  <div slot="actions">
    <a href="index.html">← Back to App</a>
  </div>
</app-header>
```

#### 2. Conditional Rendering
Single component, multiple modes:

```html
<!-- Read-only view (index.html) -->
<config-table id="config-table" readonly></config-table>

<!-- Editable view (admin.html) -->
<config-table id="config-table"></config-table>
```

#### 3. Inline Scripts
Simple pages don't need separate files:

```html
<script>
  // ~50 lines of simple logic inline
  const configApi = createApi({
    namespace: 'ai.course.config',
    version: 'v1',
    baseUrl: '/api'
  });
  
  const configTable = document.getElementById('config-table');
  
  document.addEventListener('DOMContentLoaded', async () => {
    const configurations = await configApi('list');
    configTable.data = configurations;
  });
</script>
```

#### 4. Single Event Pattern
One event, multiple actions:

```javascript
document.addEventListener('config-action', (e) => {
  const { action, id } = e.detail;
  if (action === 'edit') editConfiguration(id);
  else if (action === 'delete') deleteConfiguration(id);
});
```

### Custom Elements

#### app-header.js (~40 lines)
Reusable header with slot-like behavior. Used on both pages with different content.

#### app-message.js (~35 lines)
Message display component with auto-hide for success messages.

#### app-loading.js (~25 lines)
Simple loading indicator with show/hide methods.

#### config-table.js (~75 lines)
Data table with conditional rendering for readonly mode.

**Features:**
- Single component for both views
- Attribute-based configuration (`readonly`)
- Conditional event listeners
- Used on index.html (readonly) and admin.html (editable)

## Web Interface

### Main Page (index.html)
**Read-only view** - Simple configuration viewer

- View all configurations in a table
- No edit/delete buttons (readonly mode)
- Link to admin dashboard
- Inline script (~50 lines)

Access at: `http://localhost:3000`

### Admin Dashboard (admin.html)
**Full management interface** - Complete CRUD operations

- View all configurations
- Search/filter functionality
- Add new configurations (modal dialog)
- Edit existing configurations
- Delete configurations
- Statistics dashboard
- Inline script (~150 lines)

Access at: `http://localhost:3000/admin.html`

## Project Structure

```
config-service/
├── src/
│   ├── server.js              # Express server with resolver endpoint
│   ├── db.js                  # Database connection pool
│   ├── resolvers/             # API resolvers (dynamically loaded)
│   │   └── ai.course.config.v1.js  # Configuration CRUD (~150 lines)
│   └── public/
│       ├── elements/          # Custom elements
│       │   ├── app-header.js  # Reusable header (~40 lines)
│       │   ├── app-message.js # Message display (~35 lines)
│       │   ├── app-loading.js # Loading indicator (~25 lines)
│       │   └── config-table.js # Data table (~75 lines)
│       ├── api-client.js      # Universal API client (~55 lines)
│       ├── index.html         # Main page (with inline script)
│       ├── admin.html         # Admin page (with inline script)
│       └── style.css          # Unified styles
├── templates/                 # Reusable templates & guidelines
│   ├── CUSTOM_ELEMENT_TEMPLATE.md
│   ├── API_RESOLVER_TEMPLATE.md
│   ├── CODING_GUIDELINES.md
│   └── README.md
├── tests/
│   └── config.test.js         # Jest API tests (resolver pattern)
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
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

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Validation error or duplicate key
- `404 Not Found` - Resource not found or invalid namespace/version
- `500 Internal Server Error` - Server error

Error responses include a JSON object with an error message:

```json
{
  "error": "Configuration with key 'app_name' already exists"
}
```

## Testing

The test suite includes:
- Resolver pattern API tests (list, create, get, update, delete)
- Input validation tests
- Error handling tests
- Duplicate key prevention tests
- Invalid namespace/version/action tests

**No mocking needed** - tests use the ephemeral database!

Run tests with:

```bash
npm test
```

## Templates & Guidelines

The `templates/` directory contains comprehensive documentation:

### [CUSTOM_ELEMENT_TEMPLATE.md](./templates/CUSTOM_ELEMENT_TEMPLATE.md)
- Basic custom element pattern
- Slot-like behavior pattern
- Conditional rendering pattern
- Page organization guidelines
- Real examples from the project

### [API_RESOLVER_TEMPLATE.md](./templates/API_RESOLVER_TEMPLATE.md)
- Resolver pattern template
- CRUD operations
- Validation and error handling
- Database integration

### [CODING_GUIDELINES.md](./templates/CODING_GUIDELINES.md)
- Code style and patterns
- Architecture principles
- File organization
- Security best practices
- Elegant code examples

### [templates/README.md](./templates/README.md)
- Quick start guides
- Architecture overview
- Benefits and philosophy
- Version history

## Security Considerations

- Uses parameterized SQL queries to prevent SQL injection
- Input validation on both frontend and backend
- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- XSS prevention with HTML escaping in frontend
- No inline event handlers (uses data attributes)

## Key Principles

1. **Simplicity** - Minimal code, maximum clarity
2. **Reusability** - One component, multiple uses
3. **Flexibility** - Slots for content injection
4. **Modularity** - Conditional rendering for modes
5. **Pragmatism** - Inline scripts when appropriate
6. **Elegance** - Clean, readable, maintainable
7. **Scalability** - Resolver pattern for growth
8. **Testability** - Easy to test without mocks

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Configuration versioning/history
- [ ] Bulk import/export functionality
- [ ] Search and filter capabilities (partially implemented)
- [ ] API rate limiting
- [ ] Pagination for large datasets
- [ ] Additional resolvers for other resources
- [ ] WebSocket support for real-time updates

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding guidelines in `templates/`
4. Use the templates for new components/resolvers
5. Write/update tests
6. Submit a pull request

**Remember:** The best code is no code. The second best is simple, elegant code.

## Support

For issues or questions, please open an issue in the repository.

---

**Look at the elegance of this code and follow these patterns!**
