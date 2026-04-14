# Petra Portal: Comprehensive Features Overview

Petra Portal is a specialized tutoring management platform designed to streamline the operations of a boutique tutoring agency. It connects **Admins**, **Tutors**, and **Clients** (Parents/Students) through a unified interface powered by Next.js and Supabase.

---

## 🔑 Core Engines & Infrastructure

### 1. Unified Authentication & RBAC
- **Multi-Role System**: Discrete experiences for `admin`, `tutor`, `student`, and `parent`.
- **Row Level Security (RLS)**: Strict data isolation ensuring tutors only see their students, and clients only see their own billing/lessons.
- **Middleware-Driven Protection**: Automated route protection based on user session and role.

### 2. Intelligent Pricing Engine
- **Dynamic Multipliers**: Pricing adjusted automatically based on Program Category (e.g., standard vs. premium) and Market Region.
- **Margin Management**: Real-time calculation of student price vs. tutor pay to ensure agency profitability.
- **Currencies & Exchange Rates**: Support for multi-currency billing with automated conversion logic.

### 3. Lesson Lifecycle Management
- **Status Workflow**: Tracks lessons from `scheduled` to `completed`, `cancelled`, or `no-show`.
- **Trial System**: Dedicated pipeline for trial lesson requests, scheduling, and conversion to regular student status.
- **Google Calendar Integration**: Bi-directional sync for tutor and student schedules.

---

## 👔 Admin Dashboard Features
*The central hub for agency operations.*

- **User Management**: Centralized control over all profiles, role assignments, and account statuses.
- **Pricing Configuration**: Interface to tune multipliers, market rates, and global pricing rules.
- **Invoice & Payout Control**:
  - Generate and manage student invoices (PDF upload support).
  - Track tutor payout statuses and history.
- **Global Calendar**: Bird's-eye view of all agency activity across all tutors and students.

---

## 👨‍🏫 Tutor Portal Features
*Tools for professional practitioners to manage their business.*

- **Profile Customization**: Manage bios, subjects, university background, and personal teaching style.
- **Smart Availability**:
  - **Rule-Based Scheduling**: Define recurring weekly availability.
  - **Exceptions**: Easily block off specific dates or set one-time changes.
- **Lesson Reporting**: Post-lesson interface to log covered topics, student engagement, and homework assignments.
- **Financial Tracking**: View compensation history, pending payouts, and earnings per lesson.
- **Student Dossiers**: Access to matched student profiles and lesson history.

---

## 🎓 Client Portal Features (Student/Parent)
*A premium experience for educational discovery and management.*

- **Tutor Discovery**: Browse tutor profiles with filters for subjects and expertise.
- **Lesson Management**:
  - View upcoming and past lesson history.
  - Request new lessons or trial sessions.
- **Pricing Estimator**: Interactive tool for clients to estimate costs based on their specific program needs.
- **Payment & Billing**:
  - View invoice history and current balance.
  - Track payment status and history.
- **Progress Tracking**: Access to lesson reports and homework items assigned by tutors.

---

## 📂 Database & Data Model Highlights
- **`profiles`**: Core user data linked to Supabase Auth.
- **`matches`**: Formalizes the relationship between students and tutors.
- **`pricing_quotes`**: Snapshots of agreed-upon rates for specific student-tutor pairings.
- **`lesson_reports`**: Detailed qualitative data on student progress.
- **`tutor_availability_*`**: Complex rule system for scheduling logic.

---

## 🛠️ Technology Stack
- **Framework**: Next.js (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Scheduling**: Google Calendar API
- **Styling**: Modern, role-specific CSS architectures (`admin.css`, `tutor.css`, `client.css`)
