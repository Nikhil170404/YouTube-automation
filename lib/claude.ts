import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  const systemPrompt = `You are a YouTube creator's AI assistant writing comment replies.
${channelContext ? `Channel context: ${channelContext}` : ""}
${voiceContext ? `Writing style/voice: ${voiceContext}` : "Write in a friendly, authentic, conversational tone."}

Rules:
- Keep replies concise (1-3 sentences max)
- Be genuine and personal, not robotic
- Don't start with "Hey!" or "Thanks for commenting!" every time — vary openers
- Never mention you are an AI
- Match the energy of the original comment
- If it's a question you can't answer specifically, keep it warm and invite them to check the description or a future video
- Do not use excessive emojis`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Comment from ${authorName}: "${comment}"\n\nWrite a reply:`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");
  return content.text.trim();
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
  const message = await client.messages.create({
    model: "claude-sonnet-5-20251101",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate 10 YouTube video title ideas for a channel about: ${channelTopic}

Recent videos (avoid overlap):
${recentVideos.slice(0, 5).join("\n")}

${trending ? `Trending topics to consider:\n${trending.join("\n")}` : ""}

Return only a JSON array of 10 title strings. No explanation.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  try {
    return JSON.parse(content.text);
  } catch {
    return content.text.split("\n").filter((l) => l.trim().length > 0).slice(0, 10);
  }
}

export async function optimizeTitle(title: string, keywords: string[]): Promise<string[]> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Optimize this YouTube video title for CTR and SEO. Generate 5 alternatives.

Original title: "${title}"
Target keywords: ${keywords.join(", ")}

Rules:
- Under 70 characters
- Include primary keyword naturally
- Use curiosity, numbers, or clear benefit
- Avoid clickbait

Return only a JSON array of 5 title strings.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  try {
    return JSON.parse(content.text);
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
  const message = await client.messages.create({
    model: "claude-sonnet-5-20251101",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Write a YouTube video description for:

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

Keep it under 500 words.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text.trim();
}
