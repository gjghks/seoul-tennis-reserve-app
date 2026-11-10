# Slim court payloads (traffic cost)

**Goal:** cut transfer volume (user asked: traffic-cost driven, skip brainstorming) without changing what users see.

**Finding (2026-11-10, production):** `DTLCONT` (per-facility detail HTML) is 87% of `/api/tennis`
(1.97 MB of 2.27 MB for 352 rows), and the same full court array is serialized into the RSC payload of
`/calendar` (2.43 MB), `/map` (2.28 MB), `/today` (1.26 MB), `/[district]` (0.52 MB) and **every court
detail page** via `allCourts` for SimilarCourts (2.40 MB each, 352 pages).

**Client-side readers of `DTLCONT` from list data:**
- `extractFacilityTags()` (DistrictContent list tags) — keyword scan over detail text
- `CourtDetailFallback` → `CourtDetailClient` (only when the server fetch failed): `DetailContent`, `isOutdoorCourt`

Server code (JSON-LD, detail page main court, cron) keeps full data — untouched.

## Design (my calls)
1. `lib/utils/courtListView.ts`: `toCourtListItem(court)` → shallow copy with `DTLCONT: ''` and
   `FACILITY_TAGS` precomputed by `extractFacilityTags(full court)`; `toCourtList(courts)`.
2. `SeoulService.FACILITY_TAGS?: FacilityTag[]`; `extractFacilityTags` returns it when present, so list
   consumers render identical tags.
3. Apply `toCourtList` at every list boundary: `/api/tennis` list/district responses, and page props for
   calendar, map, today, `[district]`, `[courtId]` `allCourts` (main `court` stays full).
4. `/api/tennis?svcId=<id>` returns `{ court }` with the full record (detail text) for the fallback path;
   `CourtDetailFallback` fetches it (SWR) and renders the full court once loaded.

## Tasks (TDD)
1. Tests for `toCourtListItem`/`toCourtList`: strips DTLCONT, preserves all other fields, tags equal
   `extractFacilityTags(full)`, does not mutate input, empty DTLCONT passthrough. Then implement.
2. Test `extractFacilityTags` uses `FACILITY_TAGS` when present. Then implement + type field.
3. `/api/tennis` route tests: list + district responses have empty DTLCONT and FACILITY_TAGS;
   `?svcId=` returns full court / 404. Then implement.
4. Wire pages + CourtDetailFallback. Typecheck, full test suite, build.
5. Verify sizes locally (standalone) and on production after deploy; compare tags on a district page.
