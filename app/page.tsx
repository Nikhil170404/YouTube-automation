"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

// ─── Tiny icon components ──────────────────────────────────────────────────────
function Icon({ d, size = 18, className }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}
const icons = {
  play:      "M5 3l14 9-14 9V3z",
  check:     "M20 6L9 17l-5-5",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  bar:       "M18 20V10M12 20V4M6 20v-6",
  calendar:  "M3 9h18M8 2v4M16 2v4M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z",
  message:   "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  image:     "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 5l-5-5L5 18",
  users:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  scissors:  "M6 3l6 6-6 6M18 9H9M6 21l6-6M18 15H9",
  trending:  "M23 6l-9.5 9.5-5-5L1 18",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  x:         "M18 6L6 18M6 6l12 12",
  menu:      "M3 12h18M3 6h18M3 18h18",
  chevron:   "M6 9l6 6 6-6",
};

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in-view"); obs.unobserve(el); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const dur = 1600;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Hero mock window ─────────────────────────────────────────────────────────
function HeroMock() {
  const [tab, setTab] = useState(0);
  const [typed, setTyped] = useState("");
  const replyText = "Thanks for the kind words, Alex! The next collab is already in the works — stay subscribed so you don't miss it 🙌";

  useEffect(() => {
    const t = setInterval(() => setTab((p) => (p + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tab !== 0) return;
    setTyped("");
    let i = 0;
    const delay = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setTyped(replyText.slice(0, i));
        if (i >= replyText.length) clearInterval(id);
      }, 28);
      return () => clearInterval(id);
    }, 1200);
    return () => clearTimeout(delay);
  }, [tab]);

  const tabs = ["Comments", "Analytics", "Schedule"];

  return (
    <div className="relative animate-float">
      <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-tr from-accent/40 via-transparent to-gold/20 rounded-3xl" />
      <div className="relative glass rounded-2xl overflow-hidden shadow-2xl border border-border/50 w-full max-w-[420px]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-surface/60">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex gap-1 ml-3">
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${tab === i ? "bg-accent text-white" : "text-muted hover:text-text-2"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Comments tab */}
        <div className={`transition-all duration-400 ${tab === 0 ? "block" : "hidden"}`}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-widest font-semibold">Unreplied</span>
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">247 new</span>
            </div>
            {/* Comment item - replied */}
            <div className="bg-surface-2/60 rounded-xl p-3 opacity-50">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">M</div>
                <span className="text-xs text-text-2 font-medium">Maya R.</span>
                <span className="text-[10px] text-muted ml-auto">3h ago</span>
              </div>
              <p className="text-xs text-muted">"This tutorial saved me hours!"</p>
              <div className="mt-1.5 text-[10px] text-emerald flex items-center gap-1">
                <span>✓</span> AI replied
              </div>
            </div>
            {/* Active comment */}
            <div className="bg-surface-2/80 rounded-xl p-3 border border-accent/30">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-[10px] font-bold">A</div>
                <span className="text-xs text-text-2 font-medium">Alex Kim</span>
                <span className="text-[10px] text-muted ml-auto">1h ago</span>
              </div>
              <p className="text-xs text-white">"when is your next collab video coming?"</p>
              <div className="mt-2 bg-accent/10 rounded-lg p-2.5 border border-accent/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-[9px] text-accent font-bold uppercase tracking-wider">AI Composing</span>
                </div>
                <p className="text-[11px] text-text-2 leading-relaxed min-h-[32px]">
                  {typed || <span className="opacity-40">...</span>}
                  {typed.length > 0 && typed.length < replyText.length && (
                    <span className="inline-block w-0.5 h-3 bg-accent ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics tab */}
        <div className={`transition-all duration-400 ${tab === 1 ? "block" : "hidden"}`}>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Views", val: "48.2K", change: "+12%", up: true },
                { label: "CTR",   val: "5.8%",  change: "+0.3%", up: true },
                { label: "Watch Time", val: "3.2K hrs", change: "-2%", up: false },
                { label: "Subs",  val: "+842",  change: "+38%", up: true },
              ].map((s) => (
                <div key={s.label} className="bg-surface-2/70 rounded-xl p-3">
                  <p className="text-[10px] text-muted mb-1">{s.label}</p>
                  <p className="text-base font-bold text-white">{s.val}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${s.up ? "text-emerald" : "text-accent"}`}>{s.change} this week</p>
                </div>
              ))}
            </div>
            {/* Mini bar chart */}
            <div className="bg-surface-2/40 rounded-xl p-3">
              <p className="text-[10px] text-muted mb-2">Views — Last 7 Days</p>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 45, 80, 95, 70, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all duration-700"
                    style={{ height: `${h}%`, background: i === 4 ? "#E8340A" : "rgba(232,52,10,0.3)" }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} className="text-[9px] text-muted flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule tab */}
        <div className={`transition-all duration-400 ${tab === 2 ? "block" : "hidden"}`}>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted uppercase tracking-widest font-semibold">Upcoming</span>
              <span className="text-xs text-accent font-medium">+ Add Video</span>
            </div>
            {[
              { title: "10 Productivity Hacks That Actually Work", date: "Tomorrow, 9:00 AM", status: "scheduled" },
              { title: "I Tried the Viral Morning Routine for 30 Days", date: "Aug 12, 2:00 PM",  status: "scheduled" },
              { title: "Why Most YouTube Advice is Wrong", date: "Aug 15, 10:00 AM", status: "draft" },
            ].map((v) => (
              <div key={v.title} className="bg-surface-2/70 rounded-xl p-3 flex gap-3 items-start">
                <div className="w-12 h-8 rounded bg-gradient-to-br from-surface-3 to-border flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium leading-tight truncate">{v.title}</p>
                  <p className="text-[10px] text-muted mt-0.5">{v.date}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                  v.status === "scheduled" ? "bg-emerald/15 text-emerald" : "bg-border text-muted"
                }`}>{v.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Nav is now the shared Navbar component imported above

// ─── Features data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: icons.message, title: "AI Comment Auto-Reply",
    desc: "Claude AI reads each comment, matches your voice, and posts a genuine reply. Rules engine lets you set triggers, templates, and tone. Never miss an engagement signal again.",
    tags: ["AI-powered", "Rules engine", "Sentiment filter", "Auto-moderation"],
    color: "accent",
  },
  {
    icon: icons.search, title: "YouTube SEO Tools",
    desc: "Keyword difficulty scores, tag gap analysis, competitor title breakdowns, and AI title rewrites optimized for CTR. Know exactly which words get you discovered.",
    tags: ["Keyword research", "Tag analyzer", "Title optimizer", "Competitor gaps"],
    color: "blue",
  },
  {
    icon: icons.calendar, title: "Video Scheduler",
    desc: "Calendar view of your entire content pipeline. Queue videos in advance, set the exact publish time, manage drafts, and see everything at a glance across all your channels.",
    tags: ["Calendar view", "Multi-channel", "Draft management", "Optimal timing"],
    color: "emerald",
  },
  {
    icon: icons.bar, title: "Analytics Beyond Studio",
    desc: "CTR trends, watch time breakdowns, revenue estimates, subscriber velocity, and competitor benchmarks — all in one dashboard that YouTube Studio doesn't give you.",
    tags: ["Revenue tracking", "CTR trends", "Competitor data", "Subscriber analytics"],
    color: "gold",
  },
  {
    icon: icons.image, title: "Thumbnail A/B Testing",
    desc: "Upload two or three thumbnail variants. We rotate them automatically, collect CTR data over 48 hours, and declare a statistically significant winner. No guessing.",
    tags: ["Auto-rotation", "CTR tracking", "Statistical significance", "Unlimited tests"],
    color: "accent",
  },
  {
    icon: icons.zap, title: "AI Content Generator",
    desc: "Out of ideas? Enter your channel topic and get AI-generated video concepts backed by what's trending. Then auto-write your title variants and full description — optimized for search.",
    tags: ["Video ideas", "Title variants", "AI descriptions", "SEO optimized"],
    color: "emerald",
  },
];

const colorMap: Record<string, string> = {
  accent:  "text-accent bg-accent/10 border-accent/20",
  blue:    "text-blue-400 bg-blue-400/10 border-blue-400/20",
  emerald: "text-emerald bg-emerald/10 border-emerald/20",
  gold:    "text-gold bg-gold/10 border-gold/20",
};
const iconBg: Record<string, string> = {
  accent:  "bg-accent/15 text-accent",
  blue:    "bg-blue-400/15 text-blue-400",
  emerald: "bg-emerald/15 text-emerald",
  gold:    "bg-gold/15 text-gold",
};

// ─── Pricing data ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Free", price: { mo: 0, yr: 0 }, rec: false,
    features: ["1 channel", "30 AI auto-replies/mo", "3 scheduled uploads/mo", "Basic SEO tools", "Analytics dashboard"],
  },
  {
    name: "Starter", price: { mo: 7, yr: 5 }, rec: false,
    features: ["1 channel", "250 AI auto-replies/mo", "Unlimited scheduling", "Full SEO + keywords", "Full analytics", "Email support"],
  },
  {
    name: "Pro", price: { mo: 19, yr: 15 }, rec: true,
    features: ["3 channels", "1,000 AI auto-replies/mo", "Thumbnail A/B testing", "Advanced SEO", "Priority support"],
  },
  {
    name: "Agency", price: { mo: 49, yr: 39 }, rec: false,
    features: ["10 channels", "Unlimited AI replies", "3 team seats", "Bulk scheduling", "Dedicated support"],
  },
  {
    name: "Enterprise", price: { mo: 99, yr: 79 }, rec: false,
    features: ["Unlimited channels", "Unlimited AI replies", "10 team seats", "Custom onboarding", "Dedicated account manager"],
  },
];

