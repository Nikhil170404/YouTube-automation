-- Add auto-reply toggle to channels
ALTER TABLE youtube_channels
  ADD COLUMN IF NOT EXISTS auto_reply_enabled boolean NOT NULL DEFAULT false;
