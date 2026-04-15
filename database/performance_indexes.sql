-- Petra OS Phase 2 Performance Indexes
-- NOTE: Please run denormalize_reports.sql before this script to ensure student_id exists on lesson_reports.
-- Run these in the Supabase SQL Editor to optimize hot query paths for the new layout system

-- Student Tasks queries (Briefing page)
CREATE INDEX IF NOT EXISTS idx_student_tasks_student_status_created ON public.student_tasks (student_id, status, created_at DESC);

-- Lessons queries (Next lesson context panel / briefing)
CREATE INDEX IF NOT EXISTS idx_lessons_student_status_datetime ON public.lessons (student_id, status, date_time ASC);

-- Lesson Reports queries (Progress page mastery arc)
CREATE INDEX IF NOT EXISTS idx_lesson_reports_student_created ON public.lesson_reports (student_id, created_at DESC);

-- Study Sessions queries (Progress page)
CREATE INDEX IF NOT EXISTS idx_study_sessions_student_completed ON public.study_sessions (student_id, completed_at DESC);

-- Plan Change Requests (Admin queue notification)
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_status ON public.plan_change_requests (status);
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_student ON public.plan_change_requests (student_id);

-- Flashcard performance (Due count in Context Panel)
CREATE INDEX IF NOT EXISTS idx_card_performance_student_next_review ON public.student_card_performance (student_id, next_review_date);
