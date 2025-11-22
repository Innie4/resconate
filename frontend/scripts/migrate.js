const { pool } = require('../lib/database');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    
    // Check if employment_type column exists in jobs table
    const employmentTypeCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='jobs' AND column_name='employment_type';
    `);
    
    if (employmentTypeCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE jobs 
        ADD COLUMN employment_type VARCHAR(50);
      `);
      console.log('✓ Added employment_type column to jobs table');
    } else {
      console.log('✓ employment_type column already exists');
    }
    
    // Check if benefits column exists in jobs table
    const benefitsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='jobs' AND column_name='benefits';
    `);
    
    if (benefitsCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE jobs 
        ADD COLUMN benefits JSONB DEFAULT '[]';
      `);
      console.log('✓ Added benefits column to jobs table');
    } else {
      console.log('✓ benefits column already exists');
    }
    
    // Check if type column is NOT NULL and make it nullable
    const typeCheck = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name='jobs' AND column_name='type';
    `);
    
    if (typeCheck.rows.length > 0 && typeCheck.rows[0].is_nullable === 'NO') {
      await client.query(`
        ALTER TABLE jobs 
        ALTER COLUMN type DROP NOT NULL;
      `);
      console.log('✓ Made type column nullable in jobs table');
    } else if (typeCheck.rows.length > 0) {
      console.log('✓ type column is already nullable');
    } else {
      console.log('✓ type column does not exist');
    }
    
    // Check if resume_url column exists in candidates table
    const resumeUrlCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='candidates' AND column_name='resume_url';
    `);
    
    if (resumeUrlCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE candidates 
        ADD COLUMN resume_url TEXT;
      `);
      console.log('✓ Added resume_url column to candidates table');
    } else {
      console.log('✓ resume_url column already exists');
    }
    
    // Check if phone column exists in candidates table
    const phoneCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='candidates' AND column_name='phone';
    `);
    
    if (phoneCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE candidates 
        ADD COLUMN phone VARCHAR(20);
      `);
      console.log('✓ Added phone column to candidates table');
    } else {
      console.log('✓ phone column already exists');
    }
    
    // Check if notes column exists in candidates table
    const notesCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='candidates' AND column_name='notes';
    `);
    
    if (notesCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE candidates 
        ADD COLUMN notes TEXT;
      `);
      console.log('✓ Added notes column to candidates table');
    } else {
      console.log('✓ notes column already exists');
    }
    
    // Check if scheduled_date column exists in interviews table
    const scheduledDateCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='interviews' AND column_name='scheduled_date';
    `);
    
    if (scheduledDateCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE interviews 
        ADD COLUMN scheduled_date TIMESTAMP;
      `);
      console.log('✓ Added scheduled_date column to interviews table');
    } else {
      console.log('✓ scheduled_date column already exists');
    }
    
    // Check if created_at column exists in candidates table
    const createdAtCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='candidates' AND column_name='created_at';
    `);
    
    if (createdAtCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE candidates 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✓ Added created_at column to candidates table');
    } else {
      console.log('✓ created_at column already exists');
    }
    
    // Check if applied_date column exists in candidates table
    const appliedDateCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='candidates' AND column_name='applied_date';
    `);
    
    if (appliedDateCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE candidates 
        ADD COLUMN applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✓ Added applied_date column to candidates table');
    } else {
      console.log('✓ applied_date column already exists');
    }
    
    // Check if interviewer_id column exists in interviews table
    const interviewerIdCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='interviews' AND column_name='interviewer_id';
    `);
    
    if (interviewerIdCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE interviews 
        ADD COLUMN interviewer_id INTEGER REFERENCES admins(id);
      `);
      console.log('✓ Added interviewer_id column to interviews table');
    } else {
      console.log('✓ interviewer_id column already exists');
    }
    
    // Check if updated_at column exists in interviews table
    const updatedAtCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='interviews' AND column_name='updated_at';
    `);
    
    if (updatedAtCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE interviews 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✓ Added updated_at column to interviews table');
    } else {
      console.log('✓ updated_at column already exists');
    }
    
    // Check if employee_id column exists in payroll table
    const payrollEmployeeIdCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='employee_id';
    `);
    
    if (payrollEmployeeIdCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE payroll 
        ADD COLUMN employee_id INTEGER REFERENCES employees(id);
      `);
      console.log('✓ Added employee_id column to payroll table');
    } else {
      console.log('✓ employee_id column already exists');
    }
    
    // Check if pay_period_start column exists in payroll table
    const payrollPeriodStartCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='pay_period_start';
    `);
    
    if (payrollPeriodStartCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE payroll 
        ADD COLUMN pay_period_start DATE;
      `);
      console.log('✓ Added pay_period_start column to payroll table');
    } else {
      console.log('✓ pay_period_start column already exists');
    }
    
    // Check if pay_period_end column exists in payroll table
    const payrollPeriodEndCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='pay_period_end';
    `);
    
    if (payrollPeriodEndCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE payroll 
        ADD COLUMN pay_period_end DATE;
      `);
      console.log('✓ Added pay_period_end column to payroll table');
    } else {
      console.log('✓ pay_period_end column already exists');
    }
    
    // Check if gross_salary column exists in payroll table
    const payrollGrossSalaryCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='gross_salary';
    `);
    
    if (payrollGrossSalaryCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE payroll 
        ADD COLUMN gross_salary DECIMAL(12,2);
      `);
      console.log('✓ Added gross_salary column to payroll table');
    } else {
      console.log('✓ gross_salary column already exists');
    }
    
    // Check if net_salary column exists in payroll table
    const payrollNetSalaryCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='net_salary';
    `);
    
    if (payrollNetSalaryCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE payroll 
        ADD COLUMN net_salary DECIMAL(12,2);
      `);
      console.log('✓ Added net_salary column to payroll table');
    } else {
      console.log('✓ net_salary column already exists');
    }
    
    // Check if created_at column exists in payroll table
    const payrollCreatedAtCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='created_at';
    `);
    
    if (payrollCreatedAtCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE payroll 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✓ Added created_at column to payroll table');
    } else {
      console.log('✓ created_at column already exists');
    }
    
    // Make period column nullable if it has NOT NULL constraint
    const periodCheck = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name='payroll' AND column_name='period';
    `);
    
    if (periodCheck.rows.length > 0 && periodCheck.rows[0].is_nullable === 'NO') {
      await client.query(`
        ALTER TABLE payroll 
        ALTER COLUMN period DROP NOT NULL;
      `);
      console.log('✓ Made period column nullable in payroll table');
    } else if (periodCheck.rows.length > 0) {
      console.log('✓ period column is already nullable');
    }
    
    // Check if review_period_start column exists in performance_reviews table
    const perfPeriodStartCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='performance_reviews' AND column_name='review_period_start';
    `);
    
    if (perfPeriodStartCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE performance_reviews 
        ADD COLUMN review_period_start DATE;
      `);
      console.log('✓ Added review_period_start column to performance_reviews table');
    } else {
      console.log('✓ review_period_start column already exists');
    }
    
    // Check if review_period_end column exists in performance_reviews table
    const perfPeriodEndCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='performance_reviews' AND column_name='review_period_end';
    `);
    
    if (perfPeriodEndCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE performance_reviews 
        ADD COLUMN review_period_end DATE;
      `);
      console.log('✓ Added review_period_end column to performance_reviews table');
    } else {
      console.log('✓ review_period_end column already exists');
    }
    
    // Check if rating column exists in performance_reviews table
    const perfRatingCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='performance_reviews' AND column_name='rating';
    `);
    
    if (perfRatingCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE performance_reviews 
        ADD COLUMN rating INTEGER;
      `);
      console.log('✓ Added rating column to performance_reviews table');
    } else {
      console.log('✓ rating column already exists');
    }
    
    // Check if comments column exists in performance_reviews table
    const perfCommentsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='performance_reviews' AND column_name='comments';
    `);
    
    if (perfCommentsCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE performance_reviews 
        ADD COLUMN comments TEXT;
      `);
      console.log('✓ Added comments column to performance_reviews table');
    } else {
      console.log('✓ comments column already exists');
    }
    
    // Check if created_at column exists in performance_reviews table
    const perfCreatedAtCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='performance_reviews' AND column_name='created_at';
    `);
    
    if (perfCreatedAtCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE performance_reviews 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✓ Added created_at column to performance_reviews table');
    } else {
      console.log('✓ created_at column already exists');
    }
    
    // Check if password_hash column exists in employees table
    const passwordHashCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='employees' AND column_name='password_hash';
    `);
    
    if (passwordHashCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE employees 
        ADD COLUMN password_hash VARCHAR(255);
      `);
      console.log('✓ Added password_hash column to employees table');
    } else {
      console.log('✓ password_hash column already exists');
    }
    
    console.log('Migrations completed successfully!');
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

