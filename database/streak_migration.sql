-- Petra OS Phase 3: Streak Tracking
-- Tracks consecutive days of study sessions (Training Mode)

-- 1. Add columns to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_study_date DATE;

-- 2. Index for streak-based leaderboards (future-proofing)
CREATE INDEX IF NOT EXISTS idx_student_profiles_streak ON public.student_profiles (current_streak DESC);
