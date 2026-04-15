-- Petra System Convergence Migration v1
-- Step 1: Data Consolidation (Homework -> Tasks)
-- Run this in the Supabase SQL Editor

-- 1. Migrate homework_items to student_tasks
INSERT INTO public.student_tasks (
    student_id, 
    lesson_id, 
    title, 
    description, 
    due_date, 
    status,
    xp_reward
)
SELECT 
    student_id, 
    lesson_id, 
    'Homework: ' || SUBSTRING(task_description FROM 1 FOR 50), 
    task_description || COALESCE('\n\nFocus: ' || next_lesson_focus, ''), 
    due_date,
    CASE WHEN status = 'completed' THEN 'completed' ELSE 'pending' END,
    50 -- Default XP for homework
FROM public.homework_items;

-- 2. Drop legacy homework table
DROP TABLE IF EXISTS public.homework_items;

-- 3. Cleanup student_profiles
ALTER TABLE public.student_profiles DROP COLUMN IF EXISTS assigned_plan;

-- 4. Standardize Statuses (Optional but recommended)
-- Ensure all tasks use the correct status set
UPDATE public.student_tasks 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'completed', 'overdue', 'archived');
