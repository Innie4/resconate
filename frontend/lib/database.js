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

const runMigrations = async (client) => {
  try {
    // Use DO block for PostgreSQL to handle errors gracefully
    await client.query(`
      DO $$ 
      BEGIN
        -- Add employment_type column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='jobs' AND column_name='employment_type'
        ) THEN
          ALTER TABLE jobs ADD COLUMN employment_type VARCHAR(50);
          RAISE NOTICE 'Added employment_type column to jobs table';
        END IF;
        
        -- Add benefits column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='jobs' AND column_name='benefits'
        ) THEN
          ALTER TABLE jobs ADD COLUMN benefits JSONB DEFAULT '[]';
          RAISE NOTICE 'Added benefits column to jobs table';
        END IF;
        
        -- Make type column nullable if it exists and is NOT NULL
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='jobs' AND column_name='type' AND is_nullable='NO'
        ) THEN
          ALTER TABLE jobs ALTER COLUMN type DROP NOT NULL;
          RAISE NOTICE 'Made type column nullable in jobs table';
        END IF;
        
        -- Add resume_url column to candidates table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='candidates' AND column_name='resume_url'
        ) THEN
          ALTER TABLE candidates ADD COLUMN resume_url TEXT;
          RAISE NOTICE 'Added resume_url column to candidates table';
        END IF;
        
        -- Add phone column to candidates table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='candidates' AND column_name='phone'
        ) THEN
          ALTER TABLE candidates ADD COLUMN phone VARCHAR(20);
          RAISE NOTICE 'Added phone column to candidates table';
        END IF;
        
        -- Add notes column to candidates table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='candidates' AND column_name='notes'
        ) THEN
          ALTER TABLE candidates ADD COLUMN notes TEXT;
          RAISE NOTICE 'Added notes column to candidates table';
        END IF;
        
        -- Add scheduled_date column to interviews table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='interviews' AND column_name='scheduled_date'
        ) THEN
          ALTER TABLE interviews ADD COLUMN scheduled_date TIMESTAMP;
          RAISE NOTICE 'Added scheduled_date column to interviews table';
        END IF;
        
        -- Add created_at column to candidates table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='candidates' AND column_name='created_at'
        ) THEN
          ALTER TABLE candidates ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          RAISE NOTICE 'Added created_at column to candidates table';
        END IF;
        
        -- Add applied_date column to candidates table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='candidates' AND column_name='applied_date'
        ) THEN
          ALTER TABLE candidates ADD COLUMN applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          RAISE NOTICE 'Added applied_date column to candidates table';
        END IF;
        
        -- Add interviewer_id column to interviews table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='interviews' AND column_name='interviewer_id'
        ) THEN
          ALTER TABLE interviews ADD COLUMN interviewer_id INTEGER REFERENCES admins(id);
          RAISE NOTICE 'Added interviewer_id column to interviews table';
        END IF;
        
        -- Add updated_at column to interviews table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='interviews' AND column_name='updated_at'
        ) THEN
          ALTER TABLE interviews ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          RAISE NOTICE 'Added updated_at column to interviews table';
        END IF;
        
        -- Ensure payroll table has correct columns
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='employee_id'
        ) THEN
          -- Check if old schema exists and migrate
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='payroll' AND column_name='employee_ids'
          ) THEN
            -- Old schema detected, add new columns
            ALTER TABLE payroll ADD COLUMN employee_id INTEGER REFERENCES employees(id);
            ALTER TABLE payroll ADD COLUMN pay_period_start DATE;
            ALTER TABLE payroll ADD COLUMN pay_period_end DATE;
            ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(12,2);
            ALTER TABLE payroll ADD COLUMN net_salary DECIMAL(12,2);
            ALTER TABLE payroll ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Added new columns to payroll table for migration';
          ELSE
            -- No old schema, just add the column
            ALTER TABLE payroll ADD COLUMN employee_id INTEGER REFERENCES employees(id);
            RAISE NOTICE 'Added employee_id column to payroll table';
          END IF;
        END IF;
        
        -- Add pay_period_start if missing
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='pay_period_start'
        ) THEN
          ALTER TABLE payroll ADD COLUMN pay_period_start DATE;
          RAISE NOTICE 'Added pay_period_start column to payroll table';
        END IF;
        
        -- Add pay_period_end if missing
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='pay_period_end'
        ) THEN
          ALTER TABLE payroll ADD COLUMN pay_period_end DATE;
          RAISE NOTICE 'Added pay_period_end column to payroll table';
        END IF;
        
        -- Add gross_salary if missing
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='gross_salary'
        ) THEN
          ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(12,2);
          RAISE NOTICE 'Added gross_salary column to payroll table';
        END IF;
        
        -- Add net_salary if missing
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='net_salary'
        ) THEN
          ALTER TABLE payroll ADD COLUMN net_salary DECIMAL(12,2);
          RAISE NOTICE 'Added net_salary column to payroll table';
        END IF;
        
        -- Ensure deductions is JSONB if it exists as another type
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='deductions' AND data_type != 'jsonb'
        ) THEN
          -- Convert to JSONB if needed (this might need data migration)
          ALTER TABLE payroll ALTER COLUMN deductions TYPE JSONB USING deductions::text::jsonb;
          RAISE NOTICE 'Converted deductions column to JSONB in payroll table';
        END IF;
        
        -- Make period column nullable if it has NOT NULL constraint
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='payroll' AND column_name='period' AND is_nullable='NO'
        ) THEN
          ALTER TABLE payroll ALTER COLUMN period DROP NOT NULL;
          RAISE NOTICE 'Made period column nullable in payroll table';
        END IF;
        
        -- Ensure performance_reviews table has review_period_start column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='performance_reviews' AND column_name='review_period_start'
        ) THEN
          ALTER TABLE performance_reviews ADD COLUMN review_period_start DATE;
          RAISE NOTICE 'Added review_period_start column to performance_reviews table';
        END IF;
        
        -- Ensure performance_reviews table has review_period_end column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='performance_reviews' AND column_name='review_period_end'
        ) THEN
          ALTER TABLE performance_reviews ADD COLUMN review_period_end DATE;
          RAISE NOTICE 'Added review_period_end column to performance_reviews table';
        END IF;
        
        -- Ensure performance_reviews table has rating column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='performance_reviews' AND column_name='rating'
        ) THEN
          ALTER TABLE performance_reviews ADD COLUMN rating INTEGER;
          RAISE NOTICE 'Added rating column to performance_reviews table';
        END IF;
        
        -- Ensure performance_reviews table has comments column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='performance_reviews' AND column_name='comments'
        ) THEN
          ALTER TABLE performance_reviews ADD COLUMN comments TEXT;
          RAISE NOTICE 'Added comments column to performance_reviews table';
        END IF;
        
        -- Ensure performance_reviews table has created_at column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='performance_reviews' AND column_name='created_at'
        ) THEN
          ALTER TABLE performance_reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          RAISE NOTICE 'Added created_at column to performance_reviews table';
        END IF;
        
        -- Ensure employees table has password_hash column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='employees' AND column_name='password_hash'
        ) THEN
          ALTER TABLE employees ADD COLUMN password_hash VARCHAR(255);
          RAISE NOTICE 'Added password_hash column to employees table';
        END IF;
        
        -- Ensure leave_requests table has updated_at column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='leave_requests' AND column_name='updated_at'
        ) THEN
          ALTER TABLE leave_requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          RAISE NOTICE 'Added updated_at column to leave_requests table';
        END IF;
      END $$;
    `);
    console.log('Migration: Verified jobs, candidates, interviews, and payroll table columns');
  } catch (migrationError) {
    console.error('Migration error:', migrationError.message);
    // Fallback: try individual column additions
    try {
      const employmentTypeCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='jobs' AND column_name='employment_type';
      `);
      if (employmentTypeCheck.rows.length === 0) {
        await client.query(`ALTER TABLE jobs ADD COLUMN employment_type VARCHAR(50);`);
        console.log('Migration: Added employment_type column');
      }
      
      const benefitsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='jobs' AND column_name='benefits';
      `);
      if (benefitsCheck.rows.length === 0) {
        await client.query(`ALTER TABLE jobs ADD COLUMN benefits JSONB DEFAULT '[]';`);
        console.log('Migration: Added benefits column');
      }
      
      // Make type column nullable
      const typeCheck = await client.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns 
        WHERE table_name='jobs' AND column_name='type';
      `);
      if (typeCheck.rows.length > 0 && typeCheck.rows[0].is_nullable === 'NO') {
        await client.query(`ALTER TABLE jobs ALTER COLUMN type DROP NOT NULL;`);
        console.log('Migration: Made type column nullable');
      }
      
      // Add resume_url column to candidates table
      const resumeUrlCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='candidates' AND column_name='resume_url';
      `);
      if (resumeUrlCheck.rows.length === 0) {
        await client.query(`ALTER TABLE candidates ADD COLUMN resume_url TEXT;`);
        console.log('Migration: Added resume_url column to candidates table');
      }
      
      // Add phone column to candidates table
      const phoneCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='candidates' AND column_name='phone';
      `);
      if (phoneCheck.rows.length === 0) {
        await client.query(`ALTER TABLE candidates ADD COLUMN phone VARCHAR(20);`);
        console.log('Migration: Added phone column to candidates table');
      }
      
      // Add notes column to candidates table
      const notesCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='candidates' AND column_name='notes';
      `);
      if (notesCheck.rows.length === 0) {
        await client.query(`ALTER TABLE candidates ADD COLUMN notes TEXT;`);
        console.log('Migration: Added notes column to candidates table');
      }
      
      // Add scheduled_date column to interviews table
      const scheduledDateCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='interviews' AND column_name='scheduled_date';
      `);
      if (scheduledDateCheck.rows.length === 0) {
        await client.query(`ALTER TABLE interviews ADD COLUMN scheduled_date TIMESTAMP;`);
        console.log('Migration: Added scheduled_date column to interviews table');
      }
      
      // Add created_at column to candidates table
      const createdAtCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='candidates' AND column_name='created_at';
      `);
      if (createdAtCheck.rows.length === 0) {
        await client.query(`ALTER TABLE candidates ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Migration: Added created_at column to candidates table');
      }
      
      // Add applied_date column to candidates table
      const appliedDateCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='candidates' AND column_name='applied_date';
      `);
      if (appliedDateCheck.rows.length === 0) {
        await client.query(`ALTER TABLE candidates ADD COLUMN applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Migration: Added applied_date column to candidates table');
      }
      
      // Add interviewer_id column to interviews table
      const interviewerIdCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='interviews' AND column_name='interviewer_id';
      `);
      if (interviewerIdCheck.rows.length === 0) {
        await client.query(`ALTER TABLE interviews ADD COLUMN interviewer_id INTEGER REFERENCES admins(id);`);
        console.log('Migration: Added interviewer_id column to interviews table');
      }
      
      // Add updated_at column to interviews table
      const updatedAtCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='interviews' AND column_name='updated_at';
      `);
      if (updatedAtCheck.rows.length === 0) {
        await client.query(`ALTER TABLE interviews ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Migration: Added updated_at column to interviews table');
      }
      
      // Ensure payroll table has correct columns
      const payrollEmployeeIdCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='employee_id';
      `);
      if (payrollEmployeeIdCheck.rows.length === 0) {
        await client.query(`ALTER TABLE payroll ADD COLUMN employee_id INTEGER REFERENCES employees(id);`);
        console.log('Migration: Added employee_id column to payroll table');
      }
      
      const payrollPeriodStartCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='pay_period_start';
      `);
      if (payrollPeriodStartCheck.rows.length === 0) {
        await client.query(`ALTER TABLE payroll ADD COLUMN pay_period_start DATE;`);
        console.log('Migration: Added pay_period_start column to payroll table');
      }
      
      const payrollPeriodEndCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='pay_period_end';
      `);
      if (payrollPeriodEndCheck.rows.length === 0) {
        await client.query(`ALTER TABLE payroll ADD COLUMN pay_period_end DATE;`);
        console.log('Migration: Added pay_period_end column to payroll table');
      }
      
      const payrollGrossSalaryCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='gross_salary';
      `);
      if (payrollGrossSalaryCheck.rows.length === 0) {
        await client.query(`ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(12,2);`);
        console.log('Migration: Added gross_salary column to payroll table');
      }
      
      const payrollNetSalaryCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='net_salary';
      `);
      if (payrollNetSalaryCheck.rows.length === 0) {
        await client.query(`ALTER TABLE payroll ADD COLUMN net_salary DECIMAL(12,2);`);
        console.log('Migration: Added net_salary column to payroll table');
      }
      
      const payrollCreatedAtCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='created_at';
      `);
      if (payrollCreatedAtCheck.rows.length === 0) {
        await client.query(`ALTER TABLE payroll ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Migration: Added created_at column to payroll table');
      }
      
      // Make period column nullable if it has NOT NULL constraint
      const periodCheck = await client.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns 
        WHERE table_name='payroll' AND column_name='period';
      `);
      if (periodCheck.rows.length > 0 && periodCheck.rows[0].is_nullable === 'NO') {
        await client.query(`ALTER TABLE payroll ALTER COLUMN period DROP NOT NULL;`);
        console.log('Migration: Made period column nullable in payroll table');
      }
      
      // Ensure performance_reviews table has review_period_start column
      const perfPeriodStartCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='performance_reviews' AND column_name='review_period_start';
      `);
      if (perfPeriodStartCheck.rows.length === 0) {
        await client.query(`ALTER TABLE performance_reviews ADD COLUMN review_period_start DATE;`);
        console.log('Migration: Added review_period_start column to performance_reviews table');
      }
      
      // Ensure performance_reviews table has review_period_end column
      const perfPeriodEndCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='performance_reviews' AND column_name='review_period_end';
      `);
      if (perfPeriodEndCheck.rows.length === 0) {
        await client.query(`ALTER TABLE performance_reviews ADD COLUMN review_period_end DATE;`);
        console.log('Migration: Added review_period_end column to performance_reviews table');
      }
      
      // Ensure performance_reviews table has rating column
      const perfRatingCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='performance_reviews' AND column_name='rating';
      `);
      if (perfRatingCheck.rows.length === 0) {
        await client.query(`ALTER TABLE performance_reviews ADD COLUMN rating INTEGER;`);
        console.log('Migration: Added rating column to performance_reviews table');
      }
      
      // Ensure performance_reviews table has comments column
      const perfCommentsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='performance_reviews' AND column_name='comments';
      `);
      if (perfCommentsCheck.rows.length === 0) {
        await client.query(`ALTER TABLE performance_reviews ADD COLUMN comments TEXT;`);
        console.log('Migration: Added comments column to performance_reviews table');
      }
      
      // Ensure performance_reviews table has created_at column
      const perfCreatedAtCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='performance_reviews' AND column_name='created_at';
      `);
      if (perfCreatedAtCheck.rows.length === 0) {
        await client.query(`ALTER TABLE performance_reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Migration: Added created_at column to performance_reviews table');
      }
      
      // Ensure employees table has password_hash column
      const passwordHashCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='employees' AND column_name='password_hash';
      `);
      if (passwordHashCheck.rows.length === 0) {
        await client.query(`ALTER TABLE employees ADD COLUMN password_hash VARCHAR(255);`);
        console.log('Migration: Added password_hash column to employees table');
      }
      
      // Ensure leave_requests table has updated_at column
      const leaveUpdatedAtCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='leave_requests' AND column_name='updated_at';
      `);
      if (leaveUpdatedAtCheck.rows.length === 0) {
        await client.query(`ALTER TABLE leave_requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Migration: Added updated_at column to leave_requests table');
      }
    } catch (fallbackError) {
      console.error('Fallback migration error:', fallbackError.message);
    }
  }
};

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

    // Run migrations
    await runMigrations(client);

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

// Initialize on module load (only once)
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

module.exports = { pool, initializeDatabase };



