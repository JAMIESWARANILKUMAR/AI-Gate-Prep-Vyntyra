-- ==============================================================================
-- AI GATE PREPARATION PLATFORM: CLOUDFLARE D1 (SQLITE) MULTI-TENANT SCHEMA
-- Target: Cloudflare D1 (ai_gate_prep_vyntyra)
-- ==============================================================================

-- 1. MULTI-TENANT CAMPUSES (INSTITUTES)
CREATE TABLE IF NOT EXISTS campuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_r2_url TEXT,
    primary_accent_hex TEXT DEFAULT '#0f172a',
    status TEXT DEFAULT 'active', -- 'active' | 'suspended'
    max_students INTEGER DEFAULT 500,
    allocated_mock_credits INTEGER DEFAULT 5000,
    allocated_ai_interview_credits INTEGER DEFAULT 1000,
    allocated_ai_doubt_tokens INTEGER DEFAULT 500000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ACADEMIC DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL, -- 'CSE', 'AIML', 'ECE', 'EE', 'ME', 'CE'
    allocated_mock_credits INTEGER DEFAULT 1000,
    allocated_ai_interview_credits INTEGER DEFAULT 200,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 4-TIER USER ROLES & CASCADING QUOTAS
-- Roles: 'SUPER_ADMIN' | 'CAMPUS_ADMIN' | 'DEPT_ADMIN' | 'STUDENT'
CREATE TABLE IF NOT EXISTS gate_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT', -- 'SUPER_ADMIN' | 'CAMPUS_ADMIN' | 'DEPT_ADMIN' | 'STUDENT'
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    mock_tests_allowed INTEGER DEFAULT 10,
    mock_tests_used INTEGER DEFAULT 0,
    ai_interviews_allowed INTEGER DEFAULT 3,
    ai_interviews_used INTEGER DEFAULT 0,
    daily_ai_doubts_limit INTEGER DEFAULT 25,
    daily_ai_doubts_used INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active' | 'suspended'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. VERIFIED GATE 2027 NEWS & OFFICIAL NOTICES
CREATE TABLE IF NOT EXISTS gate_updates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Exam Schedule' | 'Syllabus & Pattern' | 'Registration / GOAPS' | 'Admit Card & Results'
    source_name TEXT NOT NULL, -- 'National Coordination Board (IISc / IITs)', 'MoE India', 'PIB Education'
    source_url TEXT NOT NULL,
    is_verified INTEGER DEFAULT 1,
    is_pinned INTEGER DEFAULT 0,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. GATE BRANCHES & TAXONOMY
