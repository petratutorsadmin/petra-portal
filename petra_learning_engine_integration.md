# Petra Portal: Unified Learning Engine Integration

This document defines the complete architectural integration of the Petra Portal LMS (Tasks, XP, Levels) with the Petra Study System (Spaced Repetition, Cards, Libraries, Knowledge Graph).

Evolving from a "task system" to a "High-Performance Learning Engine."

---

## 1. UNIFIED LEARNING LOOP (CRITICAL)

The complete lifecycle of student engagement:

1. **Lesson Execution:** Tutor conducts a lesson (e.g., covering new Chapter 4 vocabulary).
2. **Tutor Report (Assignment):** The Tutor logs the report and assigns a task. They select `Task Type: Study Session` and link the existing "Chapter 4 Vocabulary" Library to the task.
3. **Card Propagation:** Automatically, all cards within the "Chapter 4 Vocabulary" library are pushed into the student's personal Spaced Repetition queue (`student_card_performance`) as "new cards."
4. **Student Entry (Mobile):** The student opens the app. The Task Queue shows: `[▶️ Run Training: Chapter 4 Vocab]`.
5. **Study Execution:** The student taps the task. The app launches the `srep_engine` in a full-screen, focused modal. 
6. **Spaced Repetition Review:** The student swipes/taps through the active flashcards. The engine calculates algorithm impacts (Easiness Factor, Interval).
7. **Performance Tracking:** The session completes. `student_card_performance` intervals are updated. The words enter the student's Knowledge Graph.
8. **XP Calculation:** Student receives base task XP (+50) PLUS micro-XP per card reviewed (+2 per card).
9. **Progress Update:** The Task is implicitly marked complete. The Level Ring animates on return to the dashboard.

---

## 2. TASK → STUDY SYSTEM INTEGRATION

Tasks are no longer just "dumb text checkboxes". They are execution triggers.

**Structural Linkage:**
*   `student_tasks` now supports a `task_type` column (`'manual_checkbox'` vs `'study_session'`).
*   Tasks of type `'study_session'` contain a `linked_target_id` pointing to either a specific `library_id` or the student's global `due_cards` queue.

**Task Behaviors:**
*   **Targeted Training:** "Master Unit 6 Terms". This forces the session engine to prioritize cards from Unit 6. 
*   **Maintenance Training:** "Daily Spaced Repetition". This pulls 20 due cards globally across all subjects the student studies.

---

## 3. STUDY SESSION INTEGRATION

Study Mode acts as a high-focus "Cognitive Training" state.

**Where it lives:**
1.  **Implicitly in Tasks:** A primary call-to-action button `[Start Session]` on the `CheckableTaskCard` whenever `task_type === 'study_session'`.
2.  **Explicitly in Nav:** A new "Training" icon in the explicit bottom mobile tab bar, allowing self-guided review independent of tutor tasks.

**Workflow:**
*   Tapping `Start Session` transitions to a full-screen, distraction-free route (`/client/study?task_id=XYZ`).
*   The UI shows the flashcard front. The user taps "Reveal".
*   The user grades themselves: (Again, Hard, Good, Easy).
*   Upon draining the active queue, a Post-Session Debrief screen shows:
    *   Cards Cleared
    *   Target Accuracy
    *   XP Earned
*   Closing the debrief fires the overarching task `completeTask` mutation automatically.

---

## 4. DATABASE EXTENSIONS (MINIMAL)

Leveraging the existing Supabase infrastructure to tie the Study Engine in.

**1. `cards` (If not already isolated):**
*   `id`, `library_id` (UUID), `topic` (TEXT), `front_content` (TEXT), `back_content` (TEXT)

**2. `student_card_performance` (The SREP State Matrix):**
*   `id` (UUID)
*   `student_id` (UUID, FK)
*   `card_id` (UUID, FK)
*   `easiness_factor` (DECIMAL, default 2.5)
*   `interval_days` (INT, default 0)
*   `repetitions` (INT, default 0)
*   `next_review_date` (TIMESTAMPTZ)
*   `UNIQUE(student_id, card_id)`

