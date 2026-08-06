import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getBlogPost, getRelatedPosts, BLOG_POSTS } from "@/lib/blog-posts";
import type { BlogSection } from "@/lib/blog-posts";

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com"}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Comment Automation": "text-accent bg-accent/10 border-accent/20",
  "Thumbnails":         "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "SEO":                "text-emerald bg-emerald/10 border-emerald/20",
  "Analytics":          "text-gold bg-gold/10 border-gold/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case "h2":
      return <h2 key={idx}>{section.text}</h2>;
    case "h3":
      return <h3 key={idx}>{section.text}</h3>;
    case "p":
      return (
        <p
          key={idx}
          dangerouslySetInnerHTML={{
            __html: section.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
          }}
        />
      );
    case "ul":
      return (
        <ul key={idx}>
          {section.items.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{
                __html: item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx}>
          {section.items.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{
                __html: item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}
        </ol>
      );
    case "callout":
      return (
        <div key={idx} className="callout">
          {section.text}
        </div>
      );
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "author": { "@type": "Organization", "name": "ChannelOS" },
    "publisher": {
      "@type": "Organization",
      "name": "ChannelOS",
      "url": process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com",
    },
    "datePublished": post.publishedAt,
    "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com"}/blog/${slug}`,
    "mainEntityOfPage": { "@type": "WebPage" },
  };

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="grid-bg noise min-h-screen pt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        {/* Article header */}
        <article className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-24">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Blog
          </Link>

          {/* Category + meta */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] || "text-muted bg-border/30 border-border"}`}>
              {post.category}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock size={11} /> {post.readTime} min read
            </span>
            <span className="text-xs text-muted">{formatDate(post.publishedAt)}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6">
            {post.title}
          </h1>

          <p className="text-lg text-text-2 leading-relaxed mb-8 border-b border-border/40 pb-8">
            {post.description}
          </p>

          {/* Hero banner */}
          <div className="w-full h-48 rounded-2xl mb-10 bg-gradient-to-br from-accent/15 via-surface-3 to-surface-2 border border-accent/15 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-black text-accent/50 leading-none">{post.category.slice(0, 2).toUpperCase()}</div>
              <div className="text-xs text-muted mt-2 uppercase tracking-widest">ChannelOS Blog</div>
            </div>
          </div>

          {/* Content */}
          <div className="prose-article">
            {post.sections.map((s, i) => renderSection(s, i))}
          </div>

          {/* Author footer */}
          <div className="mt-14 pt-8 border-t border-border/40 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="#E8340A">
                <polygon points="3,2 11,7 3,12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{post.author}</p>
              <p className="text-xs text-muted">{post.authorRole} · ChannelOS</p>
            </div>
          </div>

          {/* In-article CTA */}
          <div className="mt-10 glass rounded-2xl border border-accent/25 p-6 text-center">
            <p className="text-sm font-bold text-white mb-1">Try ChannelOS free</p>
            <p className="text-xs text-text-2 mb-4">
              30 AI replies, unlimited scheduling, full SEO tools — no credit card.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all glow-accent-sm"
            >
              Connect My Channel <ArrowRight size={14} />
            </Link>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="border-t border-border/40 bg-surface/20 py-16 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-black text-white mb-8">Related articles</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group glass rounded-2xl border border-border/60 hover:border-accent/25 transition-all p-5"
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[rp.category] || "text-muted bg-border/30 border-border"}`}>
                      {rp.category}
                    </span>
                    <h3 className="text-sm font-black text-white mt-3 mb-2 leading-snug group-hover:text-accent/80 transition-colors">
                      {rp.title}
                    </h3>
                    <p className="text-xs text-muted flex items-center gap-1.5">
                      <Clock size={11} /> {rp.readTime} min read
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
