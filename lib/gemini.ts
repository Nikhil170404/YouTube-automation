import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const flash  = () => genai.getGenerativeModel({ model: "gemini-2.0-flash" });
const flash15 = () => genai.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generate(model: ReturnType<typeof flash>, prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
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
  const prompt = `You are a YouTube creator's AI assistant writing comment replies.
${channelContext ? `Channel context: ${channelContext}` : ""}
${voiceContext ? `Writing style/voice: ${voiceContext}` : "Write in a friendly, authentic, conversational tone."}

Rules:
- Keep replies concise (1-3 sentences max)
- Be genuine and personal, not robotic
- Vary your openers — don't always start with "Hey!" or "Thanks for commenting!"
- Never mention you are an AI
- Match the energy of the original comment
- Do not use excessive emojis

Comment from ${authorName}: "${comment}"

Write a reply:`;

  return generate(flash(), prompt);
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

${trending ? `Trending topics to consider:\n${trending.join("\n")}` : ""}

Return only a JSON array of 10 title strings. No explanation, no markdown, just the raw JSON array.`;

  const text = await generate(flash15(), prompt);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : text.split("\n").filter((l) => l.trim()).slice(0, 10);
  } catch {
    return text.split("\n").filter((l) => l.trim()).slice(0, 10);
  }
}

export async function optimizeTitle(title: string, keywords: string[]): Promise<string[]> {
  const prompt = `Optimize this YouTube video title for CTR and SEO. Generate 5 alternatives.

Original title: "${title}"
Target keywords: ${keywords.join(", ")}

Rules:
- Under 70 characters each
- Include primary keyword naturally
- Use curiosity, numbers, or clear benefit
- Avoid clickbait

Return only a JSON array of 5 title strings. No explanation, no markdown, just the raw JSON array.`;

  const text = await generate(flash(), prompt);
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
Key points covered: ${keyPoints.join(", ")}
Keywords to include: ${keywords.join(", ")}

Format:
- Hook paragraph (2 sentences)
- What you'll learn (3-5 bullet points)
- Timestamps placeholder
- Call to action (subscribe + comment)
- Relevant hashtags (5-8)

Keep it under 500 words.`;

  return generate(flash15(), prompt);
}

export async function researchKeywords(query: string): Promise<{ keyword: string; relevance: number }[]> {
  const prompt = `Generate 10 YouTube keyword suggestions for the topic: "${query}"

For each keyword, estimate a relevance/search-volume score from 1-100.

Return only a JSON array like:
[{"keyword": "example keyword", "relevance": 85}, ...]

No explanation, no markdown, just the raw JSON array.`;

  const text = await generate(flash(), prompt);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}
