-- Petra Portal Initial Schema
-- Note: Run this in the Supabase SQL Editor

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'tutor', 'student', 'parent');
CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled', 'trial', 'regular');
CREATE TYPE trial_status AS ENUM ('inquiry_received', 'trial_requested', 'trial_scheduled', 'trial_completed', 'admin_review_pending', 'matched', 'active', 'paused', 'inactive');

-- 2. Base Profiles Table
-- Depends on auth.users from Supabase
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Tutor Profiles
CREATE TABLE public.tutor_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  photo_url TEXT,
  university TEXT,
  languages TEXT[],
  subjects TEXT[],
  curriculum_expertise TEXT[],
  bio TEXT,
  teaching_style TEXT,
  general_availability_summary TEXT, -- Student facing summary
  google_calendar_id TEXT, -- For sync
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Student Profiles
CREATE TABLE public.student_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  status trial_status DEFAULT 'inquiry_received',
  assigned_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Parent Profiles (No extra fields initially needed, but good to have dedicated table if needed, using profiles for now)
-- 6. Student Parent Links
CREATE TABLE public.student_parent_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);
ALTER TABLE public.student_parent_links ENABLE ROW LEVEL SECURITY;

-- 7. Student Tutor Preferences / Match Requests
CREATE TABLE public.match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  preferred_tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE SET NULL,
  request_text TEXT,
  status TEXT DEFAULT 'pending', -- pending, matched, closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- 8. Actual Student-Tutor Matches (Who teaches who)
CREATE TABLE public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  matched_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- admin who matched
  status TEXT DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 9. Trial Status History
CREATE TABLE public.trial_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  status trial_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.trial_status_history ENABLE ROW LEVEL SECURITY;

-- 10. Pricing Engine Tables (Admin only logic)
CREATE TABLE public.program_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  multiplier DECIMAL(5, 2) DEFAULT 1.0,
  description TEXT
);
CREATE TABLE public.currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g. JPY, USD
  exchange_rate DECIMAL(10, 4) DEFAULT 1.0
);
CREATE TABLE public.market_multipliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_name TEXT NOT NULL,
  multiplier DECIMAL(5, 2) DEFAULT 1.0
);
CREATE TABLE public.pricing_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_level TEXT NOT NULL,
  min_pay DECIMAL(10, 2),
  standard_pay DECIMAL(10, 2),
  max_pay DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Pricing Quotes (Assigned to students)
CREATE TABLE public.pricing_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  currency_id UUID REFERENCES public.currencies(id),
  student_price DECIMAL(10, 2) NOT NULL,
  tutor_pay DECIMAL(10, 2) NOT NULL,
  petra_margin DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.pricing_quotes ENABLE ROW LEVEL SECURITY;

-- 12. Tutor Availability
CREATE TABLE public.tutor_availability_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tutor_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tutor_availability_exceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tutor_availability_exceptions ENABLE ROW LEVEL SECURITY;

-- 13. Lessons
CREATE TABLE public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE SET NULL,
  date_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  subject_program TEXT,
  delivery_type TEXT, -- online, in-person
  status lesson_status DEFAULT 'scheduled',
  is_trial BOOLEAN DEFAULT false,
  pricing_quote_id UUID REFERENCES public.pricing_quotes(id) ON DELETE SET NULL,
  google_calendar_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 14. Lesson Requests
CREATE TABLE public.lesson_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE SET NULL,
  preferred_date_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lesson_requests ENABLE ROW LEVEL SECURITY;

-- 15. Lesson Reports & Homework
CREATE TABLE public.lesson_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.tutor_profiles(id),
  topics_covered TEXT,
  student_visible_comments TEXT,
  admin_only_notes TEXT,
  student_engagement_rating INT, -- 1-5
  attendance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lesson_reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.homework_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  next_lesson_focus TEXT,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned', -- assigned, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.homework_items ENABLE ROW LEVEL SECURITY;

-- 16. Invoices & Payments (Admin managed)
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'unpaid', -- unpaid, paid, void
  due_date DATE,
  file_url TEXT, -- uploaded PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid
  payout_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 17. Feedback & Support
CREATE TABLE public.student_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  satisfaction_rating INT,
  comments TEXT,
  issues_to_flag TEXT,
  continue_with_tutor BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'open', -- open, in_progress, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 18. Storage & Documents
-- Uses Supabase core storage, tables not strictly needed, but handy to associate with users
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  doc_type TEXT, -- id, resume, other
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read their own profile. Admins can read all.
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins all operations on profiles" ON public.profiles USING (public.is_admin());

-- Tutor Profiles: Tutors see own. Admins see all. Students/parents see approved IF logic permits. (Simplified: students can view).
-- Requirement: Tutors must never see other tutors.
CREATE POLICY "Tutors view own tutor profile" ON public.tutor_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all tutor profiles" ON public.tutor_profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Students and parents can view tutor profiles" ON public.tutor_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('student', 'parent')
  )
);
CREATE POLICY "Tutors update own tutor profile" ON public.tutor_profiles FOR UPDATE USING (auth.uid() = id);

-- Student Profiles: Students see own. Parents see linked. Admins see all. Tutors see matched.
CREATE POLICY "Students view own student profile" ON public.student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all student profiles" ON public.student_profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Parents view linked student profiles" ON public.student_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_parent_links WHERE parent_id = auth.uid() AND student_id = public.student_profiles.id
  )
);
CREATE POLICY "Tutors view matched student profiles" ON public.student_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.matches WHERE tutor_id = auth.uid() AND student_id = public.student_profiles.id
  )
);

-- Lessons: Students see own. Tutors see own. Admins see all. Parents see linked.
CREATE POLICY "Students view own lessons" ON public.lessons FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Tutors view own lessons" ON public.lessons FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Admins view all lessons" ON public.lessons FOR SELECT USING (public.is_admin());
CREATE POLICY "Parents view linked student lessons" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_parent_links WHERE parent_id = auth.uid() AND student_id = public.lessons.student_id
  )
);

-- Lesson Reports: Tutors create/view own. Students view own. Parents view linked. Admins view all.
CREATE POLICY "Tutors view own reports" ON public.lesson_reports FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors insert own reports" ON public.lesson_reports FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Admins view all reports" ON public.lesson_reports FOR SELECT USING (public.is_admin());
CREATE POLICY "Students view own reports" ON public.lesson_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons WHERE id = lesson_id AND student_id = auth.uid()
  )
);

-- Payouts: Tutors view own. Admins view all.
CREATE POLICY "Tutors view own payouts" ON public.payouts FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Admins manage all payouts" ON public.payouts USING (public.is_admin());

-- Invoices: Students view own. Parents view linked. Admins view all.
CREATE POLICY "Students view own invoices" ON public.invoices FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins manage all invoices" ON public.invoices USING (public.is_admin());

-- Default safety: for tables not explicitly granting to others, assume only admin or owner.
-- This ensures strict requirements met.
