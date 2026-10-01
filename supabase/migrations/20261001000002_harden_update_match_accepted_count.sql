-- =============================================================================
-- Harden public.update_match_accepted_count(uuid) (pre-existing, from
-- 20260309000001_add_matching.sql)
-- =============================================================================
-- Prod state before this migration: SECURITY DEFINER, no search_path
-- (proconfig null), EXECUTE granted to PUBLIC/anon/authenticated/service_role.
--
-- - search_path pinned: a SECURITY DEFINER function without it resolves
--   unqualified names via the caller's search_path.
-- - anon/PUBLIC revoked: any anonymous caller could force a recount/status
--   flip on any post. authenticated is KEPT: app/api/matching/[id]/apply/route.ts
--   calls it via supabase.rpc() with the user's session client (cancel + accept/
--   reject). public.delete_user_account (20261001000001) calls it from its own
--   definer context, which is unaffected by these grants.
-- =============================================================================

alter function public.update_match_accepted_count(uuid) set search_path = public, pg_temp;

revoke execute on function public.update_match_accepted_count(uuid) from public;
revoke execute on function public.update_match_accepted_count(uuid) from anon;
grant execute on function public.update_match_accepted_count(uuid) to authenticated;
grant execute on function public.update_match_accepted_count(uuid) to service_role;

-- Verify after `db push`:
--   select proconfig from pg_proc where oid = 'public.update_match_accepted_count(uuid)'::regprocedure;  -- {search_path=public, pg_temp}
--   select has_function_privilege('anon','public.update_match_accepted_count(uuid)','execute');           -- false
--   select has_function_privilege('authenticated','public.update_match_accepted_count(uuid)','execute');  -- true
