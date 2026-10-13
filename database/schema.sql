-- ========================================================================
-- AI INTERVIEW COACH - PRODUCTION DATABASE SCHEMA (MySQL 8.0+)
-- ========================================================================

CREATE DATABASE IF NOT EXISTS ai_interview_coach
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_interview_coach;

-- Disable foreign key checks during setup
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS question_bank;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
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

-- 2. PROFILES TABLE
CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  college VARCHAR(150) NULL,
  experience_level ENUM('Fresher', '1-2 years', '3-5 years', '5+ years') DEFAULT 'Fresher',
  preferred_role VARCHAR(100) DEFAULT 'Software Engineer',
  skills JSON NULL COMMENT 'Array of skill strings',
  resume_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. QUESTION BANK TABLE (Curated seed & backup questions)
CREATE TABLE question_bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(100) NOT NULL,
  interview_type ENUM('Technical', 'HR', 'Behavioral') NOT NULL,
  topic VARCHAR(120) NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  question_text TEXT NOT NULL,
  expected_concepts JSON NOT NULL COMMENT 'Array of expected key concepts',
  sample_answer TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qbank_lookup (role, interview_type, difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. INTERVIEWS TABLE
CREATE TABLE interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_role VARCHAR(100) NOT NULL,
  experience_level ENUM('Fresher', '1-2 years', '3-5 years', '5+ years') NOT NULL,
  interview_type ENUM('Technical', 'HR', 'Behavioral', 'Mixed') NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  total_questions INT NOT NULL DEFAULT 5,
  overall_score DECIMAL(5,2) NULL COMMENT 'Calculated weighted average (0 - 100)',
  status ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
  target_company VARCHAR(120) NULL,
  mode ENUM('Text', 'Voice') NOT NULL DEFAULT 'Voice',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_interviews_user_status (user_id, status),
  INDEX idx_interviews_user_date (user_id, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. QUESTIONS TABLE
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id INT NOT NULL,
  question_text TEXT NOT NULL,
  topic VARCHAR(120) NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  expected_concepts JSON NOT NULL COMMENT 'Array of string concepts',
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  INDEX idx_questions_interview_order (interview_id, question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ANSWERS TABLE
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

-- 7. FEEDBACK TABLE
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  answer_id INT NOT NULL UNIQUE,
  strengths JSON NOT NULL COMMENT 'Array of strengths strings',
  improvements JSON NOT NULL COMMENT 'Array of improvement suggestions',
  missing_concepts JSON NOT NULL COMMENT 'Array of missing technical/behavioral concepts',
  recommendations JSON NOT NULL COMMENT 'Array of recommended topics to practice',
  sample_answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_answer FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- SEED DATA: CURATED QUESTION BANK
-- ========================================================================

INSERT INTO question_bank (role, interview_type, topic, difficulty, question_text, expected_concepts, sample_answer) VALUES
('Java Developer', 'Technical', 'Object-Oriented Programming', 'Medium',
 'Explain polymorphism in Java. What is the difference between compile-time and runtime polymorphism?',
 '["Compile-time polymorphism (Method Overloading)", "Runtime polymorphism (Method Overriding)", "Virtual method dispatch", "Dynamic binding"]',
 'Polymorphism in Java allows an entity to take multiple forms. Compile-time polymorphism is achieved through method overloading, where methods share the same name with different signatures resolved by the compiler. Runtime polymorphism is achieved via method overriding where a subclass provides a specific implementation of a parent method, resolved dynamically via dynamic method dispatch at runtime.'),

('Java Developer', 'Technical', 'Multithreading & Concurrency', 'Hard',
 'How does Java handle thread synchronization, and what is the difference between synchronized blocks, ReentrantLock, and volatile variables?',
 '["synchronized keyword (monitor lock)", "ReentrantLock fairness and tryLock", "volatile memory visibility (happens-before)", "Race conditions and thread safety"]',
 'Java provides intrinsic locks through the synchronized keyword which ensures mutual exclusion. ReentrantLock offers advanced features like fairness policy, interruptible locks, and timed lock acquisition. The volatile keyword guarantees visibility across CPU caches using memory barriers without providing mutual exclusion.'),

('Python Developer', 'Technical', 'Memory Management & GIL', 'Medium',
 'Explain Python Global Interpreter Lock (GIL) and how Python manages memory under the hood.',
 '["Global Interpreter Lock (GIL) preventing true parallel threads for CPU tasks", "Reference counting", "Generational Garbage Collector", "Cyclic references"]',
 'The GIL is a mutex that prevents multiple native threads from executing Python bytecodes concurrently in CPython to simplify memory management. Python uses reference counting as its primary memory management mechanism, complemented by a cyclic garbage collector organized into three generations to collect circular references.'),

('React Native Developer', 'Technical', 'Architecture & Performance', 'Medium',
 'Explain the New Architecture of React Native. What role do TurboModules, Fabric, and JSI play compared to the old Bridge?',
 '["JavaScript Interface (JSI)", "Fabric renderer", "TurboModules lazy loading", "Elimination of async JSON bridge serialization"]',
 'The New Architecture replaces the asynchronous JSON-serialization Bridge with the JavaScript Interface (JSI), enabling direct C++ to JavaScript memory references. Fabric provides synchronous layout and render tree operations, and TurboModules allows lazy-loading native modules on demand instead of eager initialization at startup.'),

('Full Stack Developer', 'Technical', 'System Architecture & APIs', 'Medium',
 'How do you design a secure, scalable RESTful API with idempotency and rate limiting?',
 '["HTTP methods idempotency (GET, PUT, DELETE vs POST)", "Idempotency-Key headers", "Token bucket / sliding window rate limiting", "JWT validation & HTTPS"]',
 'A scalable RESTful API follows standard HTTP status codes and semantics. To ensure idempotency on non-idempotent operations like payments or creations, clients supply an Idempotency-Key stored with a distributed cache like Redis. Rate limiting is implemented via token bucket algorithms, and security is safeguarded with HTTPS, JWT Bearer tokens, and input validation.'),

('AI/ML Engineer', 'Technical', 'Transformer Models & Attention', 'Hard',
 'Explain how Multi-Head Self-Attention works in Transformer architectures and why it outperforms recurrent models.',
 '["Query, Key, Value matrices", "Scaled Dot-Product Attention formula", "Multi-head representation subspaces", "Parallelization over sequence length"]',
 'Self-attention maps input queries, keys, and values through learned projection matrices. Scaled dot-product attention computes softmax(Q K^T / sqrt(d_k)) * V. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. Unlike RNNs with sequential dependencies, Transformers can parallelize token processing across the entire context window.'),

('Data Analyst', 'Technical', 'SQL & Statistical Analysis', 'Medium',
 'What is the difference between WHERE and HAVING in SQL, and when would you use Window Functions like ROW_NUMBER() versus RANK()?',
 '["WHERE filters rows before grouping", "HAVING filters aggregated groups", "ROW_NUMBER produces consecutive unique ranks", "RANK assigns duplicate ranks and skips gaps"]',
 'WHERE filters rows prior to aggregation, whereas HAVING filters groups after GROUP BY calculations. Window functions compute values across rows related to the current row without collapsing them; ROW_NUMBER assigns distinct sequential integers even for ties, while RANK assigns the same rank to ties and skips subsequent numbers.'),

('Software Engineer', 'HR', 'Career Motivation & Culture', 'Easy',
 'Why are you interested in this software engineering role, and how do you align with our collaborative culture?',
 '["Clear motivation grounded in tech stack and company mission", "Team collaboration and open communication", "Continuous learning mindset", "Impact orientation"]',
 'I am eager to contribute because your platform tackles high-scale problems with modern architecture. I thrive in collaborative cross-functional teams where knowledge sharing, thorough code reviews, and mutual mentorship drive customer success and personal technical growth.'),

('Software Engineer', 'Behavioral', 'Conflict & Delivery', 'Medium',
 'Describe a situation where you had a strong technical disagreement with a teammate or lead. How did you resolve it and deliver the project?',
 '["STAR format (Situation, Task, Action, Result)", "Data-driven objective evaluation (benchmarks/POC)", "Active listening and compromise", "Timely delivery without personal friction"]',
 'In my previous project, a teammate wanted a complex microservice while I advocated for a modular monolith to meet an upcoming launch deadline. I listened to his scalability concerns, proposed a timeboxed proof-of-concept, and benchmarked latency and ops overhead. The data showed our monolith met all SLAs while saving 3 weeks of dev effort. We agreed, documented a future migration path, and shipped on time with zero downtime.');
