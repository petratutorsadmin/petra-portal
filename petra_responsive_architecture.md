# Petra Portal: Responsive Architecture & Mobile Optimization Plan

This document outlines the concrete implementation specifications to upgrade Petra Portal from a desktop-centric operations dashboard into a premium, responsive environment optimized for Phone, Tablet, and Desktop.

---

## 1. MOBILE UX DIAGNOSIS

**The Problem with Compressed Dashboards:**
Existing operations platforms typically fail on mobile because they rely on horizontal spatial relationships (data tables, side-by-side forms, wide sidebars). When compressed, these elements either overflow horizontally (requiring tedious scrolling) or shrink to unreadable scales. 

**Petra Portal's Likely Current Friction Points:**
*   **Information Density:** Pricing Engine estimators and Admin quote forms have too many inputs squeezed together, leading to visual fatigue and "fat-finger" errors.
*   **Navigation:** A permanent desktop sidebar taking up 20-30% of a mobile screen is unacceptable. 
*   **Table Behavior:** Unresponsive `<table>` elements for lesson history or tutor payouts break viewport boundaries.
*   **Interaction Flow:** Tutors tapping tiny `[+]` or `[-]` buttons for XP increments will struggle on mobile screens.

---

## 2. RESPONSIVE PRODUCT STRATEGY

Each role demands a different device priority. The system does not need to be unilaterally "Mobile First"—it must be **Device-Appropriate**.

*   **Student Role (Mobile-First):** 90% of students will interact with Petra via their iPhone. Their experience must mirror a premium habit-tracker (like Duolingo or Apple Fitness), entirely optimized for one-handed vertical use.
*   **Parent Role (Mobile-First):** Parents check updates on the go. They need high-trust, receipt-like overviews of progress and billing. Desktop is secondary.
*   **Tutor Role (Tablet/Mobile-First):** Tutors manage schedules on their phones, but they likely conduct the "After-Action Protocol" (submitting reports) on an iPad or tablet immediately after a lesson.
*   **Admin Role (Desktop-First):** Admins executing the Pricing Engine, reconciling payroll, and managing complex matches will be at a computer. Their mobile experience should be restricted to an "executive overview" (reading read-only metrics), not complex data entry.

---

## 3. NEW RESPONSIVE NAVIGATION MODEL

We must move away from the static, unified layout model to a device-adaptive paradigm.

*   **Desktop (`>= 1024px`):** 
    *   **Layout:** Persistent left Sidebar (250px) + Main Content Area. 
    *   **Role Logic:** Admins and Tutors get the full expanded sidebar.
*   **Tablet (`768px - 1023px`):** 
    *   **Layout:** Narrow side-rail navigation (icon-only, ~80px wide). Expanding only on hover/tap. This maximizes horizontal real estate for report writing and tables.
*   **Mobile (`< 768px`):** 
    *   **Layout:** Bottom Tab Bar for primary routes (Home, Tasks, Profile). 
    *   **Role Logic:** Eradicate the hamburger menu for Students/Parents; they only need 3-4 primary destinations. Admins/Tutors keep a hidden hamburger for secondary ops settings.

---

## 4. MOBILE-FIRST STUDENT EXPERIENCE

The Student Hub must feel like a focused, premium native app (think Nike Run Club, not Salesforce).

*   **1. The "Hero" State (Top of Viewport):** 
    *   No welcome fluff. Immediately display the **Level Progress Ring**. It should take up 40% of the upper screen real estate.
*   **2. Active Objectives (Middle of Viewport):**
    *   A strictly constrained vertical stack of `CheckableTaskCards`.
    *   **Rule:** Max 3 visible tasks. If there are more, show a subtle "View All" link. This prevents endless scrolling and psychological overload.
*   **3. Imminent Session (Floating/Sticky):**
    *   A fixed bottom sheet or highly distinct card near the thumb zone that anchors the next lesson: `[Thursday 4:00 PM • Grammar with Toru]`.
*   **Hidden/Collapsed Elements:**
    *   Full lesson history, historical GPA, and past tutor quotes are hidden behind an explicit "Profile/Archive" tab in the bottom bar. Do not load these on the main feed.

---

## 5. PARENT MOBILE EXPERIENCE

Parents are buying *results* and *trust*. Do not gamify their portal.

*   **1. The "Ledger" View:**
    *   Top card is not an XP circle, but a clear ROI metric: `Current Phase: P4 Academic Writing`.
