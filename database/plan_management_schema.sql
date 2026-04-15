-- Petra Portal: Plan Management System
-- Run in Supabase SQL Editor

-- =============================================
-- plan_change_requests: tracks all student plan requests
-- =============================================
CREATE TABLE public.plan_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  
  -- What they're asking to change
  request_type TEXT NOT NULL,
  -- format_change | frequency_change | lesson_length_change | tutor_change 
  -- | add_subject | pause | resume | add_sibling | other

  -- Their specific request values
  current_value TEXT,    -- e.g. "online", "60min", "1x/week"
  requested_value TEXT,  -- e.g. "in-person", "90min", "2x/week"
  notes TEXT,            -- Free-text field for extra context

  -- Price preview (calculated at submission for simple requests)
  current_monthly_jpy INT,
  projected_monthly_jpy INT,

  -- Workflow status
  status TEXT DEFAULT 'pending',
  -- pending | under_review | approved | declined | cancelled

  -- Admin handling
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  effective_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.plan_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Students manage their own. Admins see all.
CREATE POLICY "Students view own requests" ON public.plan_change_requests
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students submit requests" ON public.plan_change_requests
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students cancel own pending requests" ON public.plan_change_requests
  FOR UPDATE USING (
    student_id = auth.uid() AND status = 'pending'
  )
  WITH CHECK (status = 'cancelled');

CREATE POLICY "Admins manage all requests" ON public.plan_change_requests
  FOR ALL USING (public.is_admin());

-- Index for fast student lookups
CREATE INDEX ON public.plan_change_requests (student_id, status, created_at DESC);
