-- ========================================================================
-- AI INTERVIEW COACH - PRODUCTION DATABASE SCHEMA (MySQL 8.0+)
-- ========================================================================

CREATE DATABASE IF NOT EXISTS ai_interview_coach
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_interview_coach;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS question_bank;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  college VARCHAR(150) NULL,
  experience_level ENUM('Fresher', '1-2 years', '3-5 years', '5+ years') DEFAULT 'Fresher',
  preferred_role VARCHAR(100) DEFAULT 'Software Engineer',
  skills JSON NULL,
  resume_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE question_bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(100) NOT NULL,
  interview_type ENUM('Technical', 'HR', 'Behavioral') NOT NULL,
  topic VARCHAR(120) NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  question_text TEXT NOT NULL,
  expected_concepts JSON NOT NULL,
  sample_answer TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qbank_lookup (role, interview_type, difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_role VARCHAR(100) NOT NULL,
  experience_level ENUM('Fresher', '1-2 years', '3-5 years', '5+ years') NOT NULL,
  interview_type ENUM('Technical', 'HR', 'Behavioral', 'Mixed') NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  total_questions INT NOT NULL DEFAULT 5,
  overall_score DECIMAL(5,2) NULL,
  status ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
  target_company VARCHAR(120) NULL,
  mode ENUM('Text', 'Voice') NOT NULL DEFAULT 'Voice',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_interviews_user_status (user_id, status),
  INDEX idx_interviews_user_date (user_id, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id INT NOT NULL,
  question_text TEXT NOT NULL,
  topic VARCHAR(120) NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  expected_concepts JSON NOT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  INDEX idx_questions_interview_order (interview_id, question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id INT NOT NULL,
  question_id INT NOT NULL UNIQUE,
  answer_text TEXT NOT NULL,
  answer_mode ENUM('Text', 'Voice') NOT NULL DEFAULT 'Text',
  technical_score DECIMAL(5,2) NULL,
  relevance_score DECIMAL(5,2) NULL,
  communication_score DECIMAL(5,2) NULL,
  structure_score DECIMAL(5,2) NULL,
  concept_coverage_score DECIMAL(5,2) NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  is_unanswered BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_answers_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_answers_interview (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  answer_id INT NOT NULL UNIQUE,
  strengths JSON NOT NULL,
  improvements JSON NOT NULL,
  missing_concepts JSON NOT NULL,
  recommendations JSON NOT NULL,
  sample_answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_answer FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
