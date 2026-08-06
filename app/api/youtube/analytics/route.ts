import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAnalytics, getChannelStats, getRecentVideos } from "@/lib/youtube/client";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  // Verify the user is authenticated
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelDbId = request.nextUrl.searchParams.get("channelId");
  const days        = parseInt(request.nextUrl.searchParams.get("days") || "28");

  if (!channelDbId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  // Use service client so RLS doesn't block the channel lookup
  const supabase = await createServiceClient();

  const { data: channel } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("id", channelDbId)
    .eq("user_id", user.id)
    .single();

  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const tokens    = { access_token: channel.access_token, refresh_token: channel.refresh_token };
  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
  const endDate   = format(new Date(), "yyyy-MM-dd");

  // Fetch in parallel — treat each as independent; don't fail all if one errors
  const [statsResult, analyticsResult, videosResult] = await Promise.allSettled([
    getChannelStats(tokens, channel.channel_id),
    getAnalytics(tokens, channel.channel_id, startDate, endDate),
    getRecentVideos(tokens, channel.channel_id, 10),
  ]);

  const stats    = statsResult.status    === "fulfilled" ? statsResult.value    : null;
  const analytics = analyticsResult.status === "fulfilled" ? analyticsResult.value : [];
  const videos   = videosResult.status   === "fulfilled" ? videosResult.value   : [];

  if (analyticsResult.status === "rejected") {
    console.error("[analytics] YouTube Analytics API error:", analyticsResult.reason);
  }

  // Save latest analytics snapshot if we have data
  if (analytics.length > 0) {
    const latest = analytics[analytics.length - 1];
    await supabase.from("analytics_snapshots").upsert({
      channel_id:         channelDbId,
      snapshot_date:      endDate,
      views:              latest.views,
      watch_time_minutes: latest.watchTimeMinutes,
      subscribers_gained: latest.subscribersGained,
      subscribers_lost:   latest.subscribersLost,
      avg_ctr:            latest.clickThroughRate || null,
    }, { onConflict: "channel_id,snapshot_date" });
  }

  return NextResponse.json({ stats, analytics, videos });
}
