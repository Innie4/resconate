const { pool } = require('../../../../lib/database');
const { authenticateAdmin } = require('../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('DELETE FROM payroll WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Payroll record not found' });
        res.json({ success: true, message: 'Payroll record deleted' });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;

