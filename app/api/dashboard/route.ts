import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServiceClient();

  const [profileResult, repliesResult, scheduledResult] = await Promise.allSettled([
    supabase.from("profiles").select("ai_replies_used, ai_replies_limit, plan").eq("id", user.id).single(),
    supabase.from("comment_replies").select("comment_author, reply_text, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("scheduled_videos").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("status", "scheduled"),
  ]);

  const profile      = profileResult.status      === "fulfilled" ? profileResult.value.data      : null;
  const recentReplies = repliesResult.status     === "fulfilled" ? repliesResult.value.data      : [];
  const scheduledCount = scheduledResult.status  === "fulfilled" ? (scheduledResult.value.count ?? 0) : 0;

  return NextResponse.json({
    profile: profile || { ai_replies_used: 0, ai_replies_limit: 30, plan: "free" },
    recentReplies: recentReplies || [],
    scheduledCount,
  });
}
