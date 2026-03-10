-- Petra Portal Pricing System Migration
-- Run this in the Supabase SQL Editor

-- ================================================
-- 1. ALTER program_categories (replace multiplier with base_price_jpy + code)
-- ================================================
ALTER TABLE public.program_categories
  DROP COLUMN IF EXISTS multiplier,
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS base_price_jpy DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Seed the 11 canonical programs
TRUNCATE public.program_categories;
INSERT INTO public.program_categories (code, name, base_price_jpy, description) VALUES
  ('P1',  'Basic Language Support',            3500,  'Foundational language skills, beginner to elementary'),
  ('P2',  'Standard School Support',           3850,  'General school subject curriculum support'),
  ('P3',  'Conversation & Practical Language', 4200,  'Conversational English and practical everyday use'),
  ('P4',  'Academic Language Support',         4700,  'Academic writing, reading comprehension, vocabulary'),
  ('P5',  'Standard Exam Prep',                5250,  'EIKEN, TOEFL, IELTS, TOEIC, SAT Reading/Writing'),
  ('P6',  'Adult Professional / Business',     5950,  'Business English, presentations, professional communication'),
  ('P7',  'International School Core',         7000,  'Core IB/Edexcel/Cambridge MYP and IGCSE subjects'),
  ('P8',  'Advanced International Curriculum', 8400,  'IB HL, A-Level, AP specialist advanced subjects'),
  ('P9',  'Premium Writing / Admissions',      10500, 'University essay coaching and admissions consulting'),
  ('P10', 'Specialist Premium',                13300, 'Highly specialist or rare subject expertise'),
  ('P11', 'Ultra Premium Consulting',          17500, 'Executive coaching and consulting-grade sessions');

-- ================================================
-- 2. Lesson length multipliers
-- ================================================
CREATE TABLE IF NOT EXISTS public.lesson_lengths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  minutes INT UNIQUE NOT NULL,
  multiplier DECIMAL(5,3) NOT NULL
);
INSERT INTO public.lesson_lengths (minutes, multiplier) VALUES
  (45, 0.75), (60, 1.0), (90, 1.5), (120, 2.0)
ON CONFLICT (minutes) DO UPDATE SET multiplier = EXCLUDED.multiplier;

-- ================================================
-- 3. Weekly frequency discounts
-- ================================================
CREATE TABLE IF NOT EXISTS public.weekly_frequency_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lessons_per_week INT UNIQUE NOT NULL,
  discount DECIMAL(5,3) NOT NULL
);
INSERT INTO public.weekly_frequency_discounts (lessons_per_week, discount) VALUES
  (1, 0.00), (2, 0.05), (3, 0.08), (4, 0.10)
ON CONFLICT (lessons_per_week) DO UPDATE SET discount = EXCLUDED.discount;

-- ================================================
-- 4. Plan types
-- ================================================
CREATE TABLE IF NOT EXISTS public.plan_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  multiplier DECIMAL(5,3) NOT NULL,
  months INT NOT NULL
);
INSERT INTO public.plan_types (code, label, multiplier, months) VALUES
  ('PAYG', 'Pay As You Go', 1.15, 0),
  ('M1',   '1 Month',       1.00, 1),
  ('M2',   '2 Months',      0.97, 2),
  ('M3',   '3 Months',      0.94, 3),
  ('M6',   '6 Months',      0.90, 6),
  ('M12',  '12 Months',     0.85, 12)
ON CONFLICT (code) DO UPDATE SET multiplier = EXCLUDED.multiplier, label = EXCLUDED.label;

-- ================================================
-- 5. Delivery types
-- ================================================
CREATE TABLE IF NOT EXISTS public.delivery_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  client_fee INT NOT NULL,
  tutor_extra INT NOT NULL
);
INSERT INTO public.delivery_types (code, label, client_fee, tutor_extra) VALUES
  ('online',       'Online',              0,    0),
  ('ip_nearby',    'In-person Nearby',    500,  300),
  ('ip_standard',  'In-person Standard',  1000, 300),
  ('ip_far',       'In-person Far',       1500, 700),
  ('home',         'Home Visit Premium',  2000, 1000),
  ('cafe',         'Cafe Lesson',         500,  1200)
ON CONFLICT (code) DO UPDATE SET client_fee = EXCLUDED.client_fee, tutor_extra = EXCLUDED.tutor_extra;

