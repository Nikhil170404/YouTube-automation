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
      Date.now() - parsed.ts < 10 * 60 * 1000
    ) {
      return parsed as StatePayload;
    }
  } catch { /* malformed */ }
  return null;
}

const APP = () => process.env.NEXT_PUBLIC_APP_URL || "https://you-tube-automation-kappa.vercel.app";

function redirect(path: string) {
  return NextResponse.redirect(`${APP()}${path}`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return redirect("/channels?error=youtube_auth_failed");
  }

  // ── Step 1: Identify user ───────────────────────────────────────────────────
  let userId:    string | null = null;
  let userEmail: string | null = null;
  let fullName:  string | null = null;
  let avatarUrl: string | null = null;

  const stateData = parseState(searchParams.get("state"));
  if (stateData) {
    userId    = stateData.uid;
    userEmail = stateData.email;
    fullName  = stateData.full_name;
    avatarUrl = stateData.avatar_url;
  }

  if (!userId) {
    try {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        userId    = user.id;
        userEmail = user.email ?? null;
        fullName  = user.user_metadata?.full_name  ?? null;
        avatarUrl = user.user_metadata?.avatar_url ?? null;
      }
    } catch (e) {
      console.error("[callback] getUser failed:", e);
    }
  }

  if (!userId || !userEmail) {
    console.error("[callback] Could not identify user — state:", !!stateData, "userId:", userId);
    return redirect("/login");
  }

  // ── Step 2: Service client for DB ───────────────────────────────────────────
  let supabase: Awaited<ReturnType<typeof createServiceClient>>;
  try {
    supabase = await createServiceClient();
  } catch (e) {
    console.error("[callback] createServiceClient failed:", e);
    return redirect("/channels?error=db_init_failed");
  }

  // ── Step 3: Ensure profile exists ──────────────────────────────────────────
  const { error: profileErr } = await supabase.from("profiles").upsert(
    { id: userId, email: userEmail, full_name: fullName, avatar_url: avatarUrl },
    { onConflict: "id" }
  );
  if (profileErr) console.error("[callback] profile upsert error:", profileErr);

  // ── Step 4: Exchange code for tokens ───────────────────────────────────────
  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (e) {
    console.error("[callback] exchangeCodeForTokens failed:", e);
    return redirect("/channels?error=token_exchange_failed");
  }

  if (!tokens.access_token || !tokens.refresh_token) {
    console.error("[callback] Missing tokens — access:", !!tokens.access_token, "refresh:", !!tokens.refresh_token);
    return redirect("/channels?error=token_missing");
  }

  // ── Step 5: Fetch channel info ─────────────────────────────────────────────
  let channelInfo: Awaited<ReturnType<typeof getChannelInfo>>;
  try {
    channelInfo = await getChannelInfo({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
  } catch (e) {
    console.error("[callback] getChannelInfo failed:", e);
    return redirect("/channels?error=channel_fetch_failed");
  }

  // ── Step 6: Check plan limit ───────────────────────────────────────────────
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userId).single();
  const { count } = await supabase
    .from("youtube_channels")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true);

  const limits: Record<string, number> = { free: 1, starter: 1, pro: 3, agency: 10, enterprise: 999 };
  const limit = limits[profile?.plan || "free"] ?? 1;
  if ((count || 0) >= limit) {
    return redirect("/channels?error=channel_limit_reached");
  }

  // ── Step 7: Save channel ───────────────────────────────────────────────────
  const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : new Date(Date.now() + 3600_000).toISOString();

  const { error: upsertError } = await supabase.from("youtube_channels").upsert({
    user_id:          userId,
    channel_id:       channelInfo.channelId,
    channel_name:     channelInfo.channelName,
    channel_handle:   channelInfo.channelHandle,
    thumbnail_url:    channelInfo.thumbnailUrl,
    subscriber_count: channelInfo.subscriberCount,
    video_count:      channelInfo.videoCount,
    access_token:     tokens.access_token,
    refresh_token:    tokens.refresh_token,
    token_expires_at: expiryDate,
    is_active:        true,
  }, { onConflict: "user_id,channel_id" });

  if (upsertError) {
    console.error("[callback] channel upsert error:", upsertError);
    return redirect("/channels?error=save_failed");
  }

  return redirect("/channels?success=channel_connected");
}
