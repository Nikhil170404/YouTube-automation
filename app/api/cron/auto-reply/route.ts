import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getUnrepliedComments, postCommentReply } from "@/lib/youtube/comments";
import { generateCommentReply } from "@/lib/gemini";

// Max comments to auto-reply per channel per cron run (stay within rate limits)
const MAX_PER_CHANNEL = 10;

export async function GET(request: NextRequest) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  // Get all channels with auto-reply enabled
  const { data: channels } = await supabase
    .from("youtube_channels")
    .select("*, profiles!inner(id, ai_replies_used, ai_replies_limit, ai_voice_context)")
    .eq("is_active", true)
    .eq("auto_reply_enabled", true);

  if (!channels?.length) {
    return NextResponse.json({ processed: 0, message: "No channels with auto-reply enabled" });
  }

  let totalReplied = 0;
  const errors: string[] = [];

  for (const channel of channels) {
    const profile = (channel as any).profiles;
    if (!profile) continue;

    // Skip if user has hit their AI reply limit
    if (profile.ai_replies_used >= profile.ai_replies_limit) {
      errors.push(`${channel.channel_name}: AI reply limit reached`);
      continue;
    }

    try {
      const comments = await getUnrepliedComments(
        { access_token: channel.access_token, refresh_token: channel.refresh_token },
        channel.channel_id,
        MAX_PER_CHANNEL
      );

      // Check how many we can still reply to without exceeding limit
      const remaining = profile.ai_replies_limit - profile.ai_replies_used;
      const toReply = comments.slice(0, Math.min(remaining, MAX_PER_CHANNEL));

      for (const comment of toReply) {
        try {
          const replyText = await generateCommentReply({
            comment:        comment.text,
            authorName:     comment.authorName,
            channelContext: `Channel: ${channel.channel_name}`,
            voiceContext:   profile.ai_voice_context || undefined,
          });

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
            is_ai_generated: true,
            status:          "sent",
            sent_at:         new Date().toISOString(),
          });

          // Increment usage counter
          await supabase
            .from("profiles")
            .update({ ai_replies_used: profile.ai_replies_used + 1 })
            .eq("id", channel.user_id);

          profile.ai_replies_used += 1;
          totalReplied += 1;
        } catch (err) {
          errors.push(`${channel.channel_name} comment ${comment.id}: ${String(err)}`);
        }
      }
    } catch (err) {
      errors.push(`${channel.channel_name}: ${String(err)}`);
    }
  }

  return NextResponse.json({ processed: totalReplied, errors });
}
