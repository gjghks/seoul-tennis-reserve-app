-- Workaround: Supabase PostgREST max_rows=1000 truncates trends data.
-- These RPC functions aggregate in PostgreSQL, returning minimal rows.

CREATE OR REPLACE FUNCTION get_daily_trends(
  p_since timestamp with time zone,
  p_district text DEFAULT NULL
)
RETURNS TABLE (
  day date,
  total_courts bigint,
  available_courts bigint,
  booked_courts bigint,
  booking_rate integer
)
LANGUAGE sql STABLE
AS $$
  SELECT
    (snapshot_at AT TIME ZONE 'Asia/Seoul')::date as day,
    SUM(total_courts)::bigint as total_courts,
    SUM(available_courts)::bigint as available_courts,
    SUM(booked_courts)::bigint as booked_courts,
    CASE WHEN SUM(total_courts) > 0
      THEN ROUND((SUM(booked_courts)::numeric / SUM(total_courts)) * 100)::integer
      ELSE 0
    END as booking_rate
  FROM reservation_snapshots
  WHERE snapshot_at >= p_since
    AND (p_district IS NULL OR district = p_district)
  GROUP BY (snapshot_at AT TIME ZONE 'Asia/Seoul')::date
  ORDER BY day ASC;
$$;


CREATE OR REPLACE FUNCTION get_latest_district_rates()
RETURNS TABLE (
  district text,
  total_courts integer,
  available_courts integer,
  booked_courts integer,
  free_courts integer,
  paid_courts integer,
  booking_rate integer,
  snapshot_at timestamp with time zone
)
LANGUAGE sql STABLE
AS $$
  SELECT DISTINCT ON (district)
    district,
    total_courts,
    available_courts,
    booked_courts,
    free_courts,
    paid_courts,
    CASE WHEN total_courts > 0
      THEN ROUND((booked_courts::numeric / total_courts) * 100)::integer
      ELSE 0
    END as booking_rate,
    snapshot_at
  FROM reservation_snapshots
  ORDER BY district, snapshot_at DESC;
$$;

-- KST timezone used for day-of-week to match Seoul users
CREATE OR REPLACE FUNCTION get_heatmap_data(
  p_since timestamp with time zone,
  p_district text DEFAULT NULL
)
RETURNS TABLE (
  day_of_week integer,
  time_slot text,
  avg_booking_rate integer,
  sample_count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    EXTRACT(DOW FROM snapshot_at AT TIME ZONE 'Asia/Seoul')::integer as day_of_week,
    time_slot,
    CASE WHEN SUM(total_courts) > 0
      THEN ROUND((SUM(booked_courts)::numeric / SUM(total_courts)) * 100)::integer
      ELSE 0
    END as avg_booking_rate,
    COUNT(*)::bigint as sample_count
  FROM reservation_snapshots
  WHERE snapshot_at >= p_since
    AND time_slot IS NOT NULL
    AND (p_district IS NULL OR district = p_district)
  GROUP BY EXTRACT(DOW FROM snapshot_at AT TIME ZONE 'Asia/Seoul')::integer, time_slot
  ORDER BY day_of_week, time_slot;
$$;

GRANT EXECUTE ON FUNCTION get_daily_trends TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_latest_district_rates TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_heatmap_data TO anon, authenticated;
