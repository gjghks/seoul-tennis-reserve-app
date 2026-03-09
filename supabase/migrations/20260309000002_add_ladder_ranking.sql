-- ============================================================
-- 1. ELO columns on player_profiles
-- ============================================================
ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS singles_elo integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS doubles_elo integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS singles_matches integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS doubles_matches integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS singles_peak_elo integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS doubles_peak_elo integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS primary_district text,
  ADD COLUMN IF NOT EXISTS ladder_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_match_at timestamptz;

CREATE POLICY "Anyone can view ladder profiles" ON public.player_profiles
  FOR SELECT USING (ladder_opt_in = true);

CREATE INDEX IF NOT EXISTS player_profiles_singles_elo_idx
  ON public.player_profiles(singles_elo DESC)
  WHERE ladder_opt_in = true;

CREATE INDEX IF NOT EXISTS player_profiles_doubles_elo_idx
  ON public.player_profiles(doubles_elo DESC)
  WHERE ladder_opt_in = true;

CREATE INDEX IF NOT EXISTS player_profiles_district_idx
  ON public.player_profiles(primary_district)
  WHERE ladder_opt_in = true AND primary_district IS NOT NULL;

-- ============================================================
-- 2. elo_history (ELO change log per match)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.elo_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  game_record_id uuid REFERENCES public.game_records ON DELETE SET NULL,

  match_type text NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  elo_before integer NOT NULL,
  elo_after integer NOT NULL,
  elo_change integer NOT NULL,
  opponent_elo integer,
  result text NOT NULL CHECK (result IN ('win', 'loss', 'draw')),

  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS elo_history_user_idx
  ON public.elo_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS elo_history_game_record_idx
  ON public.elo_history(game_record_id)
  WHERE game_record_id IS NOT NULL;

ALTER TABLE public.elo_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or opted-in elo history" ON public.elo_history
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.player_profiles
      WHERE player_profiles.user_id = elo_history.user_id
        AND player_profiles.ladder_opt_in = true
    )
  );

CREATE POLICY "Service role inserts elo history" ON public.elo_history
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. RPC: Calculate ELO after match result
-- ============================================================
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

-- ============================================================
-- 4. RPC: Get leaderboard
-- ============================================================
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_match_type text DEFAULT 'singles',  -- 'singles' | 'doubles'
  p_district text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_count integer;
  elo_col text;
  matches_col text;
  peak_col text;
BEGIN
  IF p_match_type = 'doubles' THEN
    elo_col := 'doubles_elo';
    matches_col := 'doubles_matches';
    peak_col := 'doubles_peak_elo';
  ELSE
    elo_col := 'singles_elo';
    matches_col := 'singles_matches';
    peak_col := 'singles_peak_elo';
  END IF;

  EXECUTE format(
    'SELECT count(*)::integer FROM public.player_profiles
     WHERE ladder_opt_in = true
       AND %I >= 5
       AND ($1 IS NULL OR primary_district = $1)',
    matches_col
  ) INTO total_count USING p_district;

  EXECUTE format(
    'SELECT jsonb_build_object(
       ''players'', COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb),
       ''total'', $3
     )
     FROM (
       SELECT
         pp.user_id,
         u.full_name,
         u.avatar_url,
         pp.ntrp_rating,
         pp.skill_level,
         pp.primary_district,
         pp.%I as elo,
         pp.%I as matches_played,
         pp.%I as peak_elo,
         pp.last_match_at,
         pp.%I < 15 as is_provisional,
         ROW_NUMBER() OVER (ORDER BY pp.%I DESC) as rank
       FROM public.player_profiles pp
       JOIN public.users u ON u.id = pp.user_id
       WHERE pp.ladder_opt_in = true
         AND pp.%I >= 5
         AND ($1 IS NULL OR pp.primary_district = $1)
       ORDER BY pp.%I DESC
       LIMIT $2 OFFSET $4
     ) t',
    elo_col, matches_col, peak_col, matches_col, elo_col, matches_col, elo_col
  ) INTO result USING p_district, p_limit, total_count, p_offset;

  RETURN result;
END;
$$;
