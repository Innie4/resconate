const { pool } = require('../../../lib/database');
const { authenticateEmployee } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'POST') {
    return authenticateEmployee(req, res, async () => {
      try {
        const { leave_type, start_date, end_date, reason } = req.body;
        if (!leave_type || !start_date || !end_date) {
          return res.status(400).json({ error: 'leave_type, start_date, and end_date are required' });
        }
        const start = new Date(start_date);
        const end = new Date(end_date);
        const days_requested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        const result = await pool.query(
          'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [req.employee.id, leave_type, start_date, end_date, days_requested, reason || null]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;



