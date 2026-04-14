# Petra Portal: Embedded LMS Architecture

This document serves as the concrete execution specification for the Petra Portal LMS layer. It maps exactly how the tutoring operations platform transforms into a high-agency, habit-forming EdTech system.

---

## 1. CORE LMS FEATURES (STRICT LIMIT)

1.  **Drip-Fed Actionable Tasks:** Tutors assign exactly 1–3 micro-tasks per week (e.g., "Read Chapter 4", "Draft intro paragraph"). No massive long-term homework blocks.
2.  **XP & Level Progression:** Students earn fixed XP for completing tasks and attending lessons. Levels (e.g., Lvl 1 to Lvl 50) provide a quantitative meta-metric of effort without infantile gamification.
3.  **Structured Post-Session Analytics:** Replacing abstract text clumps with bounded performance sliders (Vocabulary, Grammar, Fluency) allowing Admins to catch "at-risk" decay before parents complain.

---

## 2. STUDENT EXPERIENCE (MOBILE-FIRST)

**App Launch Flow:**
The student dashboard acts as a premium habit tracker. There is no endless scrolling.

1.  **Top (Hero): The Progression Ring.**
    *   A large, sleek circular progress bar showing `Current Level` and `XP to Next Level`. It updates instantaneously via optimistic UI on task completion.
2.  **Middle (Active Feed): The Task Queue.**
    *   A vertical stack of `CheckableTaskCard`s.
    *   **Action:** Tapping the circle instantly fills it with a checkmark, fades the card, and adds XP.
    *   **Constraint:** Max 3 active tasks visible. Completed tasks gracefully disappear from the main feed into a history tab.
3.  **Bottom (Sticky Action): Next Imminent Lesson.**
    *   A fixed card showing `[Tomorrow 4:00 PM • Grammar with Toru]`. Tapping opens the Zoom link.

---

## 3. TUTOR INPUT SYSTEM

**The "After-Action Report" UI:**
Tutors no longer write essays. The post-lesson form is optimized for iPad/Tablet and takes < 60 seconds.

1.  **Skill Incrementers (Replacing standard text):**
    *   Tutors tap rapid +1, 0, or -1 modifiers for `Grammar`, `Vocabulary`, and `Pronunciation`.
2.  **Task Assignment (The Engine):**
    *   A dynamic checklist where tutors input exactly 1 to 3 short sentences for the student's week: `[Read Article X]`.
3.  **XP Bonus Slider:**
    *   A slider to instantly grant +50 or +100 "Effort XP" to the student directly from the report panel.

---

## 4. DATA FLOW (CRITICAL)

1.  **Trigger (Lesson Ends):** The lesson finishes. The Tutor opens `/tutor/lessons/[id]/report`.
2.  **Report Submission:** Tutor submits the `StructuredReportForm`.
3.  **Database Split:**
    *   The `lesson_reports` table gets the skill analytics & internal notes.
    *   *Simultaneously*, an RPC function or Next.js Server Action loops through the assigned tasks and `INSERT`s them into the `student_tasks` table mapped to the `student_id`.
4.  **Student Delivery:** The Student opens the app. The home screen queries `student_tasks WHERE status = 'pending'`.
5.  **Completion & XP Hook:** The Student clicks a task.
    *   The UI optimistically clears the task immediately.
    *   A background Server Action (`UPDATE student_tasks SET status = 'completed'`) fires.
    *   The action triggers an `UPDATE student_profiles SET current_xp = current_xp + 50`.
6.  **Progress Reflection:** The XP Ring re-fetches and animates the new total.

---

## 5. DATABASE CHANGES (LIGHTWEIGHT)

We introduce one new table and extend two existing ones.

1.  **New Table:** `student_tasks`
    *   `id` (UUID)
    *   `student_id` (UUID, FK -> student_profiles)
    *   `lesson_id` (UUID, FK -> lessons, nullable)
    *   `title` (TEXT)
    *   `status` (TEXT: 'pending', 'completed')
    *   `xp_reward` (INT)
2.  **Extend:** `student_profiles`
    *   `current_xp` (INT, default 0)
    *   `current_level` (INT, default 1)
3.  **Extend:** `lesson_reports`
    *   `skill_increments` (JSONB) - stores `{ grammar: 1, vocab: 0, fluency: -1 }`

---

## 6. UI COMPONENTS

1.  **`StudentDashboard`:** The layout wrapper that constraints width to 480px, handling the mobile overscroll locks.
2.  **`LevelProgressBar`:** An SVG circular indicator reading `current_xp`. Animate using `stroke-dashoffset` with a sharp `0.4s cubic-bezier`.
3.  **`CheckableTaskCard`:** A client component handling the optimistic UI. It holds `task_id` and fires `startTransition` to call the `completeTask` Server Action without blocking the UI thread.
4.  **`StructuredReportForm`:** The Tutor's unified input block mapping arrays of tasks into the single Supabase `insert` transaction.

---

## 7. MVP BUILD ORDER

1.  **Step 1: Database Expansion.** Run SQL to add `student_tasks`, `current_xp`, and `skill_increments`. Write strict RLS ensuring students can only update `status` to 'completed' on their own tasks.
2.  **Step 2: Tutor Input Conversion.** Replace the old text-blob `/tutor/.../report` page with the `StructuredReportForm`. Ensure it writes to the new tables.
3.  **Step 3: Student Environment.** Build out `/client/app` with the Hero Ring and real-time Task queries.
4.  **Step 4: The Core Loop Test.** Log in as Tutor -> Submit Report with task -> Log in as Student -> Click Task -> Verify XP increments.

---

## 8. UX RULES

*   **Premium, not Childish:** Keep colors deep (Slate, White, subtle Violet). Do not use cartoons, stars, or bouncing confetti.
*   **Optics of Agency:** The Student must hit the checkbox themselves. Auto-marking destroys the psychological habit loop.
*   **Latency is Death:** Student actions (task marking) MUST use Optimistic UI. If it takes 2 seconds to mark a task done, usage drops by 80%.
