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
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  return NextResponse.json({
    profile: profile || { id: user.id, email: user.email, full_name: user.user_metadata?.full_name || "", ai_replies_used: 0, ai_replies_limit: 30, plan: "free" },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = await createServiceClient();

  const { error } = await supabase.from("profiles").update({
    full_name:        body.full_name        ?? undefined,
    ai_voice_context: body.ai_voice_context ?? undefined,
  }).eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
