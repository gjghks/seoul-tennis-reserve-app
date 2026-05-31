-- Harden RLS write policies: close direct-PostgREST write holes for anon/authenticated.
--
-- Context: these tables relied on overly-permissive RLS write policies (using(true) /
-- with check(true) / missing WITH CHECK). Because the public anon key is shipped to every
-- browser, a client could write to them directly via PostgREST, bypassing the Next.js API
-- guards. The trusted writers are unaffected:
--   * cron writers use the service role, which BYPASSES RLS entirely;
--   * calculate_elo is SECURITY DEFINER and runs as the table owner, also bypassing RLS.
-- With RLS enabled and no permissive write policy, anon/authenticated writes are denied by
-- default, while SELECT (read) policies are preserved where the app reads via the anon client.

-- ============================================================
-- A1. match_applications: prevent an applicant from self-accepting (privilege escalation)
-- ============================================================
-- Old policy allowed UPDATE if (applicant OR post author) with NO WITH CHECK, so an applicant
-- could PATCH their own row to status='accepted' via PostgREST. Split into two scoped policies.
drop policy if exists "Authorized users can update applications" on public.match_applications;

-- Applicants may only keep their row pending or withdraw it (never accepted/rejected).
create policy "Applicants update own application (limited)"
  on public.match_applications for update to authenticated
  using (auth.uid() = applicant_id)
  with check (auth.uid() = applicant_id and status in ('pending', 'withdrawn'));

-- Post authors may accept/reject applications on their own posts.
create policy "Post authors manage applications"
  on public.match_applications for update to authenticated
  using (
    exists (
      select 1 from public.match_posts
      where match_posts.id = match_applications.post_id
        and match_posts.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.match_posts
      where match_posts.id = match_applications.post_id
        and match_posts.author_id = auth.uid()
    )
  );

-- ============================================================
-- A2. court_status_cache / popular_courts_cache: drop anon-writable "FOR ALL using(true)"
--     policies (cron writes via the service role, which bypasses RLS).
-- ============================================================
drop policy if exists "Service role manages court status cache" on public.court_status_cache;
-- Court status is public information; keep read access, deny writes by default.
create policy "Anyone can read court status cache"
  on public.court_status_cache for select using (true);

drop policy if exists "Service role can manage popular courts cache" on public.popular_courts_cache;
-- The "Anyone can read popular courts cache" SELECT policy is retained (read server-side via anon client).

-- ============================================================
-- A3. reservation_snapshots / elo_history: drop anon "INSERT with check(true)" policies.
--     Snapshots are written by cron (service role); elo_history by calculate_elo (SECURITY DEFINER).
-- ============================================================
drop policy if exists "Service role can insert snapshots" on public.reservation_snapshots;
-- "Anyone can read snapshots" SELECT policy is retained.

drop policy if exists "Service role inserts elo history" on public.elo_history;
-- "View own or opted-in elo history" SELECT policy is retained.
