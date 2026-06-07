-- Schema for Alpha Tuition System

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','tutor','student') NOT NULL DEFAULT 'tutor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(16),
  dob DATE,
  mobile VARCHAR(32),
  parent_name VARCHAR(255),
  parent_contact VARCHAR(64),
  parent_contact_2 VARCHAR(64),
  address TEXT,
  email VARCHAR(255),
  admission_date DATE,
  class_id INT DEFAULT NULL,
  section VARCHAR(16),
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications table for alerts, in-app and email records
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_role VARCHAR(32) DEFAULT 'all',
  recipient_id INT DEFAULT NULL,
  type VARCHAR(64) DEFAULT 'general',
  title VARCHAR(255) DEFAULT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(32) DEFAULT 'in-app',
  is_read TINYINT(1) DEFAULT 0,
  priority ENUM('low','medium','high','normal') DEFAULT 'normal',
  due_date DATE DEFAULT NULL,
  send_date DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reports table for storing generated report file references
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  period VARCHAR(64) NOT NULL,
  file_path VARCHAR(511) NOT NULL,
  created_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
