-- Create index for efficient opponent name queries
CREATE INDEX IF NOT EXISTS idx_game_records_opponent
ON game_records(user_id, opponent_name);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_game_records_played_at
ON game_records(user_id, played_at DESC);
