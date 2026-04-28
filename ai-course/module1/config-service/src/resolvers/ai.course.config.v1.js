/**
 * Configs Namespace Resolver - Version 1
 * Handles all configuration-related actions
 */


async function resolve(pool,{action, params,mappings}) {
  switch (action) {
    case 'list':
      const [rows] = await pool.query('SELECT * FROM configurations ORDER BY id');
      return { status: 200, data: rows };
      
    case 'get':
      if (!params.id) {
        return { status: 400, error: 'ID is required for get action' };
      }
      const [getRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [params.id]);
      if (getRows.length === 0) {
        return { status: 404, error: 'Configuration not found' };
      }
      return { status: 200, data: getRows[0] };
      
    case 'create':
      if (!params.key_name || !params.value) {
        return { status: 400, error: 'key_name and value are required' };
      }
      const [createResult] = await pool.query(
        'INSERT INTO configurations (key_name, value, description) VALUES (?, ?, ?)',
        [params.key_name, params.value, params.description || null]
      );
      const [createdRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [createResult.insertId]);
      return { status: 201, data: createdRows[0] };
      
    case 'update':
      if (!params.id) {
        return { status: 400, error: 'ID is required for update action' };
      }
      const [existingRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [params.id]);
      if (existingRows.length === 0) {
        return { status: 404, error: 'Configuration not found' };
      }
      await pool.query(
        'UPDATE configurations SET value = ?, description = ? WHERE id = ?',
        [params.value, params.description || null, params.id]
      );
      const [updatedRows] = await pool.query('SELECT * FROM configurations WHERE id = ?', [params.id]);
      return { status: 200, data: updatedRows[0] };
      
    case 'delete':
      if (!params.id) {
        return { status: 400, error: 'ID is required for delete action' };
      }
      const [deleteCheck] = await pool.query('SELECT * FROM configurations WHERE id = ?', [params.id]);
      if (deleteCheck.length === 0) {
        return { status: 404, error: 'Configuration not found' };
      }
      await pool.query('DELETE FROM configurations WHERE id = ?', [params.id]);
      return { status: 204 };
      
    default:
      return { status: 400, error: `Unknown action: ${action}` };
  }
}

module.exports = { resolve };
