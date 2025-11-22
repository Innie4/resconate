const { pool } = require('../../../../../lib/database');
const { authenticateAdmin } = require('../../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { status } = req.body;
        if (!['active', 'closed', 'draft'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        const result = await pool.query('UPDATE jobs SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;



