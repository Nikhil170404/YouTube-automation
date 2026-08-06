export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Row shapes defined before Database to avoid any self-reference issues
type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  ai_voice_context: string | null;
  plan: "free" | "starter" | "pro" | "agency" | "enterprise";
  ai_replies_used: number;
  ai_replies_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

type YoutubeChannelRow = {
  id: string;
  user_id: string;
  channel_id: string;
  channel_name: string;
  channel_handle: string | null;
  thumbnail_url: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CommentRuleRow = {
  id: string;
  channel_id: string;
  user_id: string;
  name: string;
  trigger_keywords: string[];
  reply_template: string | null;
  use_ai: boolean;
  ai_context: string | null;
  is_active: boolean;
  match_count: number;
  created_at: string;
};

type CommentReplyRow = {
  id: string;
  channel_id: string;
  user_id: string;
  comment_id: string;
  comment_text: string;
  comment_author: string;
  reply_text: string;
  is_ai_generated: boolean;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
};

type ScheduledVideoRow = {
  id: string;
  channel_id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  category_id: string | null;
  privacy_status: "public" | "unlisted" | "private";
  scheduled_at: string;
  video_file_url: string | null;
  thumbnail_url: string | null;
  youtube_video_id: string | null;
  status: "draft" | "scheduled" | "uploading" | "published" | "failed";
  created_at: string;
  updated_at: string;
};

type AnalyticsSnapshotRow = {
  id: string;
  channel_id: string;
  snapshot_date: string;
  views: number;
  watch_time_minutes: number;
  subscribers_gained: number;
  subscribers_lost: number;
  estimated_revenue: number | null;
  avg_ctr: number | null;
  avg_watch_percentage: number | null;
  created_at: string;
};

type ThumbnailTestRow = {
  id: string;
  video_id: string;
  channel_id: string;
  user_id: string;
  variant_a_url: string;
  variant_b_url: string;
  variant_a_ctr: number | null;
  variant_b_ctr: number | null;
  winner: "a" | "b" | null;
  status: "running" | "completed" | "paused";
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

// Supabase 2.x requires `Relationships` on every table; omitting it collapses
// the inferred row type to `never` in the query builder generics.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at">;
        Update: Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      youtube_channels: {
        Row: YoutubeChannelRow;
        Insert: Omit<YoutubeChannelRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<YoutubeChannelRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      comment_rules: {
        Row: CommentRuleRow;
        Insert: Omit<CommentRuleRow, "id" | "match_count" | "created_at">;
        Update: Partial<Omit<CommentRuleRow, "id" | "created_at">>;
        Relationships: [];
      };
      comment_replies: {
        Row: CommentReplyRow;
        Insert: Omit<CommentReplyRow, "id" | "created_at">;
        Update: Partial<Omit<CommentReplyRow, "id" | "created_at">>;
        Relationships: [];
      };
      scheduled_videos: {
        Row: ScheduledVideoRow;
        Insert: Omit<ScheduledVideoRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ScheduledVideoRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      analytics_snapshots: {
        Row: AnalyticsSnapshotRow;
        Insert: Omit<AnalyticsSnapshotRow, "id" | "created_at">;
        Update: Partial<Omit<AnalyticsSnapshotRow, "id" | "created_at">>;
        Relationships: [];
      };
      thumbnail_tests: {
        Row: ThumbnailTestRow;
        Insert: Omit<ThumbnailTestRow, "id" | "created_at">;
        Update: Partial<Omit<ThumbnailTestRow, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = ProfileRow;
export type YoutubeChannel = YoutubeChannelRow;
export type CommentRule = CommentRuleRow;
export type CommentReply = CommentReplyRow;
export type ScheduledVideo = ScheduledVideoRow;
export type AnalyticsSnapshot = AnalyticsSnapshotRow;
export type ThumbnailTest = ThumbnailTestRow;

export type PlanType = Profile["plan"];
export const PLAN_LIMITS: Record<PlanType, { channels: number; aiReplies: number }> = {
  free:       { channels: 1,        aiReplies: 30       },
  starter:    { channels: 1,        aiReplies: 300      },
  pro:        { channels: 3,        aiReplies: 1000     },
  agency:     { channels: 10,       aiReplies: Infinity },
  enterprise: { channels: Infinity, aiReplies: Infinity },
};
