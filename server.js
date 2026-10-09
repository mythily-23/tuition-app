import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());


// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tuition_db'
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO admin_users (username, password, name) VALUES ($1, $2, $3) RETURNING id, username, name',
      [username, hashedPassword, name]
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
    
    const user = result.rows[0];
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== GRADES ====================
app.get('/api/grades', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grades ORDER BY level');
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== STUDENTS ====================
app.get('/api/students', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, g.name as grade_name FROM students s 
       LEFT JOIN grades g ON s.grade_id = g.id 
       WHERE s.is_active = true ORDER BY s.name`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/students', authMiddleware, async (req, res) => {
  try {
    const { name, grade_id, phone, parent_phone, email, address } = req.body;
    const result = await pool.query(
      'INSERT INTO students (name, grade_id, phone, parent_phone, email, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, grade_id, phone, parent_phone, email, address]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, g.name as grade_name FROM students s 
       LEFT JOIN grades g ON s.grade_id = g.id 
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const { name, grade_id, phone, parent_phone, email, address } = req.body;
    const result = await pool.query(
      'UPDATE students SET name = $1, grade_id = $2, phone = $3, parent_phone = $4, email = $5, address = $6 WHERE id = $7 RETURNING *',
      [name, grade_id, phone, parent_phone, email, address, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== SUBJECTS ====================
app.get('/api/subjects', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/subjects', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO subjects (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== SUBJECT GRADES ====================
app.get('/api/subject-grades', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sg.*, s.name as subject_name, g.name as grade_name FROM subject_grades sg
       JOIN subjects s ON sg.subject_id = s.id
       JOIN grades g ON sg.grade_id = g.id
       ORDER BY s.name, g.level`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/subject-grades', authMiddleware, async (req, res) => {
  try {
    const { subject_id, grade_id, reference_fee } = req.body;
    const result = await pool.query(
      'INSERT INTO subject_grades (subject_id, grade_id, reference_fee) VALUES ($1, $2, $3) RETURNING *',
      [subject_id, grade_id, reference_fee]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/subject-grades/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM subject_grades WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/subject-grades/subject/:subjectId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sg.*, g.name as grade_name FROM subject_grades sg
       JOIN grades g ON sg.grade_id = g.id
       WHERE sg.subject_id = $1
       ORDER BY g.level`,
      [req.params.subjectId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ENROLLMENTS ====================
app.get('/api/enrollments/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, s.name as subject_name, g.name as grade_name FROM enrollments e 
       JOIN subjects s ON e.subject_id = s.id 
       JOIN grades g ON e.grade_id = g.id
       WHERE e.student_id = $1 AND e.is_active = true
       ORDER BY s.name`,
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/enrollments', authMiddleware, async (req, res) => {
  try {
    const { student_id, subject_id, grade_id, monthly_fee } = req.body;
    const result = await pool.query(
      'INSERT INTO enrollments (student_id, subject_id, grade_id, monthly_fee) VALUES ($1, $2, $3, $4) RETURNING *',
      [student_id, subject_id, grade_id, monthly_fee]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/enrollments/:id', authMiddleware, async (req, res) => {
  try {
    const { monthly_fee } = req.body;
    const result = await pool.query(
      'UPDATE enrollments SET monthly_fee = $1 WHERE id = $2 RETURNING *',
      [monthly_fee, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/enrollments/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE enrollments SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PAYMENTS ====================
app.get('/api/payments', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, s.name as student_name FROM payments p 
       JOIN students s ON p.student_id = s.id 
       ORDER BY p.payment_date DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payments', authMiddleware, async (req, res) => {
  try {
    const { student_id, amount, payment_date, payment_method, months_covered, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO payments (student_id, amount, payment_date, payment_method, months_covered, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, amount, payment_date, payment_method, months_covered || 1, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/payments/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE student_id = $1 ORDER BY payment_date DESC',
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== DASHBOARD STATS ====================
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const totalStudents = await pool.query('SELECT COUNT(*) FROM students WHERE is_active = true');
    const todayCollections = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE payment_date = CURRENT_DATE"
    );
    const monthCollections = await pool.query(
      `SELECT SUM(amount) as total FROM payments 
       WHERE EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)`
    );
    const collectionsByGrade = await pool.query(
      `SELECT g.name as grade_name, COALESCE(SUM(p.amount), 0) as total
       FROM grades g
       LEFT JOIN students s ON g.id = s.grade_id AND s.is_active = true
       LEFT JOIN enrollments e ON s.id = e.student_id AND e.is_active = true
       LEFT JOIN payments p ON s.id = p.student_id
       GROUP BY g.id, g.name
       ORDER BY g.level`
    );
    const teachers = await pool.query('SELECT COUNT(*) FROM teachers');

    res.json({
      totalStudents: totalStudents.rows[0].count,
      totalTeachers: teachers.rows[0].count,
      todayCollections: todayCollections.rows[0].total || 0,
      monthCollections: monthCollections.rows[0].total || 0,
      collectionsByGrade: collectionsByGrade.rows
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== TEACHERS ====================
app.get('/api/teachers', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, s.name as subject_name FROM teachers t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       ORDER BY t.name`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/teachers', authMiddleware, async (req, res) => {
  try {
    const { name, subject_id, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO teachers (name, subject_id, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, subject_id, phone]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teachers/:id', authMiddleware, async (req, res) => {
  try {
    const { name, subject_id, phone } = req.body;
    const result = await pool.query(
      'UPDATE teachers SET name = $1, subject_id = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, subject_id, phone, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== TEACHER GRADE SALARY ====================
app.get('/api/teacher-grade-salary/:teacherId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tgs.*, g.name as grade_name FROM teacher_grade_salary tgs
       JOIN grades g ON tgs.grade_id = g.id
       WHERE tgs.teacher_id = $1
       ORDER BY g.level`,
      [req.params.teacherId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/teacher-grade-salary', authMiddleware, async (req, res) => {
  try {
    const { teacher_id, grade_id, monthly_salary } = req.body;
    const result = await pool.query(
      'INSERT INTO teacher_grade_salary (teacher_id, grade_id, monthly_salary) VALUES ($1, $2, $3) RETURNING *',
      [teacher_id, grade_id, monthly_salary]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teacher-grade-salary/:id', authMiddleware, async (req, res) => {
  try {
    const { monthly_salary } = req.body;
    const result = await pool.query(
      'UPDATE teacher_grade_salary SET monthly_salary = $1 WHERE id = $2 RETURNING *',
      [monthly_salary, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/teacher-grade-salary/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM teacher_grade_salary WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== REPORTS ====================
app.get('/api/reports/pending-fees', authMiddleware, async (req, res) => {
  try {
    const { gradeId, subjectId } = req.query;
    let query = `SELECT 
      s.id, s.name, s.phone, g.name as grade_name,
      COALESCE(SUM(e.monthly_fee), 0) as total_monthly_fees,
      COALESCE(SUM(p.amount), 0) as total_paid,
      COALESCE(SUM(e.monthly_fee), 0) - COALESCE(SUM(p.amount), 0) as pending_amount
    FROM students s
    LEFT JOIN grades g ON s.grade_id = g.id
    LEFT JOIN enrollments e ON s.id = e.student_id AND e.is_active = true
    LEFT JOIN payments p ON s.id = p.student_id
    WHERE s.is_active = true`;
    
    const params = [];
    if (gradeId) {
      query += ` AND s.grade_id = $${params.length + 1}`;
      params.push(gradeId);
    }
    if (subjectId) {
      query += ` AND e.subject_id = $${params.length + 1}`;
      params.push(subjectId);
    }
    
    query += ` GROUP BY s.id, s.name, s.phone, g.name
      HAVING COALESCE(SUM(e.monthly_fee), 0) - COALESCE(SUM(p.amount), 0) > 0
      ORDER BY pending_amount DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/reports/monthly-collection', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', payment_date) as month, SUM(amount) as total
       FROM payments
       GROUP BY DATE_TRUNC('month', payment_date)
       ORDER BY month DESC LIMIT 12`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/reports/teacher-payroll', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id, t.name, t.subject_id,
        COALESCE(SUM(tgs.monthly_salary), 0) as total_salary
      FROM teachers t
      LEFT JOIN teacher_grade_salary tgs ON t.id = tgs.teacher_id
      GROUP BY t.id, t.name, t.subject_id
      ORDER BY t.name`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
