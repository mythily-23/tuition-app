import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tuition_db'
});

const createTablesSQL = `
  -- Grades table (Class 1-12)
  CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    level INT NOT NULL
  );

  -- Subjects table
  CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
  );

  -- Subject Grades (subject + grade + reference fee)
  CREATE TABLE IF NOT EXISTS subject_grades (
    id SERIAL PRIMARY KEY,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    grade_id INT NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    reference_fee DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, grade_id)
  );

  -- Teachers table
  CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject_id INT REFERENCES subjects(id),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Teacher Grade Salary (teacher + grade + salary)
  CREATE TABLE IF NOT EXISTS teacher_grade_salary (
    id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    grade_id INT NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    monthly_salary DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, grade_id)
  );

  -- Students table
  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_id INT REFERENCES grades(id),
    phone VARCHAR(15),
    parent_phone VARCHAR(15),
    email VARCHAR(100),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
  );

  -- Student enrollment (which subjects a student takes)
  CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id),
    grade_id INT NOT NULL REFERENCES grades(id),
    monthly_fee DECIMAL(10, 2) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(student_id, subject_id)
  );

  -- Payments table
  CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(20),
    months_covered INT DEFAULT 1,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Teacher payments (monthly salary records)
  CREATE TABLE IF NOT EXISTS teacher_payments (
    id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES teachers(id),
    month DATE NOT NULL,
    salary_amount DECIMAL(10, 2) NOT NULL,
    revenue_share_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Revenue share classes (e.g., chess)
  CREATE TABLE IF NOT EXISTS revenue_share_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher_percentage INT NOT NULL DEFAULT 70,
    admin_percentage INT NOT NULL DEFAULT 30,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Revenue share transactions
  CREATE TABLE IF NOT EXISTS revenue_share_transactions (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES revenue_share_classes(id),
    student_id INT REFERENCES students(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Admin user
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_student_name ON students(name);
  CREATE INDEX IF NOT EXISTS idx_payment_date ON payments(payment_date);
  CREATE INDEX IF NOT EXISTS idx_student_payments ON payments(student_id);
  CREATE INDEX IF NOT EXISTS idx_enrollment_active ON enrollments(is_active);
`;

async function initDB() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Split by semicolon and execute each statement
    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
      }
    }

    // Seed default grades (Class 1-12)
    console.log('Seeding grades...');
    for (let i = 1; i <= 12; i++) {
      await client.query(
        'INSERT INTO grades (name, level) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [`Class ${i}`, i]
      );
    }

    console.log('✅ Database tables created successfully');
    console.log('✅ Grades seeded (Class 1-12)');
    await client.end();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
