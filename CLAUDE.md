# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DecaCheckin is a barcode-based check-in system for event attendees. It uses barcode scanners to track attendee movement through three states: Checked In, Conference Property, and Checked Out. The scanner input format is `YYYY/MM/DD HH:mm:ss ID` (e.g., `2025/12/01 10:37:18 1210082`).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS 4, SWR
- **Database**: PostgreSQL via Supabase (`@supabase/supabase-js`)
- **TypeScript**: Strict mode enabled

## Development Commands

```bash
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:3000)
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (e.g., `https://xyz.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (client-side, respects RLS)
- `SUPABASE_SECRET_KEY`: Supabase secret key (server-side only, bypasses RLS)
- `NEXT_PUBLIC_CHECKOUT_CUTOFF`: Time cutoff in 24h format (e.g., "17:00")

**Note**: The app will fail with `ENOTFOUND placeholder.supabase.co` if environment variables are missing. Copy `.env` to `.env.local` and populate with actual Supabase credentials.

## Architecture

### Database Schema (Supabase)

The `User` table stores attendee information:

- `id` (text, primary key): User ID from barcode
- `name` (text): Attendee name
- `status` (enum): `CHECKED_IN` | `CONFERENCE` | `CHECKED_OUT`
- `last_scanned_at` (timestamp): Last scan time
- `updated_at` (timestamp): Record update time

### Directory Structure

```text
app/
├── page.tsx                      # Main dashboard (3-column layout)
├── layout.tsx                    # Root layout
├── seed/page.tsx                 # Data management UI
├── components/
│   ├── ScannerListener.tsx       # Headless barcode scanner listener
│   └── UserCard.tsx              # User display card
└── api/
    ├── scan/route.ts             # POST: Process barcode scan
    ├── seed/route.ts             # POST: Bulk seed/upsert users
    └── users/route.ts            # GET: Fetch all users

lib/
├── supabase.ts                   # Supabase client initialization
└── types.ts                      # Shared TypeScript types
```

### Key Components

**ScannerListener** ([app/components/ScannerListener.tsx:6](app/components/ScannerListener.tsx#L6))

- Headless component that listens for global keyboard input
- Buffers keystrokes and triggers on `Enter` key
- Debounces to distinguish scanner input from manual typing (<200ms between chars)
- Sends barcode to `/api/scan` endpoint

**Dashboard** ([app/page.tsx:17](app/page.tsx#L17))

- Uses SWR with 2-second polling interval for real-time updates
- Filters users into three columns by status
- Client component that renders the entire UI

### State Transition Logic

Implemented in [app/api/scan/route.ts:15](app/api/scan/route.ts#L15):

1. Extract user ID from barcode (last space-separated part)
2. Compare current time against `NEXT_PUBLIC_CHECKOUT_CUTOFF`
3. Transition:
   - Before cutoff → `CONFERENCE`
   - After cutoff → `CHECKED_OUT`
4. Update `status` and `last_scanned_at` in database

### Supabase Client Architecture

Two clients defined in [lib/supabase.ts:1](lib/supabase.ts#L1):

1. **`supabase`** (client-side): Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, respects Row Level Security
2. **`supabaseAdmin`** (server-side): Uses `SUPABASE_SECRET_KEY`, bypasses RLS

**IMPORTANT**: Always use `supabaseAdmin` in API routes. Never expose the secret key to the client.

## Seeding Data

POST to `/api/seed` with:

```json
{
  "users": [
    { "id": "1210082", "name": "John Doe" },
    { "id": "1210083", "name": "Jane Smith" }
  ]
}
```

The endpoint performs an upsert (inserts new users, updates existing by ID).

## Type System

User type defined in [lib/types.ts:3](lib/types.ts#L3). Note that Supabase returns `last_scanned_at` in snake_case by default.

## Path Aliases

- `@/*` maps to project root (configured in [tsconfig.json:22](tsconfig.json#L22))

## Deployment

Designed for Vercel deployment. Set all environment variables in Vercel project settings. The app uses Next.js API routes (not Server Actions) for all backend operations.
