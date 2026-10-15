-- ==============================================================================
-- ZYTX ACADEMY: SUPABASE DATABASE INITIALIZATION SCRIPT
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Students, Admins, Demo Access)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  demo_status TEXT DEFAULT 'none',
  progress INTEGER DEFAULT 0,
  track TEXT DEFAULT 'Exporting & E-Commerce',
  joined_date TEXT,
  watched_videos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Courses Table (Modules & Sessions)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Live',
  img TEXT,
  sessions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  assigned_student_ids JSONB DEFAULT '["all"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'Submitted',
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Q&A Forum Table
CREATE TABLE IF NOT EXISTS public.qa_forum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT DEFAULT 'general',
  student_id TEXT,
  student_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  replies TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Platform Content & Demo Config Table
CREATE TABLE IF NOT EXISTS public.merkanto_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT DEFAULT 'Demo',
  label TEXT,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Default Administrator Account
INSERT INTO public.profiles (id, name, email, password, role, demo_status, joined_date)
VALUES (
  'admin-root-001',
  'Executive Director',
  'admin@zytx.com',
  'password123',
  'admin',
  'approved',
  TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
)
ON CONFLICT (email) DO NOTHING;

-- Default Demo Videos & WhatsApp Configuration
INSERT INTO public.merkanto_content (key, value, category, label, type)
VALUES
  ('demo.v1.title', 'DEMO VIDEO 1: MASTERCLASS OVERVIEW', 'Demo', 'Demo Video 1 Title', 'text'),
  ('demo.v1.url', 'https://player.vimeo.com/video/1197817919?h=31d77d474c', 'Demo', 'Demo Video 1 URL', 'video'),
  ('demo.v2.title', 'DEMO VIDEO 2: BASICS OF EXPORTING', 'Demo', 'Demo Video 2 Title', 'text'),
  ('demo.v2.url', 'https://player.vimeo.com/video/1197817919?h=31d77d474c', 'Demo', 'Demo Video 2 URL', 'video'),
  ('demo.whatsapp', '+91 98765 43210', 'Demo', 'WhatsApp Support Number', 'text')
ON CONFLICT (key) DO NOTHING;

-- Initial Course Module: Dropshipping & Export Mastery
INSERT INTO public.courses (title, description, img, sessions)
VALUES (
  'Export Mastery: Global Success',
  'Master export logistics, international trade compliance, market selection, and global scaling.',
  '/images/export_mastery_banner.png',
  '[
    {
      "id": "session-1",
      "title": "Module 1: Introduction to Global Exporting",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "description": "Understanding global trade routes, export readiness, and buyer sourcing."
    },
    {
      "id": "session-2",
      "title": "Module 2: Regulatory Compliance & Customs",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "description": "In-depth guide to export documentation, HS codes, and logistics."
    }
  ]'::jsonb
);

-- Disable Row Level Security (RLS) for simple client-side access or enable public policies:
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_forum DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.merkanto_content DISABLE ROW LEVEL SECURITY;
