import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — YouTube Growth & Automation Tips",
  description: "Actionable guides on YouTube comment automation, thumbnail testing, SEO, analytics, and channel growth. Written by the ChannelOS team.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com"}/blog`,
  },
  openGraph: {
    title: "ChannelOS Blog — YouTube Growth & Automation Tips",
    description: "Actionable guides on YouTube comment automation, thumbnail testing, SEO, analytics, and channel growth.",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com"}/blog`,
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Comment Automation": "text-accent bg-accent/10 border-accent/20",
  "Thumbnails":         "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "SEO":                "text-emerald bg-emerald/10 border-emerald/20",
  "Analytics":          "text-gold bg-gold/10 border-gold/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPage() {
  const featured = BLOG_POSTS.find((p) => p.featured);
  const rest = BLOG_POSTS.filter((p) => !p.featured);

  return (
    <>
      <Navbar />

      <main className="grid-bg noise min-h-screen pt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 right-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        {/* Hero */}
        <section className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-xs font-semibold text-accent tracking-wide uppercase">Blog</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight text-white mb-4">
              YouTube growth,{" "}
              <span className="text-gradient">without the fluff.</span>
            </h1>
            <p className="text-xl text-text-2 max-w-2xl">
              Actionable guides on automation, SEO, thumbnails, and analytics. No padding, no filler — just what works.
            </p>
          </div>

          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group block glass rounded-2xl border border-border/60 hover:border-accent/30 transition-all p-8 sm:p-10 mb-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-gold/3 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Graphic */}
                <div className="flex-shrink-0 w-full lg:w-56 h-40 lg:h-36 rounded-xl bg-gradient-to-br from-accent/20 via-surface-3 to-surface-2 flex items-center justify-center border border-accent/15">
                  <div className="text-center">
                    <div className="text-4xl font-black text-accent/80 leading-none">AI</div>
                    <div className="text-xs text-muted mt-1 tracking-widest">GUIDE</div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[featured.category] || "text-muted bg-border/30 border-border"}`}>
                      {featured.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                      Featured
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 group-hover:text-accent/90 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-text-2 text-sm leading-relaxed mb-4 max-w-2xl">{featured.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {featured.readTime} min read
                    </span>
                    <span>{formatDate(featured.publishedAt)}</span>
                    <span className="ml-auto hidden sm:flex items-center gap-1 text-accent font-semibold group-hover:gap-2 transition-all">
                      Read article <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Post grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group glass rounded-2xl border border-border/60 hover:border-accent/25 transition-all p-6 flex flex-col"
              >
                {/* Mini graphic */}
                <div className="w-full h-28 rounded-xl mb-5 bg-gradient-to-br from-surface-3 to-surface-2 border border-border/40 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">{post.category}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] || "text-muted bg-border/30 border-border"}`}>
                    {post.category}
                  </span>
                </div>

                <h2 className="text-base font-black text-white leading-snug mb-2 group-hover:text-accent/90 transition-colors flex-1">
                  {post.title}
                </h2>
                <p className="text-text-2 text-xs leading-relaxed mb-4 line-clamp-2">{post.description}</p>

                <div className="flex items-center justify-between text-xs text-muted mt-auto pt-3 border-t border-border/40">
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} />
                    {post.readTime} min
                  </span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center glass rounded-2xl border border-border/60 p-10">
            <p className="text-xs text-accent uppercase tracking-widest font-bold mb-3">Want more?</p>
            <h2 className="text-2xl font-black text-white mb-3">Try ChannelOS free</h2>
            <p className="text-text-2 text-sm mb-6 max-w-md mx-auto">
              Connect your channel and start putting these guides into practice — free plan, no credit card.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-6 py-3 rounded-xl transition-all glow-accent-sm"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
