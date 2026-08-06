import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function getUser() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServiceClient();
  const { data: tests } = await supabase
    .from("thumbnail_tests").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ tests: tests || [] });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = await createServiceClient();

  const { error } = await supabase.from("thumbnail_tests").insert({
    channel_id:    body.channel_id,
    user_id:       user.id,
    video_id:      body.video_id,
    variant_a_url: body.variant_a_url,
    variant_b_url: body.variant_b_url,
    status:        "running",
    started_at:    new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
