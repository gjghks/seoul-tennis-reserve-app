-- =============================================================================
-- Fix profile-save regression: restore authenticated UPDATE on player_profiles.user_id
-- =============================================================================
-- REGRESSION: migration 20260621000001_harden_elo_and_profile_rls.sql (SEC-2) did
--   `revoke update on public.player_profiles from authenticated` and re-granted
--   column-level UPDATE on ONLY the user-editable profile columns. That grant list
--   enumerated updated_at (route-written) but OMITTED user_id (also route-written).
--
--   Both the tennis profile route (app/api/profile/tennis PUT) and the ladder route
--   (app/api/ladder/profile PUT) call supabase-js
--   `.upsert({ user_id, ... }, { onConflict: 'user_id' })`. PostgREST does NOT strip
--   the on_conflict/PK column from the generated
--   `INSERT ... ON CONFLICT (user_id) DO UPDATE SET ...`, so it emits
--   `SET user_id = EXCLUDED.user_id` alongside the profile columns. PostgreSQL checks
--   column-level UPDATE privilege for EVERY column named in DO UPDATE SET at executor
--   start, from the parsed SET target list, regardless of whether a row actually
--   conflicts. So even the first-time onboarding save (a runtime pure INSERT) fails
--   with SQLSTATE 42501, which the routes surface as a 500
--   ("프로필 저장에 실패했습니다." / "래더 프로필 업데이트에 실패했습니다.").
--
-- FIX: add user_id to the column-level UPDATE grant for authenticated. The ELO columns
--   (singles_elo, doubles_elo, singles_matches, doubles_matches, singles_peak_elo,
--   doubles_peak_elo, last_match_at) remain EXCLUDED, so SEC-2's intent holds: they stay
--   writable only by calculate_elo (SECURITY DEFINER owner).
--
-- WHY GRANTING UPDATE ON THE PK IS SAFE (SEC-2 + RLS preserved):
--   The UPDATE row policy "Users can update their own profile" is
--   `using (auth.uid() = user_id)` with NO explicit WITH CHECK. In PostgreSQL, when an
--   UPDATE policy has no WITH CHECK, the USING expression is ALSO applied as the WITH
--   CHECK against the NEW row. Therefore a user can only ever set user_id to a value
--   equal to auth.uid() — they cannot reassign a row to another user. Column-level GRANT
--   (table reachability) and RLS (row/value filtering) are independent layers; restoring
--   UPDATE(user_id) only lets the PostgREST-generated `SET user_id = EXCLUDED.user_id`
--   no-op pass the privilege check, while RLS still forbids cross-user tampering.
-- Ref: app diagnosis 2026-07-09; regression from 20260621000001 (SEC-2).
-- =============================================================================

-- Re-grant the full user-editable column set INCLUDING user_id. Re-listing the
-- already-granted columns is a harmless no-op and keeps the intended privilege set
-- self-documenting. ELO columns are deliberately absent (owner-only via calculate_elo).
grant update (
  user_id,
  career_years,
  ntrp_rating,
  skill_level,
  preferred_hand,
  age_group,
  ladder_opt_in,
  primary_district,
  updated_at
) on public.player_profiles to authenticated;
