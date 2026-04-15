-- Petra OS: Denormalize student_id into lesson_reports
-- This enables fast mastery indexing and simplifies RLS/queries for student views.

-- 1. Add the column
ALTER TABLE public.lesson_reports 
ADD COLUMN student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE;

-- 2. Populate it from the lessons table
UPDATE public.lesson_reports lr
SET student_id = l.student_id
FROM public.lessons l
WHERE lr.lesson_id = l.id;

-- 3. Add NOT NULL constraint (optional, but good if every report should have a student)
-- ALTER TABLE public.lesson_reports ALTER COLUMN student_id SET NOT NULL;

-- 4. Update RLS (simpler now)
DROP POLICY IF EXISTS "Students view own reports" ON public.lesson_reports;
CREATE POLICY "Students view own reports" ON public.lesson_reports 
FOR SELECT USING (student_id = auth.uid());