-- ================================================
-- 6. Student types
-- ================================================
CREATE TABLE IF NOT EXISTS public.student_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  multiplier DECIMAL(5,3) NOT NULL
);
INSERT INTO public.student_types (code, label, multiplier) VALUES
  ('early_childhood', 'Early Childhood',      1.10),
  ('elementary',      'Elementary',           1.10),
  ('junior_high',     'Junior High',          1.05),
  ('high_school',     'High School',          1.10),
  ('international',   'International School', 1.25),
  ('university',      'University',           0.90),
  ('adult',           'Adult',                1.00),
  ('professional',    'Professional',         1.20)
ON CONFLICT (code) DO UPDATE SET multiplier = EXCLUDED.multiplier;

-- ================================================
-- 7. Group size rules
-- ================================================
CREATE TABLE IF NOT EXISTS public.group_size_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  size INT UNIQUE NOT NULL,
  multiplier DECIMAL(5,3) NOT NULL
);
INSERT INTO public.group_size_rules (size, multiplier) VALUES
  (1, 1.00), (2, 0.80), (3, 0.65), (4, 0.55), (5, 0.50), (6, 0.45)
ON CONFLICT (size) DO UPDATE SET multiplier = EXCLUDED.multiplier;

-- ================================================
-- 8. Re-seed market_multipliers
-- ================================================
TRUNCATE public.market_multipliers;
INSERT INTO public.market_multipliers (region_name, multiplier) VALUES
  ('Developing Markets', 0.65),
  ('Emerging Markets',   0.80),
  ('Upper Middle',       0.90),
  ('Japan Baseline',     1.00),
  ('High Income Asia',   1.30),
  ('Western Europe',     1.90),
  ('UK',                 2.10),
  ('North America',      2.20),
  ('Premium Cities',     2.50);

-- ================================================
-- 9. Re-seed currencies
-- ================================================
TRUNCATE public.currencies;
INSERT INTO public.currencies (code, exchange_rate) VALUES
  ('JPY', 1.0000),
  ('USD', 0.0067),
  ('EUR', 0.0062),
  ('GBP', 0.0053),
  ('THB', 0.2400),
  ('IDR', 103.50),
  ('SGD', 0.0090);

-- ================================================
-- 10. Expand tutor_profiles
-- ================================================
ALTER TABLE public.tutor_profiles
  ADD COLUMN IF NOT EXISTS tutor_level INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS tutor_pay_mode TEXT DEFAULT 'standard';

-- ================================================
-- 11. Expand pricing_quotes with full inputs
-- ================================================
ALTER TABLE public.pricing_quotes
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.program_categories(id),
  ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES public.tutor_profiles(id),
  ADD COLUMN IF NOT EXISTS lesson_length_minutes INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS lessons_per_week INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plan_code TEXT DEFAULT 'M1',
  ADD COLUMN IF NOT EXISTS delivery_code TEXT DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS student_type_code TEXT DEFAULT 'adult',
  ADD COLUMN IF NOT EXISTS market_region TEXT DEFAULT 'Japan Baseline',
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'JPY',
  ADD COLUMN IF NOT EXISTS group_size INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tutor_pay_per_lesson DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS client_price_per_lesson DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS petra_margin_per_lesson DECIMAL(10,2);

-- Remove old minimal columns if they conflict
ALTER TABLE public.pricing_quotes
  ALTER COLUMN student_price DROP NOT NULL,
  ALTER COLUMN tutor_pay DROP NOT NULL;

-- ================================================
-- 12. Expand invoices
-- ================================================
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS pricing_quote_id UUID REFERENCES public.pricing_quotes(id),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- ================================================
-- 13. Student enrollments
-- ================================================
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  pricing_quote_id UUID REFERENCES public.pricing_quotes(id),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending',
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS for enrollments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_enrollments' AND policyname = 'Students view own enrollments') THEN
    CREATE POLICY "Students view own enrollments" ON public.student_enrollments FOR SELECT USING (student_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_enrollments' AND policyname = 'Admins manage enrollments') THEN
    CREATE POLICY "Admins manage enrollments" ON public.student_enrollments USING (public.is_admin());
  END IF;
END $$;

-- RLS on pricing_quotes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing_quotes' AND policyname = 'Admins manage quotes') THEN
    CREATE POLICY "Admins manage quotes" ON public.pricing_quotes USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing_quotes' AND policyname = 'Students view own approved quotes') THEN
    CREATE POLICY "Students view own approved quotes" ON public.pricing_quotes FOR SELECT USING (student_id = auth.uid() AND status = 'approved');
  END IF;
END $$;
