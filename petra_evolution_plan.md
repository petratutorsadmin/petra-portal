# Petra Evolution Plan: Transforming Operations into EdTech

This document outlines the strategic product evolution for Petra Portal. The goal is to transition from a strong, operational "extranet" into a hybrid system containing both a premium operations platform and an engaging, habit-forming EdTech learning product.

## 1. PRODUCT DIAGNOSIS

**What Petra already does extremely well:**
- **Unit Economics Engine**: The `pricing-engine.ts` efficiently models complex market constraints, gross margin thresholds, and dynamic multiplier rules without bleeding logic everywhere.
- **Data Boundaries (RLS)**: Strict Row Level Security successfully isolates roles, ensuring absolute privacy.
- **Logistics Core**: Scheduling, invoicing, and reporting are robust, highly functional, and predictable.

**What should NOT be changed:**
- **The Core PostgreSQL Base**: The atomic concepts of `profiles`, `matches`, `lessons`, and `quotes` must stay as-is. Do not rewrite backend architectures.
- **Google Calendar Sync**: It is the single source of absolute truth for time. Do not build custom calendar infrastructure.
- **Pricing Enforcement**: The margin checks and programmatic pricing must remain untouched. 

**What prevents Petra from being perceived as EdTech:**
- The current student experience is *transactional* rather than *transformational*. 
- It functions as a portal where a student "checks the receipt" rather than "makes progress."
- The interaction is asynchronous, infrequent, and passive. It lacks a feedback loop that rewards daily engagement or makes growth feel tangible.

---

## 2. PRODUCT ARCHITECTURE

To scale, the system must separate into two distinct, specialized layers that share a single underlying Supabase database.

### A. Operations Layer (Web-First)
- **Target Audience:** Admins & Tutors.
- **Platform:** Desktop/Laptop web browsers.
- **Design Metaphor:** "The Medical Chart / The Command Center." High density, high utility, deeply analytical. Use of large tables, split views, and dense forms.

### B. Learning Layer (Mobile-First / Tablet)
- **Target Audience:** Students & Parents.
- **Platform:** iOS/Android (PWA or Native) + specialized iPad view.
- **Design Metaphor:** "The Fitness Tracker / The Digital Companion." Low friction, highly visual, progress-oriented, deeply satisfying micro-interactions.

**Shared Backend Integration:**
- Both apps talk to the exact same Supabase endpoint. 
- A tutor logs a `lesson_report` on the Operations Web App $\to$ RLS verifies the match $\to$ The Learning Mobile App triggers a push notification to the student about new XP or homework.

---

## 3. ROLE EXPERIENCE REDESIGN

- **ADMIN (The Architect):** 
  - *Keep the power.* Avoid cluttering this view with student gamification graphics. 
  - *Addition:* Implement a "Student Health Score" column on the web dashboard. This score derives from the student's mobile app engagement (XP velocity, task completion rate) to predict churn risk.

- **TUTOR (The Practitioner):** 
  - *Keep the clipboard vibe.* 
  - *Addition:* Simplify the `lesson_report` input. Instead of broad text boxes, use structured increments. For example, logging "Grammar: +10 XP", or easily toggling boolean homework tasks. This makes data entry faster for the tutor and structurally readable for the mobile app.

- **PARENT (The Observer):** 
  - *Keep trust high.* Parents shouldn't be spammed.
  - *Addition:* A weekly "Digest" view. Beautiful, auto-generated graphics showing their child's consistency (lesson rhythm) and tutor remarks. Provide absolute clarity on ROI.

- **STUDENT (The Explorer):** 
  - *Shift from passive to active.* 
  - *Addition:* A daily destination. Students no longer just wait for lessons; they log in to check off micro-tasks, review flashcards logged by the tutor, and see their overarching "Level" or progression track go up.

---

## 4. STUDENT APP (PETRA COMPANION)

Building a focused, mobile-first product directly aimed at the student user.

### Constraints:
- **Maximum 3-5 core screens.**
- **High frequency (daily/weekly usage).**
- **Derives value purely from existing database architectures.**

### Core Features:
1. **The Briefing (Home Screen):**
   - *What:* The immediate tactical view. A countdown to the next scheduled lesson and top 3 pending homework tasks.
   - *Why:* Creates urgency and immediate context framing each time the app is opened.
