const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { pool, initializeDatabase } = require('./database');
const { authenticateAdmin, loginAdmin, getMe, forgotPassword, authenticateEmployee, loginEmployee, getEmployeeMe } = require('./auth');
const { validateJob, createValidationMiddleware } = require('./validation');

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

initializeDatabase();

// Security & performance
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  credentials: true
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'resconate-session',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve frontend build
const frontendBuildDir = path.join(__dirname, '..', 'frontend', 'build');
const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
// Serve static files from build directory
app.use(express.static(frontendBuildDir));
app.use(express.static(frontendPublicDir));

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Resconate API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [__filename] // using inline JSDoc in this file
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/health', (req, res) => res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() }));

// Basic HR endpoints (Postgres-backed)
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
app.post('/api/auth/login', loginAdmin);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Admin info }
 *       401: { description: Unauthorized }
 */
app.get('/api/auth/me', getMe);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *     responses:
 *       200: { description: Reset instructions sent }
 */
app.post('/api/auth/forgot-password', forgotPassword);

/**
 * @openapi
 * /api/employee/login:
 *   post:
 *     summary: Employee login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
app.post('/api/employee/login', loginEmployee);

/**
 * @openapi
 * /api/employee/me:
 *   get:
 *     summary: Get current authenticated employee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Employee info }
 *       401: { description: Unauthorized }
 */
app.get('/api/employee/me', getEmployeeMe);

/**
 * @openapi
 * /api/hr/jobs:
 *   get:
 *     summary: List jobs
 *     responses:
 *       200:
 *         description: Jobs list
 *   post:
 *     summary: Create job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               department: { type: string }
 *               location: { type: string }
 *               employment_type: { type: string }
 *               salary: { type: string }
 *               description: { type: string }
 *               requirements: { type: string }
 *               benefits: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Created }
 */
