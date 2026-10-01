-- =============================================================================
-- 회원 탈퇴: public.delete_user_account(target_user_id uuid)
-- =============================================================================
-- Removes or anonymizes every row in `public` that belongs to one user, so the
-- caller can then hard-delete the auth user with auth.admin.deleteUser().
--
-- Why this is needed: every FK to auth.users (and favorites/alerts -> public.users)
-- is ON DELETE NO ACTION, and every user has a public.users row. Without this
-- function, auth.admin.deleteUser() fails with "Database error deleting user".
--
-- Shared by:
--   - DELETE /api/account            (self-service 회원 탈퇴)
--   - scripts/delete-user.ts --execute (admin manual deletion)
-- both via lib/account/deleteAccount.ts::deleteUserAccount().
--
-- auth.users is NOT deleted here. GoTrue owns the auth schema; the caller runs
-- auth.admin.deleteUser() afterwards so identities/sessions/refresh tokens are
-- cleaned up by the Auth server itself (its FKs CASCADE from auth.users).
--
-- Storage objects are NOT deleted here: storage.protect_delete() blocks SQL
-- deletes from storage.objects. The caller removes them via the Storage API.
--
-- Per-table handling (own data deleted; rows on other users' content are
-- detached/withdrawn so their data stays intact):
--   match_posts (author)              DELETE  (applications CASCADE)
--   match_applications (applicant)    DELETE  + recount accepted_count on the
--                                             affected posts of other users
--   court_transfers (seller)          DELETE  (transfer_interests CASCADE)
--   transfer_interests (buyer)        DELETE
--   court_transfers (buyer)           UPDATE buyer_id/buyer_name = NULL,
--                                             'reserved' -> 'available'
--   tournaments (creator)             DELETE  (participants/matches CASCADE)
--   tournament_participants (user)    UPDATE user_id = NULL (name was typed by
--                                             the organizer; bracket stays valid)
--   elo_history, game_records, reviews, player_profiles,
--   push_subscriptions, alert_settings, favorites      DELETE
--   alerts / notification_logs (legacy, prod-only)     DELETE if tables exist
--   users (public profile)            DELETE (last; favorites/alerts FK to it)
--
-- Idempotent: running it again for the same id returns all-zero counts.
-- Execution: service_role only (it can wipe any account).
--
-- auth.role() guard (below): it reads request.jwt.claims, so PostgREST calls
-- with an anon/authenticated JWT are rejected even if an EXECUTE grant is
-- added by mistake. Sessions WITHOUT a JWT (psql, `supabase db`, Management
-- API SQL editor) pass on purpose — those are already superuser-level.
--
-- Deploy order: apply this migration BEFORE shipping /api/account (the code
-- aborts safely without it, but the feature is dead). After `db push`, verify:
--   select has_function_privilege('anon','public.delete_user_account(uuid)','execute');          -- false
--   select has_function_privilege('authenticated','public.delete_user_account(uuid)','execute'); -- false
--   select has_function_privilege('service_role','public.delete_user_account(uuid)','execute');  -- true
-- =============================================================================

create or replace function public.delete_user_account(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_counts jsonb := '{}'::jsonb;
  v_n integer;
  v_post_ids uuid[];
  v_post_id uuid;
begin
  if target_user_id is null then
    raise exception 'target_user_id is required' using errcode = '22004';
  end if;

  -- Defense in depth on top of the EXECUTE grants below: never allow an
  -- end-user JWT (anon/authenticated) to run this, even if a grant is added
  -- by mistake later. service_role and direct DB sessions (no JWT) pass.
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    raise exception 'permission denied for delete_user_account' using errcode = '42501';
  end if;

  -- 1) Own matching posts (other users' applications on them CASCADE)
  delete from public.match_posts where author_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('match_posts', v_n);

  -- 2) Own applications on other users' posts. Remember accepted ones so the
  --    post's accepted_count / open-closed status is recomputed afterwards.
  select coalesce(array_agg(distinct post_id), '{}'::uuid[])
    into v_post_ids
    from public.match_applications
   where applicant_id = target_user_id
     and status = 'accepted';

  delete from public.match_applications where applicant_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('match_applications', v_n);

  foreach v_post_id in array v_post_ids loop
    perform public.update_match_accepted_count(v_post_id);
  end loop;

  -- 3) Own transfer listings (other users' interests on them CASCADE)
  delete from public.court_transfers where seller_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('court_transfers', v_n);

  -- 4) Own interests on other users' listings
  delete from public.transfer_interests where buyer_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('transfer_interests', v_n);

  -- 5) Buyer reference on other users' listings: detach, keep the listing.
  --    A listing 'reserved' for this buyer goes back to 'available' so the
  --    seller is not stuck; 'completed' (and other states) stay as they are.
  update public.court_transfers
     set buyer_id = null,
         buyer_name = null,
         status = case when status = 'reserved' then 'available' else status end
   where buyer_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('court_transfers_buyer_detached', v_n);

  -- 6) Own tournaments (participants + matches CASCADE)
  delete from public.tournaments where creator_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('tournaments', v_n);

  -- 7) Participation in other users' tournaments: unlink the account only.
  --    Deleting the row would null out participant/winner refs in the
  --    organizer's bracket (tournament_matches FKs are SET NULL).
  update public.tournament_participants
     set user_id = null
   where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('tournament_participants_detached', v_n);

  -- 8) Own records / ladder data (elo_history before game_records)
  delete from public.elo_history where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('elo_history', v_n);

  delete from public.game_records where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('game_records', v_n);

  delete from public.reviews where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('reviews', v_n);

  delete from public.player_profiles where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('player_profiles', v_n);

  -- 9) Notifications
  delete from public.push_subscriptions where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('push_subscriptions', v_n);

  delete from public.alert_settings where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('alert_settings', v_n);

  -- 10) Legacy tables (exist in prod only, not in migrations; 0 rows today).
  --     notification_logs.alert_id -> alerts is NO ACTION, so logs go first.
  if to_regclass('public.alerts') is not null then
    if to_regclass('public.notification_logs') is not null then
      execute 'delete from public.notification_logs
                where alert_id in (select id from public.alerts where user_id = $1)'
        using target_user_id;
      get diagnostics v_n = row_count;
      v_counts := v_counts || jsonb_build_object('notification_logs', v_n);
    end if;

    execute 'delete from public.alerts where user_id = $1' using target_user_id;
    get diagnostics v_n = row_count;
    v_counts := v_counts || jsonb_build_object('alerts', v_n);
  end if;

  -- 11) Favorites (FK -> public.users)
  delete from public.favorites where user_id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('favorites', v_n);

  -- 12) Public profile row, last (every other public FK is gone now)
  delete from public.users where id = target_user_id;
  get diagnostics v_n = row_count;
  v_counts := v_counts || jsonb_build_object('users', v_n);

  return v_counts;
end;
$$;

comment on function public.delete_user_account(uuid) is
  '회원 탈퇴: deletes/anonymizes all public rows of a user (auth.users and storage are handled by lib/account/deleteAccount.ts). service_role only.';

-- Least privilege: Postgres grants EXECUTE to PUBLIC by default and Supabase's
-- default privileges add explicit anon/authenticated grants on new functions
-- (see 20260621000002_revoke_anon_calculate_elo.sql). Without these revokes any
-- logged-in user could wipe any account.
revoke execute on function public.delete_user_account(uuid) from public;
revoke execute on function public.delete_user_account(uuid) from anon;
revoke execute on function public.delete_user_account(uuid) from authenticated;
grant execute on function public.delete_user_account(uuid) to service_role;
