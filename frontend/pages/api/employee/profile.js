const { pool } = require('../../../lib/database');
const { authenticateEmployee } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateEmployee(req, res, async () => {
      try {
        const result = await pool.query(
          'SELECT id, employee_id, name, email, department, position, salary, phone, address, start_date, status FROM employees WHERE id=$1',
          [req.employee.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else if (req.method === 'PUT') {
    return authenticateEmployee(req, res, async () => {
      try {
        const { phone, address } = req.body;
        const result = await pool.query(
          'UPDATE employees SET phone=$1, address=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING id, employee_id, name, email, department, position, phone, address',
          [phone, address, req.employee.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;



