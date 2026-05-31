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
- **Image Optimization**: sharp
- **Linting (Korean comments)**: `@code-yeongyu/comment-checker`
- **Animation**: Framer Motion (`framer-motion`)
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
| `/matching` | `app/matching/page.tsx` | Open matching board - find tennis partners |
| `/matching/new` | `app/matching/new/page.tsx` | Create matching post |
| `/matching/[id]` | `app/matching/[id]/page.tsx` | Matching post detail (applicants, status) |
| `/ladder` | `app/ladder/page.tsx` | ELO ladder/ranking leaderboard |
| `/transfers` | `app/transfers/page.tsx` | Court transfer market |
| `/transfers/new` | `app/transfers/new/page.tsx` | Create transfer listing |
| `/transfers/[id]` | `app/transfers/[id]/page.tsx` | Transfer detail (interest, contact reveal) |
| `/tournaments` | `app/tournaments/page.tsx` | Tournament list (create, manage brackets) |
| `/tournaments/new` | `app/tournaments/new/page.tsx` | Create new tournament |
| `/tournaments/[id]` | `app/tournaments/[id]/page.tsx` | Tournament detail (bracket, live scores, draw) |
| `/[district]` | `app/[district]/page.tsx` | District court listing with real-time status |
| `/[district]/[courtId]` | `app/[district]/[courtId]/page.tsx` | Court detail (reviews, weather, map, similar courts) |
| `/my` | `app/my/page.tsx` | User dashboard (favorites, recent courts, alert settings, tennis profile) |
| `/guide/[district]` | `app/guide/[district]/page.tsx` | District guide (tips, parking, accessibility) |
| `/guide/reservation` | `app/guide/reservation/page.tsx` | Step-by-step Seoul public reservation guide |
| `/guide/records` | `app/guide/records/page.tsx` | Match records usage guide |
| `/guide/matching` | `app/guide/matching/page.tsx` | Matching feature guide |
| `/guide/ladder` | `app/guide/ladder/page.tsx` | Ladder system guide |
| `/guide/transfers` | `app/guide/transfers/page.tsx` | Transfer market guide |
| `/guide/tournaments` | `app/guide/tournaments/page.tsx` | Tournament system guide |
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
| `/api/profile/tennis` | GET, PUT | Tennis player profile (NTRP, career years, skill level) |
| `/api/profile/me` | GET, PUT | User profile (nickname, avatar_type, gender) |
| `/api/matching` | GET, POST | Matching posts (list, create) |
| `/api/matching/[id]` | GET, PUT, DELETE | Individual matching post operations |
| `/api/matching/[id]/apply` | POST, DELETE | Apply/cancel to matching post |
| `/api/ladder` | GET | Leaderboard (filterable by match type, district) |
| `/api/ladder/profile` | GET, PUT | Ladder profile (opt-in, ELO ratings) |
| `/api/ladder/history` | GET | ELO rating change history |
| `/api/transfers` | GET, POST | Transfer listings (list, create) |
| `/api/transfers/[id]` | GET, PUT, DELETE | Individual transfer operations |
| `/api/transfers/[id]/interest` | POST, DELETE | Express/cancel interest in transfer |
| `/api/tournaments` | GET, POST | Tournament CRUD (list, create) |
| `/api/tournaments/[id]` | GET, PUT, DELETE | Individual tournament operations |
| `/api/tournaments/[id]/draw` | POST | Generate tournament draw/bracket |
| `/api/tournaments/[id]/matches` | GET, POST, PUT | Tournament match operations (list, create, update scores) |
| `/api/reviews` | GET, POST, PUT, DELETE | User reviews with ratings and images |
| `/api/favorites` | GET, POST, DELETE | User favorite courts |
| `/api/visit` | GET, POST | Recent court visit tracking |
| `/api/alerts` | GET, POST | Push notification alert settings |
| `/api/alerts/[id]` | DELETE | Delete specific alert |
| `/api/push/subscribe` | POST, DELETE | Web push subscription management |
| `/api/push/test` | POST | Test push notification |
| `/api/feedback` | POST | Anonymous feedback submission |
| `/api/cron/snapshot` | GET | Scheduled: snapshot court data for trends |
| `/api/cron/popular-courts` | GET | Scheduled: compute popular courts ranking |
| `/api/cron/check-alerts` | GET | Scheduled: check and send push alerts |
| `/api/cron/cleanup` | GET | Scheduled: database cleanup |
| `/api/cron/scrape-external` | GET | Scheduled: scrape external facility data (non-Seoul API courts) |
| `/api/cron/expire-transfers` | GET | Scheduled: auto-expire past-date transfer listings |
| `/auth/callback` | GET | OAuth callback handler |

