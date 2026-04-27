# Configuration Service API

A RESTful API service for managing application configurations with a web-based interface. Built with Node.js, Express, and MySQL.

## Features

- ✅ Full CRUD operations for configurations
- ✅ RESTful JSON API
- ✅ Web-based user interface
- ✅ Direct SQL queries (no ORM)
- ✅ Input validation and error handling
- ✅ Comprehensive test suite with Jest
- ✅ Docker-based MySQL database

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Database**: MySQL 8.0 (Docker)
- **Testing**: Jest, Supertest

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

### 4. Run database migrations

Connect to MySQL and run the migrations:

```bash
docker exec -i mysql_sample mysql -umy_user -pmy_password sample_db < config-service/migrations.sql
```

Or use a MySQL client:

```bash
mysql -h localhost -P 3306 -u my_user -pmy_password sample_db < migrations.sql
```

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

### Run tests in watch mode

```bash
npm run test:watch
```

## API Endpoints

### Get all configurations

```http
GET /api/config
```

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "key": "app_name",
    "value": "Config Service",
    "description": "Application name",
    "created_at": "2026-04-28T07:00:00.000Z",
    "updated_at": "2026-04-28T07:00:00.000Z"
  }
]
```

### Get single configuration

```http
GET /api/config/:id
```

**Response**: `200 OK` or `404 Not Found`

```json
{
  "id": 1,
  "key": "app_name",
  "value": "Config Service",
  "description": "Application name",
  "created_at": "2026-04-28T07:00:00.000Z",
  "updated_at": "2026-04-28T07:00:00.000Z"
}
```

### Create configuration

```http
POST /api/config
Content-Type: application/json

{
  "key": "new_config",
  "value": "config_value",
  "description": "Optional description"
}
```

**Response**: `201 Created` or `400 Bad Request`

### Update configuration

```http
PUT /api/config/:id
Content-Type: application/json

{
  "key": "updated_config",
  "value": "updated_value",
  "description": "Updated description"
}
```

**Response**: `200 OK`, `400 Bad Request`, or `404 Not Found`

### Delete configuration

```http
DELETE /api/config/:id
```

**Response**: `204 No Content` or `404 Not Found`

## Web Interface

Access the web interface at `http://localhost:3000`

The interface provides:
- Form to add new configurations
- Table displaying all configurations
- Edit and delete buttons for each configuration
- Real-time feedback with success/error messages

## Project Structure

```
config-service/
├── src/
│   ├── server.js              # Express server setup
│   ├── db.js                  # Database connection pool
│   ├── routes/
│   │   └── config.js          # Configuration API routes
│   └── public/
│       ├── index.html         # Frontend HTML
│       ├── style.css          # Frontend styles
│       └── app.js             # Frontend JavaScript
├── tests/
│   └── config.test.js         # Jest API tests
├── migrations.sql             # Database schema
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Database Schema

```sql
CREATE TABLE configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation error or duplicate key
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a JSON object with an error message:

```json
{
  "error": "Configuration key already exists"
}
```

## Testing

The test suite includes:
- API endpoint tests (GET, POST, PUT, DELETE)
- Input validation tests
- Error handling tests
- Duplicate key prevention tests

Run tests with:

```bash
npm test
```

## Security Considerations

- Uses parameterized SQL queries to prevent SQL injection
- Input validation on both frontend and backend
- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- XSS prevention with HTML escaping in frontend

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Configuration versioning/history
- [ ] Bulk import/export functionality
- [ ] Search and filter capabilities
- [ ] API rate limiting
- [ ] Pagination for large datasets

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Support

For issues or questions, please open an issue in the repository.
