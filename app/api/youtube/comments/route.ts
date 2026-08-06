import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUnrepliedComments, postCommentReply } from "@/lib/youtube/comments";
import { generateCommentReply } from "@/lib/gemini";

// GET /api/youtube/comments?channelId=xxx — fetch unreplied comments
export async function GET(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelDbId = request.nextUrl.searchParams.get("channelId");
  if (!channelDbId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const supabase = await createServiceClient();
  const { data: channel } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("id", channelDbId)
    .eq("user_id", user.id)
    .single();

  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const comments = await getUnrepliedComments(
    { access_token: channel.access_token, refresh_token: channel.refresh_token },
    channel.channel_id
  );

  return NextResponse.json({ comments });
}

// POST /api/youtube/comments — auto-reply to a comment
export async function POST(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { channelId, commentId, commentText, authorName, useAI, replyText, aiContext } = body;

  const supabase = await createServiceClient();

  const { data: channel } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("id", channelId)
    .eq("user_id", user.id)
    .single();

  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  // Check AI reply limit
  if (useAI) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_replies_used, ai_replies_limit")
      .eq("id", user.id)
      .single();

    if (profile && profile.ai_replies_used >= profile.ai_replies_limit) {
      return NextResponse.json(
        { error: "AI reply limit reached. Please upgrade your plan." },
        { status: 429 }
      );
    }
  }

  let finalReply = replyText;
  let isAiGenerated = false;

  if (useAI) {
    finalReply = await generateCommentReply({
      comment:        commentText,
      authorName,
      channelContext: `Channel: ${channel.channel_name}`,
      voiceContext:   aiContext,
    });
    isAiGenerated = true;

    const { data: prof } = await supabase.from("profiles").select("ai_replies_used").eq("id", user.id).single();
    if (prof) {
      await supabase.from("profiles").update({ ai_replies_used: prof.ai_replies_used + 1 }).eq("id", user.id);
    }
  }

  await postCommentReply(
    { access_token: channel.access_token, refresh_token: channel.refresh_token },
    commentId,
    finalReply
  );

  await supabase.from("comment_replies").insert({
    channel_id:      channelId,
    user_id:         user.id,
    comment_id:      commentId,
    comment_text:    commentText,
    comment_author:  authorName,
    reply_text:      finalReply,
    is_ai_generated: isAiGenerated,
    status:          "sent",
    sent_at:         new Date().toISOString(),
  });

  return NextResponse.json({ success: true, reply: finalReply });
}
