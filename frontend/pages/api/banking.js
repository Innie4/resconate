const { pool } = require('../../lib/database');
const { authenticateAdmin } = require('../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        // Get employees with banking information
        const result = await pool.query(
          `SELECT e.id, e.employee_id, e.name, e.email, e.department, e.position, e.salary,
                  COALESCE(SUM(p.net_salary), 0) as total_paid,
                  COUNT(p.id) as payment_count
           FROM employees e
           LEFT JOIN payroll p ON e.id = p.employee_id AND p.status = 'paid'
           WHERE e.status = 'active'
           GROUP BY e.id, e.employee_id, e.name, e.email, e.department, e.position, e.salary
           ORDER BY e.name`
        );
        res.json({ success: true, data: result.rows });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;

