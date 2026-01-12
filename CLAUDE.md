# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Tennis Reserve is a Next.js application that monitors Seoul's public tennis court reservation system and sends email alerts when courts become available. It uses Supabase for authentication and data storage, and integrates with Seoul Open Data API.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database/Auth**: Supabase (magic link authentication via OTP)
- **Email**: Nodemailer (configured for SMTP)
- **External API**: Seoul Open Data API (ListPublicReservationSport)
- **Deployment**: Vercel with cron jobs

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `lib/` - Core utilities (Supabase client, Seoul API client, email service)
- `components/` - React components
- `supabase/` - Database schema (schema.sql)

### Data Flow
1. **Cron Job** (`app/api/cron/check-availability/route.ts`): Runs every 10 minutes via Vercel cron
2. **Seoul API** (`lib/seoulApi.ts`): Fetches sports facility data, filters for tennis courts with status "접수중" or "예약가능"
3. **Alert Matching**: Matches available courts with user alerts by region (Seoul district/Gu)
4. **Notification** (`lib/email.ts`): Sends email alerts to users with matching preferences

### Database Schema (Supabase)
- `users` - Extends Supabase auth.users
- `alerts` - User alert preferences (region, time_slot, is_active)
- `notification_logs` - Email delivery tracking

All tables use Row Level Security (RLS) - users can only access their own data.

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL    # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY   # Supabase service role (server-side cron only)
SEOUL_OPEN_DATA_KEY         # Seoul Open Data API key
CRON_SECRET                 # Bearer token for cron endpoint auth
EMAIL_HOST/PORT/USER/PASS   # SMTP configuration (optional, defaults to Gmail)
```

### Path Alias
`@/*` maps to project root (e.g., `@/lib/supabase`)
