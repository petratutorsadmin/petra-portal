-- Create payouts table for recording payments to tutors
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency_code TEXT DEFAULT 'JPY',
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  payout_date DATE,
  period_start DATE,
  period_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- RLS for payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Admins manage payouts') THEN
    CREATE POLICY "Admins manage payouts" ON public.payouts USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Tutors view own payouts') THEN
    CREATE POLICY "Tutors view own payouts" ON public.payouts FOR SELECT USING (tutor_id = auth.uid());
  END IF;
END $$;
