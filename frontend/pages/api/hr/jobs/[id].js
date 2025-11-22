const { pool } = require('../../../../lib/database');
const { authenticateAdmin } = require('../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { title, department, location, employment_type, salary, description, requirements, benefits, status } = req.body;
        const result = await pool.query(
          'UPDATE jobs SET title=$1, department=$2, location=$3, employment_type=$4, salary=$5, description=$6, requirements=$7, benefits=$8, status=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10 RETURNING *',
          [title, department, location, employment_type || null, salary || null, description || null, requirements || null, JSON.stringify(benefits || []), status || 'active', id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        console.error('Job update error:', e);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else if (req.method === 'DELETE') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('DELETE FROM jobs WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        res.json({ success: true, message: 'Job deleted' });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
