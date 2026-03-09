-- ============================================================
-- court_transfers: status CHECK에 'expired' 추가
-- 경기 날짜가 지난 양도글을 자동 만료 처리하기 위한 상태 값
-- ============================================================
ALTER TABLE public.court_transfers
  DROP CONSTRAINT IF EXISTS court_transfers_status_check;

ALTER TABLE public.court_transfers
  ADD CONSTRAINT court_transfers_status_check
  CHECK (status IN ('available', 'reserved', 'completed', 'cancelled', 'expired'));
