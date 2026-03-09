-- ============================================================
-- 양도 마켓: 관심 표시 + 연락처 비공개 시스템
-- ============================================================

-- 1. court_transfers에 연락처 컬럼 추가
ALTER TABLE public.court_transfers
  ADD COLUMN IF NOT EXISTS contact_type text
    CHECK (contact_type IN ('kakao', 'phone'))
    DEFAULT 'kakao',
  ADD COLUMN IF NOT EXISTS contact_info text;

-- 2. transfer_interests (관심 표시 테이블)
CREATE TABLE IF NOT EXISTS public.transfer_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id uuid REFERENCES public.court_transfers(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES auth.users NOT NULL,
  buyer_name text NOT NULL DEFAULT '',
  message text CHECK (char_length(message) <= 200),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(transfer_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS transfer_interests_transfer_idx
  ON public.transfer_interests(transfer_id);

CREATE INDEX IF NOT EXISTS transfer_interests_buyer_idx
  ON public.transfer_interests(buyer_id);

ALTER TABLE public.transfer_interests ENABLE ROW LEVEL SECURITY;

-- 관심 표시한 본인 + 양도글 작성자만 조회 가능
CREATE POLICY "Users can view relevant interests"
  ON public.transfer_interests FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.court_transfers
      WHERE id = transfer_id AND seller_id = auth.uid()
    )
  );

-- 로그인 유저가 본인으로만 관심 표시 가능
CREATE POLICY "Authenticated users can express interest"
  ON public.transfer_interests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- 양도글 작성자만 관심 표시 수락/거절 가능
CREATE POLICY "Sellers can manage interests"
  ON public.transfer_interests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.court_transfers
      WHERE id = transfer_id AND seller_id = auth.uid()
    )
  );

-- 관심 표시한 본인만 철회 가능
CREATE POLICY "Buyers can withdraw interest"
  ON public.transfer_interests FOR DELETE
  USING (buyer_id = auth.uid());
