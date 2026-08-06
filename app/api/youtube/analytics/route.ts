import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnalytics, getChannelStats, getRecentVideos } from "@/lib/youtube/client";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelDbId = request.nextUrl.searchParams.get("channelId");
  const days        = parseInt(request.nextUrl.searchParams.get("days") || "28");

  if (!channelDbId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const { data: channel } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("id", channelDbId)
    .eq("user_id", user.id)
    .single();

  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const tokens      = { access_token: channel.access_token, refresh_token: channel.refresh_token };
  const startDate   = format(subDays(new Date(), days), "yyyy-MM-dd");
  const endDate     = format(new Date(), "yyyy-MM-dd");

  const [stats, analytics, videos] = await Promise.all([
    getChannelStats(tokens, channel.channel_id),
    getAnalytics(tokens, channel.channel_id, startDate, endDate),
    getRecentVideos(tokens, channel.channel_id, 10),
  ]);

  // Save snapshot for today
  if (analytics.length > 0) {
    const latest = analytics[analytics.length - 1];
    await supabase.from("analytics_snapshots").upsert({
      channel_id:           channelDbId,
      snapshot_date:        endDate,
      views:                latest.views,
      watch_time_minutes:   latest.watchTimeMinutes,
      subscribers_gained:   latest.subscribersGained,
      subscribers_lost:     latest.subscribersLost,
      estimated_revenue:    latest.estimatedRevenue,
      avg_ctr:              latest.clickThroughRate,
    }, { onConflict: "channel_id,snapshot_date" });
  }

  return NextResponse.json({ stats, analytics, videos });
}
