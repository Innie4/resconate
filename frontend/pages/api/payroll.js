const { pool } = require('../../lib/database');
const { authenticateEmployee } = require('../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateEmployee(req, res, async () => {
      try {
        const result = await pool.query(
          'SELECT * FROM payroll WHERE employee_id=$1 ORDER BY pay_period_start DESC LIMIT 12',
          [req.employee.id]
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



