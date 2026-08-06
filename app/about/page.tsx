import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Zap, Shield, Users } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "About ChannelOS — Built for Serious YouTube Creators",
  description: "We built ChannelOS because we were creators tired of spending 3 hours a day on tasks that had nothing to do with making videos. Learn our story, values, and mission.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com"}/about`,
  },
  openGraph: {
    title: "About ChannelOS — Built for Serious YouTube Creators",
    description: "We built ChannelOS because we were creators tired of spending 3 hours a day on tasks that had nothing to do with making videos.",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://channelosapp.com"}/about`,
    type: "website",
  },
};

const VALUES = [
  {
    Icon: Target,
    title: "Automation with intention",
    desc: "Automation should amplify what makes your channel human, not replace it. Every feature we build is designed to give you back time — not to take over decisions that require your judgment.",
  },
  {
    Icon: Zap,
    title: "Speed that compounds",
    desc: "Small efficiencies compound. A creator who saves 6 hours per week has 24 extra hours per month for content. Over a year, that's a meaningful competitive advantage.",
  },
  {
    Icon: Shield,
    title: "Platform safety, always",
    desc: "We operate within YouTube's API Terms of Service, full stop. No scraping, no unauthorized access, no techniques that risk your channel. We'd rather grow slowly than build on sand.",
  },
  {
    Icon: Users,
    title: "Built by creators",
    desc: "The people building ChannelOS are themselves YouTube creators. We use the tool we build. That forces a different kind of honesty about what actually matters.",
  },
];

const STATS = [
  { val: "2,400+", label: "Channels connected"         },
  { val: "1.2M+",  label: "AI replies sent"            },
  { val: "6 hrs",  label: "Saved per week, on average" },
  { val: "$0",     label: "Outside funding (bootstrapped)" },
];

const TIMELINE = [
  {
    year: "2024",
    title: "The problem becomes unbearable",
    desc: "Spending 3 hours per day on comment management, keyword lookups, and manual scheduling. Five separate tools, $90/month in subscriptions, and still missing replies.",
  },
  {
    year: "Early 2025",
    title: "First working version",
    desc: "A rough dashboard connecting YouTube OAuth, polling for comments, and generating AI replies. Not pretty. But it worked, and it gave back 2 hours per day immediately.",
  },
  {
    year: "Mid 2025",
    title: "Launched to first 100 creators",
    desc: "Added scheduling, SEO tools, and thumbnail A/B testing. The feedback was clear: people wanted one place for all of this, not just comments.",
  },
  {
    year: "2026",
    title: "2,400 channels and growing",
    desc: "Full-featured platform covering all six core YouTube jobs. Agency plan launched. Roadmap includes Shorts auto-clipper, competitor tracking, and a mobile app.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="grid-bg noise min-h-screen pt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-gold/4 blur-[100px]" />
        </div>

        {/* Hero */}
        <section className="relative py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold text-accent tracking-wide uppercase">Our Story</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-6 text-white">
            Built for creators who take{" "}
            <span className="text-gradient">YouTube seriously.</span>
          </h1>

          <p className="text-xl text-text-2 leading-relaxed max-w-2xl mx-auto">
            We started ChannelOS because we were creators tired of spending 3 hours a day on tasks that had nothing to do with making videos.
          </p>
        </section>

        {/* Story */}
        <section className="py-20 border-y border-border/40 bg-surface/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-black text-white mb-8">The problem we lived</h2>
            <div className="space-y-5 text-text-2 text-[15px] leading-relaxed">
              <p>
                At 50,000 subscribers, the workload shifted. Making content was maybe 40% of the job. The rest was: responding to 300+ comments across 20 videos, figuring out which keywords were worth targeting, remembering to upload at the right time, manually swapping thumbnails to test CTR. Sustainable, but only barely.
              </p>
              <p>
                We looked at the existing tools. TubeBuddy for SEO. VidIQ for analytics. A separate tool for comment management. Another for thumbnail testing. Each had a monthly fee. Each had a learning curve. None of them talked to each other. The combined cost was $117/month for a workflow that was still mostly manual.
              </p>
              <p>
                We built ChannelOS because that stack shouldn't exist. Six core jobs that every serious creator needs — comments, SEO, scheduling, analytics, thumbnail testing, and content repurposing — should live in one place, share context with each other, and cost less than any two of the tools they're replacing.
              </p>
              <p>
                That's still the product goal. One platform. Deep features. Pricing that doesn't require a business justification.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-black text-white mb-12">How we got here</h2>
            <div className="relative">
              <div className="absolute left-[72px] sm:left-20 top-0 bottom-0 w-px bg-border/60" />
              <div className="space-y-10">
                {TIMELINE.map((item) => (
                  <div key={item.year} className="flex gap-6 sm:gap-8">
                    <div className="flex-shrink-0 w-16 sm:w-[4.5rem] text-right">
                      <span className="text-xs font-black text-accent tracking-wide">{item.year}</span>
                    </div>
                    <div className="relative flex-1 pb-1">
                      <div className="absolute -left-[22px] sm:-left-6 top-0.5 w-2.5 h-2.5 rounded-full bg-surface border-2 border-accent" />
                      <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                      <p className="text-text-2 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-4 pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
              {STATS.map((s) => (
                <div key={s.label} className="bg-surface/60 px-5 py-8 text-center">
                  <p className="text-3xl font-black text-white mb-2">{s.val}</p>
                  <p className="text-sm text-muted leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 border-y border-border/40 bg-surface/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-black text-white mb-12 text-center">What we believe</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {VALUES.map((v) => (
                <div key={v.title} className="glass rounded-2xl border border-border/60 p-6 hover:border-border transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <v.Icon size={18} className="text-accent" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-text-2 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to get your time back?
            </h2>
            <p className="text-text-2 text-lg mb-8 max-w-lg mx-auto">
              Connect your first channel free. No credit card required. Start seeing results in 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-8 py-4 rounded-xl transition-all glow-accent-sm"
              >
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 glass text-text-2 hover:text-white font-semibold px-8 py-4 rounded-xl border border-border/80 transition-all"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
