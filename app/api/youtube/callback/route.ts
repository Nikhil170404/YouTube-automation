import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getChannelInfo } from "@/lib/youtube/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
    // Resolve user ID: prefer state param (Safari ITP strips cookies on cross-site redirect)
    // then fall back to session cookie (Edge / Chrome / Firefox)
    let userId: string | null = null;
    const stateParam = searchParams.get("state");
    if (stateParam) {
      try {
        const parsed = JSON.parse(Buffer.from(stateParam, "base64url").toString());
        // Accept state tokens issued within the last 10 minutes
        if (parsed.uid && typeof parsed.uid === "string" && Date.now() - parsed.ts < 10 * 60 * 1000) {
          userId = parsed.uid;
        }
      } catch { /* malformed state — fall through to cookie */ }
    }

    if (!userId) {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      userId = user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    // Use service client for all DB operations — bypasses RLS on server
    const supabase = await createServiceClient();

    // Fetch user metadata from Auth so we can upsert the profile
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
    if (!authUser) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    // Ensure profile row exists (trigger may not have fired if tables were created after signup)
    await supabase.from("profiles").upsert({
      id:         userId,
      email:      authUser.email!,
      full_name:  authUser.user_metadata?.full_name  ?? null,
      avatar_url: authUser.user_metadata?.avatar_url ?? null,
    }, { onConflict: "id" });

    const tokens      = await exchangeCodeForTokens(code);
    const channelInfo = await getChannelInfo({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token!,
    });

    // Check plan channel limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    const { count } = await supabase
      .from("youtube_channels")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
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

    // Upsert the channel and check for errors
    const { error: upsertError } = await supabase.from("youtube_channels").upsert({
      user_id:          userId,
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

    if (upsertError) {
      console.error("Channel upsert error:", upsertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/channels?error=save_failed`
      );
    }

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
