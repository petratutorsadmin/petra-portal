# Petra Portal: Unified Features Analysis

*This document serves as the comprehensive analysis of the Petra Portal hybrid system, detailing both the original Administrative Operations platform and the newly embedded Learning Management System (LMS).*

---

## 1. Executive Summary
Petra Portal is a dual-layer system balancing high-density logistics for tutoring agencies and high-agency, habit-forming digital product experiences for students. By persisting all data to a single unified Supabase PostgreSQL instance, the product solves both the administrative "back-office" nightmares and the pedagogical "front-office" engagement challenges.

---

## 2. Layer A: The Operations Platform 
*(Audience: Admins and Tutors)*

### 👔 Admin "Command Center"
- **RBAC Matrix**: Strict Supabase Row Level Security separating roles (`admin`, `tutor`, `student`, `parent`). Admins retain `is_admin()` bypass privileges across the network.
- **The Pricing Engine**: Programmatic TypeScript engine calculating absolute Gross Profit Margins based on:
  - Program Categories (e.g., P1 to P11 multipliers)
  - Student Types (e.g., International School vs. Standard)
  - Delivery Overheads (Online vs. In-Person)
  - Market Adjustments
- **Financial Subsystems**:
  - Invoicing and PDF storage integration.
  - Tutor Compensation (`tutor_pay_mode` constraints).
- **Logistics Engine**: Google Calendar service account integration. Every lesson booked in the system dynamically seeds a unified Google Calendar with metadata embedded.

### 👨‍🏫 Tutor "Practitioner Hub"
- **Profile Authority**: Tutors manage public bios, expertise matrices, and availability blocks.
- **Dynamic Availability**: 
  - Implementation of recurring day-to-day slots (`tutor_availability_rules`).
  - Dynamic overrides (`tutor_availability_exceptions`) for holiday or specific blockouts.
- **Financial Dashboards**: Live payouts and compensation tracking based strictly on their `tutor_level` mapping.

---

## 3. Layer B: The EdTech Learning System (LMS)
*(Audience: Students and Parents)*

### **The "After-Action Protocol" (Tutor-to-Student Data Pipeline)**
- **Structured Debriefs**: Away from blank text boxes, Tutors now log analytical performance via `<StructuredReportForm />`. 
- **Skill Vectors**: Every lesson yields `skill_increments`. A tutor dynamically scores +5 or -5 on attributes like `Grammar`, `Vocab`, `Fluency`.
- **Bonus Allocations**: Tutors can manually slide a `Bonus Effort XP` bar after impressive sessions.

### 🎓 The Student "Companion" Dashboard (`/client/app`)
- **Progression Engine**:
  - `LevelProgressBar`: A visual ring summarizing `current_xp` vs the `xpForNextLevel` (Level threshold formula: `Level * 500`).
  - Creates a tangible growth trajectory out of an intangible service (tutoring).
- **Active Objectives (Tasks)**:
  - Data from the `student_tasks` relational table.
  - Tutors assign modular tasks (e.g., "Read Chapter 4"). Students swipe to mark them complete (`CheckableTaskCard`), verifying action via `completeTask` Server Action and firing an XP payload.
- **The Briefing View**: Imminent "Next Session" details directly sourced from Google Calendar equivalents, plus the "Last Debrief" quotes to bookend the learning journey.

---

## 4. Architectural Synergies (Why It Works)
- **Zero-Latency State**: Because the `student_tasks` XP logic is functionally tied to the exact same database performing edge functions for the Admin invoicing system, there are no webhook delays or third-party CRM bloat. 
- **Security-First Model**: The student experience is actively protected out-of-the-box via existing Supabase RLS. Students cannot invoke `completeTask` server actions on tasks assigned to other `student_id`s.

---

## 5. Future Analytical Opportunities
With the implementation of `skill_increments` and `student_tasks`, the agency now captures proprietary metadata that solves a major problem: **Predictable Churn**. 
- Admins can query `student_tasks` completion velocity to flag "At Risk" students who miss homework.
- Overall `current_xp` accumulation serves as quantitative proof-of-work to present to Parents during renewal cycles.
