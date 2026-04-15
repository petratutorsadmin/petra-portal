-- RLS Recursion Fix: Use SECURITY DEFINER functions to check roles.
-- This prevents infinite recursion in the profiles table.

CREATE OR REPLACE FUNCTION public.is_student_or_parent()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('student', 'parent')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Update the profiles policy to use the non-recursive function
DROP POLICY IF EXISTS "Students and parents can view tutor identity" ON public.profiles;

CREATE POLICY "Students and parents can view tutor identity" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'tutor' AND public.is_student_or_parent()
);
