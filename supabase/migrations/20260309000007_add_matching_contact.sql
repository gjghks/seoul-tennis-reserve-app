-- Add contact fields to match_posts (same pattern as transfers)
ALTER TABLE match_posts
  ADD COLUMN IF NOT EXISTS contact_type text CHECK (contact_type IN ('kakao', 'phone')),
  ADD COLUMN IF NOT EXISTS contact_info text;
