export interface YTComment {
  id: string;
  videoId: string;
  videoTitle: string;
  authorName: string;
  authorProfileUrl: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  replyCount: number;
  isReplied: boolean;
}

export interface YTVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  ctr?: number;
  avgWatchPercentage?: number;
}

export interface YTChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  hiddenSubscriberCount: boolean;
}

export interface YTAnalytics {
  date: string;
  views: number;
  watchTimeMinutes: number;
  subscribersGained: number;
  subscribersLost: number;
  estimatedRevenue: number;
  averageViewDuration: number;
  clickThroughRate: number;
}

export interface YTSearchResult {
  keyword: string;
  volume: "high" | "medium" | "low";
  competition: "high" | "medium" | "low";
  videosFound: number;
  suggestions: string[];
}

export interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}
