# Web API Implementation Plan

## Phase 1: Project Setup and Database Schema

### 1.1 Create Project Structure
- Create `config-service/` directory
- Initialize npm project with `package.json`
- Create folder structure:
  - `src/` - Source code
  - `src/routes/` - API routes
  - `src/public/` - Frontend files
  - `tests/` - Test files

### 1.2 Install Dependencies
```bash
npm install express mysql2 dotenv cors
npm install --save-dev jest
```

### 1.3 Create Environment Configuration
- Create `.env` file with database credentials
- Add `.env` to `.gitignore`

### 1.4 Database Schema Setup
- Create SQL migration file for `configurations` table
- Add table creation to `init.sql` or create separate migration
- Table structure:
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

## Phase 2: Backend Implementation

### 2.1 Database Connection (`src/db.js`)
- Import mysql2/promise
- Create connection pool
- Export pool for use in routes
- Include error handling for connection failures

### 2.2 Configuration Routes (`src/routes/config.js`)
Implement the following endpoints:

**GET /api/config**
- Query all configurations from database
- Return JSON array
- Handle empty results

**GET /api/config/:id**
- Query single configuration by ID
- Return 404 if not found
- Return JSON object

**POST /api/config**
- Validate required fields (key, value)
- Check for duplicate keys
- Insert into database
- Return created configuration with 201 status

**PUT /api/config/:id**
- Validate ID exists
- Update configuration fields
- Return updated configuration
- Handle not found scenario

**DELETE /api/config/:id**
- Validate ID exists
- Delete from database
- Return 204 status on success
- Handle not found scenario

### 2.3 Main Server (`src/server.js`)
- Import express and dependencies
- Configure middleware (express.json, cors)
- Serve static files from public directory
- Mount configuration routes
- Add error handling middleware
- Start server on port 3000 (or from env)
- Export app for testing

### 2.4 Error Handling
- Create consistent error response format
- Handle database errors gracefully
- Return appropriate HTTP status codes:
  - 200: Success
  - 201: Created
  - 204: No Content (delete)
  - 400: Bad Request (validation)
  - 404: Not Found
  - 500: Server Error

## Phase 3: Frontend Implementation

### 3.1 HTML Structure (`src/public/index.html`)
- Create semantic HTML structure
- Form for adding/editing configurations:
  - Input for key
  - Textarea for value
  - Input for description
  - Submit button
- Table for displaying configurations:
  - Columns: ID, Key, Value, Description, Actions
  - Edit and Delete buttons for each row
- Link CSS and JavaScript files

### 3.2 Styling (`src/public/style.css`)
- Basic responsive layout
- Form styling
- Table styling with hover effects
- Button styles (primary, danger)
- Loading and error states
- Mobile-friendly design

### 3.3 Frontend Logic (`src/public/app.js`)
Implement the following functions:

**fetchConfigurations()**
- GET request to /api/config
- Populate table with results
- Handle empty state
- Show error messages

**createConfiguration(formData)**
- POST request to /api/config
- Validate form inputs
- Clear form on success
- Refresh configuration list

**updateConfiguration(id, formData)**
- PUT request to /api/config/:id
- Update table row
- Show success message

**deleteConfiguration(id)**
- Confirm deletion with user
- DELETE request to /api/config/:id
- Remove row from table
- Show success message

**Event Listeners**
- Form submit handler
- Edit button handlers
- Delete button handlers
- Page load initialization

## Phase 4: Testing

### 4.1 Test Setup (`tests/config.test.js`)
- Configure Jest for Node.js
- Set up test database or mocking
- Import app and supertest

### 4.2 API Tests
Test each endpoint:
- GET /api/config - returns array
- GET /api/config/:id - returns single item
- GET /api/config/:id - returns 404 for invalid ID
- POST /api/config - creates new configuration
- POST /api/config - validates required fields
- POST /api/config - prevents duplicate keys
- PUT /api/config/:id - updates configuration
- PUT /api/config/:id - returns 404 for invalid ID
- DELETE /api/config/:id - deletes configuration
- DELETE /api/config/:id - returns 404 for invalid ID

### 4.3 Package.json Scripts
Add test scripts:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Phase 5: Documentation and Finalization

### 5.1 README.md
Create comprehensive documentation:
- Project description
- Prerequisites
- Installation steps
- Database setup instructions
- Running the application
- API endpoint documentation
- Testing instructions
- Project structure overview

### 5.2 Code Review Checklist
- [ ] All endpoints working correctly
- [ ] Error handling implemented
- [ ] Input validation in place
- [ ] Frontend CRUD operations functional
- [ ] Tests passing
- [ ] Code is clean and commented
- [ ] No hardcoded credentials
- [ ] README is complete

### 5.3 Final Testing
- Start MySQL container
- Run database migrations
- Start the server
- Test all CRUD operations via frontend
- Run Jest test suite
- Verify error scenarios

## Implementation Order

1. **Setup** (Phase 1): ~15 minutes
   - Create folders, initialize npm, install dependencies
   - Set up environment variables
   - Create database schema

2. **Backend** (Phase 2): ~30 minutes
   - Database connection
   - API routes implementation
   - Server setup with middleware

3. **Frontend** (Phase 3): ~30 minutes
   - HTML structure
   - CSS styling
   - JavaScript functionality

4. **Testing** (Phase 4): ~20 minutes
   - Write Jest tests
   - Run and verify tests

5. **Documentation** (Phase 5): ~10 minutes
   - Write README
   - Final review and testing

**Total Estimated Time**: ~1.5-2 hours

## Key Considerations

- **Database Connection**: Ensure MySQL container is running before starting the service
- **CORS**: Enable CORS to allow frontend-backend communication
- **Error Messages**: Provide clear, user-friendly error messages
- **Validation**: Validate all inputs on both frontend and backend
- **Security**: Use parameterized queries to prevent SQL injection
- **Code Organization**: Keep code modular and maintainable
- **Testing**: Write tests as you build, not after

## Success Metrics

- ✅ All API endpoints return correct responses
- ✅ Frontend can perform all CRUD operations
- ✅ Tests achieve >80% code coverage
- ✅ No console errors in browser or server
- ✅ Clean, readable code with proper error handling
- ✅ Documentation is clear and complete
