const fs = require('fs');
const path = require('path');
const pool = require('../src/db');
const bcrypt = require('bcryptjs');

async function run() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);

  console.log('Running schema statements:', stmts.length);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const stmt of stmts) {
      await conn.query(stmt);
    }

    // seed admin user if not exists
    const [rows] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', ['admin@alpha.local']);
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await conn.query('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Admin User', 'admin@alpha.local', hash, 'admin']);
      console.log('Inserted admin user (email: admin@alpha.local, password: admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // seed a sample class
    const [crows] = await conn.query('SELECT id FROM classes WHERE class_name = ? LIMIT 1', ['10th']);
    let classId;
    if (crows.length === 0) {
      const [res] = await conn.query('INSERT INTO classes (class_name, academic_year, description) VALUES (?, ?, ?)', ['10th', '2025-2026', 'Sample 10th grade class']);
      classId = res.insertId;
      console.log('Inserted sample class id', classId);
    } else {
      classId = crows[0].id;
    }

    // seed subjects
    const subjects = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHEM' }
    ];

    for (const s of subjects) {
      const [srows] = await conn.query('SELECT id FROM subjects WHERE subject_name = ? AND class_id = ? LIMIT 1', [s.name, classId]);
      if (srows.length === 0) {
        await conn.query('INSERT INTO subjects (class_id, subject_name, subject_code, description) VALUES (?, ?, ?, ?)', [classId, s.name, s.code, 'Sample subject']);
      }
    }

    // seed a student
    const [strows] = await conn.query('SELECT id FROM students WHERE full_name = ? LIMIT 1', ['Test Student']);
    if (strows.length === 0) {
      await conn.query(
        `INSERT INTO students (full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Test Student', 'male', '2011-05-12', '9999999999', 'Parent Name', '8888888888', '123 Test St', 'student1@alpha.local', '2025-05-01', classId, 'A', 'active']
      );
      console.log('Inserted sample student');
    }

    await conn.commit();
    console.log('Migration and seed complete');
  } catch (err) {
    await conn.rollback();
    console.error('Migration failed', err.message || err);
    process.exitCode = 1;
  } finally {
    conn.release();
    process.exit();
  }
}

run();
