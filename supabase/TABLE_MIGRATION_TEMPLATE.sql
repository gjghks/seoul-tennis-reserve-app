-- =============================================================================
-- New-table migration template — Supabase Data API GRANT convention
-- =============================================================================
-- This is a REFERENCE template, not a runnable migration. Copy it into a new
-- supabase/migrations/<timestamp>_<name>.sql when adding a public table.
--
-- WHY THE GRANT BLOCK:
--   Supabase is removing the platform default-privilege rule that used to
--   auto-grant new public tables to anon/authenticated/service_role.
--     - New projects: default since 2026-05-30
--     - THIS (existing) project: enforced on tables created on/after 2026-10-30
--   Existing tables keep their grants and are permanently safe — do NOT backfill
--   or alter old migrations. From the cutoff, a NEW table is invisible to the
--   Data API (PostgREST / GraphQL / supabase-js) until explicitly GRANTed.
--
--   GRANT (table reachability) and RLS (row filtering) are INDEPENDENT, both
--   required: a new table with perfect RLS still returns permission-denied
--   without a GRANT. service_role bypasses RLS but NOT the table GRANT.
--
--   Ref: https://github.com/orgs/supabase/discussions/45329
-- =============================================================================

-- ============================================================
-- 1. <table_name>
-- ============================================================
create table if not exists public.<table_name> (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  -- ...columns with inline check() constraints...
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists <table_name>_user_id_idx
  on public.<table_name>(user_id);

-- RLS (row filtering — unchanged by the Data API grant change)
alter table public.<table_name> enable row level security;

create policy "Users view own rows"
  on public.<table_name> for select
  using (auth.uid() = user_id);

create policy "Users insert own rows"
  on public.<table_name> for insert
  with check (auth.uid() = user_id);

create policy "Users update own rows"
  on public.<table_name> for update
  using (auth.uid() = user_id);

create policy "Users delete own rows"
  on public.<table_name> for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 2. Data API grants  (REQUIRED for tables created on/after 2026-10-30)
-- ============================================================
-- Pick the lines that match the table's access pattern (see decision table):
grant select, insert, update, delete on public.<table_name> to authenticated;
grant select, insert, update, delete on public.<table_name> to service_role;
-- grant select on public.<table_name> to anon;   -- ONLY if publicly readable
-- grant insert on public.<table_name> to anon;    -- ONLY anonymous-write tables

-- -----------------------------------------------------------------------------
-- GRANT DECISION TABLE (match this app's existing patterns)
-- -----------------------------------------------------------------------------
--  User-scoped CRUD (auth.uid() = user_id)  -> authenticated + service_role only
--      e.g. favorites, game_records, alert_settings, match_applications
--  Public read (anon reads via createAnonSupabaseClient / browser)
--      -> also `grant select ... to anon`
--      e.g. reviews, popular_courts_cache, site_visits, match_posts, transfers
--  Anonymous write (unauth INSERT)
--      -> also `grant insert ... to anon`        e.g. feedback
--  Cron / service-only (only createServiceRoleClient touches it)
--      -> `grant ... to service_role` only, NO anon/authenticated
--      e.g. court_status_cache
-- -----------------------------------------------------------------------------

-- New RPC / supabase.rpc()-callable functions: grant EXECUTE explicitly,
-- mirroring supabase/migrations/20260222000001_trends_rpc_functions.sql:
--   grant execute on function public.<your_function>() to anon, authenticated;

-- Sequences: NOT needed in this repo. All PKs are uuid or
-- `bigint generated always as identity` (sequence advances via the table
-- privilege). Only legacy serial/nextval() would need:
--   grant usage, select on all sequences in schema public to anon, authenticated, service_role;
