# DecaCheckin Product Requirements Document (PRD)

## 1. Overview
**Goal:** A web-based check-in/tracking system for event attendees using barcode scanners.
**Target Audience:** Event staff managing attendee flow.
**Platform:** Web (Next.js), hosted on Vercel.

## 2. Core Features

### 2.1 Dashboard
- **Three-Column Layout:**
  - **Checked In:** Initial state for all attendees.
  - **Conference Property:** Attendees scanned before the cutoff time.
  - **Checked Out:** Attendees scanned after the cutoff time.
- **Display:**
  - Shows attendee **Names**.
  - Real-time updates (polling every 2 seconds).
  - Responsive design (stacks on mobile, though primarily for desktop/tablet use).

### 2.2 Scanner Integration
- **Input Method:** Barcode scanner acting as a keyboard.
- **Input Format:** `YYYY/MM/DD HH:mm:ss ID` (e.g., `2025/12/01 10:37:18 1210082`).
- **Trigger:** Scanner sends an `Enter` keypress after data.
- **Headless Operation:** No need to focus a specific input field; the app listens globally for input.

### 2.3 Logic & State Management
- **Cutoff Time:** Configurable via `NEXT_PUBLIC_CHECKOUT_CUTOFF` (default: 17:00 / 5 PM).
- **Transition Logic:**
  - If Scan Time < Cutoff: Move to **Conference Property**.
  - If Scan Time >= Cutoff: Move to **Checked Out**.
- **Data Source:**
  - Master List (Name <-> ID mapping) stored in Database.
  - Initial state populated via Seed API.

## 3. Technical Architecture

### 3.1 Stack
- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, SWR.
- **Backend:** Next.js Server Actions / API Routes.
- **Database:** PostgreSQL (Supabase) accessed via `@supabase/supabase-js`.

### 3.2 Database Schema
**Table: User**
- `id`: Text (Primary Key, from barcode)
- `name`: Text
- `status`: Enum (CHECKED_IN, CONFERENCE, CHECKED_OUT)
- `last_scanned_at`: Timestamp
- `updated_at`: Timestamp

### 3.3 Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: New standard publishable key (replaces anon key).
- `SUPABASE_SECRET_KEY`: New standard secret key (replaces service_role key).
- `NEXT_PUBLIC_CHECKOUT_CUTOFF`: 24h format time string (e.g., "17:00").

## 4. Deployment & Setup
1. **Clone Repo.**
2. **Install Dependencies:** `npm install`.
3. **Setup Supabase:**
   - Create Project.
   - Run SQL script to create "User" table.
   - Update `.env.local` with credentials.
4. **Seed Data:**
   - POST to `/api/seed` with JSON body: `{ "users": [{ "id": "123", "name": "John Doe" }] }`.
5. **Run Dev:** `npm run dev`.
6. **Deploy:** Push to Vercel (configure env vars there).