2. **The Vault (Resource Hub):**
   - *What:* A chronological feed of past lesson notes and study materials attached directly to the `lessons` schema. 
   - *Why:* Moves the student from losing email attachments to building a comprehensive, searchable archive of their own knowledge.
3. **The Ledger (Growth Engine):**
   - *What:* A visual representation of their Level and total XP, graphed over time, based entirely on completed lessons and checked-off `homework_items`.
   - *Why:* Turns abstract "studying" into a concretized, undeniable track record of effort. Habit formation relies on visible momentum.

---

## 5. DATA TRANSFORMATION

Existing tables must now serve as "learning intelligence":

- **`lessons` $\to$ Rhythm / Cadence Metrics.** Attending a scheduled lesson guarantees a base drop of +100 XP. Missing it breaks a visual "streak."
- **`homework_items` $\to$ The Task System.** Completing a task gives +50 XP. It turns abstract studying into dopamine-driven micro-goals.
- **`lesson_reports` $\to$ After-Action Reviews.** Tutors provide structured feedback increments (e.g., +25 point bonus for high engagement in the `student_engagement_rating` field). 
- **`student_profiles` $\to$ The Level System.** Adding `current_xp` and `level` fields mathematically defines the student’s journey. Levels can unlock digital badges or physical real-world perks.

---

## 6. MOBILE & IPAD EXPERIENCE

### Mobile App (iOS/Android - Phone)
- **Navigation:** Bottom-tab bar (Briefing, Tasks, Vault, Profile).
- **Interaction Model:** Swiping actions for completing tasks (e.g., swiping right on a homework card plays a rewarding haptic click and fires a Supabase update).
- **Flow:** User gets a push notification 1 hour before lesson $\to$ logs into Briefing screen $\to$ sees the lesson link + pre-reading material.

### iPad / Tablet Experience
- **Mobile vs Table differences:** The iPad app should absolutely **not** be a scaled-up phone layout. 
- **Tutor In-Lesson Mode:** A dual-pane split screen. Left side shows the student's historical `Vault` and goals; Right side presents a live-input form to draft the `lesson_report` mid-session. It operates functionally as an electronic medical record system.
- **Vibe:** It should feel utilitarian, incredibly fast, and deeply premium. 

---

## 7. MVP BUILD PLAN

*Founder Note: Optimize strictly for speed to market. Do not over-engineer native bridges yet.*

### Phase 1: "The Companion Beta" (Next 2-3 Weeks)
- **Goal:** Get the first 10-15 highly engaged students habituated to checking the app.
- **Build:** Implement a PWA or simple React Native wrapper around a mobile-optimized Next.js route (`/app`).
- **Features:** 
  1. Upcoming Lesson countdown.
  2. "Mark as Done" checklist for homework. 
- **Ignore:** Complex gamification, parent digest views, complex native animations.

### Phase 2: "The Feedback Loop" (Months 1-2)
- **Build:** The Vault (lesson history parsing) and the backend calculation for XP tracking. 
- **Tweak:** Refactor the Tutor web UI to output structured, discrete tasks rather than paragraph text blobs.
- **Outcome:** The system is now generating structured educational data autonomously.

### Phase 3: "Full Intelligence" (Months 3+)
- **Scale:** Push notifications, the Parent Observer Dashboard, full visual leveling rings (like Apple Watch fitness rings). 
- **Platform:** True App Store deployment.

---

## 8. UX / DESIGN PRINCIPLES

To hit the true execution note, the following design tenets must be upheld across all touchpoints:

- **Premium, strictly NOT generic SaaS:** Leverage deep, harmonious color palettes (slate, deep purple, stark white), subtle glassmorphism for overlays, and modern typography (Inter/Geist). It must feel like an expensive service.
- **Structured, NOT chaotic:** Avoid endless scrolling feeds. Every piece of UI must justify its existence. 
- **Motivating, NOT gamified:** Avoid childish mascots. Draw inspiration from high-end adult fitness trackers like WHOOP, Oura, or Strava. Progress bars and streak counts, not cartoons.
- **High-Trust:** Parent dashboards must be pristine, instantly readable, and exude professionalism.
- **High-Agency:** Students must feel they are managing their own professional development, giving them a sense of respect and autonomy.
