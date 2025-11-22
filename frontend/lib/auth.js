const { pool } = require('./database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, email, role FROM admins WHERE id=$1', [decoded.adminId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.admin = result.rows[0];
    if (next && typeof next === 'function') {
      await next();
    }
  } catch (err) {
    console.error('Error in authenticateAdmin:', err);
    if (!res.headersSent) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: err.message || 'Invalid token'
      });
    }
  }
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const result = await pool.query('SELECT id, username, email, password_hash, role FROM admins WHERE username=$1 OR email=$1', [username]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  const admin = result.rows[0];
  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ success: true, token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role } });
};

const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, email, role FROM admins WHERE id=$1', [decoded.adminId]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid token' });
    res.json({ success: true, admin: result.rows[0] });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const forgotPassword = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  
  try {
    const result = await pool.query('SELECT id, email FROM admins WHERE username=$1 OR email=$1', [username]);
    // For security, always return success even if user doesn't exist
    if (result.rows.length > 0) {
      // In production, send email with reset link here
      // For now, just return success
      console.log(`Password reset requested for: ${result.rows[0].email}`);
    }
    res.json({ success: true, message: 'If the username exists, password reset instructions have been sent.' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Employee authentication
const authenticateEmployee = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, employee_id, name, email, department, position FROM employees WHERE id=$1', [decoded.employeeId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.employee = result.rows[0];
    if (next && typeof next === 'function') {
      await next();
    }
  } catch (e) {
    console.error('Employee authentication error:', e);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const loginEmployee = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  try {
    const result = await pool.query(
      'SELECT id, employee_id, name, email, password_hash, department, position FROM employees WHERE employee_id=$1 OR email=$1',
      [username]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const employee = result.rows[0];
    
    if (!employee.password_hash) {
      return res.status(401).json({ error: 'Account not set up. Please contact HR.' });
    }
    
    const ok = await bcrypt.compare(password, employee.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ employeeId: employee.id, employeeIdStr: employee.employee_id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position
      }
    });
  } catch (e) {
    console.error('Employee login error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEmployeeMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, employee_id, name, email, department, position, salary, start_date, status FROM employees WHERE id=$1',
      [decoded.employeeId]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid token' });
    res.json({ success: true, employee: result.rows[0] });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  authenticateAdmin,
  loginAdmin,
  getMe,
  forgotPassword,
  authenticateEmployee,
  loginEmployee,
  getEmployeeMe
};
