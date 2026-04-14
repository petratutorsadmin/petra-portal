-- RLS Policies for Tutor Availability
-- Allow tutors to manage their own recurring rules and one-off exceptions

-- 1. Rules
ALTER TABLE public.tutor_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors manage own availability rules" ON public.tutor_availability_rules
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Anyone can view tutor availability rules" ON public.tutor_availability_rules
  FOR SELECT USING (true);

-- 2. Exceptions
ALTER TABLE public.tutor_availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors manage own availability exceptions" ON public.tutor_availability_exceptions
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Anyone can view tutor availability exceptions" ON public.tutor_availability_exceptions
  FOR SELECT USING (true);
