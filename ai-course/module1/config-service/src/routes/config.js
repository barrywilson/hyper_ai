const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/config - Get all configurations
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configurations ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

// GET /api/config/:id - Get single configuration by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// POST /api/config - Create new configuration
router.post('/', async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    // Validate required fields
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    // Insert new configuration
    const [result] = await pool.query(
      'INSERT INTO configurations (key_name, value, description) VALUES (?, ?, ?)',
      [key, value, description || null]
    );
    
    // Fetch the created configuration
    const [rows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating configuration:', error);
    
    // Handle duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Configuration key already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

// PUT /api/config/:id - Update configuration
router.put('/:id', async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const { id } = req.params;
    
    // Validate required fields
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    // Check if configuration exists
    const [existing] = await pool.query('SELECT * FROM configurations WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    // Update configuration
    await pool.query(
      'UPDATE configurations SET key_name = ?, value = ?, description = ? WHERE id = ?',
      [key, value, description || null, id]
    );
    
    // Fetch updated configuration
    const [rows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [id]);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating configuration:', error);
    
    // Handle duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Configuration key already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// DELETE /api/config/:id - Delete configuration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if configuration exists
    const [existing] = await pool.query('SELECT * FROM configurations WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    // Delete configuration
    await pool.query('DELETE FROM configurations WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

module.exports = router;
