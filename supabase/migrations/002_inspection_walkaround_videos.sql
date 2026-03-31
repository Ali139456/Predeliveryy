-- Optional walk-around video clips (paths / URLs), same shape as photos[]
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS walkaround_videos JSONB DEFAULT '[]'::jsonb;
