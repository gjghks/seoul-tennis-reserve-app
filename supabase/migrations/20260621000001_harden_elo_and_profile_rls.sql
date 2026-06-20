-- =============================================================================
-- Security hardening: ELO RPC + player_profiles column privileges (SEC-1, SEC-2)
-- =============================================================================
-- SEC-1: calculate_elo is SECURITY DEFINER (runs as table owner, bypasses RLS) and
--   trusted its p_user_id argument, so ANY caller could manipulate ANY user's ELO
--   (pump/tank a victim, write player_profiles/elo_history directly). The app always
--   passes the caller's own id, so we enforce that: callers may only update their OWN
--   rating. Also drop the implicit PUBLIC execute grant (anon could call it too).
-- SEC-2: the player_profiles UPDATE policy (auth.uid() = user_id) did not restrict
--   columns, so a logged-in user could PATCH their own singles_elo/doubles_elo/peak
--   directly via PostgREST to fake the leaderboard. Replace the table-level UPDATE
--   grant with column-level UPDATE on only the user-editable profile columns; the ELO
--   columns stay owner-only (written exclusively by calculate_elo).
-- Ref: app diagnosis 2026-06-21, SEC-1/SEC-2.
-- =============================================================================

-- ── SEC-1: calculate_elo — caller may only update their own rating ──────────
CREATE OR REPLACE FUNCTION calculate_elo(
  p_user_id uuid,
  p_opponent_elo integer,
  p_result text,            -- 'win' | 'loss' | 'draw'
  p_match_type text,        -- 'singles' | 'doubles'
  p_game_record_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_elo integer;
  current_matches integer;
  k_factor float;
  expected float;
  actual float;
  elo_change integer;
  new_elo integer;
  peak_elo integer;
  is_doubles boolean;
  elo_col text;
  matches_col text;
  peak_col text;
BEGIN
  -- SEC-1 guard: only the authenticated caller may update their OWN rating.
  -- Blocks arbitrary p_user_id and anon callers (auth.uid() is null for anon).
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'forbidden: calculate_elo can only update your own rating';
  END IF;

  is_doubles := (p_match_type = 'doubles');

  IF is_doubles THEN
    elo_col := 'doubles_elo';
    matches_col := 'doubles_matches';
    peak_col := 'doubles_peak_elo';
  ELSE
    elo_col := 'singles_elo';
    matches_col := 'singles_matches';
    peak_col := 'singles_peak_elo';
  END IF;

  EXECUTE format(
    'SELECT %I, %I, %I FROM public.player_profiles WHERE user_id = $1',
    elo_col, matches_col, peak_col
  ) INTO current_elo, current_matches, peak_elo USING p_user_id;

  IF current_elo IS NULL THEN
    INSERT INTO public.player_profiles (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    current_elo := 1200;
    current_matches := 0;
    peak_elo := 1200;
  END IF;

  IF current_matches < 20 THEN
    k_factor := 40;
  ELSIF current_elo < 1400 THEN
    k_factor := 32;
  ELSIF current_elo < 1600 THEN
    k_factor := 24;
  ELSE
    k_factor := 16;
  END IF;

  IF is_doubles THEN
    k_factor := k_factor * 0.75;
  END IF;

  -- Expected score: P(win) = 1 / (1 + 10^((opponent - self) / 400))
  expected := 1.0 / (1.0 + POWER(10.0, (p_opponent_elo - current_elo)::float / 400.0));

  CASE p_result
    WHEN 'win' THEN actual := 1.0;
    WHEN 'loss' THEN actual := 0.0;
    WHEN 'draw' THEN actual := 0.5;
    ELSE RAISE EXCEPTION 'Invalid result: %', p_result;
  END CASE;

  elo_change := ROUND(k_factor * (actual - expected))::integer;
  new_elo := GREATEST(800, current_elo + elo_change);

  IF new_elo > peak_elo THEN
    peak_elo := new_elo;
  END IF;

  EXECUTE format(
    'UPDATE public.player_profiles SET %I = $1, %I = $2, %I = %I + 1, last_match_at = now(), updated_at = now() WHERE user_id = $3',
    elo_col, peak_col, matches_col, matches_col
  ) USING new_elo, peak_elo, p_user_id;

  INSERT INTO public.elo_history (user_id, game_record_id, match_type, elo_before, elo_after, elo_change, opponent_elo, result)
  VALUES (p_user_id, p_game_record_id, p_match_type, current_elo, new_elo, elo_change, p_opponent_elo, p_result);

  RETURN jsonb_build_object(
    'elo_before', current_elo,
    'elo_after', new_elo,
    'elo_change', elo_change,
    'peak_elo', peak_elo,
    'k_factor', k_factor,
    'matches_played', current_matches + 1,
    'is_provisional', (current_matches + 1) < 15
  );
END;
$$;

-- Remove the implicit PUBLIC execute grant; the records API calls this via the
-- authenticated client, so authenticated keeps EXECUTE (the guard above bounds it).
revoke execute on function public.calculate_elo(uuid, integer, text, text, uuid) from public;
grant execute on function public.calculate_elo(uuid, integer, text, text, uuid) to authenticated;

-- ── SEC-2: player_profiles — restrict UPDATE to user-editable columns ───────
-- Replace the broad table-level UPDATE (which let users PATCH their own ELO) with
-- column-level UPDATE on only the profile columns the tennis/ladder PUT routes write.
-- ELO columns (singles_elo/doubles_elo/*_matches/*_peak_elo/last_match_at) are then
-- only writable by calculate_elo (SECURITY DEFINER owner). The RLS row policy
-- ("Users can update their own profile", auth.uid() = user_id) is unchanged.
revoke update on public.player_profiles from authenticated;
grant update (
  career_years,
  ntrp_rating,
  skill_level,
  preferred_hand,
  age_group,
  ladder_opt_in,
  primary_district,
  updated_at
) on public.player_profiles to authenticated;
