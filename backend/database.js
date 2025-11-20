const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'postgres',
        password: process.env.DB_PASSWORD || 'Test1234',
        port: process.env.DB_PORT || 5432,
      }
);

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        department VARCHAR(100),
        position VARCHAR(100),
        salary DECIMAL(12,2),
        phone VARCHAR(20),
        address TEXT,
        emergency_contact JSONB,
        start_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        benefits JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        department VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        employment_type VARCHAR(50),
        description TEXT,
        requirements TEXT,
        benefits JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'active',
        posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        salary VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        resume_url TEXT,
        job_id INTEGER REFERENCES jobs(id),
        status VARCHAR(50) DEFAULT 'applied',
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER REFERENCES candidates(id),
        job_id INTEGER REFERENCES jobs(id),
        interviewer_id INTEGER REFERENCES admins(id),
        scheduled_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id),
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested INTEGER,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        approved_by INTEGER REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payroll (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id),
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        gross_salary DECIMAL(12,2),
        deductions JSONB DEFAULT '[]',
        net_salary DECIMAL(12,2),
        status VARCHAR(50) DEFAULT 'pending',
        payslip_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS performance_reviews (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id),
        reviewer_id INTEGER REFERENCES admins(id),
        review_period_start DATE,
        review_period_end DATE,
        rating INTEGER,
        comments TEXT,
        goals JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_records (
        id SERIAL PRIMARY KEY,
        record_type VARCHAR(100) NOT NULL,
        employee_id INTEGER REFERENCES employees(id),
        compliance_date DATE,
        score INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables ensured');
  } finally {
    client.release();
  }
};

const createDefaultAdmin = async () => {
  const bcrypt = require('bcryptjs');
  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM admins WHERE username=$1', ['admin']);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO admins (username, email, password_hash, role) VALUES ($1,$2,$3,$4)',
        ['admin', 'admin@resconate.local', hash, 'super_admin']
      );
      console.log('Seeded default admin (admin/admin123)');
    }
  } finally {
    client.release();
  }
};

const initializeDatabase = async () => {
  await createTables();
  await createDefaultAdmin();
};

module.exports = { pool, initializeDatabase };


