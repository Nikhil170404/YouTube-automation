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
  const { data: videos } = await supabase
    .from("scheduled_videos").select("*").eq("user_id", user.id).order("scheduled_at");

  return NextResponse.json({ videos: videos || [] });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = await createServiceClient();

  const { error } = await supabase.from("scheduled_videos").insert({
    channel_id:     body.channel_id,
    user_id:        user.id,
    title:          body.title,
    description:    body.description || null,
    tags:           body.tags || [],
    privacy_status: body.privacy_status || "public",
    scheduled_at:   body.scheduled_at,
    video_file_url: body.video_file_url || null,
    thumbnail_url:  body.thumbnail_url  || null,
    status:         "scheduled",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("scheduled_videos").delete().eq("id", id).eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
