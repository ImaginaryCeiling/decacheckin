# DecaCheckin

A barcode-based check-in system for events.

## Features
- Real-time attendee tracking.
- 3-column dashboard (Checked In, Conference Property, Checked Out).
- Barcode scanner support (Headless).
- Configurable checkout cutoff time.

## Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a new Supabase project.
   - Go to the **SQL Editor** in your Supabase Dashboard and run the following query to create the table:

   ```sql
   create type status_enum as enum ('CHECKED_IN', 'CONFERENCE', 'CHECKED_OUT');

   create table "User" (
     id text primary key,
     name text not null,
     status status_enum default 'CHECKED_IN',
     last_scanned_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );
   ```

3. **Environment Variables**
   Create a `.env.local` file with your credentials. Note the use of the new **Publishable** and **Secret** keys.
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sbp_..."
   SUPABASE_SECRET_KEY="sbs_..."
   NEXT_PUBLIC_CHECKOUT_CUTOFF="17:00"
   ```

4. **Seed Data**
   Use the `/api/seed` endpoint to upload your master list.
   Example `curl`:
   ```bash
   curl -X POST http://localhost:3000/api/seed \
     -H "Content-Type: application/json" \
     -d '{ "users": [{ "id": "1210082", "name": "John Doe" }] }'
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

1. Push to GitHub.
2. Import project in Vercel.
3. Set Environment Variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `NEXT_PUBLIC_CHECKOUT_CUTOFF`
4. Deploy.
