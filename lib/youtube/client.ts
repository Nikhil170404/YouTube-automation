import { google } from "googleapis";
import type { OAuthTokens, YTChannelStats, YTVideo, YTAnalytics } from "@/types/youtube";

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );
}

export function getAuthUrl(state?: string): string {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
    ...(state ? { state } : {}),
  });
}

export async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens as OAuthTokens;
}

export function createYouTubeClient(tokens: { access_token: string; refresh_token: string }) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);
  return {
    youtube: google.youtube({ version: "v3", auth: oauth2Client }),
    youtubeAnalytics: google.youtubeAnalytics({ version: "v2", auth: oauth2Client }),
    oauth2Client,
  };
}

export async function getChannelInfo(tokens: { access_token: string; refresh_token: string }) {
  const { youtube } = createYouTubeClient(tokens);
  const res = await youtube.channels.list({
    part: ["snippet", "statistics", "brandingSettings"],
    mine: true,
  });
  const channel = res.data.items?.[0];
  if (!channel) throw new Error("No YouTube channel found");
  return {
    channelId:       channel.id!,
    channelName:     channel.snippet?.title!,
    channelHandle:   channel.snippet?.customUrl || null,
    thumbnailUrl:    channel.snippet?.thumbnails?.default?.url || null,
    subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
    videoCount:      parseInt(channel.statistics?.videoCount || "0"),
  };
}

export async function getChannelStats(
  tokens: { access_token: string; refresh_token: string },
  channelId: string
): Promise<YTChannelStats> {
  const { youtube } = createYouTubeClient(tokens);
  const res = await youtube.channels.list({
    part: ["statistics"],
    id: [channelId],
  });
  const stats = res.data.items?.[0]?.statistics;
  return {
    subscriberCount:       parseInt(stats?.subscriberCount || "0"),
    viewCount:             parseInt(stats?.viewCount || "0"),
    videoCount:            parseInt(stats?.videoCount || "0"),
    hiddenSubscriberCount: stats?.hiddenSubscriberCount ?? false,
  };
}

export async function getRecentVideos(
  tokens: { access_token: string; refresh_token: string },
  channelId: string,
  maxResults = 20
): Promise<YTVideo[]> {
  const { youtube } = createYouTubeClient(tokens);
  const searchRes = await youtube.search.list({
    part: ["snippet"],
    channelId,
    type: ["video"],
    order: "date",
    maxResults,
  });
  const videoIds = searchRes.data.items?.map((i) => i.id?.videoId!).filter(Boolean) || [];
  if (!videoIds.length) return [];

  const videoRes = await youtube.videos.list({
    part: ["snippet", "statistics", "contentDetails"],
    id: videoIds,
  });

  return (videoRes.data.items || []).map((v) => ({
    id:             v.id!,
    title:          v.snippet?.title || "",
    description:    v.snippet?.description || "",
    thumbnailUrl:   v.snippet?.thumbnails?.medium?.url || "",
    publishedAt:    v.snippet?.publishedAt || "",
    viewCount:      parseInt(v.statistics?.viewCount || "0"),
    likeCount:      parseInt(v.statistics?.likeCount || "0"),
    commentCount:   parseInt(v.statistics?.commentCount || "0"),
    duration:       v.contentDetails?.duration || "",
  }));
}

export async function getAnalytics(
  tokens: { access_token: string; refresh_token: string },
  channelId: string,
  startDate: string,
  endDate: string
): Promise<YTAnalytics[]> {
  const { youtubeAnalytics } = createYouTubeClient(tokens);
  // estimatedRevenue requires YouTube Partner Program (monetization)
  // annotationClickThroughRate was deprecated and removed by YouTube
  // Using only universally available metrics
  const res = await youtubeAnalytics.reports.query({
    ids: `channel==${channelId}`,
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched,subscribersGained,subscribersLost,averageViewDuration",
    dimensions: "day",
    sort: "day",
  });

  return (res.data.rows || []).map((row) => ({
    date:                row[0] as string,
    views:               Number(row[1]),
    watchTimeMinutes:    Number(row[2]),
    subscribersGained:   Number(row[3]),
    subscribersLost:     Number(row[4]),
    estimatedRevenue:    0,
    averageViewDuration: Number(row[5]),
    clickThroughRate:    0,
  }));
}
