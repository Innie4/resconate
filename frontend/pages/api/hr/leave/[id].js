const { pool } = require('../../../../lib/database');
const { authenticateAdmin } = require('../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { status } = req.body;
        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
          return res.status(400).json({ error: 'Valid status (approved, rejected, pending) is required' });
        }
        
        const result = await pool.query(
          'UPDATE leave_requests SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
          [status, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Leave request not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        console.error('Error updating leave request:', e);
        res.status(500).json({ error: 'Internal server error', message: e.message });
      }
    });
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;

