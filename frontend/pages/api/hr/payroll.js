const { pool } = require('../../../lib/database');
const { authenticateAdmin } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query(
          `SELECT p.*, e.name as employee_name, e.employee_id, e.department, e.position 
           FROM payroll p 
           LEFT JOIN employees e ON p.employee_id = e.id 
           ORDER BY COALESCE(p.pay_period_start, p.created_at) DESC 
           LIMIT 100`
        );
        res.json({ success: true, data: result.rows });
      } catch (e) {
        console.error('Error fetching payroll:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to fetch payroll',
          details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
      }
    });
  } else if (req.method === 'POST') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { employee_id, pay_period_start, pay_period_end, gross_salary, deductions, net_salary } = req.body;
        if (!employee_id || !pay_period_start || !pay_period_end || !gross_salary || !net_salary) {
          return res.status(400).json({ error: 'employee_id, pay_period_start, pay_period_end, gross_salary, and net_salary are required' });
        }
        // Find employee by employee_id string
        const empResult = await pool.query('SELECT id FROM employees WHERE employee_id = $1', [employee_id]);
        if (empResult.rows.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        const empId = empResult.rows[0].id;
        const result = await pool.query(
          `INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, gross_salary, deductions, net_salary, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending')
           RETURNING *`,
          [empId, pay_period_start, pay_period_end, gross_salary, JSON.stringify(deductions || []), net_salary]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        console.error('Error creating payroll record:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to create payroll record',
          details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;

