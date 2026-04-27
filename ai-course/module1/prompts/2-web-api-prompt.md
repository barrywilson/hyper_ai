# Web API Implementation Prompt

## Project Overview
Create a configuration service API that provides a RESTful interface for managing configuration data. This service will serve as a backend API for storing and retrieving configuration settings.

## Technical Stack
- **Backend**: Node.js
- **Frontend**: HTML, CSS, JavaScript
- **API Format**: JSON (request and response)
- **Database**: MySQL 8.0 (running in Docker container)
- **Database Access**: Direct SQL queries
- **Testing**: Jest

## Database Configuration
The MySQL database is already set up with the following details:
- **Container Name**: mysql_sample
- **Database Name**: sample_db
- **Host**: localhost
- **Port**: 3306
- **User**: my_user
- **Password**: my_password
- **Root Password**: root_password

Current schema includes a `users` table with sample data.

## Requirements

### 1. Backend API Service
Create a Node.js backend service that:
- Provides RESTful JSON APIs
- Connects to the MySQL database using direct SQL queries
- Implements CRUD operations for configuration management
- Follows REST best practices
- Includes proper error handling
- Uses minimal dependencies (keep it simple)

### 2. API Endpoints
Design and implement endpoints for:
- **GET /api/config** - Retrieve all configurations
- **GET /api/config/:id** - Retrieve a specific configuration by ID
- **POST /api/config** - Create a new configuration
- **PUT /api/config/:id** - Update an existing configuration
- **DELETE /api/config/:id** - Delete a configuration

### 3. Database Schema
Create a `configurations` table with appropriate fields:
- `id` (primary key, auto-increment)
- `key` (unique configuration key/name)
- `value` (configuration value)
- `description` (optional description)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 4. Frontend Interface
Create a simple web interface that:
- Displays all configurations in a table
- Allows creating new configurations via a form
- Enables editing existing configurations
- Provides delete functionality
- Uses vanilla JavaScript (no frameworks)
- Communicates with the backend via fetch API

### 5. Testing
Implement Jest tests for:
- API endpoint functionality
- Database operations
- Error handling scenarios
- Input validation

## Project Structure
```
config-service/
├── src/
│   ├── server.js          # Main server file
│   ├── db.js              # Database connection
│   ├── routes/
│   │   └── config.js      # Configuration routes
│   └── public/
│       ├── index.html     # Frontend interface
│       ├── style.css      # Styling
│       └── app.js         # Frontend JavaScript
├── tests/
│   └── config.test.js     # Jest tests
├── package.json
└── README.md
```

## Implementation Guidelines
1. **Keep it simple**: Use minimal dependencies, avoid over-engineering
2. **Direct SQL**: Use mysql2 package for direct SQL queries (no ORM)
3. **Error handling**: Implement proper try-catch blocks and return appropriate HTTP status codes
4. **Validation**: Validate input data before database operations
5. **CORS**: Enable CORS for frontend-backend communication
6. **Environment variables**: Use .env file for database credentials
7. **Documentation**: Include clear README with setup and usage instructions

## Dependencies to Install
- express (web framework)
- mysql2 (MySQL client)
- dotenv (environment variables)
- cors (CORS middleware)
- jest (testing framework) - dev dependency

## Success Criteria
- API endpoints respond with proper JSON format
- Database operations work correctly
- Frontend can perform all CRUD operations
- Tests pass successfully
- Code is clean and well-organized
- README provides clear setup instructions

## Notes
- Do not add extra dependencies without approval
- Ask questions if requirements are unclear
- Follow the existing project conventions in AGENTS.md
- Keep the file/folder structure basic and organized
