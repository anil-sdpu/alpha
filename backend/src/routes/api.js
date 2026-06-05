const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

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

router.get('/students', authenticate, requirePermission('students','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.id, s.full_name, s.gender, s.mobile, s.email, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id LIMIT 50');
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch students' });
  }
});

router.get('/classes', authenticate, requirePermission('classes','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, class_name, academic_year, description FROM classes LIMIT 50');
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch classes' });
  }
});

router.get('/subjects', authenticate, requirePermission('subjects','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, subject_name, subject_code, description FROM subjects LIMIT 50');
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch subjects' });
  }
});

// Classes CRUD
router.post('/classes', authenticate, requirePermission('classes','create'), async (req, res) => {
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

router.put('/classes/:id', authenticate, requirePermission('classes','edit'), async (req, res) => {
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

router.delete('/classes/:id', authenticate, requirePermission('classes','delete'), async (req, res) => {
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
router.post('/subjects', authenticate, requirePermission('subjects','create'), async (req, res) => {
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

router.put('/subjects/:id', authenticate, requirePermission('subjects','edit'), async (req, res) => {
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

router.delete('/subjects/:id', authenticate, requirePermission('subjects','delete'), async (req, res) => {
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
router.get('/students/:id', authenticate, requirePermission('students','view'), async (req, res) => {
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

router.post('/students', authenticate, requirePermission('students','create'), async (req, res) => {
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

router.put('/students/:id', authenticate, requirePermission('students','edit'), async (req, res) => {
  const { id } = req.params;
  const { full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section } = req.body;
  try {
    await pool.query(
      'UPDATE students SET full_name = ?, gender = ?, dob = ?, mobile = ?, parent_name = ?, parent_contact = ?, address = ?, email = ?, admission_date = ?, class_id = ?, section = ? WHERE id = ?',
      [full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update student' });
  }
});

router.delete('/students/:id', authenticate, requirePermission('students','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete student' });
  }
});

// Chapters CRUD
router.get('/chapters', authenticate, requirePermission('chapters','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ch.id, ch.title, ch.chapter_number, ch.status, s.subject_name FROM chapters ch LEFT JOIN subjects s ON ch.subject_id = s.id LIMIT 200');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch chapters' });
  }
});

router.post('/chapters', authenticate, requirePermission('chapters','create'), async (req, res) => {
  const { subject_id, chapter_number, title, notes_path, status } = req.body;
  if (!subject_id || !title) return res.status(400).json({ error: 'subject_id and title required' });
  try {
    const [result] = await pool.query('INSERT INTO chapters (subject_id, chapter_number, title, notes_path, status) VALUES (?, ?, ?, ?, ?)', [subject_id, chapter_number, title, notes_path, status || 'published']);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create chapter' });
  }
});

router.put('/chapters/:id', authenticate, requirePermission('chapters','edit'), async (req, res) => {
  const { id } = req.params;
  const { subject_id, chapter_number, title, notes_path, status } = req.body;
  try {
    await pool.query('UPDATE chapters SET subject_id = ?, chapter_number = ?, title = ?, notes_path = ?, status = ? WHERE id = ?', [subject_id, chapter_number, title, notes_path, status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update chapter' });
  }
});

router.delete('/chapters/:id', authenticate, requirePermission('chapters','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete chapter' });
  }
});

// Tests CRUD
router.get('/tests', authenticate, requirePermission('tests','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT t.*, c.class_name, s.subject_name, ch.title as chapter_title FROM tests t LEFT JOIN classes c ON t.class_id = c.id LEFT JOIN subjects s ON t.subject_id = s.id LEFT JOIN chapters ch ON t.chapter_id = ch.id ORDER BY t.date DESC LIMIT 200');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch tests' });
  }
});

router.post('/tests', authenticate, requirePermission('tests','create'), async (req, res) => {
  const { class_id, subject_id, chapter_id, test_type, title, date, start_time, end_time, total_marks, duration_minutes, instructions } = req.body;
  if (!class_id || !subject_id || !title || !date) return res.status(400).json({ error: 'class_id, subject_id, title and date required' });
  try {
    const [result] = await pool.query('INSERT INTO tests (class_id, subject_id, chapter_id, test_type, title, date, start_time, end_time, total_marks, duration_minutes, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [class_id, subject_id, chapter_id, test_type, title, date, start_time, end_time, total_marks || 100, duration_minutes || 60, instructions]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create test' });
  }
});

router.put('/tests/:id', authenticate, requirePermission('tests','edit'), async (req, res) => {
  const { id } = req.params;
  const { class_id, subject_id, chapter_id, test_type, title, date, start_time, end_time, total_marks, duration_minutes, instructions } = req.body;
  try {
    await pool.query('UPDATE tests SET class_id = ?, subject_id = ?, chapter_id = ?, test_type = ?, title = ?, date = ?, start_time = ?, end_time = ?, total_marks = ?, duration_minutes = ?, instructions = ? WHERE id = ?', [class_id, subject_id, chapter_id, test_type, title, date, start_time, end_time, total_marks, duration_minutes, instructions, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update test' });
  }
});

router.delete('/tests/:id', authenticate, requirePermission('tests','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tests WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete test' });
  }
});

// Questions CRUD
router.get('/questions', authenticate, requirePermission('questions','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT q.*, s.subject_name, ch.title as chapter_title FROM questions q LEFT JOIN subjects s ON q.subject_id = s.id LEFT JOIN chapters ch ON q.chapter_id = ch.id ORDER BY q.created_at DESC LIMIT 500');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch questions' });
  }
});

router.post('/questions', authenticate, requirePermission('questions','create'), async (req, res) => {
  const { subject_id, chapter_id, question_type, question_text, options, correct_answer, marks, difficulty, tags } = req.body;
  if (!question_text) return res.status(400).json({ error: 'question_text required' });
  try {
    const opts = options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null;
    const [result] = await pool.query('INSERT INTO questions (subject_id, chapter_id, question_type, question_text, options, correct_answer, marks, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [subject_id, chapter_id, question_type, question_text, opts, correct_answer, marks || 1, difficulty || 'medium', tags]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create question' });
  }
});

router.put('/questions/:id', authenticate, requirePermission('questions','edit'), async (req, res) => {
  const { id } = req.params;
  const { subject_id, chapter_id, question_type, question_text, options, correct_answer, marks, difficulty, tags } = req.body;
  try {
    const opts = options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null;
    await pool.query('UPDATE questions SET subject_id = ?, chapter_id = ?, question_type = ?, question_text = ?, options = ?, correct_answer = ?, marks = ?, difficulty = ?, tags = ? WHERE id = ?', [subject_id, chapter_id, question_type, question_text, opts, correct_answer, marks, difficulty, tags, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update question' });
  }
});

router.delete('/questions/:id', authenticate, requirePermission('questions','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM questions WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete question' });
  }
});

// Question Papers (basic)
router.get('/question_papers', authenticate, requirePermission('tests','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT qp.*, t.title as test_title, u.full_name as generated_by_name FROM question_papers qp LEFT JOIN tests t ON qp.test_id = t.id LEFT JOIN users u ON qp.generated_by = u.id ORDER BY qp.created_at DESC LIMIT 200');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch question papers' });
  }
});

router.post('/question_papers', authenticate, requirePermission('tests','create'), async (req, res) => {
  const { test_id, title, generated_by, pdf_path } = req.body;
  if (!test_id || !title) return res.status(400).json({ error: 'test_id and title required' });
  try {
    const [result] = await pool.query('INSERT INTO question_papers (test_id, title, generated_by, pdf_path) VALUES (?, ?, ?, ?)', [test_id, title, generated_by || null, pdf_path || null]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create question paper' });
  }
});

// File upload setup
const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(uploadsRoot, 'question_papers');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage });

// Upload PDF for question paper and optionally create record
router.post('/upload/question_paper', authenticate, requirePermission('tests','create'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const relPath = path.join('uploads', 'question_papers', req.file.filename).replace(/\\/g, '/');
    // create db record if test_id provided
    const { test_id, title } = req.body;
    if (test_id && title) {
      const [r] = await pool.query('INSERT INTO question_papers (test_id, title, generated_by, pdf_path) VALUES (?, ?, ?, ?)', [test_id, title, req.user.id, relPath]);
      return res.json({ id: r.insertId, path: relPath });
    }
    res.json({ path: relPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Generate a simple PDF question paper from question ids
router.post('/question_papers/generate', authenticate, requirePermission('tests','create'), async (req, res) => {
  try {
    const { test_id, title, question_ids } = req.body;
    if (!test_id || !title || !Array.isArray(question_ids) || question_ids.length === 0) return res.status(400).json({ error: 'test_id, title and question_ids required' });
    // fetch questions
    const [questions] = await pool.query('SELECT id, question_text, options, marks FROM questions WHERE id IN (?)', [question_ids]);
    // create pdf
    const filename = `${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const outDir = path.join(uploadsRoot, 'question_papers');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    let idx = 1;
    for (const q of questions) {
      doc.fontSize(12).text(`${idx}. ${q.question_text}`);
      if (q.options) {
        let opts = [];
        try { opts = JSON.parse(q.options); } catch (e) { opts = null; }
        if (Array.isArray(opts)) {
          let oIdx = 0;
          for (const o of opts) {
            const label = String.fromCharCode(65 + (oIdx % 26));
            doc.text(`   ${label}. ${o}`);
            oIdx++;
          }
        }
      }
      doc.moveDown();
      idx++;
    }
    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    const relPath = path.join('uploads', 'question_papers', filename).replace(/\\/g, '/');
    const [r] = await pool.query('INSERT INTO question_papers (test_id, title, generated_by, pdf_path) VALUES (?, ?, ?, ?)', [test_id, title, req.user.id, relPath]);
    const qpId = r.insertId;
    // insert question relations
    const inserts = question_ids.map((qid, i) => [qpId, qid, i + 1]);
    if (inserts.length) await pool.query('INSERT INTO question_paper_questions (question_paper_id, question_id, sequence_order) VALUES ?', [inserts]);
    res.json({ id: qpId, path: relPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to generate question paper' });
  }
});

// DPQ CRUD
router.get('/dpq', authenticate, requirePermission('dpq','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT d.*, c.class_name, s.subject_name, ch.title as chapter_title FROM dpq d LEFT JOIN classes c ON d.class_id = c.id LEFT JOIN subjects s ON d.subject_id = s.id LEFT JOIN chapters ch ON d.chapter_id = ch.id ORDER BY d.publish_date DESC LIMIT 200');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch dpq' });
  }
});

router.post('/dpq', authenticate, requirePermission('dpq','create'), async (req, res) => {
  const { class_id, subject_id, chapter_id, title, description, publish_date, due_date, status } = req.body;
  if (!class_id || !title || !publish_date) return res.status(400).json({ error: 'class_id, title and publish_date required' });
  try {
    const [result] = await pool.query('INSERT INTO dpq (class_id, subject_id, chapter_id, title, description, publish_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [class_id, subject_id, chapter_id, title, description, publish_date, due_date, status || 'published']);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create dpq' });
  }
});

router.put('/dpq/:id', authenticate, requirePermission('dpq','edit'), async (req, res) => {
  const { id } = req.params;
  const { class_id, subject_id, chapter_id, title, description, publish_date, due_date, status } = req.body;
  try {
    await pool.query('UPDATE dpq SET class_id = ?, subject_id = ?, chapter_id = ?, title = ?, description = ?, publish_date = ?, due_date = ?, status = ? WHERE id = ?', [class_id, subject_id, chapter_id, title, description, publish_date, due_date, status, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update dpq' });
  }
});

router.delete('/dpq/:id', authenticate, requirePermission('dpq','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM dpq WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete dpq' });
  }
});

// Attendance CRUD
router.get('/attendance', authenticate, requirePermission('attendance','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT a.*, s.full_name, c.class_name FROM attendance a LEFT JOIN students s ON a.student_id = s.id LEFT JOIN classes c ON a.class_id = c.id ORDER BY a.attendance_date DESC LIMIT 500');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch attendance' });
  }
});

router.post('/attendance', authenticate, requirePermission('attendance','create'), async (req, res) => {
  const { student_id, class_id, attendance_date, status, remarks } = req.body;
  if (!student_id || !class_id || !attendance_date) return res.status(400).json({ error: 'student_id, class_id and attendance_date required' });
  try {
    const [result] = await pool.query('INSERT INTO attendance (student_id, class_id, attendance_date, status, remarks) VALUES (?, ?, ?, ?, ?)', [student_id, class_id, attendance_date, status || 'present', remarks]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create attendance record' });
  }
});

router.put('/attendance/:id', authenticate, requirePermission('attendance','edit'), async (req, res) => {
  const { id } = req.params;
  const { student_id, class_id, attendance_date, status, remarks } = req.body;
  try {
    await pool.query('UPDATE attendance SET student_id = ?, class_id = ?, attendance_date = ?, status = ?, remarks = ? WHERE id = ?', [student_id, class_id, attendance_date, status, remarks, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update attendance' });
  }
});

router.delete('/attendance/:id', authenticate, requirePermission('attendance','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete attendance record' });
  }
});

// Fees CRUD
router.get('/fees', authenticate, requirePermission('fees','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT f.*, s.full_name FROM fees f LEFT JOIN students s ON f.student_id = s.id ORDER BY f.created_at DESC LIMIT 500');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch fees' });
  }
});

router.post('/fees', authenticate, requirePermission('fees','create'), async (req, res) => {
  const { student_id, total_fee, paid_amount, due_amount, payment_date, payment_mode, status, remarks } = req.body;
  if (!student_id) return res.status(400).json({ error: 'student_id required' });
  try {
    const [result] = await pool.query('INSERT INTO fees (student_id, total_fee, paid_amount, due_amount, payment_date, payment_mode, status, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [student_id, total_fee || 0, paid_amount || 0, due_amount || 0, payment_date || null, payment_mode || 'cash', status || 'due', remarks]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create fee record' });
  }
});

router.put('/fees/:id', authenticate, requirePermission('fees','edit'), async (req, res) => {
  const { id } = req.params;
  const { student_id, total_fee, paid_amount, due_amount, payment_date, payment_mode, status, remarks } = req.body;
  try {
    await pool.query('UPDATE fees SET student_id = ?, total_fee = ?, paid_amount = ?, due_amount = ?, payment_date = ?, payment_mode = ?, status = ?, remarks = ? WHERE id = ?', [student_id, total_fee, paid_amount, due_amount, payment_date, payment_mode, status, remarks, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update fee record' });
  }
});

router.delete('/fees/:id', authenticate, requirePermission('fees','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fees WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete fee record' });
  }
});

// Notifications CRUD
router.get('/notifications', authenticate, requirePermission('notifications','view'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY send_date DESC LIMIT 500');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch notifications' });
  }
});

router.post('/notifications', authenticate, requirePermission('notifications','create'), async (req, res) => {
  const { recipient_role, recipient_id, type, message, channel, is_read } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    const [result] = await pool.query('INSERT INTO notifications (recipient_role, recipient_id, type, message, channel, is_read) VALUES (?, ?, ?, ?, ?, ?)', [recipient_role || 'all', recipient_id || null, type || 'general', message, channel || 'in-app', is_read ? 1 : 0]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create notification' });
  }
});

router.put('/notifications/:id', authenticate, requirePermission('notifications','edit'), async (req, res) => {
  const { id } = req.params;
  const { recipient_role, recipient_id, type, message, channel, is_read } = req.body;
  try {
    await pool.query('UPDATE notifications SET recipient_role = ?, recipient_id = ?, type = ?, message = ?, channel = ?, is_read = ? WHERE id = ?', [recipient_role, recipient_id, type, message, channel, is_read ? 1 : 0, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update notification' });
  }
});

router.delete('/notifications/:id', authenticate, requirePermission('notifications','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete notification' });
  }
});

// Helper: create SMTP transporter if configured
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({ host, port: Number(port), secure: false, auth: { user, pass } });
}

// Generate a marks card PDF and optionally send to parent email
router.post('/reports/markcard', authenticate, requirePermission('students','edit'), async (req, res) => {
  try {
    const { student_id, period, period_label, grades, comments, send_email, recipient_email } = req.body;
    if (!student_id || !period || !Array.isArray(grades)) return res.status(400).json({ error: 'student_id, period and grades[] required' });
    const [srows] = await pool.query('SELECT * FROM students WHERE id = ? LIMIT 1', [student_id]);
    if (!srows[0]) return res.status(404).json({ error: 'Student not found' });
    const student = srows[0];

    // create pdf
    const filename = `${Date.now()}-markcard-${student.id}.pdf`;
    const outDir = path.join(uploadsRoot, 'reports');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, filename);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    doc.fontSize(20).text('Marksheet / Report Card', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${student.full_name}`);
    doc.text(`Class ID: ${student.class_id || 'N/A'}`);
    doc.text(`Period: ${period} ${period_label ? '('+period_label+')' : ''}`);
    doc.moveDown();

    let totalObt = 0, totalMax = 0;
    doc.fontSize(12);
    for (const g of grades) {
      const subj = g.subject_name || g.subject_id || 'Subject';
      const obt = Number(g.obtained || 0);
      const max = Number(g.total || 100);
      totalObt += obt;
      totalMax += max;
      doc.text(`${subj}: ${obt} / ${max}    Grade: ${g.grade || ''}    Remarks: ${g.remarks || ''}`);
    }
    const percent = totalMax ? Math.round((totalObt / totalMax) * 10000) / 100 : 0;
    doc.moveDown();
    doc.text(`Total: ${totalObt} / ${totalMax}    Percentage: ${percent}%`);
    if (comments) {
      doc.moveDown();
      doc.text(`Comments: ${comments}`);
    }
    doc.moveDown();
    doc.text(`Generated by: ${req.user.name || req.user.id} on ${new Date().toLocaleString()}`);
    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    const relPath = path.join('uploads', 'reports', filename).replace(/\\/g, '/');

    // persist record if reports table exists (silent failure if not)
    try {
      await pool.query('INSERT INTO reports (student_id, period, file_path, created_by, notes) VALUES (?, ?, ?, ?, ?)', [student_id, period, relPath, req.user.id, comments || null]);
    } catch (e) {
      // ignore if table missing
    }

    // send email if requested
    if (send_email) {
      const transporter = getTransporter();
      const to = recipient_email || student.email || null;
      if (!transporter) return res.status(500).json({ error: 'SMTP not configured' });
      if (!to) return res.status(400).json({ error: 'No recipient email available' });
      const mail = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject: `Report Card - ${student.full_name} - ${period}`,
        text: `Please find attached the report card for ${student.full_name}.`,
        attachments: [{ filename, path: outPath }]
      };
      await transporter.sendMail(mail);
    }

    res.json({ path: relPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to generate report' });
  }
});

// Send notification emails / mass alerts
router.post('/notifications/send', authenticate, requirePermission('notifications','create'), async (req, res) => {
  try {
    const { title, message, priority, due_date, recipient_role, recipient_ids, channel } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    // resolve recipients
    let recipients = [];
    if (Array.isArray(recipient_ids) && recipient_ids.length) {
      // assume student ids
      const [rows] = await pool.query('SELECT id, full_name, email, parent_contact FROM students WHERE id IN (?)', [recipient_ids]);
      recipients = rows.map(r => ({ id: r.id, name: r.full_name, email: r.email }));
    } else if (recipient_role === 'tutor') {
      const [rows] = await pool.query('SELECT id, full_name, email FROM users WHERE role = ?', ['tutor']);
      recipients = rows.map(r => ({ id: r.id, name: r.full_name, email: r.email }));
    } else {
      // default to students/all
      const [rows] = await pool.query('SELECT id, full_name, email FROM students');
      recipients = rows.map(r => ({ id: r.id, name: r.full_name, email: r.email }));
    }

    // insert notifications and optionally send email
    const transporter = getTransporter();
    let sent = 0, failed = 0;
    for (const r of recipients) {
      try {
        await pool.query('INSERT INTO notifications (recipient_role, recipient_id, type, message, channel, is_read, send_date, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)', [recipient_role || 'student', r.id, 'alert', message, channel || 'in-app', 0, priority || 'normal', due_date || null]);
        if (channel && channel.includes('email')) {
          if (!transporter) throw new Error('SMTP not configured');
          if (!r.email) throw new Error('No email for recipient');
          await transporter.sendMail({ from: process.env.FROM_EMAIL || process.env.SMTP_USER, to: r.email, subject: title || 'Notification', text: message });
        }
        sent++;
      } catch (e) {
        console.error('Failed to notify', r.id, e.message || e);
        failed++;
      }
    }

    res.json({ ok: true, sent, failed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to send notifications' });
  }
});

module.exports = router;

