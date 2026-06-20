-- =============================================================================
-- tennis_snapshot_cache — durable last-good snapshot of the full tennis court list
-- =============================================================================
-- Purpose: when the Seoul Open Data API (openAPI.seoul.go.kr:8088) is down/
-- unresponsive, fetchTennisAvailability() used to fall back to the ~41 independent
-- courts only (everything shows "외부예약"). This single-row table holds the last
-- HEALTHY full snapshot so the server can serve it across instances / cold starts
-- instead of degrading. Written only on a healthy success; read only on failure.
--
-- Service-only table (court_status_cache pattern): only the server's service-role
-- client touches it. No anon/authenticated access.
-- =============================================================================

create table if not exists public.tennis_snapshot_cache (
  id boolean primary key default true,
  snapshot jsonb not null,
  court_count integer not null,
  updated_at timestamptz not null default now(),
  constraint tennis_snapshot_cache_singleton check (id = true)
);

-- RLS (row filtering — independent of the Data API grant). No policies for
-- anon/authenticated: service_role bypasses RLS and is the only writer/reader.
alter table public.tennis_snapshot_cache enable row level security;

-- Data API grants — service-only (no anon/authenticated; mirrors court_status_cache).
grant select, insert, update, delete on public.tennis_snapshot_cache to service_role;