const FAQS = [
  {
    q: "What is ChannelOS and how does it help YouTube creators?",
    a: "ChannelOS is an all-in-one YouTube channel management platform. It automates the time-consuming operational tasks of running a YouTube channel: replying to comments with AI, scheduling video uploads, researching SEO keywords, A/B testing thumbnails, and analyzing analytics beyond what YouTube Studio provides. It replaces 5+ separate tools with one platform.",
  },
  {
    q: "How does the AI comment reply feature work?",
    a: "When you connect your YouTube channel, ChannelOS polls for new unreplied comments every 15 minutes. For each comment, our Claude AI model reads the context, matches your channel's voice and tone (which you configure once), and generates a genuine, non-robotic reply. You can review before posting or enable fully automatic replies. The AI never mentions it is an AI.",
  },
  {
    q: "Is this safe to connect to my YouTube channel?",
    a: "Yes. We use Google's official OAuth 2.0 flow — the same standard every major app uses. We never store your Google password. You grant specific scopes (comments, uploads, analytics), and you can revoke access at any time from your Google account settings. We are fully compliant with YouTube's API Terms of Service.",
  },
  {
    q: "How does the thumbnail A/B testing work?",
    a: "You upload two or three thumbnail variants for any video. ChannelOS uses the YouTube Data API to rotate thumbnails automatically at set intervals, tracking the CTR for each variant. After collecting statistically significant data (usually 48–72 hours), it declares a winner and permanently sets the winning thumbnail. No manual swapping needed.",
  },
  {
    q: "Can I manage multiple YouTube channels?",
    a: "Yes. The Pro plan supports 3 channels, Agency supports 10, and Enterprise is unlimited. Each channel is managed from a single dashboard. Agency users also get team seats so colleagues can access specific channels without sharing login credentials.",
  },
  {
    q: "What happens when I reach my AI reply limit?",
    a: "You'll receive a notification before hitting the limit. Once reached, auto-replies pause — your comments are still collected and queued, and manual replies still work. You can upgrade your plan at any time to instantly restore auto-replies. Unused quota does not roll over month to month.",
  },
  {
    q: "How is ChannelOS different from TubeBuddy or VidIQ?",
    a: "TubeBuddy and VidIQ are great SEO tools but have no AI comment auto-reply. CommentShark does comment replies but nothing else — and costs $20/mo for that one feature alone. ChannelOS gives you AI comment auto-reply, video scheduling, SEO tools, thumbnail A/B testing, and analytics all in one — starting at $7/month, less than what any single competitor charges for just one of those jobs.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. We offer a 14-day money-back guarantee on all paid plans, no questions asked. Cancel within 14 days of your first payment for a full refund.",
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(),
        r4 = useReveal(), r5 = useReveal(), r6 = useReveal(),
        r7 = useReveal(), r8 = useReveal();

  useEffect(() => {
    // Add schema for FAQPage
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQS.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <>
      <Navbar />

      <main className="grid-bg noise">

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/8 blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold text-accent tracking-wide uppercase">All-in-One YouTube Channel OS</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  Your YouTube<br />
                  Channel,{" "}
                  <span className="text-gradient">Automated.</span>
                </h1>

                <p className="text-lg text-text-2 leading-relaxed mb-8 max-w-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  AI comment auto-reply, smart video scheduler, SEO keyword tools, thumbnail A/B tests, and analytics — all in one place. Replace 4 tools with one, starting at $7/month.
                </p>

                <div className="flex flex-wrap gap-3 mb-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-6 py-3 rounded-xl transition-all glow-accent-sm hover:scale-[1.02] active:scale-[0.98]">
                    Start for Free
                    <Icon d={icons.arrow} size={16} />
                  </Link>
                  <a href="#how"
                    className="inline-flex items-center gap-2 glass text-text-2 hover:text-white font-semibold px-6 py-3 rounded-xl transition-all border border-border/80">
                    See How It Works
                  </a>
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap gap-5 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                  {[
                    { label: "Channels connected", val: "2,400+" },
                    { label: "AI replies sent",     val: "1.2M+" },
                    { label: "Avg time saved/week", val: "6 hrs" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-white font-bold text-lg leading-tight">{s.val}</p>
                      <p className="text-muted text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero mock */}
              <div className="flex justify-center lg:justify-end">
                <HeroMock />
              </div>
            </div>
          </div>
        </section>

        {/* ── CONSOLIDATION BAR ────────────────────────────────────────── */}
        <section className="border-y border-border/50 py-10 bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs text-muted uppercase tracking-[0.2em] font-semibold mb-6">Replace all of these</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["TubeBuddy $23+/mo", "VidIQ $39+/mo", "CommentShark $20/mo", "Morningfame $13/mo"].map((t) => (
                <div key={t} className="text-xs text-muted line-through bg-surface-2/50 border border-border/50 rounded-lg px-3 py-2 font-medium">
                  {t}
                </div>
              ))}
              <span className="text-muted font-bold text-lg mx-2">=</span>
              <div className="text-sm font-bold text-accent bg-accent/10 border border-accent/30 rounded-lg px-4 py-2">
                $95+/mo stacked
              </div>
              <span className="text-muted font-bold text-lg mx-2">→</span>
              <div className="text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-2 rounded-lg px-4 py-2 glow-accent-sm">
                ChannelOS Pro · $19/mo
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────────────── */}
        <div ref={r1} className="reveal py-16 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
              {[
                { num: 90, suffix: "%", label: "of creators report burnout — driven by admin, not content" },
                { num: 71, suffix: "%", label: "have considered quitting YouTube entirely" },
                { num: 5,  suffix: "+", label: "separate tools the average creator juggles today" },
                { num: 95, suffix: "$", label: "stacking YouTube tools — before ChannelOS", prefix: true },
              ].map((s, i) => (
                <div key={i} className="bg-surface/60 px-6 py-8 text-center">
                  <p className="text-4xl font-black text-white mb-2">
                    {s.prefix && <span className="text-2xl text-muted">$</span>}
                    <Counter target={s.num} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-muted leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="py-24 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div ref={r2} className="reveal text-center mb-16">
              <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-3">Everything You Need</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                Five tools. <span className="text-gradient">One platform.</span>
              </h2>
              <p className="text-text-2 text-lg max-w-xl mx-auto">
                Every feature a serious YouTube creator or agency needs — built deep, not bolted on.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <div key={f.title} ref={i === 0 ? r3 : undefined}
                  className={`reveal reveal-delay-${Math.min(i + 1, 5)} glass rounded-2xl p-6 border border-border/60 hover:border-${f.color === "accent" ? "accent" : f.color}/30 transition-all group hover:scale-[1.01]`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg[f.color]}`}>
                    <Icon d={f.icon} size={18} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-text-2 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorMap[f.color]}`}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <a href="#comparison" className="text-sm text-muted hover:text-white transition-colors inline-flex items-center gap-1.5">
                Compare with competitors <Icon d={icons.arrow} size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section id="how" className="py-24 scroll-mt-20 bg-surface/20 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div ref={r4} className="reveal text-center mb-16">
              <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-3">Setup in Minutes</p>
              <h2 className="text-4xl font-black tracking-tight text-white">Connect. Configure. <span className="text-gradient">Automate.</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector lines (desktop) */}
              <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-accent/30 via-accent/60 to-accent/30" />

              {[
                {
                  step: "01", title: "Connect Your Channel",
                  desc: "Click 'Connect YouTube'. Google's OAuth flow handles authentication securely. Done in 30 seconds — no API key setup, no manual tokens.",
                  icon: icons.play, color: "accent",
                },
                {
                  step: "02", title: "Configure Your Preferences",
                  desc: "Tell us your AI voice, upload schedule, SEO targets, and comment rules. One-time setup that takes about 5 minutes.",
                  icon: icons.zap, color: "gold",
                },
                {
                  step: "03", title: "Watch It Work",
                  desc: "Comments get answered, videos go live on schedule, SEO gaps get flagged, and your dashboard shows real-time performance.",
                  icon: icons.trending, color: "emerald",
                },
              ].map((s) => (
                <div key={s.step} className="text-center relative">
                  <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center ${iconBg[s.color]} relative z-10`}>
                    <Icon d={s.icon} size={28} />
                  </div>
                  <div className="text-[10px] font-black text-muted tracking-[0.2em] mb-2">{s.step}</div>
                  <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                  <p className="text-text-2 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-6 py-3 rounded-xl transition-all glow-accent-sm">
                Connect My Channel <Icon d={icons.arrow} size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── COMPARISON ───────────────────────────────────────────────── */}
        <section id="comparison" className="py-24 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div ref={r5} className="reveal text-center mb-14">
              <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-3">Competitive Analysis</p>
              <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                One platform vs. <span className="text-gradient">the fragmented stack</span>
              </h2>
              <p className="text-text-2 text-lg max-w-xl mx-auto">
                Every competitor solves one problem well. We solve all six.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="bg-surface/80 border-b border-border/50">
                    <th className="text-left px-5 py-4 text-xs text-muted uppercase tracking-widest font-semibold">Tool</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">Price/mo</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">Comments</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">Schedule</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">SEO</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">A/B Test</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">Analytics+</th>
                    <th className="px-4 py-4 text-xs text-muted uppercase tracking-widest font-semibold text-center">Repurpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "TubeBuddy",    price: "$23+", c: false, s: true,  seo: true,  ab: true,  an: true,  r: false, us: false },
                    { name: "VidIQ",        price: "$39+", c: false, s: false, seo: true,  ab: false, an: true,  r: false, us: false },
                    { name: "CommentShark", price: "$20",  c: true,  s: false, seo: false, ab: false, an: false, r: false, us: false },
                    { name: "NapoleonCat",  price: "$27+", c: true,  s: true,  seo: false, ab: false, an: true,  r: false, us: false },
                    { name: "Morningfame",  price: "$13",  c: false, s: false, seo: true,  ab: false, an: true,  r: false, us: false },
                    { name: "ChannelOS Pro",price: "$19",  c: true,  s: true,  seo: true,  ab: true,  an: true,  r: true,  us: true  },
                  ].map((row) => {
                    const checks = [row.c, row.s, row.seo, row.ab, row.an, row.r];
                    return (
                      <tr key={row.name} className={`border-b border-border/30 transition-colors ${
                        row.us ? "bg-accent/8 border-b-accent/30" : "hover:bg-surface/40"
                      }`}>
                        <td className={`px-5 py-3.5 font-semibold ${row.us ? "text-accent" : "text-white"}`}>
                          {row.name}
                          {row.us && <span className="ml-2 text-[9px] bg-accent text-white px-1.5 py-0.5 rounded font-bold uppercase">Us</span>}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-white text-[13px]">{row.price}</td>
                        {checks.map((c, i) => (
                          <td key={i} className="px-4 py-3.5 text-center">
                            {c
                              ? <span className="text-emerald text-base font-bold">✓</span>
                              : <span className="text-border text-base">–</span>
                            }
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted text-center mt-4">Prices shown are entry/mid-tier monthly plans as of August 2026. TubeBuddy Legend; VidIQ Boost; CommentShark Pro; NapoleonCat Standard.</p>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 scroll-mt-20 bg-surface/20 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div ref={r6} className="reveal text-center mb-12">
              <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-3">Pricing</p>
              <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                Simple pricing. <span className="text-gradient">No surprises.</span>
              </h2>
              <p className="text-text-2 text-lg mb-8">All plans include a 14-day money-back guarantee.</p>

              {/* Toggle */}
              <div className="inline-flex items-center gap-3 bg-surface border border-border rounded-xl p-1">
                <button onClick={() => setAnnual(false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!annual ? "bg-accent text-white" : "text-muted hover:text-white"}`}>
                  Monthly
                </button>
                <button onClick={() => setAnnual(true)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "bg-accent text-white" : "text-muted hover:text-white"}`}>
                  Annual
                  <span className="text-[10px] bg-emerald/20 text-emerald px-1.5 rounded font-bold">-20%</span>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PLANS.map((p) => (
                <div key={p.name}
                  className={`relative rounded-2xl p-5 flex flex-col gap-4 transition-all ${
                    p.rec
                      ? "bg-gradient-to-b from-accent/15 to-surface border border-accent/50 glow-accent scale-[1.02]"
                      : "glass border border-border/60 hover:border-border"
                  }`}>
                  {p.rec && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <p className="text-xs text-muted uppercase tracking-widest font-bold mb-2">{p.name}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-white">${annual ? p.price.yr : p.price.mo}</span>
                      <span className="text-muted text-sm mb-1">/mo</span>
                    </div>
                    {annual && p.price.mo > 0 && (
                      <p className="text-[10px] text-emerald mt-0.5">Save ${(p.price.mo - p.price.yr) * 12}/yr</p>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-4 flex-1">
                    <ul className="space-y-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-text-2">
                          <Icon d={icons.check} size={13} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/signup"
                    className={`block text-center text-sm font-bold py-2.5 rounded-xl transition-all ${
                      p.rec
                        ? "bg-accent hover:bg-accent-2 text-white glow-accent-sm"
                        : "bg-surface-3 hover:bg-border/60 text-white border border-border/60"
                    }`}>
                    {p.price.mo === 0 ? "Start Free" : "Get Started"}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted mt-8">
              Need a custom plan for a large team? <Link href="mailto:hello@channelosapp.com" className="text-accent hover:underline">Contact us →</Link>
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div ref={r7} className="reveal text-center mb-14">
              <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-3">FAQ</p>
              <h2 className="text-4xl font-black tracking-tight text-white">
                Common questions, <span className="text-gradient">straight answers.</span>
              </h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((f, i) => (
                <div key={i} className="glass rounded-xl border border-border/60 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors">
                    <span className="text-sm font-semibold text-white leading-snug">{f.q}</span>
                    <Icon d={icons.chevron} size={16}
                      className={`text-muted flex-shrink-0 mt-0.5 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96" : "max-h-0"}`}>
                    <p className="text-sm text-text-2 leading-relaxed px-5 pb-5">{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-border/40">
          <div ref={r8} className="reveal max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-accent/50 via-transparent to-gold/30 rounded-3xl" />
              <div className="relative glass rounded-3xl border border-border/60 p-16">
                <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-4">Get Started Today</p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-5">
                  Stop managing.<br />
                  <span className="text-gradient">Start growing.</span>
                </h2>
                <p className="text-text-2 text-lg mb-8 max-w-lg mx-auto">
                  Connect your first channel in 30 seconds. Free plan includes 30 AI auto-replies and 3 scheduled uploads — no credit card required.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-all glow-accent hover:scale-[1.02]">
                    Connect My YouTube Channel
                    <Icon d={icons.arrow} size={18} />
                  </Link>
                </div>
                <p className="text-muted text-sm mt-4">Free forever · No credit card · 14-day money-back on paid plans</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
