-- RLS Fix: Allow students and parents to see tutor names in the profiles table.
-- This is required for the "Browse Tutors" directory to function.

DROP POLICY IF EXISTS "Students and parents can view tutor identity" ON public.profiles;

CREATE POLICY "Students and parents can view tutor identity" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'tutor' AND 
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('student', 'parent')
  )
);
