const { pool } = require('../../../lib/database');
const { authenticateAdmin } = require('../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('SELECT id, employee_id, name, email, department, position, salary, phone, address, start_date, status FROM employees WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else if (req.method === 'PUT') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { name, email, department, position, salary, phone, address, password, start_date, status } = req.body;
        
        // If password is provided, hash it and update
        if (password && password.trim() !== '') {
          const bcrypt = require('bcryptjs');
          const password_hash = await bcrypt.hash(password, 10);
          const result = await pool.query(
            'UPDATE employees SET name=$1, email=$2, department=$3, position=$4, salary=$5, phone=$6, address=$7, password_hash=$8, start_date=$9, status=$10, updated_at=CURRENT_TIMESTAMP WHERE id=$11 RETURNING id, employee_id, name, email, department, position, salary, phone, address, start_date, status',
            [name, email, department, position, salary, phone, address, password_hash, start_date, status, id]
          );
          if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
          res.json({ success: true, data: result.rows[0] });
        } else {
          // No password provided, update without changing password
          const result = await pool.query(
            'UPDATE employees SET name=$1, email=$2, department=$3, position=$4, salary=$5, phone=$6, address=$7, start_date=$8, status=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10 RETURNING id, employee_id, name, email, department, position, salary, phone, address, start_date, status',
            [name, email, department, position, salary, phone, address, start_date, status, id]
          );
          if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
          res.json({ success: true, data: result.rows[0] });
        }
      } catch (e) {
        console.error('Error updating employee:', e);
        res.status(500).json({ error: 'Internal server error', message: e.message });
      }
    });
  } else if (req.method === 'DELETE') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, message: 'Employee deleted' });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;



