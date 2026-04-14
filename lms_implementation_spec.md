# Petra Portal LMS: Implementation Blueprint

This is the exact technical specification to embed a true Learning Management System (LMS) into the existing Petra Portal, transforming the system from passive operations into active student engagement, without breaking the existing architecture.

---

## 1. NEW DATABASE SCHEMA (EXACT)

We are introducing a dedicated `student_tasks` table to drive student agency. Supabase RLS will ensure complete data isolation.

```sql
-- New Table: student_tasks
CREATE TABLE public.student_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INT DEFAULT 50,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- enum: pending, completed, overdue, dropped
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: student_tasks
ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own tasks" ON public.student_tasks 
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Tutors manage assigned tasks" ON public.student_tasks 
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Admins full access" ON public.student_tasks 
  FOR ALL USING (public.is_admin());
```

---

## 2. UPDATED TABLE CHANGES

We are transforming the `student_profiles` to hold progression state, and `lesson_reports` to hold highly structured analytical feedback.

```sql
-- 1. Modify student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN current_xp INT DEFAULT 0,
ADD COLUMN current_level INT DEFAULT 1;

-- 2. Modify lesson_reports
ALTER TABLE public.lesson_reports 
ADD COLUMN xp_awarded INT DEFAULT 0, -- Base + tutor discretion bonus
ADD COLUMN skill_increments JSONB DEFAULT '{}'::jsonb; 
-- Example payload: {"grammar": 10, "vocab": 5, "fluency": -5}
```

---

## 3. NEW UI STRUCTURE (NEXT.JS ROUTES)

We repurpose and expand the `/client` and `/tutor` routes into application-grade endpoints.

**Student Routes (Mobile-Optimized):**
* `/client/app` (The Briefing / Hub)
* `/client/app/tasks` (The comprehensive Task Board)
* `/client/app/vault` (Historical notes & `lesson_reports` feed)

**Tutor Routes (Web/Tablet):**
* `/tutor/lessons/[id]/report/new` (The new Structured Data Hub for after-action reporting)

---

## 4. COMPONENT BREAKDOWN

These must be built as highly isolated, server-client decoupled React components.

**1. `StudentDashboardHub.tsx` (Server Component)**
- **Shows**: Frame wrapper.
- **Data**: Fetches `student_profiles.current_xp` and `student_tasks` `WHERE status='pending' LIMIT 3`.

**2. `LevelProgressBar.tsx` (Client Component)**
- **Shows**: Neon linear/circular bar. Current Level, XP to next level.
- **Data**: Passed `current_xp` via props. (Logic: `Next Level = Level * 500 XP`).
- **Updates**: Fires a pulse animation when `current_xp` mutates via context/prop update.

**3. `CheckableTaskCard.tsx` (Client Component)**
- **Shows**: Task title, due date, XP reward tag.
- **Data**: Individual `student_tasks` row.
- **Updates**: `onClick` -> triggers Server Action `markTaskComplete(taskId)`. Plays a satisfying haptic/visual checkmark burst.

**4. `StructuredReportForm.tsx` (Client Component for Tutors)**
- **Shows**: Form replacing the old giant text area.
- **Data**: Associated `lesson_id` and `student_id`.
- **Updates**: State manages an array of string tasks, a slider for Bonus XP, and integer trackers for skill toggles. Submits one aggregate payload via `submitLessonReport()`.

---

## 5. STUDENT DASHBOARD (DETAILED)

**Strict Layout Constraint:** Designed for a 390x844px mobile viewport.

**TOP VIEWPORT (The Status Region):**
* **Level Ring**: Bold typography inside a circular progress ring. (e.g., "Level 4").
* **Banner**: "Next session: Tomorrow at 4:00 PM with Michael."
* **Global Motivation**: Concise, non-childish text. "Keep your rhythm."

**MIDDLE VIEWPORT (The Action Space):**
* **Section Title**: "Current Objectives"
* **List**: Maximum 3 `CheckableTaskCard`s.
  * *UI Vibe*: Flat cards, 1px subtle stroke, dark matte background inside a clean white/dark-mode theme. Right side of card features a dedicated interaction zone (circle).
* **Interaction**: Pressing the circle completes the task, crosses out the text, reveals +50 XP animation, and vanishes the card after 1.5 seconds.

**BOTTOM VIEWPORT (The Vault Preview):**
* **Section Title**: "Last Debrief"
* **Card**: Snippet of the latest `lesson_reports`.
* **Content**: "Grammar +10. Vocabulary +5. Great work on past-tense verb endings."

