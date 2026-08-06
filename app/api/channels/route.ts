import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Service client bypasses RLS — safe on server with user already verified
    const supabase = await createServiceClient();
    const { data: channels, error } = await supabase
      .from("youtube_channels")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (error) {
      console.error("Fetch channels error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ channels: channels || [] });
  } catch (err) {
    console.error("Channels API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, is_active } = await request.json();
    const supabase = await createServiceClient();

    const { error } = await supabase
      .from("youtube_channels")
      .update({ is_active })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Channels PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
