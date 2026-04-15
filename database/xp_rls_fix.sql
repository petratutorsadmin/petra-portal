-- RLS Fix: Allow students to update their own XP and progress stats
-- Without this, study sessions and task completions would fail to save XP.

DROP POLICY IF EXISTS "Students update own student profile" ON public.student_profiles;

CREATE POLICY "Students update own student profile" 
ON public.student_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure Tutors can also update student profiles if they match (e.g. for awarding XP during reports)
DROP POLICY IF EXISTS "Tutors update matched student profiles" ON public.student_profiles;

CREATE POLICY "Tutors update matched student profiles"
ON public.student_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.matches WHERE tutor_id = auth.uid() AND student_id = public.student_profiles.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches WHERE tutor_id = auth.uid() AND student_id = public.student_profiles.id
  )
);
