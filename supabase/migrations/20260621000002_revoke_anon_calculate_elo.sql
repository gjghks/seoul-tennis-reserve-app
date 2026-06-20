-- =============================================================================
-- SEC-1 follow-up: least-privilege EXECUTE on calculate_elo
-- =============================================================================
-- Supabase's default privileges grant anon/service_role an explicit EXECUTE on
-- new public functions, so the `revoke ... from public` in 20260621000001 left
-- anon able to INVOKE calculate_elo (the auth.uid() guard still blocks misuse).
-- Tighten to least-privilege: only the authenticated caller path (records API)
-- needs it. anon has no legitimate reason to call it.
-- =============================================================================

revoke execute on function public.calculate_elo(uuid, integer, text, text, uuid) from anon;
