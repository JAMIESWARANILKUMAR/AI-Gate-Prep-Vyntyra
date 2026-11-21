-- ==============================================================================
-- AI GATE PREPARATION PLATFORM: POSTGRESQL SCHEMA FOR SUPABASE
-- Migration: 20261121000000_gate_platform_schema.sql
-- Target: Supabase PostgreSQL (Project ref: vmoppxbrihhxkbbfcolw)
-- ==============================================================================

-- 1. GATE BRANCHES & TAXONOMY
CREATE TABLE IF NOT EXISTS public.gate_branches (
    code TEXT PRIMARY KEY, -- 'CS', 'DA', 'EC', 'EE', 'ME', 'CE'
    name TEXT NOT NULL,
    description TEXT,
    syllabus_version TEXT DEFAULT '2025-2026',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gate_subjects (
    id TEXT PRIMARY KEY,
    branch_code TEXT NOT NULL REFERENCES public.gate_branches(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    weightage_percent NUMERIC(5,2) DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gate_topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES public.gate_subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subtopics JSONB DEFAULT '[]'::jsonb, -- Array of strings
    importance_tier TEXT DEFAULT 'medium' CHECK (importance_tier IN ('high', 'medium', 'low'))
);

-- 2. GATE VAULT: PYQ PAPERS, SYLLABUS COPIES & STUDY MATERIAL (Cloudflare R2)
CREATE TABLE IF NOT EXISTS public.gate_vault_documents (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('pyq', 'syllabus', 'study_notes', 'formula_sheet')),
    branch_code TEXT NOT NULL REFERENCES public.gate_branches(code) ON DELETE CASCADE,
    year INTEGER,
    subject_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    r2_key TEXT NOT NULL,
    r2_url TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    file_type TEXT DEFAULT 'application/pdf',
    download_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. GATE QUESTION BANK (MCQ, MSQ, NAT)
CREATE TABLE IF NOT EXISTS public.gate_questions (
    id TEXT PRIMARY KEY,
    branch_code TEXT NOT NULL REFERENCES public.gate_branches(code) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.gate_subjects(id) ON DELETE SET NULL,
    topic_id TEXT REFERENCES public.gate_topics(id) ON DELETE SET NULL,
    source_type TEXT NOT NULL DEFAULT 'mock' CHECK (source_type IN ('pyq', 'mock', 'practice_daily')),
    source_year INTEGER,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'msq', 'nat', 'coding', 'short_answer')),
    marks INTEGER NOT NULL DEFAULT 1,
    negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0.33,
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    options JSONB DEFAULT '[]'::jsonb, -- Array of { id: 'A', text: '...', image_url?: '...' }
    correct_answer TEXT NOT NULL, -- 'A', 'A,C', or '42.5' or range
    nat_range_min NUMERIC(10,4),
    nat_range_max NUMERIC(10,4),
    difficulty TEXT DEFAULT 'moderate' CHECK (difficulty IN ('easy', 'moderate', 'hard', 'gate_ranker')),
    section TEXT DEFAULT 'core' CHECK (section IN ('general_aptitude', 'engineering_mathematics', 'core')),
    status TEXT DEFAULT 'approved' CHECK (status IN ('draft', 'pending_sme_review', 'approved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CACHED AI LOGICAL & THEORETICAL BREAKDOWNS
CREATE TABLE IF NOT EXISTS public.gate_question_breakdowns (
    question_id TEXT PRIMARY KEY REFERENCES public.gate_questions(id) ON DELETE CASCADE,
    theoretical_concept TEXT NOT NULL,
    step_by_step_derivation TEXT NOT NULL,
    common_traps_and_pitfalls TEXT NOT NULL,
    verified_by_sme_id TEXT,
    verification_status TEXT DEFAULT 'ai_generated' CHECK (verification_status IN ('ai_generated', 'sme_verified', 'sme_edited')),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GATE EXAMS & MOCK TESTS
CREATE TABLE IF NOT EXISTS public.gate_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'full_length_mock' CHECK (exam_type IN ('full_length_mock', 'subject_test', 'topic_test', 'daily_challenge')),
    branch_code TEXT NOT NULL REFERENCES public.gate_branches(code) ON DELETE CASCADE,
    total_marks INTEGER DEFAULT 100,
    duration_minutes INTEGER DEFAULT 180,
    question_ids JSONB DEFAULT '[]'::jsonb, -- Array of question IDs
    original_pyq_vault_id TEXT REFERENCES public.gate_vault_documents(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    enable_calculator BOOLEAN DEFAULT true,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TEST & QUOTA ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.gate_allocations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    exam_id TEXT REFERENCES public.gate_exams(id) ON DELETE CASCADE,
    allocation_type TEXT NOT NULL DEFAULT 'global' CHECK (allocation_type IN ('specific_exam', 'batch_cohort', 'global')),
    allocated_by TEXT,
    mock_interview_quota INTEGER DEFAULT 3,
    ai_doubt_quota INTEGER DEFAULT 100,
    allocated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- 7. EXAM SUBMISSIONS & PERFORMANCE
CREATE TABLE IF NOT EXISTS public.gate_submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES public.gate_exams(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    total_score NUMERIC(6,2) DEFAULT 0.0,
    accuracy_percent NUMERIC(5,2) DEFAULT 0.0,
    marks_obtained_aptitude NUMERIC(6,2) DEFAULT 0.0,
    marks_obtained_math NUMERIC(6,2) DEFAULT 0.0,
    marks_obtained_core NUMERIC(6,2) DEFAULT 0.0,
    positive_marks NUMERIC(6,2) DEFAULT 0.0,
    negative_marks NUMERIC(6,2) DEFAULT 0.0,
    time_taken_seconds INTEGER DEFAULT 0,
    all_india_rank INTEGER,
    percentile NUMERIC(5,2),
    status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'timed_out')),
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.gate_submission_answers (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES public.gate_submissions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.gate_questions(id) ON DELETE CASCADE,
    student_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    marks_awarded NUMERIC(5,2) DEFAULT 0.0,
    time_spent_seconds INTEGER DEFAULT 0,
    state TEXT DEFAULT 'answered' CHECK (state IN ('answered', 'marked_for_review', 'not_visited', 'skipped'))
);

-- 8. CONTEXTUAL AI DOUBTS & ESCALATIONS
CREATE TABLE IF NOT EXISTS public.gate_doubts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    question_id TEXT NOT NULL REFERENCES public.gate_questions(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]'::jsonb,
    is_escalated_to_sme BOOLEAN DEFAULT false,
    sme_resolution TEXT,
    sme_id TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'escalated')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PERSONALIZED HIGH-SCORE ROADMAPS
CREATE TABLE IF NOT EXISTS public.gate_roadmaps (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    branch_code TEXT NOT NULL,
    target_gate_year INTEGER DEFAULT 2026,
    target_score INTEGER DEFAULT 80,
    weak_subject_ids JSONB DEFAULT '[]'::jsonb,
    strong_subject_ids JSONB DEFAULT '[]'::jsonb,
    weekly_plan JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_gate_subjects_branch ON public.gate_subjects(branch_code);
CREATE INDEX IF NOT EXISTS idx_gate_topics_subject ON public.gate_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_gate_vault_branch_cat ON public.gate_vault_documents(branch_code, category);
CREATE INDEX IF NOT EXISTS idx_gate_questions_branch ON public.gate_questions(branch_code, source_type);
CREATE INDEX IF NOT EXISTS idx_gate_submissions_student ON public.gate_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_submissions_exam ON public.gate_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_gate_submission_answers_sub ON public.gate_submission_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_gate_doubts_student ON public.gate_doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_doubts_status ON public.gate_doubts(status, is_escalated_to_sme);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.gate_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_question_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_submission_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_roadmaps ENABLE ROW LEVEL SECURITY;

-- 1. Public / Academic Content Read Policies (Branches, Subjects, Topics, Vault, Questions, Breakdowns, Exams)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view branches" ON public.gate_branches;
    CREATE POLICY "Public can view branches" ON public.gate_branches FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "Public can view subjects" ON public.gate_subjects;
    CREATE POLICY "Public can view subjects" ON public.gate_subjects FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "Public can view topics" ON public.gate_topics;
    CREATE POLICY "Public can view topics" ON public.gate_topics FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "Public can view vault documents" ON public.gate_vault_documents;
    CREATE POLICY "Public can view vault documents" ON public.gate_vault_documents FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "Public can view gate questions" ON public.gate_questions;
    CREATE POLICY "Public can view gate questions" ON public.gate_questions FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "Public can view question breakdowns" ON public.gate_question_breakdowns;
    CREATE POLICY "Public can view question breakdowns" ON public.gate_question_breakdowns FOR SELECT TO anon, authenticated USING (true);

    DROP POLICY IF EXISTS "Public can view published exams" ON public.gate_exams;
    CREATE POLICY "Public can view published exams" ON public.gate_exams FOR SELECT TO anon, authenticated USING (status = 'published');
END $$;

-- 2. Student & Aspirant User Data Policies (Submissions, Answers, Doubts, Roadmaps, Allocations)
DO $$
BEGIN
    -- Allocations
    DROP POLICY IF EXISTS "Students can view allocations" ON public.gate_allocations;
    CREATE POLICY "Students can view allocations" ON public.gate_allocations FOR SELECT TO authenticated
        USING (student_id = (SELECT auth.uid())::text OR allocation_type = 'global');

    -- Submissions
    DROP POLICY IF EXISTS "Students can view submissions" ON public.gate_submissions;
    CREATE POLICY "Students can view submissions" ON public.gate_submissions FOR SELECT TO authenticated
        USING (student_id = (SELECT auth.uid())::text);

    DROP POLICY IF EXISTS "Students can insert submissions" ON public.gate_submissions;
    CREATE POLICY "Students can insert submissions" ON public.gate_submissions FOR INSERT TO authenticated
        WITH CHECK (student_id = (SELECT auth.uid())::text);

    DROP POLICY IF EXISTS "Students can update submissions" ON public.gate_submissions;
    CREATE POLICY "Students can update submissions" ON public.gate_submissions FOR UPDATE TO authenticated
        USING (student_id = (SELECT auth.uid())::text)
        WITH CHECK (student_id = (SELECT auth.uid())::text);

    -- Submission Answers
    DROP POLICY IF EXISTS "Students can view submission answers" ON public.gate_submission_answers;
    CREATE POLICY "Students can view submission answers" ON public.gate_submission_answers FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT 1 FROM public.gate_submissions s 
            WHERE s.id = gate_submission_answers.submission_id AND s.student_id = (SELECT auth.uid())::text
        ));

    DROP POLICY IF EXISTS "Students can insert submission answers" ON public.gate_submission_answers;
    CREATE POLICY "Students can insert submission answers" ON public.gate_submission_answers FOR INSERT TO authenticated
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.gate_submissions s 
            WHERE s.id = gate_submission_answers.submission_id AND s.student_id = (SELECT auth.uid())::text
        ));

    -- Doubts
    DROP POLICY IF EXISTS "Students can view doubts" ON public.gate_doubts;
    CREATE POLICY "Students can view doubts" ON public.gate_doubts FOR SELECT TO authenticated
        USING (student_id = (SELECT auth.uid())::text OR is_escalated_to_sme = true);

    DROP POLICY IF EXISTS "Students can insert doubts" ON public.gate_doubts;
    CREATE POLICY "Students can insert doubts" ON public.gate_doubts FOR INSERT TO authenticated
        WITH CHECK (student_id = (SELECT auth.uid())::text);

    DROP POLICY IF EXISTS "Students can update doubts" ON public.gate_doubts;
    CREATE POLICY "Students can update doubts" ON public.gate_doubts FOR UPDATE TO authenticated
        USING (student_id = (SELECT auth.uid())::text OR is_escalated_to_sme = true)
        WITH CHECK (student_id = (SELECT auth.uid())::text OR is_escalated_to_sme = true);

    -- Roadmaps
    DROP POLICY IF EXISTS "Students can view roadmaps" ON public.gate_roadmaps;
    CREATE POLICY "Students can view roadmaps" ON public.gate_roadmaps FOR SELECT TO authenticated
        USING (student_id = (SELECT auth.uid())::text);

    DROP POLICY IF EXISTS "Students can upsert roadmaps" ON public.gate_roadmaps;
    CREATE POLICY "Students can upsert roadmaps" ON public.gate_roadmaps FOR ALL TO authenticated
        USING (student_id = (SELECT auth.uid())::text)
        WITH CHECK (student_id = (SELECT auth.uid())::text);