*   **2. Tutor Debrief Feed:**
    *   A clean, vertical timeline of recent `lesson_reports`. 
    *   Show the Tutor's `student_visible_comments` boldly. Hide the granular XP maths—replace it with simple, reassuring skill tags: `[Vocabulary +]`, `[Pronunciation ++]`.
*   **3. Invoices & Scheduling:**
    *   A dedicated tab for financial truth. One-tap access to PDF receipts and a scannable grid of upcoming verified lesson times.

---

## 6. TABLET / IPAD SPECIFICATIONS (TUTOR FOCUS)

The iPad is the primary working tool for the Tutor. Treating the tablet as a "big phone" will ruin the data entry experience.

*   **Split View Construction:** 
    *   When a Tutor clicks into a Lesson Report, the interface should utilize a **Sidebar/Detail Split View** (similar to iPad Mail or Notes).
    *   **Left Pane (30%):** List of today's students/lessons.
    *   **Right Pane (70%):** The `StructuredReportForm`.
*   **Live Lesson Mode:**
    *   The `CheckableTaskCard` and `Skill Increment` buttons must be sized to `min-width: 44px; min-height: 44px` (Apple Human Interface Guidelines for touch targets) so the tutor can comfortably tap +5 XP without looking down closely while talking to the student.
*   **Orientation Rules:**
    *   Portrait: Stacked cards. Landscape: Multi-column grids.

---

## 7. COMPONENT-LEVEL RESPONSIVE RULES

*   **Data Tables (e.g., Payouts, Admin Users):**
    *   *Desktop:* Standard `<table>`.
    *   *Mobile:* Completely dismantle tables. Map `{row}` arrays into `flex-col` **Cards**. For payouts, use a master-detail pattern where tapping a generic payout card opens a modal with line-item breakdowns.
*   **Forms (e.g., Pricing Estimator):**
    *   *Desktop:* 2-column or 3-column grid layouts.
    *   *Mobile:* 1-column stack. Convert `<select>` dropdowns into large, tappable bottom-sheets or full-width pill selectors if there are 4 options or fewer (e.g. Plan Commitment: M1, M3, M6).
*   **Modals:**
    *   *Desktop:* Centered floating lightbox.
    *   *Mobile:* Convert all modals into **Bottom Sheets** anchored to the bottom of the screen. This preserves thumb reachability.
*   **The XP Slider (Tutor Report):**
    *   Requires a touch-friendly track width (`height: 24px` minimum) and an external exact-number input box so tutors don't have to fight touch-scrubbing imprecision.

---

## 8. IMPLEMENTATION PLAN

**Phase 1: Triage & Structural Baselines (Days 1-3)**
*   Implement CSS Media Queries for the new Navigation Model.
*   Hide desktop sidebar on mobile; wrap existing client/tutor shells in a Bottom Tab Bar layout for `< 768px`.
*   Increase global touch target sizes to `44px` height (buttons, inputs) to instantly fix "fat-finger" errors.

**Phase 2: Mobile Dismantling (Days 4-7)**
*   Convert all explicit `<table>` elements in the Client and Tutor views into responsive Card iterators using `display: grid` and CSS container queries.
*   Convert the `PricingEstimatorClient.tsx` multi-column grid into a stacked mobile layout with large pill toggles.

**Phase 3: The Student "Native" Feel (Days 8-10)**
*   Rebuild the `/client/app` layout to strictly enforce the "Hero Ring -> Top 3 Tasks -> Sticky Next Lesson" visual hierarchy.
*   Implement overscroll-behavior constraints to give it a locked, app-like bounce effect instead of web-scrolling.

**Phase 4: iPad Split-Views for Tutors (Days 11-14)**
*   Wrap the `/tutor/lessons` directory in a React parallel route or CSS Grid layout that detects `min-width: 768px` to activate the Left-List / Right-Form dual pane.

---

## 9. DESIGN PRINCIPLES

*   **Premium:** Generous negative space (padding: 1.5rem minimum on cards). Deep, subdued color palette (Slate, Violet, pure White). No primary colors.
*   **Structured:** Information is rigidly constrained into bounded boxes and gentle borders (`border: 1px solid #e2e8f0`). Everything feels contained.
*   **High-Trust:** Typography must be sharp. Use system fonts (`San Francisco/Inter`) with strict tracking.
*   **Not Childish:** Eliminate bouncing animations, gamified confetti, and bright cartoon aesthetic. Use smooth, mathematically grounded CSS curves (`cubic-bezier(0.4, 0, 0.2, 1)`).
*   **Not Cluttered:** Ruthlessly hide secondary data. If it doesn't inform the immediate next action, hide it behind a tap.