### Component Structure

```
components/
  layout/          # Header, HeaderAuth, Footer, BottomNav, MoreMenu, VisitorCounter
  home/            # HomeContent, CourtSearch, PopularCourts, RecordsPromoCard, DiscoveryCards,
                   #   MatchingPromoCard, LadderPromoCard, TransferPromoCard, TournamentPromoCard
  district/        # DistrictContent, DistrictGrid
  court-detail/    # CourtDetailClient, StickyHeader, DetailContent, FeeTable,
                   #   ParkingSection, CourtDetailMap, SimilarCourts, CourtDetailFallback,
                   #   ContentItem, TableRenderer, highlight, types
  weather/         # WeatherInfoCard, HomeWeatherCard, WeatherBadge, DustAlertBanner
  review/          # ReviewSection, ReviewList, ReviewForm, RatingDistribution
  favorite/        # FavoriteCourtSection, FavoriteButton
  alert/           # AlertSettingsSection, CourtAlertButton
  records/         # RecordsContent, RecordCard, RecordDetail, RecordForm,
                   #   RecordStats, ScoreInput, MatchTypeSelect,
                   #   CourtLocationInput, EmptyRecords, OpponentHistory, SkillProgressChart,
                   #   RecordImageUploader, RecordOptionalDetailsSection, RecordScoreSection, useRecordForm
  matching/        # MatchingContent, MatchingPostCard, MatchingPostForm, MatchingPostDetail
  ladder/          # LadderContent, RankCard, EloChart
  transfers/       # TransfersContent, TransferCard, TransferForm, TransferDetail
  profile/         # TennisProfileSection, ProfileAvatar, ProfileGate, UnifiedProfileSection, UserProfileSection
  today/           # TodayContent
  compare/         # CompareContent
  trends/          # TrendsContent, HeatmapChart
  calendar/        # CalendarContent
  tournament/      # TournamentContent, TournamentCard, TournamentForm, TournamentDetail,
                   #   BracketView, BracketConnector, DrawGenerator, MatchCard,
                   #   LiveScoreInput, TournamentLifecycleDemo
  guide/           # GuideContent, RecordsGuideContent, ReservationGuideContent,
                   #   MatchingGuideContent, LadderGuideContent, TransfersGuideContent,
                   #   TournamentsGuideContent
  auth/            # LoginPrompt, ProviderBadge
  map/             # KakaoMapView, MapDiscoveryContent
  reservation/     # ReservationNotice
  ui/              # Button, EmptyState, ShareButton, KakaoShareButton, MapAppSelector,
                   #   NavigationProgress, LastUpdated, FacilityTags, Toast, Spinner,
                   #   ScrollToTop, Skeleton
  icons/           # weather/ (AnimatedWeatherIcon, SunnyIcon, CloudyIcon, PartlyCloudyIcon,
                   #   RainyIcon, SnowyIcon)
  pwa/             # InstallPrompt, UpdatePrompt
  feedback/        # FeedbackModal
  ads/             # AdBanner
  city-data/       # CongestionBadge
  seasonal/        # CherryBlossomBanner, SakuraOverlay
  Providers.tsx    # Context providers wrapper
  GoogleAnalytics.tsx
  GoogleAdSense.tsx
```

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `lib/` - Core utilities, API clients, hooks, constants, data, utils
  - `lib/*.ts` - Root-level modules:
    - `seoulApi.ts` - Seoul Open Data API client
    - `supabase.ts` / `supabaseServer.ts` - Supabase browser/server clients
    - `airQualityApi.ts` / `airkoreaApi.ts` - Air quality API clients
    - `livingWeatherApi.ts` - Living weather index API client
    - `seoulCityDataApi.ts` - Seoul city data (congestion) API client
    - `bracket-engine.ts` - Tournament bracket generation engine
    - `webPush.ts` - Web Push notification utilities
    - `cronAuth.ts` - Cron endpoint authentication helper
    - `popularCourts.ts` - Popular courts ranking logic
    - `rateLimit.ts` - API rate limiting
    - `imageUtils.ts` - Image processing utilities
    - `adConfig.ts` - Ad slot configuration
    - `date.ts` - Date formatting utilities
    - `cn.ts` - Theme class utility (`useThemeClass`)
  - `lib/constants/` - District data (`districts.ts`), tennis constants (`tennis.ts`), matching (`matching.ts`), ladder (`ladder.ts`), transfers (`transfers.ts`), profile (`profile.ts`), tournament (`tournament.ts`)
  - `lib/data/` - Facility enrichment data and types
    - `facilityEnrichment.data.ts` - Per-court enrichment (court count, surface, lighting, coordinates, operating hours, images, mapPOIName)
    - `facilityEnrichment.types.ts` - Enrichment type definitions (includes mapPOIName for map navigation)
    - `facilityEnrichment.ts` - Enrichment lookup functions (getEnrichment, getEnrichmentOperatingHours, getEnrichmentImageUrl, getMapPOIName)
    - `independentCourts.ts` - Courts not in Seoul API (Gangbuk, Nowon, Dongdaemun, Eunpyeong, Jungnang)
  - `lib/hooks/` - Custom hooks (useAlertSettings, useCountUp, useGameRecords, useInView, useKakaoLoaderWithHttps, usePushSubscription, useRecentCourts, useRecentSearches, useRecordStats, useReservationTip, useScrollFade, useTennisProfile, useMatchingPosts, useMatchingPost, useLeaderboard, useEloHistory, useLadderProfile, useTransfers, useTransferInterest, useUserProfile, useTournaments)
  - `lib/utils/` - Utilities (courtSearch, courtStatus, districtStats, facilityTags, inAppBrowser, mapNavigation, phoneLink, sanitize, sanitizeRedirect, searchAnalytics, searchExperiment, searchHighlight, svgPath, tennis, weatherGrid, contentParser/)
  - `lib/scrapers/` - External facility data scrapers (`fmcsScraper.ts`, `jungrangScraper.ts`)
  - `lib/mockData/` - Mock/sample data for guides (`guideExamples.ts`)
