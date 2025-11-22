const { pool } = require('../../lib/database');
const { authenticateAdmin } = require('../../lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    return authenticateAdmin(req, res, async () => {
      try {
        const result = await pool.query('SELECT * FROM compliance_records ORDER BY created_at DESC LIMIT 50');
        res.json({ success: true, data: result.rows });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else if (req.method === 'POST') {
    return authenticateAdmin(req, res, async () => {
      try {
        const { record_type, employee_id, compliance_date, score, notes } = req.body;
        if (!record_type) {
          return res.status(400).json({ error: 'record_type is required' });
        }
        let empId = null;
        if (employee_id) {
          const empResult = await pool.query('SELECT id FROM employees WHERE employee_id = $1', [employee_id]);
          if (empResult.rows.length > 0) {
            empId = empResult.rows[0].id;
          }
        }
        const result = await pool.query(
          `INSERT INTO compliance_records (record_type, employee_id, compliance_date, score, notes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [record_type, empId, compliance_date || null, score || null, notes || null]
        );
        res.json({ success: true, data: result.rows[0] });
      } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;



