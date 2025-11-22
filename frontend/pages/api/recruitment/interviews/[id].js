const { pool } = require('../../../../lib/database');
const { authenticateAdmin } = require('../../../../lib/auth');

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { status, result } = req.body;
        const finalStatus = status || (result === 'passed' ? 'completed' : result === 'failed' ? 'failed' : 'completed');
        const notesUpdate = result ? ` Result: ${result}.` : '';
        
        // Update interview status
        const interviewResult = await pool.query(
          'UPDATE interviews SET status=$1, notes=COALESCE(notes, \'\') || $2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *',
          [finalStatus, notesUpdate, id]
        );
        if (interviewResult.rows.length === 0) return res.status(404).json({ error: 'Interview not found' });
        
        // Update candidate status if interview is completed
        if (finalStatus === 'completed' || finalStatus === 'failed') {
          const candidateId = interviewResult.rows[0].candidate_id;
          if (candidateId) {
            const candidateStatus = result === 'passed' ? 'hired' : 'rejected';
            await pool.query(
              'UPDATE candidates SET status=$1 WHERE id=$2',
              [candidateStatus, candidateId]
            );
          }
        }
        
        res.json({ success: true, data: interviewResult.rows[0] });
      } catch (e) {
        console.error('Interview update error:', e);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else if (req.method === 'DELETE') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('DELETE FROM interviews WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Interview not found' });
        res.json({ success: true, message: 'Interview deleted' });
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

