import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getChannelInfo } from "@/lib/youtube/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface StatePayload {
  uid:        string;
  email:      string;
  full_name:  string | null;
  avatar_url: string | null;
  ts:         number;
}

function parseState(raw: string | null): StatePayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString());
    if (
      parsed.uid && typeof parsed.uid === "string" &&
      parsed.email && typeof parsed.email === "string" &&
      typeof parsed.ts === "number" &&
      Date.now() - parsed.ts < 10 * 60 * 1000 // 10-minute expiry
    ) {
      return parsed as StatePayload;
    }
  } catch { /* malformed */ }
  return null;
}

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
    // ── Identify the user ────────────────────────────────────────────────────
    // State param path: Safari ITP strips cookies on cross-site redirect, so
    // the connect route embeds user info in state before sending to Google.
    const stateData = parseState(searchParams.get("state"));

    let userId:    string | null = stateData?.uid        ?? null;
    let userEmail: string | null = stateData?.email      ?? null;
    let fullName:  string | null = stateData?.full_name  ?? null;
    let avatarUrl: string | null = stateData?.avatar_url ?? null;

    // Cookie path: Edge / Chrome / Firefox retain the session cookie
    if (!userId) {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        userId    = user.id;
        userEmail = user.email ?? null;
        fullName  = user.user_metadata?.full_name  ?? null;
        avatarUrl = user.user_metadata?.avatar_url ?? null;
      }
    }

    if (!userId || !userEmail) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    // ── All DB writes via service client (bypasses RLS) ──────────────────────
    const supabase = await createServiceClient();

    // Ensure profile row exists (trigger may not have fired at signup time)
    await supabase.from("profiles").upsert(
      { id: userId, email: userEmail, full_name: fullName, avatar_url: avatarUrl },
      { onConflict: "id" }
    );

    // ── Exchange code for tokens and fetch channel info ──────────────────────
    const tokens      = await exchangeCodeForTokens(code);
    const channelInfo = await getChannelInfo({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token!,
    });

    // ── Check plan channel limit ─────────────────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles").select("plan").eq("id", userId).single();

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

    // ── Save the channel ─────────────────────────────────────────────────────
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
      token_expires_at: new Date(tokens.expiry_date!).toISOString(),
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
