const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/db');

// Test configuration
let testConfigId;

// Helper function to call resolver API
const callResolver = (action, params = {}) => {
  return request(app)
    .post('/api/resolve')
    .send({
      namespace: 'ai.course.config',
      version: 'v1',
      action,
      params
    });
};

describe('Configuration API Tests (Resolver Pattern)', () => {
  
  // Clean up after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('list action', () => {
    test('should return array of configurations', async () => {
      const response = await callResolver('list')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('create action', () => {
    test('should create a new configuration', async () => {
      const newConfig = {
        key_name: 'test_key_' + Date.now(),
        value: 'test_value',
        description: 'Test description'
      };

      const response = await callResolver('create', newConfig)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.key_name).toBe(newConfig.key_name);
      expect(response.body.value).toBe(newConfig.value);
      
      testConfigId = response.body.id;
    });

    test('should validate required fields', async () => {
      const invalidConfig = {
        description: 'Missing key_name and value'
      };

      const response = await callResolver('create', invalidConfig)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should prevent duplicate keys', async () => {
      const config1 = {
        key_name: 'duplicate_test_' + Date.now(),
        value: 'value1'
      };

      // Create first config
      await callResolver('create', config1)
        .expect(200);

      // Try to create duplicate
      const response = await callResolver('create', config1)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('get action', () => {
    test('should return a single configuration', async () => {
      if (!testConfigId) {
        // Create a test config if none exists
        const newConfig = {
          key_name: 'test_single_' + Date.now(),
          value: 'test_value'
        };
        const createResponse = await callResolver('create', newConfig);
        testConfigId = createResponse.body.id;
      }

      const response = await callResolver('get', { id: testConfigId })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', testConfigId);
      expect(response.body).toHaveProperty('key_name');
      expect(response.body).toHaveProperty('value');
    });

    test('should return 404 for non-existent configuration', async () => {
      const response = await callResolver('get', { id: 999999 })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('update action', () => {
    test('should update an existing configuration', async () => {
      if (!testConfigId) {
        const newConfig = {
          key_name: 'test_update_' + Date.now(),
          value: 'original_value'
        };
        const createResponse = await callResolver('create', newConfig);
        testConfigId = createResponse.body.id;
      }

      const updatedConfig = {
        id: testConfigId,
        value: 'updated_value',
        description: 'Updated description'
      };

      const response = await callResolver('update', updatedConfig)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.value).toBe(updatedConfig.value);
      expect(response.body.description).toBe(updatedConfig.description);
    });

    test('should return 404 for non-existent configuration', async () => {
      const updatedConfig = {
        id: 999999,
        value: 'test_value'
      };

      const response = await callResolver('update', updatedConfig)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate required fields on update', async () => {
      if (!testConfigId) {
        const newConfig = {
          key_name: 'test_validate_' + Date.now(),
          value: 'test_value'
        };
        const createResponse = await callResolver('create', newConfig);
        testConfigId = createResponse.body.id;
      }

      const invalidUpdate = {
        id: testConfigId,
        description: 'Missing value'
      };

      const response = await callResolver('update', invalidUpdate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('delete action', () => {
    test('should delete an existing configuration', async () => {
      // Create a config to delete
      const newConfig = {
        key_name: 'test_delete_' + Date.now(),
        value: 'to_be_deleted'
      };
      const createResponse = await callResolver('create', newConfig);
      const deleteId = createResponse.body.id;

      // Delete it
      await callResolver('delete', { id: deleteId })
        .expect(200);

      // Verify it's gone
      await callResolver('get', { id: deleteId })
        .expect(404);
    });

    test('should return 404 for non-existent configuration', async () => {
      const response = await callResolver('delete', { id: 999999 })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('resolver pattern validation', () => {
    test('should return 400 for invalid action', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .send({
          namespace: 'ai.course.config',
          version: 'v1',
          action: 'invalid_action',
          params: {}
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 404 for invalid namespace', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .send({
          namespace: 'invalid.namespace',
          version: 'v1',
          action: 'list',
          params: {}
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 404 for invalid version', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .send({
          namespace: 'ai.course.config',
          version: 'v999',
          action: 'list',
          params: {}
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
