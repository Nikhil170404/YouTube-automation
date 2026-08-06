import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/youtube/client";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Encode user ID in state so Safari (ITP) cookie loss doesn't break the callback
  const state = Buffer.from(JSON.stringify({ uid: user.id, ts: Date.now() })).toString("base64url");
  const url = getAuthUrl(state);
  return NextResponse.redirect(url);
}
