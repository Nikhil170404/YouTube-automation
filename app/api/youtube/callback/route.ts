import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getChannelInfo } from "@/lib/youtube/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=youtube_auth_failed`
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    const tokens      = await exchangeCodeForTokens(code);
    const channelInfo = await getChannelInfo({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token!,
    });

    // Check plan channel limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const { count } = await supabase
      .from("youtube_channels")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const limits: Record<string, number> = {
      free: 1, starter: 1, pro: 3, agency: 10, enterprise: 999,
    };
    const limit = limits[profile?.plan || "free"] ?? 1;
    if ((count || 0) >= limit) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=channel_limit_reached`
      );
    }

    // Upsert the channel
    await supabase.from("youtube_channels").upsert({
      user_id:          user.id,
      channel_id:       channelInfo.channelId,
      channel_name:     channelInfo.channelName,
      channel_handle:   channelInfo.channelHandle,
      thumbnail_url:    channelInfo.thumbnailUrl,
      subscriber_count: channelInfo.subscriberCount,
      video_count:      channelInfo.videoCount,
      access_token:     tokens.access_token,
      refresh_token:    tokens.refresh_token!,
      token_expires_at: new Date(tokens.expiry_date).toISOString(),
      is_active:        true,
    }, { onConflict: "user_id,channel_id" });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?success=channel_connected`
    );
  } catch (err) {
    console.error("YouTube callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=connection_failed`
    );
  }
}
