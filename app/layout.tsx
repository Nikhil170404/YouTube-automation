import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ChannelOS — YouTube Channel Automation Platform",
    template: "%s | ChannelOS",
  },
  description:
    "Automate YouTube comment replies with AI, schedule uploads, A/B test thumbnails, and grow your channel. All features in one platform starting at $9/month.",
  keywords: [
    "youtube automation",
    "youtube comment auto reply",
    "youtube scheduler",
    "youtube seo tool",
    "youtube analytics",
    "thumbnail ab testing",
    "youtube channel management",
    "creator tools",
  ],
  authors: [{ name: "ChannelOS" }],
  creator: "ChannelOS",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com",
    siteName:    "ChannelOS",
    title:       "ChannelOS — YouTube Channel Automation Platform",
    description: "Replace TubeBuddy + VidIQ + CommentShark with one platform. AI comment replies, smart scheduler, SEO tools, and analytics — from $9/mo.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ChannelOS Dashboard" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "ChannelOS — YouTube Channel Automation",
    description: "AI comment replies, scheduler, SEO, analytics. One platform. Starting at $9/mo.",
    images:      ["/og.png"],
    creator:     "@channelosapp",
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ChannelOS",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "url": process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com",
          "description": "All-in-one YouTube channel automation platform with AI comment replies, video scheduler, SEO tools, thumbnail A/B testing, and analytics.",
          "offers": [
            { "@type": "Offer", "price": "0",  "priceCurrency": "USD", "name": "Free Plan" },
            { "@type": "Offer", "price": "9",  "priceCurrency": "USD", "name": "Starter Plan" },
            { "@type": "Offer", "price": "19", "priceCurrency": "USD", "name": "Pro Plan" },
            { "@type": "Offer", "price": "49", "priceCurrency": "USD", "name": "Agency Plan" },
            { "@type": "Offer", "price": "99", "priceCurrency": "USD", "name": "Enterprise Plan" },
          ],
          "featureList": [
            "AI Comment Auto-Reply",
            "Video Upload Scheduler",
            "YouTube SEO Keyword Tool",
            "Thumbnail A/B Testing",
            "YouTube Analytics Dashboard",
            "Competitor Channel Tracking",
            "Content Repurposing to Shorts",
            "Multi-Channel Management",
          ],
        }) }} />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
