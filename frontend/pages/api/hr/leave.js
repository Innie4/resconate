const { pool } = require('../../../lib/database');
const { authenticateAdmin } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query(`
          SELECT lr.*, e.name as employee_name, e.employee_id, e.email as employee_email, e.department
          FROM leave_requests lr
          LEFT JOIN employees e ON lr.employee_id = e.id
          ORDER BY lr.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
      } catch (e) {
        console.error('Error fetching leave requests:', e);
        res.status(500).json({ error: 'Internal server error', message: e.message });
      }
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;

