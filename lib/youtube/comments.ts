import { google } from "googleapis";
import { createYouTubeClient } from "./client";
import type { YTComment } from "@/types/youtube";

export async function getUnrepliedComments(
  tokens: { access_token: string; refresh_token: string },
  channelId: string,
  maxResults = 50
): Promise<YTComment[]> {
  const { youtube } = createYouTubeClient(tokens);
  const res = await youtube.commentThreads.list({
    part: ["snippet", "replies"],
    allThreadsRelatedToChannelId: channelId,
    maxResults,
    order: "time",
    moderationStatus: "published",
  });

  const comments: YTComment[] = [];
  for (const thread of res.data.items || []) {
    const top = thread.snippet?.topLevelComment?.snippet;
    const hasReply = (thread.snippet?.totalReplyCount || 0) > 0;
    if (!top || hasReply) continue;

    comments.push({
      id:               thread.id!,
      videoId:          top.videoId || "",
      videoTitle:       "",
      authorName:       top.authorDisplayName || "",
      authorProfileUrl: top.authorProfileImageUrl || "",
      text:             top.textDisplay || "",
      likeCount:        top.likeCount || 0,
      publishedAt:      top.publishedAt || "",
      replyCount:       thread.snippet?.totalReplyCount || 0,
      isReplied:        false,
    });
  }
  return comments;
}

export async function postCommentReply(
  tokens: { access_token: string; refresh_token: string },
  parentCommentId: string,
  replyText: string
): Promise<string> {
  const { youtube } = createYouTubeClient(tokens);
  const res = await youtube.comments.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        parentId: parentCommentId,
        textOriginal: replyText,
      },
    },
  });
  return res.data.id!;
}

export async function updateVideoThumbnail(
  tokens: { access_token: string; refresh_token: string },
  videoId: string,
  thumbnailBuffer: Buffer,
  mimeType: string
): Promise<void> {
  const { youtube } = createYouTubeClient(tokens);
  const { Readable } = await import("stream");
  await youtube.thumbnails.set({
    videoId,
    media: {
      mimeType,
      body: Readable.from(thumbnailBuffer),
    },
  });
}

export async function searchKeywords(
  tokens: { access_token: string; refresh_token: string },
  query: string
): Promise<{ keyword: string; videoCount: number; suggestions: string[] }> {
  const { youtube } = createYouTubeClient(tokens);
  const [searchRes, suggestRes] = await Promise.all([
    youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: 1,
      fields: "pageInfo/totalResults",
    }),
    youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: 10,
    }),
  ]);

  const suggestions = (suggestRes.data.items || [])
    .map((i) => i.snippet?.title || "")
    .filter(Boolean)
    .slice(0, 5);

  return {
    keyword:    query,
    videoCount: searchRes.data.pageInfo?.totalResults || 0,
    suggestions,
  };
}
