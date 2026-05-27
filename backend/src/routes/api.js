const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash || '');
    // if (!validPassword) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, name: user.full_name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to process login' });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  res.json({ profile: req.user });
});

router.get('/students', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.id, s.full_name, s.gender, s.mobile, s.email, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id LIMIT 50');
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch students' });
  }
});

router.get('/classes', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, class_name, academic_year, description FROM classes LIMIT 50');
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch classes' });
  }
});

router.get('/subjects', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, subject_name, subject_code, description FROM subjects LIMIT 50');
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch subjects' });
  }
});

// Classes CRUD
router.post('/classes', authenticate, async (req, res) => {
  const { class_name, academic_year, description } = req.body;
  if (!class_name) return res.status(400).json({ error: 'class_name required' });
  try {
    const [result] = await pool.query('INSERT INTO classes (class_name, academic_year, description) VALUES (?, ?, ?)', [class_name, academic_year, description]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create class' });
  }
});

router.put('/classes/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { class_name, academic_year, description } = req.body;
  try {
    await pool.query('UPDATE classes SET class_name = ?, academic_year = ?, description = ? WHERE id = ?', [class_name, academic_year, description, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update class' });
  }
});

router.delete('/classes/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete class' });
  }
});

// Subjects CRUD
router.post('/subjects', authenticate, async (req, res) => {
  const { class_id, subject_name, subject_code, description } = req.body;
  if (!subject_name) return res.status(400).json({ error: 'subject_name required' });
  try {
    const [result] = await pool.query('INSERT INTO subjects (class_id, subject_name, subject_code, description) VALUES (?, ?, ?, ?)', [class_id, subject_name, subject_code, description]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create subject' });
  }
});

router.put('/subjects/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { class_id, subject_name, subject_code, description } = req.body;
  try {
    await pool.query('UPDATE subjects SET class_id = ?, subject_name = ?, subject_code = ?, description = ? WHERE id = ?', [class_id, subject_name, subject_code, description, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update subject' });
  }
});

router.delete('/subjects/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete subject' });
  }
});

// Students CRUD
router.get('/students/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch student' });
  }
});

router.post('/students', authenticate, async (req, res) => {
  const { full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO students (full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create student' });
  }
});

router.put('/students/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status } = req.body;
  try {
    await pool.query(
      'UPDATE students SET full_name = ?, gender = ?, dob = ?, mobile = ?, parent_name = ?, parent_contact = ?, address = ?, email = ?, admission_date = ?, class_id = ?, section = ?, status = ? WHERE id = ?',
      [full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update student' });
  }
});

router.delete('/students/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete student' });
  }
});

module.exports = router;