- `components/` - React components (organized by feature domain)
- `contexts/` - React context providers (AuthContext, ThemeContext, TennisDataContext, ToastContext, SeasonalContext)
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
| `reservation_snapshots` | Historical court availability per district with time_slot (for trends + heatmap) |
| `push_subscriptions` | Web push endpoint + keys per user |
| `alert_settings` | User alert preferences (favorite_available, district_available) |
| `court_status_cache` | Court status change detection (service role only) |
| `site_visits` | Daily visit counter with atomic increment function |
| `popular_courts_cache` | Pre-computed TOP 5 ranking (single-row, cron-updated) |
| `matching_posts` | Open matching posts (date, location, match type, skill level, capacity, status) |
| `matching_applications` | Applications to matching posts (user_id, post_id, message) |
| `ladder_profiles` | Ladder opt-in, singles/doubles ELO ratings, match counts |
| `ladder_match_history` | ELO rating change log per match |
| `transfers` | Court transfer listings (court info, play date, price, status, contact) |
| `transfer_interests` | Interest expressions on transfer listings |
| `user_profiles` | User profile (nickname, avatar_type, gender) |
| `tournaments` | Tournament events (format, match type, scoring, status, draw type, share token) |
| `tournament_participants` | Tournament participant entries (name, seed, partner) |
| `tournament_matches` | Tournament bracket matches (round, score, status, winner) |

All tables use Row Level Security (RLS). Storage buckets: `review-images` for review photos, `record-images` for game record photos.

**RPC Functions** (PostgreSQL server-side aggregation):
| Function | Purpose |
|----------|---------|
| `increment_site_visit()` | Atomic daily visit counter with KST timezone |
| `get_daily_trends()` | Daily booking rate aggregation (bypasses PostgREST row limit) |
| `get_latest_district_rates()` | Latest reservation rates per district |
| `get_heatmap_data()` | Day-of-week × time-slot booking rate for heatmap |

Schema is maintained in two places:
- `supabase/schema.sql` — Base schema (may lag behind migrations)
- `supabase/migrations/` — Incremental changes (source of truth for recent additions)

#### Data API GRANT convention (required for new tables from 2026-10-30)

