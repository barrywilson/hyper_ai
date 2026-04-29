const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database connection
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://config-ui:8080'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Routes

// GET /api/configurations - List all configurations
app.get('/api/configurations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configurations ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/configurations/:id - Get a single configuration
app.get('/api/configurations/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/configurations - Create a new configuration
app.post('/api/configurations', async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'key and value are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO configurations (`key`, value, description) VALUES (?, ?, ?)',
      [key, value, description || null]
    );
    
    const [createdRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [result.insertId]);
    res.status(201).json(createdRows[0]);
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: `Configuration with key '${req.body.key}' already exists` });
    }
    console.error('Error creating configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/configurations/:id - Update a configuration
app.put('/api/configurations/:id', async (req, res) => {
  try {
    const { value, description } = req.body;
    // console.log(`Updating configuration id=${req.params.id} with value=${value} and description=${description}`);
    
    const [existingRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    await pool.query(
      'UPDATE configurations SET value = ?, description = ? WHERE id = ?',
      [value, description || null, req.params.id]
    );
    
    const [updatedRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
    
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/configurations/:id - Delete a configuration
app.delete('/api/configurations/:id', async (req, res) => {
  try {
    const [existingRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    await pool.query('DELETE FROM configurations WHERE id = ?', [req.params.id]);
    res.status(204).send();
    
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/configurations');
  console.log('  GET    /api/configurations/:id');
  console.log('  POST   /api/configurations');
  console.log('  PUT    /api/configurations/:id');
  console.log('  DELETE /api/configurations/:id');
});

// Export for testing
module.exports = app;
