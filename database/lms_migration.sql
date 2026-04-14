-- Petra Portal LMS Migration
-- Run this securely in the Supabase SQL Editor

-- 1. Modify student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN current_xp INT DEFAULT 0,
ADD COLUMN current_level INT DEFAULT 1;

-- 2. Modify lesson_reports
ALTER TABLE public.lesson_reports 
ADD COLUMN xp_awarded INT DEFAULT 0,
ADD COLUMN skill_increments JSONB DEFAULT '{}'::jsonb; 

-- 3. Create student_tasks
CREATE TABLE public.student_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INT DEFAULT 50,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- pending, completed, overdue, dropped
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on new table
ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS Policies for student_tasks
CREATE POLICY "Students manage own tasks" ON public.student_tasks 
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Tutors manage assigned tasks" ON public.student_tasks 
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Admins full access" ON public.student_tasks 
  FOR ALL USING (public.is_admin());