END $$;

-- 3. Admin & Service Role Master Permissions
DO $$
BEGIN
    -- Allow service_role bypass for automated backend functions
    DROP POLICY IF EXISTS "Service role master access branches" ON public.gate_branches;
    CREATE POLICY "Service role master access branches" ON public.gate_branches FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access vault" ON public.gate_vault_documents;
    CREATE POLICY "Service role master access vault" ON public.gate_vault_documents FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access questions" ON public.gate_questions;
    CREATE POLICY "Service role master access questions" ON public.gate_questions FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access breakdowns" ON public.gate_question_breakdowns;
    CREATE POLICY "Service role master access breakdowns" ON public.gate_question_breakdowns FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access exams" ON public.gate_exams;
    CREATE POLICY "Service role master access exams" ON public.gate_exams FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access allocations" ON public.gate_allocations;
    CREATE POLICY "Service role master access allocations" ON public.gate_allocations FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access submissions" ON public.gate_submissions;
    CREATE POLICY "Service role master access submissions" ON public.gate_submissions FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access submission answers" ON public.gate_submission_answers;
    CREATE POLICY "Service role master access submission answers" ON public.gate_submission_answers FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access doubts" ON public.gate_doubts;
    CREATE POLICY "Service role master access doubts" ON public.gate_doubts FOR ALL TO service_role USING (true);

    DROP POLICY IF EXISTS "Service role master access roadmaps" ON public.gate_roadmaps;
    CREATE POLICY "Service role master access roadmaps" ON public.gate_roadmaps FOR ALL TO service_role USING (true);
