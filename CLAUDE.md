# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Tennis Reserve is a Next.js application that displays real-time availability of Seoul's public tennis courts. It uses Supabase for authentication and data storage, and integrates with Seoul Open Data API.

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
- **Database/Auth**: Supabase (OAuth via Kakao, Google)
- **External API**: Seoul Open Data API (ListPublicReservationSport)
- **Deployment**: Vercel

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `lib/` - Core utilities (Supabase client, Seoul API client)
- `components/` - React components
- `supabase/` - Database schema (schema.sql)

### Data Flow
1. **Seoul API** (`lib/seoulApi.ts`): Fetches sports facility data, filters for tennis courts
2. **API Route** (`app/api/tennis/route.ts`): Serves tennis data to the client
3. **Client**: Displays availability by district with favorites, reviews, and court details

### Database Schema (Supabase)
- `users` - Extends Supabase auth.users
- `reviews` - Court reviews with ratings and images
- `favorites` - User favorite courts

All tables use Row Level Security (RLS) - users can only access their own data.

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL    # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY   # Supabase service role (server-side only)
SEOUL_OPEN_DATA_KEY         # Seoul Open Data API key
```

### Path Alias
`@/*` maps to project root (e.g., `@/lib/supabase`)
