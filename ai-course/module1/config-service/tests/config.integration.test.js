/**
 * Integration Tests for Configuration Service
 * 
 * Tests the API using api-client.js against the running Docker server
 * No server imports - pure integration testing
 */

const createApi = require('../src/public/api-client');
const pool = require('../src/db');

// Polyfill fetch for Node.js
global.fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Initialize API client
const configApi = createApi({
  namespace: 'ai.course.config',
  version: 'v1',
  baseUrl: API_BASE_URL
});

// Test data
let testConfigId;

describe('Configuration Service Integration Tests', () => {
  
  // Clean up after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('List Configurations', () => {
    test('should list all configurations', async () => {
      const configs = await configApi('list');
      
      expect(Array.isArray(configs)).toBe(true);
      expect(configs.length).toBeGreaterThanOrEqual(0);
      
      if (configs.length > 0) {
        expect(configs[0]).toHaveProperty('id');
        expect(configs[0]).toHaveProperty('key');
        expect(configs[0]).toHaveProperty('value');
      }
    });
  });

  describe('Create Configuration', () => {
    test('should create a new configuration', async () => {

      const newConfig = {
        key: 'test_integration_' + Date.now(),
        value: 'test_value',
        description: 'Integration test configuration'
      };

      const created = await configApi('create', newConfig);
      
      expect(created).toHaveProperty('id');
      expect(created.key).toBe(newConfig.key);
      expect(created.value).toBe(newConfig.value);
      expect(created.description).toBe(newConfig.description);
      
      testConfigId = created.id;
    });

    test('should validate required fields', async () => {
      const invalidConfig = {
        description: 'Missing key and value'
      };

      await expect(configApi('create', invalidConfig))
        .rejects
        .toThrow(/key and value are required/);
    });

    test('should prevent duplicate keys', async () => {
      const config = {
        key: 'duplicate_integration_' + Date.now(),
        value: 'value1'
      };

      // Create first config
      await configApi('create', config);

      // Try to create duplicate
      await expect(configApi('create', config))
        .rejects
        .toThrow(/already exists/);
    });
  });

  describe('Get Configuration', () => {
    test('should get a single configuration by ID', async () => {
      if (!testConfigId) {
        const newConfig = {
          key: 'test_get_' + Date.now(),
          value: 'test_value'
        };
        const created = await configApi('create', newConfig);
        testConfigId = created.id;
      }

      const config = await configApi('get', { id: testConfigId });
      
      expect(config).toHaveProperty('id', testConfigId);
      expect(config).toHaveProperty('key');
      expect(config).toHaveProperty('value');
      expect(config).toHaveProperty('created_at');
      expect(config).toHaveProperty('updated_at');
    });

    test('should return error for non-existent configuration', async () => {
      await expect(configApi('get', { id: 999999 }))
        .rejects
        .toThrow(/not found/);
    });
  });

  describe('Update Configuration', () => {
    test('should update an existing configuration', async () => {
      if (!testConfigId) {
        const newConfig = {
          key: 'test_update_' + Date.now(),
          value: 'original_value'
        };
        const created = await configApi('create', newConfig);
        testConfigId = created.id;
      }

      const updates = {
        id: testConfigId,
        value: 'updated_value',
        description: 'Updated via integration test'
      };

      const updated = await configApi('update', updates);
      
      expect(updated.id).toBe(testConfigId);
      expect(updated.value).toBe(updates.value);
      expect(updated.description).toBe(updates.description);
    });

    test('should return error for non-existent configuration', async () => {
      await expect(configApi('update', {
        id: 999999,
        value: 'test'
      }))
        .rejects
        .toThrow(/not found/);
    });

    test('should validate required fields on update', async () => {
      if (!testConfigId) {
        const newConfig = {
          key: 'test_validate_update_' + Date.now(),
          value: 'test_value'
        };
        const created = await configApi('create', newConfig);
        testConfigId = created.id;
      }

      await expect(configApi('update', {
        id: testConfigId,
        description: 'Missing value'
      }))
        .rejects
        .toThrow();
    });
  });

  describe('Delete Configuration', () => {
    test('should delete an existing configuration', async () => {
      // Create a config to delete
      const newConfig = {
        key: 'test_delete_' + Date.now(),
        value: 'to_be_deleted'
      };
      const created = await configApi('create', newConfig);
      const deleteId = created.id;

      // Delete it
      const result = await configApi('delete', { id: deleteId });
      expect(result).toBeNull(); // 204 returns null

      // Verify it's gone
      await expect(configApi('get', { id: deleteId }))
        .rejects
        .toThrow(/not found/);
    });

    test('should return error for non-existent configuration', async () => {
      await expect(configApi('delete', { id: 999999 }))
        .rejects
        .toThrow(/not found/);
    });
  });

  describe('API Resolver Pattern', () => {
    test('should handle invalid action', async () => {
      const invalidApi = createApi({
        namespace: 'ai.course.config',
        version: 'v1',
        baseUrl: API_BASE_URL
      });

      await expect(invalidApi('invalid_action', {}))
        .rejects
        .toThrow(/Unknown action/);
    });

    test('should handle invalid namespace', async () => {
      const invalidApi = createApi({
        namespace: 'invalid.namespace',
        version: 'v1',
        baseUrl: API_BASE_URL
      });

      await expect(invalidApi('list'))
        .rejects
        .toThrow();
    });

    test('should handle invalid version', async () => {
      const invalidApi = createApi({
        namespace: 'ai.course.config',
        version: 'v999',
        baseUrl: API_BASE_URL
      });

      await expect(invalidApi('list'))
        .rejects
        .toThrow();
    });
  });

  describe('End-to-End Workflow', () => {
    test('should complete full CRUD cycle', async () => {
      const timestamp = Date.now();
      
      // 1. Create
      const createData = {
        key: `e2e_test_${timestamp}`,
        value: 'initial_value',
        description: 'E2E test config'
      };
      const created = await configApi('create', createData);
      expect(created.key).toBe(createData.key);
      const configId = created.id;

      // 2. Read (Get)
      const fetched = await configApi('get', { id: configId });
      expect(fetched.id).toBe(configId);
      expect(fetched.value).toBe('initial_value');

      // 3. Update
      const updated = await configApi('update', {
        id: configId,
        value: 'updated_value',
        description: 'Updated description'
      });
      expect(updated.value).toBe('updated_value');

      // 4. Read (List) - verify it's in the list
      const allConfigs = await configApi('list');
      const foundInList = allConfigs.find(c => c.id === configId);
      expect(foundInList).toBeDefined();
      expect(foundInList.value).toBe('updated_value');

      // 5. Delete
      await configApi('delete', { id: configId });

      // 6. Verify deletion
      await expect(configApi('get', { id: configId }))
        .rejects
        .toThrow(/not found/);
    });
  });
});
