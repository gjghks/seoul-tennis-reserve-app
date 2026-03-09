-- ============================================================
-- 1. court_transfers (코트 양도 게시판)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.court_transfers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES auth.users NOT NULL,
  seller_name text NOT NULL DEFAULT '',

  court_id text,
  court_name text NOT NULL,
  district text NOT NULL,
  play_date date NOT NULL,
  play_time_start text NOT NULL,
  play_time_end text,

  original_price integer NOT NULL DEFAULT 0 CHECK (original_price >= 0),
  asking_price integer NOT NULL DEFAULT 0 CHECK (asking_price >= 0),
  is_free boolean NOT NULL DEFAULT false,

  title text NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 100),
  description text CHECK (char_length(description) <= 500),

  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'completed', 'cancelled')),

  buyer_id uuid REFERENCES auth.users,
  buyer_name text,

  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS court_transfers_seller_idx
  ON public.court_transfers(seller_id);

CREATE INDEX IF NOT EXISTS court_transfers_status_date_idx
  ON public.court_transfers(status, play_date)
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS court_transfers_district_idx
  ON public.court_transfers(district)
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS court_transfers_created_at_idx
  ON public.court_transfers(created_at DESC);

ALTER TABLE public.court_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transfers"
  ON public.court_transfers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create transfers"
  ON public.court_transfers FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own transfers"
  ON public.court_transfers FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own transfers"
  ON public.court_transfers FOR DELETE
  USING (auth.uid() = seller_id);
