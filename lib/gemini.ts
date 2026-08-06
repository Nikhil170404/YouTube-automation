import Groq from "groq-sdk";

// Lazy-init so missing key only throws at call time, not at build time
let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

// llama-3.1-8b-instant: fastest, best quota efficiency for short tasks
// llama-3.3-70b-versatile: higher quality for complex generation tasks
const FAST_MODEL = "llama-3.1-8b-instant";
const SMART_MODEL = "llama-3.3-70b-versatile";

async function chat(
  model: string,
  prompt: string,
  maxTokens = 512,
  retries = 2
): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await getGroq().chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      return res.choices[0]?.message?.content?.trim() ?? "";
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes("429");
      if (is429 && i < retries) {
        // Groq free tier: 30 RPM — wait 10s then retry
        await new Promise((r) => setTimeout(r, 10_000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Groq: max retries exceeded");
}

export async function generateCommentReply({
  comment,
  authorName,
  channelContext,
  voiceContext,
}: {
  comment: string;
  authorName: string;
  channelContext?: string;
  voiceContext?: string;
}): Promise<string> {
  const prompt = `You are a YouTube creator's assistant writing comment replies.
${channelContext ? `Channel: ${channelContext}` : ""}
${voiceContext ? `Voice/style: ${voiceContext}` : "Be friendly, authentic, and conversational."}

Rules:
- 1-3 sentences max
- Genuine and personal, not robotic
- Vary your openers — never always start with "Hey!" or "Thanks!"
- Never reveal you are an AI
- Match the energy of the comment
- No excessive emojis

Comment from ${authorName}: "${comment}"

Reply:`;

  return chat(FAST_MODEL, prompt, 150);
}

export async function generateVideoIdeas({
  channelTopic,
  recentVideos,
  trending,
}: {
  channelTopic: string;
  recentVideos: string[];
  trending?: string[];
}): Promise<string[]> {
  const prompt = `Generate 10 YouTube video title ideas for a channel about: ${channelTopic}

Recent videos (avoid overlap):
${recentVideos.slice(0, 5).join("\n")}
${trending ? `\nTrending topics:\n${trending.join("\n")}` : ""}

Return ONLY a JSON array of 10 title strings. Example: ["Title 1", "Title 2"]
No explanation, no markdown code fences, just the raw JSON array.`;

  const text = await chat(SMART_MODEL, prompt, 512);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : text.split("\n").filter((l) => l.trim()).slice(0, 10);
  } catch {
    return text.split("\n").filter((l) => l.trim()).slice(0, 10);
  }
}

export async function optimizeTitle(title: string, keywords: string[]): Promise<string[]> {
  const prompt = `Optimize this YouTube video title for CTR and SEO. Generate 5 alternatives.

Original: "${title}"
Keywords: ${keywords.join(", ")}

Rules:
- Under 70 characters each
- Include primary keyword naturally
- Use curiosity, numbers, or clear benefit
- No clickbait

Return ONLY a JSON array of 5 title strings. No explanation, no code fences, just the raw JSON.`;

  const text = await chat(FAST_MODEL, prompt, 300);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [title];
  } catch {
    return [title];
  }
}

export async function generateVideoDescription({
  title,
  keyPoints,
  channelName,
  keywords,
}: {
  title: string;
  keyPoints: string[];
  channelName: string;
  keywords: string[];
}): Promise<string> {
  const prompt = `Write a YouTube video description for:

Title: "${title}"
Channel: ${channelName}
Key points: ${keyPoints.join(", ")}
Keywords to include: ${keywords.join(", ")}

Format:
- Hook paragraph (2 sentences)
- What you'll learn (3-5 bullet points)
- Timestamps placeholder
- Call to action (subscribe + comment)
- Hashtags (5-8)

Under 500 words.`;

  return chat(SMART_MODEL, prompt, 700);
}

export async function researchKeywords(
  query: string
): Promise<{ keyword: string; relevance: number }[]> {
  const prompt = `Generate 10 YouTube keyword suggestions for: "${query}"

For each keyword give a relevance score 1-100 based on search potential.

Return ONLY a JSON array. Example:
[{"keyword": "example", "relevance": 85}]
No explanation, no code fences, just the raw JSON array.`;

  const text = await chat(FAST_MODEL, prompt, 400);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}
