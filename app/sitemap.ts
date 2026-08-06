import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE,           priority: 1.0,  changeFrequency: "weekly"  as const },
    { url: `${BASE}/about`,   priority: 0.8,  changeFrequency: "monthly" as const },
    { url: `${BASE}/pricing`, priority: 0.9,  changeFrequency: "monthly" as const },
    { url: `${BASE}/blog`,    priority: 0.8,  changeFrequency: "weekly"  as const },
    { url: `${BASE}/login`,   priority: 0.5,  changeFrequency: "yearly"  as const },
    { url: `${BASE}/signup`,  priority: 0.7,  changeFrequency: "yearly"  as const },
  ];

  const blogPages = BLOG_POSTS.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    new Date(p.publishedAt),
    priority:        0.7 as number,
    changeFrequency: "monthly" as const,
  }));

  return [
    ...staticPages.map((p) => ({ ...p, lastModified: new Date() })),
    ...blogPages,
  ];
}
