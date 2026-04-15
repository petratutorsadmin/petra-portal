-- Petra OS: Personal Vault RLS Updates
-- Enables student-created libraries and cards

-- 1. Card Libraries Policies
-- Note: Existing policies allow Admins/Tutors to manage and Students to Read.
-- This adds 'Full Management' for students on libraries they created.

DROP POLICY IF EXISTS "Students manage own libraries" ON public.card_libraries;
CREATE POLICY "Students manage own libraries" ON public.card_libraries
  FOR ALL USING (created_by = auth.uid());

-- 2. Cards Policies
-- Allow students to manage cards inside libraries they created.
DROP POLICY IF EXISTS "Students manage own cards" ON public.cards;
CREATE POLICY "Students manage own cards" ON public.cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.card_libraries
      WHERE id = public.cards.library_id
      AND created_by = auth.uid()
    )
  );

-- 3. Student Card Performance RLS (Existing is student_id = auth.uid())
-- Ensure that when a student creates a card, they have select access to performance too.
-- (Existing policy already handles this).
