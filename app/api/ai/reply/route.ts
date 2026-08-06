import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCommentReply, generateVideoIdeas, optimizeTitle, generateVideoDescription, researchKeywords } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "generate_reply": {
        const reply = await generateCommentReply({
          comment:        body.comment,
          authorName:     body.authorName,
          channelContext: body.channelContext,
          voiceContext:   body.voiceContext,
        });
        return NextResponse.json({ reply });
      }

      case "video_ideas": {
        const ideas = await generateVideoIdeas({
          channelTopic:  body.channelTopic,
          recentVideos:  body.recentVideos || [],
          trending:      body.trending,
        });
        return NextResponse.json({ ideas });
      }

      case "optimize_title": {
        const titles = await optimizeTitle(body.title, body.keywords || []);
        return NextResponse.json({ titles });
      }

      case "generate_description": {
        const description = await generateVideoDescription({
          title:       body.title,
          keyPoints:   body.keyPoints || [],
          channelName: body.channelName,
          keywords:    body.keywords || [],
        });
        return NextResponse.json({ description });
      }

      case "keyword_research": {
        const keywords = await researchKeywords(body.query || "");
        return NextResponse.json({ keywords });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[ai/reply] Gemini error:", err);
    const msg = err?.message || "AI request failed";
    const isApiKey = msg.includes("API_KEY") || msg.includes("api key") || msg.includes("API key");
    return NextResponse.json(
      { error: isApiKey ? "GOOGLE_AI_API_KEY is missing or invalid in Vercel environment variables." : msg },
      { status: 500 }
    );
  }
}
