# Petra Portal: The Complete System Blueprint (Exhaustive Overview)

This document provides a 360-degree overview of the Petra Portal project, covering technical architecture, business logic, user journeys, and infrastructure.

---

## 🏛️ 1. Technical Architecture & Philosophy
Petra Portal is built as a **High-Density, Premium Operations Hub**. 
- **Design Philosophy**: "Football Manager meets Medical Chart" — high information density, boutique aesthetic (Luxury Purple/Gold for Admin, Professional Blue for Tutors, Clean Light for Clients).
- **Core Stack**: 
  - **Framework**: Next.js 16 (App Router)
  - **Infrastructure**: Supabase (PostgreSQL, Auth, SSR, Storage)
  - **Scheduling**: Google Calendar (Service Account Sync)
  - **Logic Layer**: Pure TypeScript functional engines (e.g., Pricing Engine).

---

## 💾 2. The Database Blueprint
The system relies on a relational schema designed for strict access control (RLS).

| Table | Purpose |
| :--- | :--- |
| `profiles` | Unified user table (Admin, Tutor, Parent, Student). |
| `tutor_profiles` | Professional metadata (Bio, Subjects, University, Teaching Style). |
| `student_profiles` | Educational status (Trial Status, Assigned Plans). |
| `matches` | The "Golden Link" connecting Students to Tutors. |
| `pricing_quotes` | Snapshot of financial agreements per match. |
| `lessons` | Scheduled sessions with Google Calendar integration. |
| `lesson_reports` | Qualitative feedback and topic tracking after lessons. |
| `tutor_availability_*` | Complex rule system for recurring vs. one-time scheduling. |

---

## 🧮 3. The Pricing Engine (Internal Logic)
The `pricing-engine.ts` is the heart of the agency's profitability. It uses a **Multiplicative Model** to calculate prices.

### How Client Prices are Built:
- **Base Price**: Depends on the **Program Category** (P1 to P11).
- **Multipliers Applied**:
  - **Length**: 45m (0.75x) to 120m (2.0x).
  - **Student Type**: International (1.25x), Professional (1.20x), Early Childhood (1.10x).
  - **Market Region**: Japan Baseline (1.0x) up to North America (2.20x) or Premium Cities (2.50x).
  - **Plan Continuity**: PAYG (1.15x) vs. 12-Month Plan (0.85x).
  - **Group Size**: 1 student (1.0x) down to 6 students (0.45x per student).

### The Profit Commander (Admin Only):
- **Tutor Pay**: Derived from the **Tutor Level** (0 to 5) and **Pay Mode** (Min, Standard, Max, or Custom).
- **Margin Analysis**: Real-time feedback on "Petra Margin %". The system warns if margins drop below the 40% threshold.

---

## 🛤️ 4. User Journeys: Role-Specific Features

### 👔 Admin: The Architect
- **Matchmaker Interface**: Managing match requests from inquiry to active student status.
- **Financial Reconciliation**: Generating invoices, logging payments, and approving tutor payouts.
- **System Settings**: Tuning the global multipliers and currency exchange rates.
- **Global Calendar**: Oversight of all active lessons across the entire network.

### 👨‍🏫 Tutor: The Practitioner
- **Profile Authority**: Customizing how they appear to prospective students.
- **Scheduling Precision**: 
  - Define **Recurring Patterns** (e.g., "Mondays 4-6 PM").
  - Set **Exceptions** for travel or illness.
- **Pedagogical Loop**: Logging covered topics and engagement ratings immediately after lessons.
- **Financial transparency**: Dashboard showing exactly what they earned per lesson and total pending payouts.

### 🎓 Client: The Student/Parent
- **Discovery**: Browsing the Tutor Directory to find matches for specific subjects.
- **Cost Transparency**: Using the **Pricing Estimator** to see a live quote before enrolling.
- **Progress Tracking**: Digital access to every lesson report and homework item assigned.
- **Billing Management**: Paying invoices and tracking session history.

---

## 🔌 5. Infrastructure & Integrations

### Google Calendar Service Flow
The system doesn't require users to OAuth individually. Instead:
1. It uses a **Google Service Account**.
2. When a lesson is created in the portal, it is injected into the **Agency Master Calendar**.
3. Descriptions in the calendar event include student/tutor names and lesson topics.

### Shared UI Components
- **Dynamic Sidebars**: Optimized for each role (Admin, Tutor, Client).
- **Unified Forms**: Premium CSS-driven forms with validation for consistent data entry.
- **Supabase Middleware**: Handles session persistence and instant role redirection (e.g., if a tutor tries to access `/admin`, they are bounced back).

---

## 🛡️ 6. Security & Data Integrity
- **RLS (Row Level Security)**: A tutor's `SELECT` query on `student_profiles` only returns results if a `match` exists between them.
- **Server Actions**: All mutations happen via `use server` functions with server-side auth validation.
- **Database Triggers**: Automated `updated_at` timestamps and status transition logging (e.g., `trial_status_history`).
