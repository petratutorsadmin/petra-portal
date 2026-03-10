-- Trigger to automatically create a profile record when a new user signs up via Supabase Auth
-- This handles the mapping of metadata (first_name, last_name, role) to the public.profiles table.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );

  -- Also create the role-specific profile if it's a student or tutor
  IF (new.raw_user_meta_data->>'role') = 'student' THEN
    INSERT INTO public.student_profiles (id, status)
    VALUES (new.id, 'inquiry_received');
  ELSIF (new.raw_user_meta_data->>'role') = 'tutor' THEN
    INSERT INTO public.tutor_profiles (id, tutor_level, tutor_pay_mode)
    VALUES (new.id, 1, 'standard');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