END $$;

-- ==============================================================================
-- EXPLICIT DATA API GRANTS
-- ==============================================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- INITIAL SEED: GATE BRANCHES (CS, DA, EC, EE, ME, CE)
-- ==============================================================================
INSERT INTO public.gate_branches (code, name, description, syllabus_version) VALUES
('CS', 'Computer Science & Information Technology', 'Algorithms, Data Structures, OS, DBMS, Networks, Theory of Computation, Compilers, Digital Logic', '2025-2026'),
('DA', 'Data Science & Artificial Intelligence', 'Probability & Statistics, Linear Algebra, Machine Learning, AI, Python/Data Structures, Database Management & Warehousing', '2025-2026'),
('EC', 'Electronics & Communication Engineering', 'Signals & Systems, Electronic Devices, Analog Circuits, Digital Circuits, Control Systems, Communications, Electromagnetics', '2025-2026'),
('EE', 'Electrical Engineering', 'Electric Circuits, Electromagnetic Fields, Signals and Systems, Electrical Machines, Power Systems, Control Systems, Electrical and Electronic Measurements, Power Electronics', '2025-2026'),
('ME', 'Mechanical Engineering', 'Engineering Mechanics, Mechanics of Materials, Theory of Machines, Vibrations, Thermodynamics, Fluid Mechanics, Manufacturing', '2025-2026'),
('CE', 'Civil Engineering', 'Structural Engineering, Geotechnical Engineering, Water Resources, Environmental Engineering, Transportation, Geomatics', '2025-2026')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    syllabus_version = EXCLUDED.syllabus_version;

-- ==============================================================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA CACHE
-- ==============================================================================
NOTIFY pgrst, 'reload schema';
