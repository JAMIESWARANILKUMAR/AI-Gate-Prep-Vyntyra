-- ==============================================================================
-- AI GATE PREPARATION PLATFORM: CLOUDFLARE D1 (SQLITE) CONSOLIDATED SCHEMA
-- Target: Cloudflare D1
-- ==============================================================================

-- 1. GATE BRANCHES & TAXONOMY
CREATE TABLE IF NOT EXISTS gate_branches (
    code TEXT PRIMARY KEY, -- 'CS', 'DA', 'EC', 'EE', 'ME', 'CE', 'IN'
    name TEXT NOT NULL,
    description TEXT,
    syllabus_version TEXT DEFAULT '2025-2026',
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

-- 2. GATE VAULT: PYQ PAPERS, SYLLABUS COPIES & STUDY MATERIAL (Cloudflare R2)
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

-- 3. GATE QUESTION BANK (MCQ, MSQ, NAT)
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

-- 4. CACHED AI LOGICAL & THEORETICAL BREAKDOWNS
CREATE TABLE IF NOT EXISTS gate_question_breakdowns (
    question_id TEXT PRIMARY KEY REFERENCES gate_questions(id),
    theoretical_concept TEXT NOT NULL,
    step_by_step_derivation TEXT NOT NULL,
    common_traps_and_pitfalls TEXT NOT NULL,
    verified_by_sme_id TEXT,
    verification_status TEXT DEFAULT 'ai_generated', -- 'ai_generated', 'sme_verified', 'sme_edited'
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. GATE EXAMS & MOCK TESTS
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
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. TEST & QUOTA ALLOCATIONS
CREATE TABLE IF NOT EXISTS gate_allocations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    exam_id TEXT REFERENCES gate_exams(id),
    allocation_type TEXT NOT NULL DEFAULT 'global', -- 'specific_exam', 'batch_cohort', 'global'
    allocated_by TEXT,
    mock_interview_quota INTEGER DEFAULT 3,
    ai_doubt_quota INTEGER DEFAULT 100,
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

-- 7. EXAM SUBMISSIONS & PERFORMANCE
CREATE TABLE IF NOT EXISTS gate_submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES gate_exams(id),
    student_id TEXT NOT NULL,
    total_score REAL DEFAULT 0.0,
    accuracy_percent REAL DEFAULT 0.0,
    marks_obtained_aptitude REAL DEFAULT 0.0,
    marks_obtained_math REAL DEFAULT 0.0,
    marks_obtained_core REAL DEFAULT 0.0,
    positive_marks REAL DEFAULT 0.0,
    negative_marks REAL DEFAULT 0.0,
    time_taken_seconds INTEGER DEFAULT 0,
    all_india_rank INTEGER,
    percentile REAL,
    status TEXT DEFAULT 'completed', -- 'in_progress', 'completed', 'timed_out'
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME
);

CREATE TABLE IF NOT EXISTS gate_submission_answers (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES gate_submissions(id),
    question_id TEXT NOT NULL REFERENCES gate_questions(id),
    student_answer TEXT, -- Selected option ID, comma-separated IDs, or numeric string
    is_correct INTEGER DEFAULT 0,
    marks_awarded REAL DEFAULT 0.0,
    time_spent_seconds INTEGER DEFAULT 0,
    state TEXT DEFAULT 'answered' -- 'answered', 'marked_for_review', 'not_visited', 'skipped'
);

-- 8. CONTEXTUAL AI DOUBTS & ESCALATIONS
CREATE TABLE IF NOT EXISTS gate_doubts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    question_id TEXT NOT NULL REFERENCES gate_questions(id),
    messages TEXT NOT NULL, -- JSON array of { sender: 'student'|'ai'|'sme', content: '...', timestamp: '...' }
    is_escalated_to_sme INTEGER DEFAULT 0,
    sme_resolution TEXT,
    sme_id TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'resolved', 'escalated'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. PERSONALIZED HIGH-SCORE ROADMAPS
CREATE TABLE IF NOT EXISTS gate_roadmaps (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    branch_code TEXT NOT NULL,
    target_gate_year INTEGER DEFAULT 2026,
    target_score INTEGER DEFAULT 80,
    weak_subject_ids TEXT, -- JSON array
    strong_subject_ids TEXT, -- JSON array
    weekly_plan TEXT, -- JSON structured weekly milestones
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. SEED INITIAL BRANCHES
INSERT OR IGNORE INTO gate_branches (code, name, description) VALUES
('CS', 'Computer Science & Information Technology', 'Algorithms, Data Structures, OS, DBMS, Networks, Theory of Computation, Compilers, Digital Logic'),
('DA', 'Data Science & Artificial Intelligence', 'Probability & Statistics, Linear Algebra, Machine Learning, AI, Python/Data Structures, Database Management & Warehousing'),
('EC', 'Electronics & Communication Engineering', 'Signals & Systems, Electronic Devices, Analog Circuits, Digital Circuits, Control Systems, Communications, Electromagnetics'),
('EE', 'Electrical Engineering', 'Electric Circuits, Electromagnetic Fields, Signals and Systems, Electrical Machines, Power Systems, Control Systems, Electrical and Electronic Measurements, Power Electronics'),
('ME', 'Mechanical Engineering', 'Engineering Mechanics, Mechanics of Materials, Theory of Machines, Vibrations, Thermodynamics, Fluid Mechanics, Manufacturing'),
('CE', 'Civil Engineering', 'Structural Engineering, Geotechnical Engineering, Water Resources, Environmental Engineering, Transportation, Geomatics');
