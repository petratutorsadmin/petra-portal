-- OAuth Token Storage for Google Calendar
CREATE TABLE IF NOT EXISTS public.user_google_creds (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiry_date BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.user_google_creds ENABLE ROW LEVEL SECURITY;

-- Policies: Users can see and update their own credentials
CREATE POLICY "Users view own google creds" ON public.user_google_creds
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own google creds" ON public.user_google_creds
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users modify own google creds" ON public.user_google_creds
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all (for debugging)
CREATE POLICY "Admins view all google creds" ON public.user_google_creds
    FOR SELECT USING (public.is_admin());