**3. `study_sessions` (Audit Log):**
*   `id` (UUID)
*   `student_id` (UUID)
*   `duration_seconds` (INT)
*   `cards_reviewed` (INT)
*   `xp_earned` (INT)

**4. Extend `student_tasks`:**
*   `task_type` (TEXT: `'standard'`, `'study_session'`)
*   `linked_library_id` (UUID, nullable)

---

## 5. UI INTEGRATION (VERY IMPORTANT)

The interface must seamlessly merge operations and learning.

*   **Student Dashboard (`/client/app`):** Active study tasks have a distinct visual language (e.g., a "Play" icon instead of a circle checkbox). Tapping them overrides route to the Study Engine.
*   **The Bottom Tab Bar (Mobile):**
    *   `[Briefing (Home)]` | `[Training (Study)]` | `[Comms (Messages/Support)]`
*   **The Knowledge Graph (Web/Tablet only):** A distinct overarching menu item called `[Neural Net]` or `[Knowledge Graph]`. This operates dynamically using D3.js, reading from `student_card_performance` to color nodes (Green = Mastered/High Interval, Orange = Learning/Low Interval).

---

## 6. XP SYSTEM INTEGRATION

XP becomes a granular economy of cognitive effort, not just participation.

*   **Task Completion:** Base +50 XP for finishing any assigned session.
*   **Micro-Transactions (Spaced Repetition):**
    *   +2 XP for every card reviewed inside a session. 
    *   *Why?* A 50-card review feels infinitely more rewarding than a 10-card review, keeping high-effort students highly motivated.
*   **The Engine Calculation:** When the `study_sessions` row is written to the DB upon session completion, the server-side action calculates `(tasks_base_100) + (cards_reviewed * 2)`. It updates the `student_profiles.current_xp` exactly once to prevent client-side tampering.

---

## 7. FEATURE PRIORITY (STRICT)

**MVP (Immediate Build):**
*   Extend `student_tasks` database schema.
*   Build the mobile-first Flashcard UI (`/client/study`).
*   Implement standard SuperMemo-2 (SM-2) algorithm logic for the Spaced Repetition engine in a Next.js Server Action.
*   Allow Tutors to select a static Library when assigning tasks.

**Phase 2 (Fast Follow):**
*   The generic "Training" Tab: Allowing students to clear their daily `due_cards` queue without needing explicit tutor task assignments.
*   Library Browser for Admins/Tutors to easily map cards to students.

**Phase 3 (Expansion):**
*   D3.js Word Graph visualization (Tablet/Desktop).
*   Automatic card generation from lesson transcriptions or notes.

---

## 8. DEVICE STRATEGY

*   **Mobile (Portrait - Primary):** The Flashcard Engine is hyper-optimized for thumb reachability on mobile. Big touch targets for (Again / Hard / Good / Easy). The primary engine of student habituation.
*   **Tablet (Landscape - Review):** Displays the Knowledge Graph on the left and the active Flashcard on the right. Better for deep dive self-study.
*   **Desktop (Admin/Tutor):** Used heavily by Tutors via the split-view dashboard to rapidly browse multi-library databases and assign massive card stacks to students in seconds during the post-lesson wipe.

---

## 9. UX RULES

*   **Tone:** The Study Mode is a "High-Performance Cognitive Training System". Not a game.
*   **Visuals:** Deep Slate background (`#0f172a`), stark white text, sharp minimal borders. Focus is purely on the data.
*   **Interactions:** No bouncing, no confetti, no mascots. When a session finishes, deliver a crisp, rapid numerical breakdown matrix (Cards Processed, XP Yield, Next Recommended Training time).
*   **Speed:** Card transitions must be instantaneous (React state). The spaced-repetition math and database logs resolve asynchronously in the background so the student NEVER waits for a loading spinner between cards.
