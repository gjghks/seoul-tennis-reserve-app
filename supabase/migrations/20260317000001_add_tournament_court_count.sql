ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS court_count integer CHECK (court_count >= 1 AND court_count <= 20);
