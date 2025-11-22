const { pool } = require('../../../lib/database');
const { authenticateAdmin } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query(
          `SELECT i.*, c.name as candidate_name, c.email as candidate_email, j.title as job_title 
           FROM interviews i 
           LEFT JOIN candidates c ON i.candidate_id = c.id 
           LEFT JOIN jobs j ON i.job_id = j.id 
           ORDER BY i.scheduled_date DESC`
        );
        res.json({ success: true, data: result.rows });
      } catch (e) {
        console.error('Error fetching interviews:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to fetch interviews',
          details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
      }
    });
  } else if (req.method === 'POST') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { candidate_id, job_id, interviewer_id, scheduled_date, notes } = req.body;
        if (!candidate_id || !scheduled_date) {
          return res.status(400).json({ error: 'candidate_id and scheduled_date are required' });
        }
        const result = await pool.query(
          'INSERT INTO interviews (candidate_id, job_id, interviewer_id, scheduled_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [candidate_id, job_id || null, interviewer_id || req.admin.id, scheduled_date, notes || null]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        console.error('Error creating interview:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to create interview',
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