app.get('/api/hr/jobs', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY posted_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/hr/jobs', authenticateAdmin, createValidationMiddleware(validateJob), async (req, res) => {
  try {
    const { title, department, location, employment_type, salary, description, requirements, benefits } = req.body;
    const result = await pool.query(
      'INSERT INTO jobs (title, department, location, employment_type, description, requirements, benefits, status, posted_date, salary) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [title, department, location, employment_type || null, description || null, requirements || null, JSON.stringify(benefits || []), 'active', new Date(), salary || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/hr/jobs/:id:
 *   get:
 *     summary: Get job by ID
 *   put:
 *     summary: Update job
 *   delete:
 *     summary: Delete job
 *   patch:
 *     summary: Update job status
 */
app.get('/api/hr/jobs/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/hr/jobs/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, department, location, employment_type, salary, description, requirements, benefits, status } = req.body;
    const result = await pool.query(
      'UPDATE jobs SET title=$1, department=$2, location=$3, employment_type=$4, description=$5, requirements=$6, benefits=$7, status=$8, salary=$9 WHERE id=$10 RETURNING *',
      [title, department, location, employment_type, description, requirements, JSON.stringify(benefits || []), status, salary, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/hr/jobs/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM jobs WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/hr/jobs/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'closed', 'draft'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await pool.query('UPDATE jobs SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Employee Management Endpoints
/**
 * @openapi
 * /api/employees:
 *   get:
 *     summary: List all employees
 *   post:
 *     summary: Create employee
 */
app.get('/api/employees', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, employee_id, name, email, department, position, salary, start_date, status FROM employees ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/employees', authenticateAdmin, async (req, res) => {
  try {
    const { employee_id, name, email, department, position, salary, phone, address, start_date } = req.body;
    if (!employee_id || !name || !email) {
      return res.status(400).json({ error: 'employee_id, name, and email are required' });
    }
    const result = await pool.query(
      'INSERT INTO employees (employee_id, name, email, department, position, salary, phone, address, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, employee_id, name, email, department, position, salary, start_date, status',
      [employee_id, name, email, department || null, position || null, salary || null, phone || null, address || null, start_date || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({ error: 'Employee ID or email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/employees/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, employee_id, name, email, department, position, salary, phone, address, start_date, status FROM employees WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/employees/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, department, position, salary, phone, address, start_date, status } = req.body;
    const result = await pool.query(
      'UPDATE employees SET name=$1, email=$2, department=$3, position=$4, salary=$5, phone=$6, address=$7, start_date=$8, status=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10 RETURNING id, employee_id, name, email, department, position, salary, phone, address, start_date, status',
      [name, email, department, position, salary, phone, address, start_date, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/employees/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics Endpoints
/**
 * @openapi
 * /api/analytics:
 *   get:
 *     summary: Get dashboard analytics
 */
app.get('/api/analytics', authenticateAdmin, async (req, res) => {
  try {
    const [employeesResult, jobsResult, interviewsResult, complianceResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM employees WHERE status=$1', ['active']),
      pool.query('SELECT COUNT(*) as count FROM jobs WHERE status=$1', ['active']),
      pool.query('SELECT COUNT(*) as count FROM interviews WHERE status=$1', ['pending']).catch(() => ({ rows: [{ count: '0' }] })),
      pool.query('SELECT AVG(score) as avg_score FROM compliance_records').catch(() => ({ rows: [{ avg_score: 95 }] }))
    ]);

    const totalEmployees = parseInt(employeesResult.rows[0].count);
    const activeJobs = parseInt(jobsResult.rows[0].count);
    const pendingInterviews = parseInt(interviewsResult.rows[0].count || 0);
    const complianceScore = Math.round(parseFloat(complianceResult.rows[0].avg_score || 95));

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeJobs,
        pendingInterviews,
        complianceScore
      }
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/employees', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM employees WHERE status=$1', ['active']);
    res.json({ success: true, count: parseInt(result.rows[0].count) });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/jobs', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status=$1', ['active']);
    res.json({ success: true, count: parseInt(result.rows[0].count) });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/interviews', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM interviews WHERE status=$1', ['pending']).catch(() => ({ rows: [{ count: '0' }] }));
    res.json({ success: true, count: parseInt(result.rows[0].count || 0) });
  } catch (e) {
    res.json({ success: true, count: 0 });
  }
});

app.get('/api/analytics/compliance', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT AVG(score) as avg_score FROM compliance_records').catch(() => ({ rows: [{ avg_score: 95 }] }));
    res.json({ success: true, score: Math.round(parseFloat(result.rows[0].avg_score || 95)) });
  } catch (e) {
    res.json({ success: true, score: 95 });
  }
});

// Employee Profile Endpoints
app.get('/api/employee/profile', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, employee_id, name, email, department, position, salary, phone, address, start_date, status FROM employees WHERE id=$1',
      [req.employee.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/employee/profile', authenticateEmployee, async (req, res) => {
  try {
    const { phone, address } = req.body;
    const result = await pool.query(
      'UPDATE employees SET phone=$1, address=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING id, employee_id, name, email, department, position, phone, address',
      [phone, address, req.employee.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave Management Endpoints
app.get('/api/leave', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leave_requests WHERE employee_id=$1 ORDER BY created_at DESC',
      [req.employee.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/leave/request', authenticateEmployee, async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'leave_type, start_date, and end_date are required' });
    }
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days_requested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const result = await pool.query(
      'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.employee.id, leave_type, start_date, end_date, days_requested, reason || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leave/:employeeId', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leave_requests WHERE employee_id=$1 ORDER BY created_at DESC',
      [req.params.employeeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payroll Endpoints
app.get('/api/payroll', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payroll WHERE employee_id=$1 ORDER BY pay_period_start DESC LIMIT 12',
      [req.employee.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/payroll/payslips', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payroll WHERE employee_id=$1 AND status=$2 ORDER BY pay_period_start DESC',
      [req.employee.id, 'processed']
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/payroll/:employeeId', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payroll WHERE employee_id=$1 ORDER BY pay_period_start DESC',
      [req.params.employeeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Performance Endpoints
app.get('/api/performance', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM performance_reviews WHERE employee_id=$1 ORDER BY review_period_end DESC',
      [req.employee.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/performance/reviews', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM performance_reviews WHERE employee_id=$1 AND status=$2 ORDER BY review_period_end DESC',
      [req.employee.id, 'completed']
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/performance/goals', authenticateEmployee, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, goals, review_period_start, review_period_end FROM performance_reviews WHERE employee_id=$1 ORDER BY review_period_end DESC LIMIT 1',
      [req.employee.id]
    );
    const goals = result.rows.length > 0 ? (result.rows[0].goals || []) : [];
    res.json({ success: true, data: goals });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recruitment Endpoints
app.get('/api/recruitment/candidates', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, j.title as job_title FROM candidates c LEFT JOIN jobs j ON c.job_id = j.id ORDER BY c.created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/recruitment/candidates', authenticateAdmin, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/recruitment/interviews', authenticateAdmin, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/recruitment/interviews', authenticateAdmin, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Banking Endpoints (placeholder)
app.get('/api/banking', authenticateAdmin, async (req, res) => {
  res.json({ success: true, data: [], message: 'Banking module coming soon' });
});

app.get('/api/banking/accounts', authenticateAdmin, async (req, res) => {
  res.json({ success: true, data: [], message: 'Banking accounts module coming soon' });
});

// Compliance Endpoints
app.get('/api/compliance', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM compliance_records ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/compliance/score', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT AVG(score) as avg_score FROM compliance_records').catch(() => ({ rows: [{ avg_score: 95 }] }));
    res.json({ success: true, score: Math.round(parseFloat(result.rows[0].avg_score || 95)) });
  } catch (e) {
    res.json({ success: true, score: 95 });
  }
});

// Frontend entry
app.get('/', (req, res) => {
  const file = fs.existsSync(path.join(frontendBuildDir, 'index.html'))
    ? path.join(frontendBuildDir, 'index.html')
    : path.join(frontendPublicDir, 'index.html');
  res.sendFile(file);
});

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Public demo projects
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, name: 'Zocket AI', description: 'AI-powered marketing platform', image: 'https://placehold.co/600x400/111/333', category: 'Web App', color: 'blue', technologies: ['React','Node.js','TensorFlow'] },
    { id: 2, name: 'HeavyOps', description: 'Fleet management solution', image: 'https://placehold.co/600x400/111/333', category: 'Mobile App', color: 'orange', technologies: ['React Native','Firebase','Google Maps API'] }
  ]);
});

/**
 * @openapi
 * /api/testimonials:
 *   get:
 *     summary: Public testimonials
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/testimonials', (req, res) => {
  res.json([
    { id: 1, text: 'Resconate moved us from idea to launch without breaking pace.', name: 'Adaeze N.', position: 'COO' },
    { id: 2, text: 'Payroll and compliance now feel automated; proactive team.', name: 'Derrick A.', position: 'People Lead' }
  ]);
});

// Fallback - serve React app for all non-API routes
app.get('*', (req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next();
  }
  // Serve React app index.html for client-side routing
  const indexPath = path.join(frontendBuildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please run "npm run build" in the frontend directory.');
  }
});

const server = app.listen(PORT, () => console.log(`API running on ${PORT}. Docs at /api-docs`));
// Graceful shutdown
const shutdown = () => {
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


