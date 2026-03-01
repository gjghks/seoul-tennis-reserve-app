# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seoul Tennis Reserve is a Next.js application that displays real-time availability of Seoul's public tennis courts across all 25 districts. It integrates Seoul Open Data API for court data, weather/air quality APIs for outdoor condition info, and Supabase for auth + user data (reviews, favorites, push alerts, game records). Deployed on Vercel (ICN region) with PWA support.

**Live**: [seoul-tennis.com](https://seoul-tennis.com)

## Commands

```bash
npm run dev        # Dev server with webpack (http://localhost:3000)
npm run build      # Production build with webpack
npm run lint       # ESLint
npm run start      # Production server
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest (single run)
npm run test:coverage  # Coverage report
```

> Note: `dev` and `build` scripts use `--webpack` flag (Next.js 16 with webpack bundler).

## Development & Deployment Workflow

### Branch Strategy
- **`develop`**: Default working branch. Push triggers Vercel Preview deployment.
- **`master`**: Production branch. Push triggers Vercel Production deployment (seoul-tennis.com).

### Workflow
1. Work on `develop` branch
2. Commit and push → pre-push hook runs lint/test/build → Vercel creates Preview URL
3. Verify on Preview URL
4. Merge `develop` → `master` → Production deployment

### Pre-push Hook (Husky)
Every `git push` automatically runs:
1. **Lint** (informational, non-blocking)
2. **Test** (`npm run test:run`) — blocks push on failure
3. **Build** (`npm run build`) — blocks push on failure

To skip in emergencies: `git push --no-verify` (use with caution)

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (webpack bundler)
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
- **Formatting**: Biome (`@biomejs/biome`)
- **Sanitization**: DOMPurify (XSS prevention)
- **UI Libraries**: canvas-confetti (animations), react-simple-pull-to-refresh (mobile UX), classnames

### Middleware

`middleware.ts` at project root handles auth protection:
- Protected paths: `/my` (user dashboard)
- Redirects unauthenticated users to `/login` with redirect param
- Uses `@supabase/ssr` for server-side auth check

### Page Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home - district grid, popular courts TOP 5, favorites, weather/air quality |
| `/today` | `app/today/page.tsx` | Today's available courts grouped by district |
| `/compare` | `app/compare/page.tsx` | District comparison (court count, availability, free courts, competition) |
| `/trends` | `app/trends/page.tsx` | Reservation competition rate trends |
| `/calendar` | `app/calendar/page.tsx` | Monthly calendar view of availability |
| `/map` | `app/map/page.tsx` | Map view - all courts on Kakao Map |
| `/records` | `app/records/page.tsx` | Game records list (match history, stats) |
| `/records/new` | `app/records/new/page.tsx` | Create new game record |
| `/records/[id]` | `app/records/[id]/page.tsx` | Game record detail view |
| `/records/[id]/edit` | `app/records/[id]/edit/page.tsx` | Edit game record |
| `/[district]` | `app/[district]/page.tsx` | District court listing with real-time status |
| `/[district]/[courtId]` | `app/[district]/[courtId]/page.tsx` | Court detail (reviews, weather, map, similar courts) |
| `/my` | `app/my/page.tsx` | User dashboard (favorites, recent courts, alert settings, tennis profile) |
| `/guide/[district]` | `app/guide/[district]/page.tsx` | District guide (tips, parking, accessibility) |
| `/guide/reservation` | `app/guide/reservation/page.tsx` | Step-by-step Seoul public reservation guide |
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
| `/api/records` | GET, POST | Game records CRUD (list, create) |
| `/api/records/[id]` | GET, PUT, DELETE | Individual game record operations |
| `/api/records/stats` | GET | Game record statistics (win rate, match count, etc.) |
| `/api/profile/tennis` | GET, POST, PUT | Tennis player profile (NTRP, career years, skill level) |
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
| `/api/cron/scrape-external` | GET | Scheduled: scrape external facility data (non-Seoul API courts) |
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
  records/         # RecordsContent, RecordCard, RecordDetail, RecordForm,
                   #   RecordStats, ScoreInput, MatchTypeSelect,
                   #   CourtLocationInput, EmptyRecords
  profile/         # TennisProfileSection
  today/           # TodayContent
  compare/         # CompareContent
  trends/          # TrendsContent
  calendar/        # CalendarContent
  guide/           # GuideContent, RecordsGuideContent, ReservationGuideContent
  auth/            # LoginPrompt, ProviderBadge
  map/             # KakaoMapView
  reservation/     # ReservationNotice
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
- `lib/` - Core utilities, API clients, hooks, constants, data, utils
  - `lib/constants/` - District data (`districts.ts`), tennis constants (`tennis.ts`)
  - `lib/data/` - Facility enrichment data and types
    - `facilityEnrichment.data.ts` - Per-court enrichment (court count, surface, lighting, coordinates, operating hours, images)
    - `facilityEnrichment.types.ts` - Enrichment type definitions
    - `facilityEnrichment.ts` - Enrichment lookup functions (getEnrichment, getEnrichmentOperatingHours, getEnrichmentImageUrl)
    - `independentCourts.ts` - Courts not in Seoul API (Gangbuk, Nowon, Dongdaemun, Eunpyeong, Jungnang)
  - `lib/hooks/` - Custom hooks (useAlertSettings, useGameRecords, useKakaoLoaderWithHttps, usePushSubscription, useRecentCourts, useRecordStats, useReservationTip, useScrollFade, useTennisProfile)
  - `lib/utils/` - Utilities (courtStatus, districtStats, facilityTags, inAppBrowser, phoneLink, sanitizeRedirect, tennis, weatherGrid, contentParser/)
- `components/` - React components (organized by feature domain)
- `contexts/` - React context providers (AuthContext, ThemeContext, TennisDataContext, ToastContext)
- `hooks/` - Legacy hooks directory (useFavorites)
- `supabase/` - Database schema and migrations
  - `schema.sql` - Base schema
  - `migrations/` - Incremental schema changes
- `scripts/` - Utility scripts
- `public/` - Static assets, PWA manifest
- `docs/` - Additional documentation (social login setup guide)

### Data Flow
1. **Seoul API** (`lib/seoulApi.ts`): Fetches ListPublicReservationSport, filters for tennis courts
2. **Independent Courts** (`lib/data/independentCourts.ts`): Merged with Seoul API data for districts not covered by the API
3. **Facility Enrichment** (`lib/data/facilityEnrichment.ts`): Overrides empty V_MIN/V_MAX and IMGURL with curated data
4. **API Routes** (`app/api/`): Proxy Seoul data + weather/air quality + Supabase CRUD
5. **Client** (SWR): Fetches from API routes, displays by district with real-time status
6. **Cron Jobs** (`app/api/cron/`): Daily snapshots for trends, ranking computation, alert checks, external scraping

### External API Integrations
- **Seoul Open Data** (`data.seoul.go.kr`): Court reservation data, air quality data
- **Korea Meteorological Administration**: Short-term weather forecasts
- **AirKorea**: National air quality data
- **Kakao Maps SDK**: Map rendering and court location display
- **Kakao Share SDK**: Social sharing to KakaoTalk

### Database Schema (Supabase)

| Table | Purpose |
|-------|---------|
| `users` | Extends auth.users (email, name, avatar) |
| `favorites` | User favorite courts (svc_id, svc_name, district, place_name) |
| `reviews` | Court reviews with 1-5 ratings, text, images (max 3) |
| `player_profiles` | Tennis player profile (NTRP rating, career years, skill level, preferred hand, age group) |
| `game_records` | Match records (date, location, match type/format, score, result, opponent, cost, notes, images) |
| `feedback` | Anonymous user feedback (feature/bug/other) |
| `reservation_snapshots` | Historical court availability per district (for trends) |
| `push_subscriptions` | Web push endpoint + keys per user |
| `alert_settings` | User alert preferences (favorite_available, district_available) |
| `court_status_cache` | Court status change detection (service role only) |
| `site_visits` | Daily visit counter with atomic increment function |
| `popular_courts_cache` | Pre-computed TOP 5 ranking (single-row, cron-updated) |

All tables use Row Level Security (RLS). Storage buckets: `review-images` for review photos, `record-images` for game record photos.

Schema is maintained in two places:
- `supabase/schema.sql` — Base schema (may lag behind migrations)
- `supabase/migrations/` — Incremental changes (source of truth for recent additions)

### Theme System

Dual theme support: **Neo-Brutalism** (default) and **Minimal**. Use `useThemeClass()` from `lib/cn.ts`:

```tsx
const themeClass = useThemeClass();
<div className={themeClass('neo-brutal-styles', 'minimal-styles')} />
```

### Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY      # Supabase service role (server-side only)

# Seoul Open Data
SEOUL_OPEN_DATA_KEY            # Seoul Open Data API key (court reservations)
SEOUL_AIR_QUALITY_KEY          # Seoul air quality API key

# Weather
WEATHER_API_KEY                # Korea Meteorological Administration API key
AIRKOREA_API_KEY               # AirKorea national air quality API key
LIVING_WEATHER_API_KEY         # Living weather index API key

# Kakao
NEXT_PUBLIC_KAKAO_MAP_KEY      # Kakao Maps SDK key (client-side)

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY   # VAPID public key (client-side)
VAPID_PRIVATE_KEY              # VAPID private key (server-side only)

# Analytics (optional)
NEXT_PUBLIC_GA_ID              # Google Analytics ID
NEXT_PUBLIC_ADSENSE_CLIENT_ID  # Google AdSense client ID

# Search v2 (optional)
NEXT_PUBLIC_SEARCH_V2_ROLLOUT_PERCENT  # v2 search rollout percentage (0-100, default 100)
NEXT_PUBLIC_SEARCH_V2_FORCE            # Force search variant ('v2' or 'legacy')
NEXT_PUBLIC_SEARCH_V2_PROFILE          # v2 ranking profile ('balanced'/'precision'/'recall')
```

### Path Alias
`@/*` maps to project root (e.g., `@/lib/supabase`)

### PWA
Service worker via Serwist (`@serwist/next`). Manifest at `public/manifest.json`. Install prompt component at `components/pwa/InstallPrompt.tsx`.

### Cron Jobs (Vercel)
Configured in `vercel.json`. Currently: daily snapshot at midnight UTC (`/api/cron/snapshot`). Other cron routes (`popular-courts`, `check-alerts`, `cleanup`) may need additional Vercel cron entries or external triggers.
