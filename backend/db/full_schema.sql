-- Full SQL schema for Alpha Coaching Classes Tuition Management System
-- Run this script in your MySQL database to create all tables and sample seed data.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS uploads;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS fees;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS test_results;
DROP TABLE IF EXISTS dpq_answers;
DROP TABLE IF EXISTS dpq;
DROP TABLE IF EXISTS question_paper_questions;
DROP TABLE IF EXISTS question_papers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS tutors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS classes;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','tutor','student') NOT NULL DEFAULT 'tutor',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tutors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(32),
  expertise VARCHAR(255),
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(128) NOT NULL,
  academic_year VARCHAR(32) DEFAULT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT DEFAULT NULL,
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(64) DEFAULT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  chapter_number INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  notes_path VARCHAR(512) DEFAULT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  student_code VARCHAR(64) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(16),
  dob DATE,
  mobile VARCHAR(32),
  parent_name VARCHAR(255),
  parent_contact VARCHAR(64),
  address TEXT,
  email VARCHAR(255),
  admission_date DATE,
  class_id INT DEFAULT NULL,
  section VARCHAR(16),
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  chapter_id INT DEFAULT NULL,
  test_type ENUM('chapterwise','weekly','monthly','unit','mock','final') NOT NULL DEFAULT 'chapterwise',
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  total_marks INT NOT NULL DEFAULT 100,
  duration_minutes INT DEFAULT 60,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT DEFAULT NULL,
  chapter_id INT DEFAULT NULL,
  question_type ENUM('mcq','fill_blank','true_false','short_answer','long_answer','numerical') NOT NULL DEFAULT 'mcq',
  question_text TEXT NOT NULL,
  options JSON DEFAULT NULL,
  correct_answer TEXT DEFAULT NULL,
  marks INT NOT NULL DEFAULT 1,
  difficulty ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  tags VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS question_papers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  generated_by INT DEFAULT NULL,
  pdf_path VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS question_paper_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_paper_id INT NOT NULL,
  question_id INT NOT NULL,
  sequence_order INT NOT NULL DEFAULT 1,
  FOREIGN KEY (question_paper_id) REFERENCES question_papers(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dpq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT DEFAULT NULL,
  chapter_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  publish_date DATE NOT NULL,
  due_date DATE DEFAULT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dpq_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dpq_id INT NOT NULL,
  student_id INT NOT NULL,
  answer_text TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INT DEFAULT NULL,
  feedback TEXT,
  status ENUM('pending','reviewed','graded') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (dpq_id) REFERENCES dpq(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS test_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  student_id INT NOT NULL,
  total_marks INT NOT NULL DEFAULT 100,
  obtained_marks INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  grade VARCHAR(16) DEFAULT NULL,
  remarks TEXT,
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present','absent','leave') NOT NULL DEFAULT 'present',
  remarks VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  total_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_date DATE DEFAULT NULL,
  payment_mode ENUM('cash','card','bank_transfer','upi','other') DEFAULT 'cash',
  status ENUM('paid','partial','due') NOT NULL DEFAULT 'due',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_role ENUM('admin','tutor','student','all') NOT NULL DEFAULT 'all',
  recipient_id INT DEFAULT NULL,
  type VARCHAR(64) DEFAULT 'general',
  message TEXT NOT NULL,
  channel ENUM('email','sms','in-app') NOT NULL DEFAULT 'in-app',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (recipient_role),
  INDEX (recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uploader_id INT DEFAULT NULL,
  type ENUM('notes','question_paper','answer_key','report','other') NOT NULL DEFAULT 'other',
  related_id INT DEFAULT NULL,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) DEFAULT NULL,
  size_bytes BIGINT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(128) NOT NULL,
  entity VARCHAR(128) DEFAULT NULL,
  entity_id INT DEFAULT NULL,
  details TEXT DEFAULT NULL,
  ip_address VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sample data
INSERT INTO users (full_name, email, password_hash, role, status) VALUES
('Admin User', 'admin@alpha.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO8h5X6dGv0h1hZVuxDI2Ij0vK38iGizW', 'admin', 'active'),
('Tutor User', 'tutor@alpha.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO8h5X6dGv0h1hZVuxDI2Ij0vK38iGizW', 'tutor', 'active'),
('Student User', 'student@alpha.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO8h5X6dGv0h1hZVuxDI2Ij0vK38iGizW', 'student', 'active');

INSERT INTO tutors (user_id, phone, expertise) VALUES
(2, '9999999999', 'Mathematics, Physics');

INSERT INTO classes (class_name, academic_year, description) VALUES
('10th', '2025-2026', '10th grade tuition class'),
('11th', '2025-2026', '11th grade tuition class'),
('12th', '2025-2026', '12th grade tuition class');

INSERT INTO subjects (class_id, subject_name, subject_code, description) VALUES
(1, 'Mathematics', 'MATH10', 'Mathematics for 10th class'),
(1, 'Physics', 'PHY10', 'Physics for 10th class'),
(1, 'Chemistry', 'CHEM10', 'Chemistry for 10th class');

INSERT INTO chapters (subject_id, chapter_number, title, notes_path, status) VALUES
(1, 1, 'Algebra Basics', 'uploads/notes/algebra-basics.pdf', 'published'),
(2, 1, 'Motion and Force', 'uploads/notes/motion-force.pdf', 'published');

INSERT INTO students (user_id, student_code, full_name, gender, dob, mobile, parent_name, parent_contact, address, email, admission_date, class_id, section, status) VALUES
(3, 'STU-1001', 'Test Student', 'male', '2011-05-12', '8888888888', 'Parent Name', '7777777777', '123 Main Street', 'student@alpha.local', '2025-05-01', 1, 'A', 'active');

INSERT INTO tests (class_id, subject_id, chapter_id, test_type, title, date, start_time, end_time, total_marks, duration_minutes, instructions) VALUES
(1, 1, 1, 'weekly', 'Weekly Mathematics Test', '2025-06-05', '10:00:00', '11:00:00', 50, 60, 'Answer all questions carefully.');

INSERT INTO questions (subject_id, chapter_id, question_type, question_text, options, correct_answer, marks, difficulty, tags) VALUES
(1, 1, 'mcq', 'What is 5 + 3?', JSON_ARRAY('6','7','8','9'), '8', 2, 'easy', 'addition'),
(2, 1, 'true_false', 'Objects in motion remain in motion unless acted upon by a force.', NULL, 'true', 2, 'medium', 'newton'),
(1, 1, 'short_answer', 'Define algebra.', NULL, 'A branch of mathematics dealing with symbols.', 5, 'medium', 'definition');

INSERT INTO question_papers (test_id, title, generated_by, pdf_path) VALUES
(1, 'Weekly Math Paper', 2, 'uploads/question_papers/weekly-math.pdf');

INSERT INTO question_paper_questions (question_paper_id, question_id, sequence_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3);

INSERT INTO dpq (class_id, subject_id, chapter_id, title, description, publish_date, due_date, status) VALUES
(1, 1, 1, 'Daily Practice Question 1', 'Solve the algebra worksheet.', '2025-06-02', '2025-06-03', 'published');

INSERT INTO dpq_answers (dpq_id, student_id, answer_text, submitted_at, score, feedback, status) VALUES
(1, 1, 'Answer: 8; Algebra is math with symbols.', '2025-06-02 14:00:00', 8, 'Good attempt.', 'graded');

INSERT INTO test_results (test_id, student_id, total_marks, obtained_marks, percentage, grade, remarks, published_at) VALUES
(1, 1, 50, 42, 84.00, 'A', 'Strong performance', '2025-06-06 09:00:00');

INSERT INTO attendance (student_id, class_id, attendance_date, status, remarks) VALUES
(1, 1, '2025-06-02', 'present', 'On time'),
(1, 1, '2025-06-03', 'absent', 'Sick');

INSERT INTO fees (student_id, total_fee, paid_amount, due_amount, payment_date, payment_mode, status, remarks) VALUES
(1, 15000.00, 10000.00, 5000.00, '2025-05-10', 'bank_transfer', 'partial', 'Fee installment paid');

INSERT INTO notifications (recipient_role, recipient_id, type, message, channel, is_read, send_date) VALUES
('student', 1, 'fee', 'Your fee payment is due in 5 days.', 'in-app', FALSE, '2025-06-01 08:00:00'),
('tutor', 2, 'dpq', 'New DPQ has been published for 10th Mathematics.', 'email', FALSE, '2025-06-02 09:00:00');

INSERT INTO uploads (uploader_id, type, related_id, filename, filepath, mime_type, size_bytes) VALUES
(2, 'notes', NULL, 'algebra-basics.pdf', 'uploads/notes/algebra-basics.pdf', 'application/pdf', 241000),
(2, 'question_paper', 1, 'weekly-math.pdf', 'uploads/question_papers/weekly-math.pdf', 'application/pdf', 128000);

INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) VALUES
(2, 'create', 'dpq', 1, 'Created initial DPQ for 10th class.', '127.0.0.1'),
(1, 'login', 'users', 1, 'Admin user logged in.', '127.0.0.1');
