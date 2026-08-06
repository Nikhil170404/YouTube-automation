export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: "free" | "starter" | "pro" | "agency" | "enterprise";
          ai_replies_used: number;
          ai_replies_limit: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      youtube_channels: {
        Row: {
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
        Insert: Omit<Database["public"]["Tables"]["youtube_channels"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["youtube_channels"]["Insert"]>;
      };
      comment_rules: {
        Row: {
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
        Insert: Omit<Database["public"]["Tables"]["comment_rules"]["Row"], "id" | "match_count" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["comment_rules"]["Insert"]>;
      };
      comment_replies: {
        Row: {
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
        Insert: Omit<Database["public"]["Tables"]["comment_replies"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["comment_replies"]["Insert"]>;
      };
      scheduled_videos: {
        Row: {
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
        Insert: Omit<Database["public"]["Tables"]["scheduled_videos"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["scheduled_videos"]["Insert"]>;
      };
      analytics_snapshots: {
        Row: {
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
        Insert: Omit<Database["public"]["Tables"]["analytics_snapshots"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analytics_snapshots"]["Insert"]>;
      };
      thumbnail_tests: {
        Row: {
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
        Insert: Omit<Database["public"]["Tables"]["thumbnail_tests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["thumbnail_tests"]["Insert"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type YoutubeChannel = Database["public"]["Tables"]["youtube_channels"]["Row"];
export type CommentRule = Database["public"]["Tables"]["comment_rules"]["Row"];
export type CommentReply = Database["public"]["Tables"]["comment_replies"]["Row"];
export type ScheduledVideo = Database["public"]["Tables"]["scheduled_videos"]["Row"];
export type AnalyticsSnapshot = Database["public"]["Tables"]["analytics_snapshots"]["Row"];
export type ThumbnailTest = Database["public"]["Tables"]["thumbnail_tests"]["Row"];

export type PlanType = Profile["plan"];
export const PLAN_LIMITS: Record<PlanType, { channels: number; aiReplies: number; competitors: number }> = {
  free:       { channels: 1,  aiReplies: 30,       competitors: 0  },
  starter:    { channels: 1,  aiReplies: 300,      competitors: 3  },
  pro:        { channels: 3,  aiReplies: 1000,     competitors: 10 },
  agency:     { channels: 10, aiReplies: Infinity,  competitors: 30 },
  enterprise: { channels: Infinity, aiReplies: Infinity, competitors: Infinity },
};
