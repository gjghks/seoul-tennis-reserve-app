-- Add time_slot column to reservation_snapshots
ALTER TABLE reservation_snapshots
ADD COLUMN IF NOT EXISTS time_slot text;

-- Add index for time-based queries
CREATE INDEX IF NOT EXISTS idx_snapshots_time_slot
ON reservation_snapshots(time_slot);

-- Add composite index for efficient heatmap queries
CREATE INDEX IF NOT EXISTS idx_snapshots_district_time
ON reservation_snapshots(district, time_slot, snapshot_at);
