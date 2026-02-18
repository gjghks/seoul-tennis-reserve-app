# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Tennis Reserve is a Next.js application that displays real-time availability of Seoul's public tennis courts across all 25 districts. It integrates Seoul Open Data API for court data, weather/air quality APIs for outdoor condition info, and Supabase for auth + user data (reviews, favorites, push alerts). Deployed on Vercel (ICN region) with PWA support.

**Live**: [seoul-tennis.com](https://seoul-tennis.com)

## Commands

```bash
npm run dev        # Dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run start      # Production server
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest (single run)
npm run test:coverage  # Coverage report
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase (OAuth via Kakao, Google)
- **Data Fetching**: SWR (client), fetch (server)
- **Maps**: Kakao Maps SDK (`react-kakao-maps-sdk`)
- **PWA**: Serwist (`@serwist/next`)
- **Push**: Web Push API (`web-push`)
- **Testing**: Vitest + @testing-library/react + jsdom
- **Deployment**: Vercel (ICN region, `vercel.json`)
- **Analytics**: Google Analytics, Google AdSense

### Page Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home - district grid, popular courts TOP 5, favorites, weather/air quality |
| `/today` | `app/today/page.tsx` | Today's available courts grouped by district |
| `/compare` | `app/compare/page.tsx` | District comparison (court count, availability, free courts, competition) |
| `/trends` | `app/trends/page.tsx` | Reservation competition rate trends |
| `/calendar` | `app/calendar/page.tsx` | Monthly calendar view of availability |
| `/[district]` | `app/[district]/page.tsx` | District court listing with real-time status |
| `/[district]/[courtId]` | `app/[district]/[courtId]/page.tsx` | Court detail (reviews, weather, map, similar courts) |
| `/my` | `app/my/page.tsx` | User dashboard (favorites, recent courts, alert settings) |
| `/guide/[district]` | `app/guide/[district]/page.tsx` | District guide (tips, parking, accessibility) |
| `/guide/records` | `app/guide/records/page.tsx` | Match records usage guide |
| `/login` | `app/login/page.tsx` | OAuth login (Kakao, Google) |
| `/about` | `app/about/page.tsx` | Service introduction |
| `/contact` | `app/contact/page.tsx` | Contact info and feedback |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms of service |
| `/sitemap-page` | `app/sitemap-page/page.tsx` | HTML sitemap for SEO |
| `/auth/complete` | `app/auth/complete/page.tsx` | OAuth completion page |

### API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/tennis` | GET | Core endpoint - fetches Seoul API, filters tennis courts |
| `/api/weather` | GET | Real-time weather by location (temp, precipitation) |
| `/api/air-quality` | GET | Air quality by district (PM2.5, PM10) |
| `/api/dust-alert` | GET | Dust alert status |
| `/api/living-weather` | GET | Living weather index |
| `/api/city-data` | GET | Aggregated city data (congestion, weather, air quality) |
| `/api/trends` | GET | Competition rate historical data |
| `/api/popular-courts` | GET | Pre-computed TOP 5 popular courts |
| `/api/reviews` | GET, POST, DELETE | User reviews with ratings and images |
| `/api/favorites` | GET, POST, DELETE | User favorite courts |
| `/api/visit` | GET, POST | Recent court visit tracking |
| `/api/alerts` | GET, POST | Push notification alert settings |
| `/api/alerts/[id]` | DELETE | Delete specific alert |
| `/api/push/subscribe` | POST, DELETE | Web push subscription management |
| `/api/push/test` | POST | Test push notification |
| `/api/feedback` | POST | Anonymous feedback submission |
| `/api/cron/snapshot` | GET | Scheduled: snapshot court data for trends (daily via Vercel cron) |
| `/api/cron/popular-courts` | GET | Scheduled: compute popular courts ranking |
| `/api/cron/check-alerts` | GET | Scheduled: check and send push alerts |
| `/api/cron/cleanup` | GET | Scheduled: database cleanup |
| `/auth/callback` | GET | OAuth callback handler |

### Component Structure

```
components/
  layout/          # Header, Footer, BottomNav, VisitorCounter
  home/            # HomeContent, CourtSearch, PopularCourts, RecordsPromoCard
  district/        # DistrictContent, DistrictGrid
  court-detail/    # CourtDetailClient, StickyHeader, DetailContent, FeeTable,
                   #   ParkingSection, CourtDetailMap, SimilarCourts
  weather/         # WeatherInfoCard, HomeWeatherCard, WeatherBadge, DustAlertBanner
  review/          # ReviewSection, ReviewList, ReviewForm
  favorite/        # FavoriteCourtSection, FavoriteButton
  alert/           # AlertSettingsSection, CourtAlertButton
  today/           # TodayContent
  compare/         # CompareContent
  trends/          # TrendsContent
  calendar/        # CalendarContent
  guide/           # GuideContent, RecordsGuideContent
  auth/            # LoginPrompt, ProviderBadge
  map/             # KakaoMapView
  reservation/     # KakaoReserveTip
  ui/              # ShareButton, KakaoShareButton, NavigationProgress,
                   #   LastUpdated, FacilityTags, Toast, Spinner
  pwa/             # InstallPrompt
  feedback/        # FeedbackModal
  ads/             # AdBanner
  city-data/       # CongestionBadge
  Providers.tsx    # Context providers wrapper
  GoogleAnalytics.tsx
  GoogleAdSense.tsx
```

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `lib/` - Core utilities (Supabase client, Seoul API client, theme utils)
- `components/` - React components (organized by feature domain)
- `contexts/` - React context providers (auth, theme)
- `hooks/` - Custom React hooks
- `supabase/` - Database schema (`schema.sql`)
- `scripts/` - Utility scripts
- `public/` - Static assets, PWA manifest

### Data Flow
1. **Seoul API** (`lib/seoulApi.ts`): Fetches ListPublicReservationSport, filters for tennis courts
2. **API Routes** (`app/api/`): Proxy Seoul data + weather/air quality + Supabase CRUD
3. **Client** (SWR): Fetches from API routes, displays by district with real-time status
4. **Cron Jobs** (`app/api/cron/`): Daily snapshots for trends, ranking computation, alert checks

### External API Integrations
- **Seoul Open Data** (`data.seoul.go.kr`): Court reservation data, air quality data
- **Korea Meteorological Administration**: Short-term weather forecasts
- **Kakao Maps SDK**: Map rendering and court location display
- **Kakao Share SDK**: Social sharing to KakaoTalk

### Database Schema (Supabase)

| Table | Purpose |
|-------|---------|
| `users` | Extends auth.users (email, name, avatar) |
| `reviews` | Court reviews with 1-5 ratings, text, images (max 3) |
| `feedback` | Anonymous user feedback (feature/bug/other) |
| `reservation_snapshots` | Historical court availability per district (for trends) |
| `push_subscriptions` | Web push endpoint + keys per user |
| `alert_settings` | User alert preferences (favorite_available, district_available) |
| `court_status_cache` | Court status change detection (service role only) |
| `site_visits` | Daily visit counter with atomic increment function |
| `popular_courts_cache` | Pre-computed TOP 5 ranking (single-row, cron-updated) |

All tables use Row Level Security (RLS). Storage bucket `review-images` for photo uploads.

Favorites are managed via Supabase client directly (not a separate table listed in schema.sql - check for additional migrations).

### Theme System

Dual theme support: **Neo-Brutalism** (default) and **Minimal**. Use `useThemeClass()` from `lib/cn.ts`:

```tsx
const themeClass = useThemeClass();
<div className={themeClass('neo-brutal-styles', 'minimal-styles')} />
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY      # Supabase service role (server-side only)
SEOUL_OPEN_DATA_KEY            # Seoul Open Data API key
NEXT_PUBLIC_GA_ID              # Google Analytics ID (optional)
```

### Path Alias
`@/*` maps to project root (e.g., `@/lib/supabase`)

### PWA
Service worker via Serwist (`@serwist/next`). Manifest at `public/manifest.json`. Install prompt component at `components/pwa/InstallPrompt.tsx`.

### Cron Jobs (Vercel)
Configured in `vercel.json`. Currently: daily snapshot at midnight UTC (`/api/cron/snapshot`). Other cron routes (`popular-courts`, `check-alerts`, `cleanup`) may need additional Vercel cron entries or external triggers.
