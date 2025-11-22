const { pool } = require('../../../lib/database');
const { authenticateAdmin } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query(
          `SELECT pr.*, e.name as employee_name, e.employee_id, e.department, e.position,
                  a.username as reviewer_name
           FROM performance_reviews pr 
           LEFT JOIN employees e ON pr.employee_id = e.id 
           LEFT JOIN admins a ON pr.reviewer_id = a.id
           ORDER BY COALESCE(pr.review_period_end, pr.created_at) DESC 
           LIMIT 100`
        );
        res.json({ success: true, data: result.rows });
      } catch (e) {
        console.error('Error fetching performance reviews:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to fetch performance reviews',
          details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
      }
    });
  } else if (req.method === 'POST') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { employee_id, review_period_start, review_period_end, rating, comments, goals } = req.body;
        if (!employee_id || !rating) {
          return res.status(400).json({ error: 'employee_id and rating are required' });
        }
        // Find employee by employee_id string
        const empResult = await pool.query('SELECT id FROM employees WHERE employee_id = $1', [employee_id]);
        if (empResult.rows.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        const empId = empResult.rows[0].id;
        const result = await pool.query(
          `INSERT INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end, rating, comments, goals, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
           RETURNING *`,
          [empId, req.admin.id, review_period_start || null, review_period_end || null, rating, comments || null, JSON.stringify(goals || [])]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        console.error('Error creating performance review:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to create performance review',
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