Supabase is removing the platform default that auto-grants new `public` tables to the Data API. **Enforced on this (existing) project for tables created on/after `2026-10-30`.** Existing tables keep their grants and are permanently safe — **do NOT backfill grants or alter old migrations.**

From the cutoff, a new `public` table is **invisible to PostgREST / GraphQL / supabase-js until explicitly GRANTed** — RLS does not expose it (GRANT = table reachability and RLS = row filtering are independent, both required; `service_role` bypasses RLS but **not** the table GRANT, and is also in the revoke). So every new `CREATE TABLE public.*` migration must append, after the RLS + policy block:

```sql
grant select, insert, update, delete on public.<table> to authenticated;
grant select, insert, update, delete on public.<table> to service_role;
-- grant select on public.<table> to anon;   -- ONLY if publicly readable (reviews/popular_courts_cache/site_visits pattern)
-- grant insert on public.<table> to anon;    -- ONLY anonymous-write tables (feedback pattern)
```

- **Cron/service-only** tables (`court_status_cache` pattern): `service_role` grant only.
- **New `supabase.rpc()` functions:** add `grant execute on function public.<fn>() to anon, authenticated;` (mirror `supabase/migrations/20260222000001_trends_rpc_functions.sql`).
- **Sequences:** not needed — all PKs are `uuid` or `bigint generated always as identity` (no legacy `serial`).
- Full copy-paste template: **`supabase/TABLE_MIGRATION_TEMPLATE.sql`**. Before the cutoff, run a Security Advisor pass (verify `court_status_cache`'s `FOR ALL using(true)` policy is not anon-exposed). Ref: [supabase/discussions/45329](https://github.com/orgs/supabase/discussions/45329).

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
SEOUL_AIR_QUALITY_KEY          # Seoul air quality API key (falls back to SEOUL_OPEN_DATA_KEY)

# Weather
WEATHER_API_KEY                # Korea Meteorological Administration API key
AIRKOREA_API_KEY               # AirKorea national air quality API key
LIVING_WEATHER_API_KEY         # Living weather index API key

# Kakao
NEXT_PUBLIC_KAKAO_MAP_KEY      # Kakao Maps SDK key (client-side)

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY   # VAPID public key (client-side)
VAPID_PRIVATE_KEY              # VAPID private key (server-side only)

# Cron Jobs
CRON_SECRET                    # Bearer token for cron endpoint auth (server-side only)

# Analytics (optional)
NEXT_PUBLIC_GA_ID              # Google Analytics ID
NEXT_PUBLIC_ADSENSE_CLIENT_ID  # Google AdSense client ID

# AdSense Slot IDs (optional)
NEXT_PUBLIC_AD_SLOT_HOME_TOP       # Ad slot: home page top
NEXT_PUBLIC_AD_SLOT_HOME_BOTTOM    # Ad slot: home page bottom
NEXT_PUBLIC_AD_SLOT_DISTRICT_TOP   # Ad slot: district page top
NEXT_PUBLIC_AD_SLOT_COURT_MIDDLE   # Ad slot: court detail middle
NEXT_PUBLIC_AD_SLOT_COURT_BOTTOM   # Ad slot: court detail bottom
NEXT_PUBLIC_AD_SLOT_SIDEBAR        # Ad slot: sidebar

# Search v2 (optional)
NEXT_PUBLIC_SEARCH_V2_ROLLOUT_PERCENT  # v2 search rollout percentage (0-100, default 100)
NEXT_PUBLIC_SEARCH_V2_FORCE            # Force search variant ('v2' or 'legacy')
NEXT_PUBLIC_SEARCH_V2_PROFILE          # v2 ranking profile ('balanced'/'precision'/'recall')
```

### Path Alias
`@/*` maps to project root (e.g., `@/lib/supabase`)

### PWA
Service worker via Serwist (`@serwist/next`). Manifest at `public/manifest.json`. Install prompt component at `components/pwa/InstallPrompt.tsx`.

### Cron Jobs
Scheduled via [cron-job.org](https://cron-job.org) (external cron service). Cron routes at `app/api/cron/` are triggered by HTTP GET from cron-job.org on configured schedules. All cron endpoints require `Authorization: Bearer ${CRON_SECRET}` header. `vercel.json` contains only region config (`icn1`), not cron entries.
