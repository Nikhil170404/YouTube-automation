import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getUnrepliedComments, postCommentReply } from "@/lib/youtube/comments";
import { generateCommentReply } from "@/lib/gemini";
import type { YTComment } from "@/types/youtube";

const MAX_PER_RUN = 20; // max total replies across all channels per cron fire

type Rule = {
  id: string;
  trigger_keywords: string[];
  reply_template: string | null;
  use_ai: boolean;
  ai_context: string | null;
  video_id: string | null;
  match_count: number;
};

function matchesRule(comment: YTComment, rule: Rule): boolean {
  if (rule.trigger_keywords.length === 0) return true; // catch-all
  const lower = comment.text.toLowerCase();
  return rule.trigger_keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export async function GET(request: NextRequest) {
  // Called by cron-job.org — set header: Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  let totalReplied = 0;
  const errors: string[] = [];

  // Get all active channels with auto-reply enabled
  const { data: channels } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("is_active", true)
    .eq("auto_reply_enabled", true);

  if (!channels?.length) {
    return NextResponse.json({ processed: 0, message: "No channels with auto-reply enabled" });
  }

  for (const channel of channels) {
    if (totalReplied >= MAX_PER_RUN) break;

    // Get user profile for AI quota
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_replies_used, ai_replies_limit, ai_voice_context")
      .eq("id", channel.user_id)
      .single();

    if (!profile || profile.ai_replies_used >= profile.ai_replies_limit) {
      if (profile) errors.push(`${channel.channel_name}: AI reply limit reached`);
      continue;
    }

    // Get active rules for this channel, ordered so video-specific rules come first
    const { data: rules } = await supabase
      .from("comment_rules")
      .select("*")
      .eq("channel_id", channel.id)
      .eq("is_active", true)
      .order("video_id", { ascending: false }); // video-specific first (non-null before null)

    const channelRules: Rule[] = rules || [];

    try {
      // Gather unique video IDs targeted by rules (plus null = whole channel)
      const videoTargets = new Set<string | null>(
        channelRules.map((r) => r.video_id)
      );
      // Always include whole-channel fetch if any catch-all / non-video rules exist
      const hasChannelRules = channelRules.some((r) => !r.video_id);
      if (hasChannelRules || channelRules.length === 0) videoTargets.add(null);

      for (const videoId of videoTargets) {
        if (totalReplied >= MAX_PER_RUN) break;

        const comments = await getUnrepliedComments(
          { access_token: channel.access_token, refresh_token: channel.refresh_token },
          channel.channel_id,
          20,
          videoId ?? undefined
        );

        for (const comment of comments) {
          if (totalReplied >= MAX_PER_RUN) break;
          if (profile.ai_replies_used >= profile.ai_replies_limit) break;

          // Find first matching rule
          const rule = channelRules.find(
            (r) => (!r.video_id || r.video_id === videoId) && matchesRule(comment, r)
          );

          // Skip if no rule matches and no catch-all
          if (!rule && channelRules.length > 0) continue;

          let replyText: string;
          let isAiGenerated = false;

          try {
            if (rule?.reply_template && !rule.use_ai) {
              replyText = rule.reply_template;
            } else {
              replyText = await generateCommentReply({
                comment:        comment.text,
                authorName:     comment.authorName,
                channelContext: `Channel: ${channel.channel_name}`,
                voiceContext:   rule?.ai_context || profile.ai_voice_context || undefined,
              });
              isAiGenerated = true;
              profile.ai_replies_used += 1;
              await supabase.from("profiles")
                .update({ ai_replies_used: profile.ai_replies_used })
                .eq("id", channel.user_id);
            }

            await postCommentReply(
              { access_token: channel.access_token, refresh_token: channel.refresh_token },
              comment.id,
              replyText
            );

            await supabase.from("comment_replies").insert({
              channel_id:      channel.id,
              user_id:         channel.user_id,
              comment_id:      comment.id,
              comment_text:    comment.text,
              comment_author:  comment.authorName,
              reply_text:      replyText,
              is_ai_generated: isAiGenerated,
              status:          "sent",
              sent_at:         new Date().toISOString(),
            });

            if (rule) {
              await supabase.from("comment_rules")
                .update({ match_count: rule.match_count + 1 })
                .eq("id", rule.id);
            }

            totalReplied++;
          } catch (err) {
            errors.push(`${channel.channel_name} comment ${comment.id}: ${String(err)}`);
          }
        }
      }
    } catch (err) {
      errors.push(`${channel.channel_name}: ${String(err)}`);
    }
  }

  return NextResponse.json({ processed: totalReplied, errors });
}
