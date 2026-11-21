-- ==============================================================================
-- AI GATE PREPARATION PLATFORM: MULTI-TENANT & VERIFIED NEWS POSTGRES SCHEMA
-- Migration: 20261121010000_gate_multi_tenant_and_news.sql
-- ==============================================================================

-- 1. CAMPUSES TABLE
CREATE TABLE IF NOT EXISTS public.campuses (
    id TEXT PRIMARY KEY DEFAULT ('camp_' || substr(md5(random()::text), 1, 12)),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_r2_url TEXT,
    primary_accent_hex TEXT DEFAULT '#0f172a',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    max_students INTEGER DEFAULT 500,
    allocated_mock_credits INTEGER DEFAULT 5000,
    allocated_ai_interview_credits INTEGER DEFAULT 1000,
    allocated_ai_doubt_tokens INTEGER DEFAULT 500000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY DEFAULT ('dept_' || substr(md5(random()::text), 1, 12)),
    campus_id TEXT NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    allocated_mock_credits INTEGER DEFAULT 1000,
    allocated_ai_interview_credits INTEGER DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GATE USERS & 4-TIER ROLES
CREATE TABLE IF NOT EXISTS public.gate_users (
    id TEXT PRIMARY KEY DEFAULT ('user_' || substr(md5(random()::text), 1, 12)),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('SUPER_ADMIN', 'CAMPUS_ADMIN', 'DEPT_ADMIN', 'STUDENT')),
    campus_id TEXT REFERENCES public.campuses(id) ON DELETE SET NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    mock_tests_allowed INTEGER DEFAULT 10,
    mock_tests_used INTEGER DEFAULT 0,
    ai_interviews_allowed INTEGER DEFAULT 3,
    ai_interviews_used INTEGER DEFAULT 0,
    daily_ai_doubts_limit INTEGER DEFAULT 25,
    daily_ai_doubts_used INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VERIFIED GATE 2027 UPDATES
CREATE TABLE IF NOT EXISTS public.gate_updates (
    id TEXT PRIMARY KEY DEFAULT ('upd_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Exam Schedule', 'Syllabus & Pattern', 'Registration / GOAPS', 'Admit Card & Results')),
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & Data API Grants
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_updates ENABLE ROW LEVEL SECURITY;

-- Open read policies for multi-tenant portal
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read campuses" ON public.campuses;
    CREATE POLICY "Public read campuses" ON public.campuses FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read departments" ON public.departments;
    CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read gate updates" ON public.gate_updates;
    CREATE POLICY "Public read gate updates" ON public.gate_updates FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Service role full access campuses" ON public.campuses;
    CREATE POLICY "Service role full access campuses" ON public.campuses FOR ALL USING (true);

    DROP POLICY IF EXISTS "Service role full access departments" ON public.departments;
    CREATE POLICY "Service role full access departments" ON public.departments FOR ALL USING (true);

    DROP POLICY IF EXISTS "Service role full access gate users" ON public.gate_users;
    CREATE POLICY "Service role full access gate users" ON public.gate_users FOR ALL USING (true);

    DROP POLICY IF EXISTS "Service role full access gate updates" ON public.gate_updates;
    CREATE POLICY "Service role full access gate updates" ON public.gate_updates FOR ALL USING (true);
END $$;

GRANT ALL ON public.campuses TO anon, authenticated, service_role;
GRANT ALL ON public.departments TO anon, authenticated, service_role;
GRANT ALL ON public.gate_users TO anon, authenticated, service_role;
GRANT ALL ON public.gate_updates TO anon, authenticated, service_role;
