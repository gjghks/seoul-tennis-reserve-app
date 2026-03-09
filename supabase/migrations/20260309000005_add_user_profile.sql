ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS nickname text UNIQUE
    CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 12),
  ADD COLUMN IF NOT EXISTS bio text
    CHECK (char_length(bio) <= 50),
  ADD COLUMN IF NOT EXISTS gender text
    CHECK (gender IN ('male', 'female'));

CREATE UNIQUE INDEX IF NOT EXISTS users_nickname_lower_idx
  ON public.users (lower(nickname));