CREATE TABLE IF NOT EXISTS gate_branches (
    code TEXT PRIMARY KEY, -- 'CS', 'DA', 'EC', 'EE', 'ME', 'CE', 'IN'
    name TEXT NOT NULL,
    description TEXT,
    syllabus_version TEXT DEFAULT '2026-2027',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gate_subjects (
    id TEXT PRIMARY KEY,
    branch_code TEXT NOT NULL REFERENCES gate_branches(code),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    weightage_percent REAL DEFAULT 10.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gate_topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES gate_subjects(id),
    name TEXT NOT NULL,
    subtopics TEXT, -- JSON array of strings
    importance_tier TEXT DEFAULT 'medium' -- 'high', 'medium', 'low'
);

-- 6. GATE VAULT: PYQ PAPERS, SYLLABUS COPIES & FORMULA SHEETS (Cloudflare R2)
CREATE TABLE IF NOT EXISTS gate_vault_documents (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'pyq', 'syllabus', 'study_notes', 'formula_sheet'
    branch_code TEXT NOT NULL REFERENCES gate_branches(code),
    year INTEGER,
    subject_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    r2_key TEXT NOT NULL,
    r2_url TEXT NOT NULL,
    file_size_bytes INTEGER DEFAULT 0,
    file_type TEXT DEFAULT 'application/pdf',
    download_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. GATE QUESTION BANK (MCQ, MSQ, NAT)
CREATE TABLE IF NOT EXISTS gate_questions (
    id TEXT PRIMARY KEY,
    branch_code TEXT NOT NULL REFERENCES gate_branches(code),
    subject_id TEXT REFERENCES gate_subjects(id),
    topic_id TEXT REFERENCES gate_topics(id),
    source_type TEXT NOT NULL DEFAULT 'mock', -- 'pyq', 'mock', 'practice_daily'
    source_year INTEGER,
    question_type TEXT NOT NULL, -- 'mcq', 'msq', 'nat'
    marks INTEGER NOT NULL DEFAULT 1, -- 1 or 2
    negative_marks REAL NOT NULL DEFAULT 0.33, -- 0.33 for 1-mark MCQ, 0.66 for 2-mark MCQ, 0 for MSQ/NAT
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    options TEXT, -- JSON array of { id: 'A', text: '...', image_url?: '...' }
    correct_answer TEXT NOT NULL, -- 'A', 'A,C', or '42.5' or range '42.0-43.0' for NAT
    nat_range_min REAL,
    nat_range_max REAL,
    difficulty TEXT DEFAULT 'moderate', -- 'easy', 'moderate', 'hard', 'gate_ranker'
    section TEXT DEFAULT 'core', -- 'general_aptitude', 'engineering_mathematics', 'core'
    status TEXT DEFAULT 'approved', -- 'draft', 'pending_sme_review', 'approved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. CACHED AI LOGICAL & THEORETICAL BREAKDOWNS
CREATE TABLE IF NOT EXISTS gate_question_breakdowns (
    question_id TEXT PRIMARY KEY REFERENCES gate_questions(id),
    theoretical_concept TEXT NOT NULL,
    step_by_step_derivation TEXT NOT NULL,
    common_traps_and_pitfalls TEXT NOT NULL,
    verified_by_sme_id TEXT,
    verification_status TEXT DEFAULT 'ai_generated', -- 'ai_generated', 'sme_verified', 'sme_edited'
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. GATE EXAMS & MOCK TESTS
CREATE TABLE IF NOT EXISTS gate_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'full_length_mock', -- 'full_length_mock', 'subject_test', 'topic_test', 'daily_challenge'
    branch_code TEXT NOT NULL REFERENCES gate_branches(code),
    total_marks INTEGER DEFAULT 100,
    duration_minutes INTEGER DEFAULT 180,
    question_ids TEXT NOT NULL, -- JSON array of question IDs
    original_pyq_vault_id TEXT REFERENCES gate_vault_documents(id),
    status TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
    scheduled_start DATETIME,
    scheduled_end DATETIME,
    enable_calculator INTEGER DEFAULT 1,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL, -- Nullable for global tests, set for campus-specific tests
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. EXAM SUBMISSIONS & PERFORMANCE
CREATE TABLE IF NOT EXISTS gate_submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES gate_exams(id),
    student_id TEXT NOT NULL,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    total_score REAL DEFAULT 0.0,
    accuracy_percent REAL DEFAULT 0.0,
    marks_obtained_aptitude REAL DEFAULT 0.0,
    marks_obtained_math REAL DEFAULT 0.0,
    marks_obtained_core REAL DEFAULT 0.0,
    positive_marks REAL DEFAULT 0.0,
    negative_marks REAL DEFAULT 0.0,
    time_taken_seconds INTEGER DEFAULT 0,
    all_india_rank INTEGER,
    campus_rank INTEGER,
    department_rank INTEGER,
    percentile REAL,
    status TEXT DEFAULT 'completed', -- 'in_progress', 'completed', 'timed_out'
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME
);

CREATE TABLE IF NOT EXISTS gate_submission_answers (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES gate_submissions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES gate_questions(id),
    student_answer TEXT,
    is_correct INTEGER DEFAULT 0,
    marks_awarded REAL DEFAULT 0.0,
    time_spent_seconds INTEGER DEFAULT 0,
    state TEXT DEFAULT 'answered'
);

-- 11. CONTEXTUAL AI DOUBTS & ESCALATIONS
CREATE TABLE IF NOT EXISTS gate_doubts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    question_id TEXT NOT NULL REFERENCES gate_questions(id),
    messages TEXT NOT NULL, -- JSON array of { sender: 'student'|'ai'|'sme', content: '...', timestamp: '...' }
    is_escalated_to_sme INTEGER DEFAULT 0,
    sme_resolution TEXT,
    sme_id TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. PERSONALIZED HIGH-SCORE ROADMAPS
CREATE TABLE IF NOT EXISTS gate_roadmaps (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    branch_code TEXT NOT NULL,
    target_gate_year INTEGER DEFAULT 2027,
    target_score INTEGER DEFAULT 80,
    weak_subject_ids TEXT,
    strong_subject_ids TEXT,
    weekly_plan TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INITIAL SEED RECORDS (Campuses, Departments, Branches & Official GATE 2027 News)
-- ==============================================================================

-- Branches
INSERT OR IGNORE INTO gate_branches (code, name, description) VALUES
('CS', 'Computer Science & Information Technology', 'Algorithms, Data Structures, OS, DBMS, Networks, Theory of Computation, Compilers, Digital Logic'),
('DA', 'Data Science & Artificial Intelligence', 'Probability & Statistics, Linear Algebra, Machine Learning, AI, Python/Data Structures, Database Management & Warehousing'),
('EC', 'Electronics & Communication Engineering', 'Signals & Systems, Electronic Devices, Analog Circuits, Digital Circuits, Control Systems, Communications, Electromagnetics'),
('EE', 'Electrical Engineering', 'Electric Circuits, Electromagnetic Fields, Signals and Systems, Electrical Machines, Power Systems, Control Systems, Power Electronics'),
('ME', 'Mechanical Engineering', 'Engineering Mechanics, Mechanics of Materials, Theory of Machines, Vibrations, Thermodynamics, Fluid Mechanics, Manufacturing'),
('CE', 'Civil Engineering', 'Structural Engineering, Geotechnical Engineering, Water Resources, Environmental Engineering, Transportation, Geomatics');

-- Partner Campuses
INSERT OR IGNORE INTO campuses (id, name, slug, logo_r2_url, primary_accent_hex, max_students, allocated_mock_credits, allocated_ai_interview_credits, allocated_ai_doubt_tokens) VALUES
('camp_iitb', 'IIT Bombay — Powai Campus', 'iitb', 'https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/campuses/iitb-emblem.png', '#0284c7', 1500, 15000, 3000, 1500000),
('camp_bits', 'BITS Pilani — Institute of Technology', 'bits-pilani', 'https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/campuses/bits-emblem.png', '#b45309', 1000, 10000, 2000, 1000000),
('camp_anna', 'Anna University — College of Engineering Guindy', 'anna-univ', 'https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/campuses/anna-emblem.png', '#059669', 800, 8000, 1500, 800000);

-- Academic Departments for IIT Bombay
INSERT OR IGNORE INTO departments (id, campus_id, name, code, allocated_mock_credits, allocated_ai_interview_credits) VALUES
('dept_iitb_cse', 'camp_iitb', 'Department of Computer Science & Engineering', 'CSE', 5000, 1000),
('dept_iitb_dsai', 'camp_iitb', 'Center for Machine Intelligence & Data Science (C-MInDS)', 'DSAI', 4000, 800),
('dept_iitb_ee', 'camp_iitb', 'Department of Electrical Engineering', 'EE', 3000, 600),
('dept_iitb_me', 'camp_iitb', 'Department of Mechanical Engineering', 'ME', 3000, 600);

-- Academic Departments for BITS Pilani
INSERT OR IGNORE INTO departments (id, campus_id, name, code, allocated_mock_credits, allocated_ai_interview_credits) VALUES
('dept_bits_cs', 'camp_bits', 'Department of Computer Science', 'CS', 4000, 800),
('dept_bits_ece', 'camp_bits', 'Department of Electrical & Electronics Engineering', 'EEE', 3000, 600),
('dept_bits_me', 'camp_bits', 'Department of Mechanical Engineering', 'ME', 3000, 600);

-- Verified GATE 2027 Live Official Updates
INSERT OR IGNORE INTO gate_updates (id, title, summary, category, source_name, source_url, is_verified, is_pinned, published_at) VALUES
('upd_01', 'GATE 2027 Organizing Institute & National Coordination Board Schedule Ratified', 'The National Coordination Board (NCB)-GATE has announced the official calendar for GATE 2027. Examination will be conducted in Computer Based Testing (CBT) mode across two consecutive weekends in February 2027. All 30 engineering and science test papers will feature standard 65 questions (100 marks) format.', 'Exam Schedule', 'NCB-GATE Official Portal', 'https://gate2027.iisc.ac.in', 1, 1, '2026-11-20 10:00:00'),
('upd_02', 'DA (Data Science & Artificial Intelligence) Syllabus Updated with Generative AI & Deep Learning Architectures', 'Official syllabus release confirms the permanent inclusion of Transformer architectures, Diffusion models, and Advanced Optimization methods in the DA paper section. Weightage of Linear Algebra and Probability & Statistics remains anchored at 25% of core technical syllabus.', 'Syllabus & Pattern', 'IIT Roorkee / IISc Academic Committee', 'https://gate2027.iisc.ac.in/syllabus', 1, 1, '2026-11-18 14:30:00'),
('upd_03', 'GOAPS 2027 Portal Architecture & One-Time Biometric Registration Guidelines', 'Candidates will be required to register using Aadhaar/Passport-verified digital identities on the enhanced GOAPS 2027 portal. Two-paper combination allowances have been expanded to include Computer Science (CS) with Data Science & AI (DA) as well as EC with DA.', 'Registration / GOAPS', 'Ministry of Education (MoE)', 'https://education.gov.in', 1, 0, '2026-11-15 09:15:00'),
('upd_04', 'PSU Recruitment via GATE 2027: IOCL, NTPC, ONGC, and BHEL Reaffirm Direct Executive Trainee Hiring', 'Public Sector Undertakings have published advance notices confirming that valid GATE 2027 scores in CS, EC, EE, ME, and CE will be the sole criteria for shortlisting candidates for Group Discussions and Personal Interviews for E-2 grade engineer appointments.', 'Admit Card & Results', 'PIB India — Ministry of Petroleum & Natural Gas', 'https://pib.gov.in', 1, 0, '2026-11-10 16:45:00'),
('upd_05', 'TCS iON Virtual Scientific Calculator Interface Standardized for 2027 Tests', 'All examination terminals will strictly utilize the non-programmable virtual calculator interface with trigonometric, logarithmic, and power functions. Handheld physical calculators remain strictly prohibited at all official examination centers.', 'Syllabus & Pattern', 'NCB-GATE Administration', 'https://gate2027.iisc.ac.in/calculator-guidelines', 1, 0, '2026-11-05 11:20:00');
