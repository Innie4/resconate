const { pool } = require('../../../lib/database');
const { authenticateAdmin } = require('../../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query(
          'SELECT c.*, j.title as job_title FROM candidates c LEFT JOIN jobs j ON c.job_id = j.id ORDER BY c.created_at DESC'
        );
        res.json({ success: true, data: result.rows });
      } catch (e) {
        console.error('Error fetching candidates:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to fetch candidates',
          details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
      }
    });
  } else if (req.method === 'POST') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { name, email, phone, resume_url, job_id, notes } = req.body;
        if (!name || !email) {
          return res.status(400).json({ error: 'name and email are required' });
        }
        const result = await pool.query(
          'INSERT INTO candidates (name, email, phone, resume_url, job_id, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [name, email, phone || null, resume_url || null, job_id || null, notes || null]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        console.error('Error creating candidate:', e);
        res.status(500).json({ 
          error: 'Internal server error',
          message: e.message || 'Failed to create candidate',
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



