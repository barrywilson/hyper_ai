const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/db');

// Test configuration
let testConfigId;

describe('Configuration API Tests', () => {
  
  // Clean up test data before all tests
  beforeAll(async () => {
    // Create test table if needed
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  });

  // Clean up after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/config', () => {
    test('should return array of configurations', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/config', () => {
    test('should create a new configuration', async () => {
      const newConfig = {
        key: 'test_key_' + Date.now(),
        value: 'test_value',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/config')
        .send(newConfig)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.key).toBe(newConfig.key);
      expect(response.body.value).toBe(newConfig.value);
      
      testConfigId = response.body.id;
    });

    test('should validate required fields', async () => {
      const invalidConfig = {
        description: 'Missing key and value'
      };

      const response = await request(app)
        .post('/api/config')
        .send(invalidConfig)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should prevent duplicate keys', async () => {
      const config1 = {
        key: 'duplicate_test_' + Date.now(),
        value: 'value1'
      };

      // Create first config
      await request(app)
        .post('/api/config')
        .send(config1)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/config')
        .send(config1)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/config/:id', () => {
    test('should return a single configuration', async () => {
      if (!testConfigId) {
        // Create a test config if none exists
        const newConfig = {
          key: 'test_single_' + Date.now(),
          value: 'test_value'
        };
        const createResponse = await request(app)
          .post('/api/config')
          .send(newConfig);
        testConfigId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/config/${testConfigId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', testConfigId);
      expect(response.body).toHaveProperty('key');
      expect(response.body).toHaveProperty('value');
    });

    test('should return 404 for non-existent configuration', async () => {
      const response = await request(app)
        .get('/api/config/999999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/config/:id', () => {
    test('should update an existing configuration', async () => {
      if (!testConfigId) {
        const newConfig = {
          key: 'test_update_' + Date.now(),
          value: 'original_value'
        };
        const createResponse = await request(app)
          .post('/api/config')
          .send(newConfig);
        testConfigId = createResponse.body.id;
      }

      const updatedConfig = {
        key: 'updated_key_' + Date.now(),
        value: 'updated_value',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/config/${testConfigId}`)
        .send(updatedConfig)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.value).toBe(updatedConfig.value);
      expect(response.body.description).toBe(updatedConfig.description);
    });

    test('should return 404 for non-existent configuration', async () => {
      const updatedConfig = {
        key: 'test_key',
        value: 'test_value'
      };

      const response = await request(app)
        .put('/api/config/999999')
        .send(updatedConfig)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate required fields on update', async () => {
      if (!testConfigId) {
        const newConfig = {
          key: 'test_validate_' + Date.now(),
          value: 'test_value'
        };
        const createResponse = await request(app)
          .post('/api/config')
          .send(newConfig);
        testConfigId = createResponse.body.id;
      }

      const invalidUpdate = {
        description: 'Missing key and value'
      };

      const response = await request(app)
        .put(`/api/config/${testConfigId}`)
        .send(invalidUpdate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/config/:id', () => {
    test('should delete an existing configuration', async () => {
      // Create a config to delete
      const newConfig = {
        key: 'test_delete_' + Date.now(),
        value: 'to_be_deleted'
      };
      const createResponse = await request(app)
        .post('/api/config')
        .send(newConfig);
      const deleteId = createResponse.body.id;

      // Delete it
      await request(app)
        .delete(`/api/config/${deleteId}`)
        .expect(204);

      // Verify it's gone
      await request(app)
        .get(`/api/config/${deleteId}`)
        .expect(404);
    });

    test('should return 404 for non-existent configuration', async () => {
      const response = await request(app)
        .delete('/api/config/999999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
