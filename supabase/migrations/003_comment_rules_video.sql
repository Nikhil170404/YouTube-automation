-- Add optional video filter to comment_rules
ALTER TABLE comment_rules
  ADD COLUMN IF NOT EXISTS video_id text DEFAULT NULL;
