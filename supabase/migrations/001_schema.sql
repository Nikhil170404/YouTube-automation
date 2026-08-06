-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                  TEXT NOT NULL UNIQUE,
  full_name              TEXT,
  avatar_url             TEXT,
  ai_voice_context       TEXT,
  plan                   TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','agency','enterprise')),
  ai_replies_used        INTEGER NOT NULL DEFAULT 0,
  ai_replies_limit       INTEGER NOT NULL DEFAULT 30,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── YouTube Channels ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.youtube_channels (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_id       TEXT NOT NULL,
  channel_name     TEXT NOT NULL,
  channel_handle   TEXT,
  thumbnail_url    TEXT,
  subscriber_count BIGINT,
  video_count      INTEGER,
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own channels" ON public.youtube_channels FOR ALL USING (auth.uid() = user_id);

-- ── Comment Rules ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comment_rules (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id       UUID NOT NULL REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  reply_template   TEXT,
  use_ai           BOOLEAN NOT NULL DEFAULT TRUE,
  ai_context       TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  match_count      INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comment_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rules" ON public.comment_rules FOR ALL USING (auth.uid() = user_id);

-- ── Comment Replies ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comment_replies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id       UUID NOT NULL REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id       TEXT NOT NULL UNIQUE,
  comment_text     TEXT NOT NULL,
  comment_author   TEXT NOT NULL,
  reply_text       TEXT NOT NULL,
  is_ai_generated  BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  sent_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own replies" ON public.comment_replies FOR ALL USING (auth.uid() = user_id);

-- ── Scheduled Videos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scheduled_videos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id       UUID NOT NULL REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  category_id      TEXT,
  privacy_status   TEXT NOT NULL DEFAULT 'public' CHECK (privacy_status IN ('public','unlisted','private')),
  scheduled_at     TIMESTAMPTZ NOT NULL,
  video_file_url   TEXT,
  thumbnail_url    TEXT,
  youtube_video_id TEXT,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','uploading','published','failed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scheduled_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own videos" ON public.scheduled_videos FOR ALL USING (auth.uid() = user_id);

-- ── Analytics Snapshots ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id            UUID NOT NULL REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  snapshot_date         DATE NOT NULL,
  views                 BIGINT NOT NULL DEFAULT 0,
  watch_time_minutes    BIGINT NOT NULL DEFAULT 0,
  subscribers_gained    INTEGER NOT NULL DEFAULT 0,
  subscribers_lost      INTEGER NOT NULL DEFAULT 0,
  estimated_revenue     NUMERIC(10,4),
  avg_ctr               NUMERIC(5,4),
  avg_watch_percentage  NUMERIC(5,4),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, snapshot_date)
);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own analytics" ON public.analytics_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.youtube_channels c WHERE c.id = channel_id AND c.user_id = auth.uid()));

-- ── Thumbnail Tests ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.thumbnail_tests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        TEXT NOT NULL,
  channel_id      UUID NOT NULL REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  variant_a_url   TEXT NOT NULL,
  variant_b_url   TEXT NOT NULL,
  variant_a_ctr   NUMERIC(5,4),
  variant_b_ctr   NUMERIC(5,4),
  winner          TEXT CHECK (winner IN ('a','b')),
  status          TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','paused')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.thumbnail_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tests" ON public.thumbnail_tests FOR ALL USING (auth.uid() = user_id);

-- ── Trigger: auto-create profile on signup ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Trigger: auto-update updated_at ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_channels_updated_at BEFORE UPDATE ON public.youtube_channels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_videos_updated_at   BEFORE UPDATE ON public.scheduled_videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
