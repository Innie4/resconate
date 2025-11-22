const { pool } = require('../../lib/database');
const { authenticateAdmin } = require('../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('SELECT id, employee_id, name, email, department, position, salary, phone, address, start_date, status, (password_hash IS NULL) as needs_password FROM employees ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
      } catch (e) {
        console.error('Error fetching employees:', e);
        res.status(500).json({ error: 'Internal server error', message: e.message });
      }
    });
  } else if (req.method === 'POST') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { name, email, department, position, salary, phone, address, password, start_date } = req.body;
        if (!name || !email) {
          return res.status(400).json({ error: 'name and email are required' });
        }
        if (!password) {
          return res.status(400).json({ error: 'password is required' });
        }
        // Auto-generate employee ID
        const countResult = await pool.query('SELECT COUNT(*) as count FROM employees');
        const employeeCount = parseInt(countResult.rows[0].count) + 1;
        const employee_id = `EMP${String(employeeCount).padStart(6, '0')}`;
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
          'INSERT INTO employees (employee_id, name, email, department, position, salary, phone, address, password_hash, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, employee_id, name, email, department, position, salary, start_date, status',
          [employee_id, name, email, department || null, position || null, salary || null, phone || null, address || null, password_hash, start_date || null]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        if (e.code === '23505') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Error creating employee:', e);
        res.status(500).json({ error: 'Internal server error', message: e.message });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;



