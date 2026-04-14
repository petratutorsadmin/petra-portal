-- Petra Portal: Learning Engine Schema Extension
-- Run this in the Supabase SQL Editor AFTER the main schema.sql
-- This adds the Spaced Repetition Engine tables

-- =============================================
-- 1. Card Libraries (Groups of cards by topic)
-- =============================================
CREATE TABLE public.card_libraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.card_libraries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. Cards (Individual flashcard units)
-- =============================================
CREATE TABLE public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  library_id UUID REFERENCES public.card_libraries(id) ON DELETE CASCADE,
  front_content TEXT NOT NULL, -- The prompt / term
  back_content TEXT NOT NULL,  -- The answer / definition
  hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. Student Card Performance (SREP State)
-- =============================================
-- One row per student-card pair. This IS the spaced repetition state.
CREATE TABLE public.student_card_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  easiness_factor DECIMAL(4, 2) DEFAULT 2.5, -- SM-2: starts at 2.5
  interval_days INT DEFAULT 0,               -- Days until next review
  repetitions INT DEFAULT 0,                 -- Times reviewed correctly in a row
  next_review_date TIMESTAMPTZ DEFAULT NOW(), -- When to show next
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE(student_id, card_id)                -- One state per student per card
);
ALTER TABLE public.student_card_performance ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. Study Sessions (Log of completed sessions)
-- =============================================
CREATE TABLE public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  library_id UUID REFERENCES public.card_libraries(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.student_tasks(id) ON DELETE SET NULL,
  cards_reviewed INT DEFAULT 0,
  cards_mastered INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. Extend student_tasks with study linkage
-- =============================================
ALTER TABLE public.student_tasks
  ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'standard', -- 'standard' | 'study_session'
  ADD COLUMN IF NOT EXISTS linked_library_id UUID REFERENCES public.card_libraries(id) ON DELETE SET NULL;

-- =============================================
-- RLS Policies for new tables
-- =============================================

-- Card Libraries: Admins/Tutors manage. Students/Parents read.
CREATE POLICY "Admins manage libraries" ON public.card_libraries USING (public.is_admin());
CREATE POLICY "Tutors manage libraries" ON public.card_libraries
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));
CREATE POLICY "Students read libraries" ON public.card_libraries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('student', 'parent')));

-- Cards: Same as libraries
CREATE POLICY "Admins manage cards" ON public.cards USING (public.is_admin());
CREATE POLICY "Tutors manage cards" ON public.cards
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));
CREATE POLICY "Students read cards" ON public.cards
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('student', 'parent')));

-- Student Card Performance: Students full access to own. Tutors/Admins read.
CREATE POLICY "Students manage own card performance" ON public.student_card_performance
  FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Tutors view card performance of matched students" ON public.student_card_performance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.matches WHERE tutor_id = auth.uid() AND student_id = public.student_card_performance.student_id)
  );
CREATE POLICY "Admins view all card performance" ON public.student_card_performance
  FOR SELECT USING (public.is_admin());

-- Study Sessions: Students manage own. Admins view all.
CREATE POLICY "Students manage own study sessions" ON public.study_sessions
  FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admins view all study sessions" ON public.study_sessions
  FOR SELECT USING (public.is_admin());
