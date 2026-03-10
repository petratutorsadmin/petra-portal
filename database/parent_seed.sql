-- Template to manually insert a Parent account and link to a Student
-- Run this in the Supabase SQL Editor. 
-- Replace the placeholders with actual data.

DO $$
DECLARE
  new_parent_id UUID := gen_random_uuid();
  target_student_id UUID := 'REPLACE_WITH_STUDENT_ID'; -- Find this in the Student Profiles table
  parent_email TEXT := 'parent@example.com';
  parent_first TEXT := 'Parent';
  parent_last TEXT := 'Name';
BEGIN
  -- 1. Insert into auth.users (Supabase managed table)
  -- Note: This creates a user that can sign in. Password will be 'password123'
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, confirmation_token, last_sign_in_at)
  VALUES (
    new_parent_id,
    parent_email,
    crypt('password123', gen_salt('bf')),
    now(),
    'authenticated',
    '',
    now()
  );

  -- 2. Insert into public.profiles
  INSERT INTO public.profiles (id, role, first_name, last_name, email, timezone)
  VALUES (
    new_parent_id,
    'parent',
    parent_first,
    parent_last,
    parent_email,
    'Asia/Tokyo'
  );

  -- 3. Link to student (Optional)
  IF target_student_id IS NOT NULL AND target_student_id != 'REPLACE_WITH_STUDENT_ID' THEN
    INSERT INTO public.student_parent_links (student_id, parent_id)
    VALUES (target_student_id, new_parent_id);
  END IF;

  RAISE NOTICE 'Parent created with ID: %', new_parent_id;
END $$;