---

## 6. TUTOR WORKFLOW UPDATE

The previous workflow was "Write a summary paragraph". The new workflow is the **"After-Action Protocol"**.

**The EXACT UI Flow (/tutor/lessons/[id]/report/new):**

1. **Step 1: Core Feedback (Text)**
   - Single input: "Headline summary for the student & parent" (Max 2 sentences).

2. **Step 2: Analytics (Toggles)**
   - Tutors click +/- buttons for preset skills:
   - `[Grammar: +5] [Pronunciation: +10] [Fluency: 0]`

3. **Step 3: XP Distribution (Slider)**
   - "Bonus Effort XP" Slider (0 to 100). Default is 50.

4. **Step 4: Objective Assignment (Dynamic List)**
   - "Assign Next Actions."
   - Input field: "Read page 42." $\to$ Press 'Add'
   - Input field: "Memorize 10 verbs." $\to$ Press 'Add'

*Tutor clicks "Submit Debrief".* The system handles all downstream complexity.

---

## 7. DATA FLOW

This is the exact chain of events:

1. **Lesson Ends** $\to$ Tutor opens `StructuredReportForm.tsx`.
2. **Tutor Submits** $\to$ Server Action `submitLessonReport()` is invoked.
   - **Transaction starts:**
   - **A)** `INSERT INTO lesson_reports` (saves core text, `xp_awarded`, and `skill_increments`).
   - **B)** `INSERT INTO student_tasks` (iterates over assigned actions, bounds `lesson_id`, `student_id`).
   - **C)** `UPDATE student_profiles SET current_xp = current_xp + xp_awarded WHERE id = student_id`.
   - **Transaction commits.**
3. **Student Opens App** $\to$ Reads `student_profiles` to render `LevelProgressBar.tsx`. Reads `student_tasks` to render `Current Objectives`.
4. **Student Acts** $\to$ Clicks task node. Server Action `completeTask(taskId)` is invoked.
   - **Transaction starts:**
   - **A)** `UPDATE student_tasks SET status = 'completed', completed_at = NOW() WHERE id = taskId`.
   - **B)** `UPDATE student_profiles SET current_xp = current_xp + 50 WHERE id = student_id`. (Triggers level-up logic if modulo threshold crossed).
   - **Transaction commits.**
5. **UI Revalidates** $\to$ Task vanishes, XP bar jumps.

---

## 8. MVP BUILD ORDER

This must be built sequentially to avoid breaking the production DB.

* **Step 1: Database Primitives (Day 1)**
  - Run SQL to create `student_tasks`.
  - Run SQL to ALTER `student_profiles` and `lesson_reports`.
  - Apply strict RLS policies.
  - *Checkpoint: No UI is broken. DB is primed.*

* **Step 2: Tutor Input Upgrade (Days 2-4)**
  - Build `StructuredReportForm.tsx`.
  - Replace current `/tutor/lessons/[id]/report/new` view.
  - Wire to `submitLessonReport` server action.
  - *Checkpoint: Tutors are now feeding structured data and tasks into the void.*

* **Step 3: Student Hub Foundation (Days 5-7)**
  - Build server queries for new `/client/app` dashboard.
  - Build `LevelProgressBar.tsx` (view only).
  - Build `CheckableTaskCard.tsx` (read only).

* **Step 4: The Interactive Loop (Days 8-10)**
  - Wire `completeTask` Server Action.
  - Implement XP mutation logic and Next.js `revalidatePath`.
  - Polish the UI/haptic interactions for marking tasks complete.

* **Step 5: Testing & Go Live (Days 11-14)**
  - Roll out exclusively to 1 active tutor and their 3 students for live beta.

---

## 9. UX REQUIREMENTS & VIBE

* **Strictly Premium:** High contrast interface. Black/Off-Black backgrounds (`#0A0A0A`) with pristine white typography and neon accent points (e.g., vibrant lime or electric purple for the XP progression).
* **Strictly Structured:** Utilize heavy use of CSS grids. Every margin is exactly `16px` or `24px`. No floating elements.
* **NOT Childish:** Completely ban the words "Game", "Play", "Quest". Use "Objectives", "Debrief", "Level", "Archive". Treat the student like a professional athlete managing their performance statistics.
* **NOT Cluttered:** Show a maximum of 3 tasks on the home screen. Hide everything else behind a secondary click to `/client/app/tasks`. The primary goal is singular focus.
