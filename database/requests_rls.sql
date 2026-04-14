-- RLS Policies for Lesson and Match Requests
-- Allow students/parents to request matches and lessons, and admins to manage them.

-- 1. Lesson Requests
ALTER TABLE public.lesson_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own lesson requests" ON public.lesson_requests
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins manage all lesson requests" ON public.lesson_requests
  USING (public.is_admin());

CREATE POLICY "Tutors view assigned lesson requests" ON public.lesson_requests
  FOR SELECT USING (tutor_id = auth.uid());

-- 2. Match Requests
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own match requests" ON public.match_requests
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins manage all match_requests" ON public.match_requests
  USING (public.is_admin());

CREATE POLICY "Tutors view assigned match requests" ON public.match_requests
  FOR SELECT USING (preferred_tutor_id = auth.uid());

-- 3. Student Parent Links visibility (Parents need this to see their children's requests)
-- This might already be in schema.sql, but let's ensure parents can view linked student requests
CREATE POLICY "Parents view linked student lesson requests" ON public.lesson_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_parent_links 
      WHERE parent_id = auth.uid() AND student_id = public.lesson_requests.student_id
    )
  );

CREATE POLICY "Parents view linked student match requests" ON public.match_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_parent_links 
      WHERE parent_id = auth.uid() AND student_id = public.match_requests.student_id
    )
  );
