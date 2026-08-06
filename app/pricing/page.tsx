"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Minus } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

const PLANS = [
  {
    name: "Free",
    tagline: "Try everything — no card needed",
    price: { mo: 0, yr: 0 },
    recommended: false,
    features: [
      "1 YouTube channel",
      "30 AI comment auto-replies / mo",
      "3 scheduled uploads / mo",
      "Basic SEO tools",
      "Analytics dashboard",
    ],
  },
  {
    name: "Starter",
    tagline: "Solo creators getting serious",
    price: { mo: 7, yr: 5 },
    recommended: false,
    features: [
      "1 YouTube channel",
      "250 AI comment auto-replies / mo",
      "Unlimited scheduling",
      "Full SEO + keyword research",
      "Full analytics dashboard",
      "Email support",
    ],
  },
  {
    name: "Pro",
    tagline: "Most popular for active creators",
    price: { mo: 19, yr: 15 },
    recommended: true,
    features: [
      "3 YouTube channels",
      "1,000 AI comment auto-replies / mo",
      "Thumbnail A/B testing",
      "Advanced SEO optimization",
      "Priority email support",
    ],
  },
  {
    name: "Agency",
    tagline: "Managing clients at scale",
    price: { mo: 49, yr: 39 },
    recommended: false,
    features: [
      "10 YouTube channels",
      "Unlimited AI comment replies",
      "3 team seats",
      "Bulk scheduling",
      "Dedicated support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Custom setup for large orgs",
    price: { mo: 99, yr: 79 },
    recommended: false,
    features: [
      "Unlimited channels",
      "Unlimited AI replies",
      "10 team seats",
      "Custom onboarding",
      "Dedicated account manager",
    ],
  },
];

const COMPARE_FEATURES = [
  "AI comment auto-replies / mo",
  "YouTube channels",
  "Video scheduling",
  "SEO tools",
  "Thumbnail A/B testing",
  "Team seats",
  "Priority support",
];

const COMPARE_DATA: Record<string, (string | boolean)[]> = {
  Free:       ["30",        "1",  true,  "Basic",   false, false, false],
  Starter:    ["250",       "1",  true,  true,      false, false, false],
  Pro:        ["1,000",     "3",  true,  true,      true,  false, true ],
  Agency:     ["Unlimited", "10", true,  true,      true,  "3",   true ],
  Enterprise: ["Unlimited", "∞",  true,  true,      true,  "10",  true ],
};

const FAQS = [
  {
    q: "What's included in the free plan?",
    a: "The free plan gives you 1 connected channel, 30 AI comment auto-replies per month, 3 scheduled uploads, and basic SEO tools. No time limit and no credit card required — use it as long as you like.",
  },
  {
    q: "How does AI comment auto-reply work?",
    a: "You set keyword rules — for example, any comment containing 'price' or 'tutorial'. When a new comment on your video matches a rule, ChannelOS uses AI to write a contextual, on-brand reply and posts it automatically. You can also set a fallback template for comments that don't match any rule.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade, downgrade, or cancel any time from your account settings. Upgrades take effect immediately (prorated). Downgrades kick in at the end of your billing period.",
  },
  {
    q: "What happens when I hit my AI reply limit?",
    a: "Auto-replies pause for the rest of the month — your comments are still collected, and you can reply manually. Upgrade any time to instantly restore auto-replies. Unused quota does not roll over.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. All paid plans come with a 14-day money-back guarantee, no questions asked.",
  },
  {
    q: "Is annual billing really cheaper?",
    a: "Yes — Starter drops from $7/mo to $5/mo on annual billing ($60/yr vs $84/yr). Pro drops from $19 to $15/mo. Same features, billed once per year.",
  },
  {
    q: "Can I connect multiple YouTube channels?",
    a: "Yes. Free and Starter support 1 channel. Pro supports 3 channels. Agency supports 10. Enterprise is unlimited — all under one login.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      <main className="grid-bg noise min-h-screen pt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/3 w-[600px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        {/* Hero */}
        <section className="relative py-24 px-4 sm:px-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold text-accent tracking-wide uppercase">Pricing</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-5 text-white">
            Simple pricing.<br />
            <span className="text-gradient">No surprises.</span>
          </h1>

          <p className="text-xl text-text-2 mb-10">
            Every plan includes a 14-day money-back guarantee. Start free — no credit card required.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-surface border border-border/60 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!annual ? "bg-accent text-white" : "text-muted hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "bg-accent text-white" : "text-muted hover:text-white"}`}
            >
              Annual
              <span className="text-[10px] bg-emerald/20 text-emerald px-1.5 py-0.5 rounded font-bold">Save 20%</span>
            </button>
          </div>
        </section>

        {/* Plans */}
        <section className="pb-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`relative rounded-2xl p-5 flex flex-col gap-5 transition-all ${
                    p.recommended
                      ? "bg-gradient-to-b from-accent/12 to-surface border border-accent/50 shadow-lg shadow-accent/10"
                      : "glass border border-border/60 hover:border-border"
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-1">{p.name}</p>
                    <p className="text-xs text-text-2 mb-3">{p.tagline}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">${annual ? p.price.yr : p.price.mo}</span>
                      <span className="text-muted text-sm mb-1.5">/mo</span>
                    </div>
                    {annual && p.price.mo > 0 && (
                      <p className="text-[11px] text-emerald mt-1">
                        Billed as ${(p.price.yr * 12)} /yr — save ${(p.price.mo - p.price.yr) * 12}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-4 flex-1">
                    <ul className="space-y-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-xs text-text-2">
                          <Check size={13} className="text-emerald flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={p.price.mo === 0 ? "/signup" : "/signup"}
                    className={`block text-center text-sm font-bold py-2.5 rounded-xl transition-all ${
                      p.recommended
                        ? "bg-accent hover:bg-accent-2 text-white glow-accent-sm"
                        : "bg-surface-3 hover:bg-border/60 text-white border border-border/60"
                    }`}
                  >
                    {p.price.mo === 0 ? "Start Free" : "Get Started"}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted mt-8">
              Need a custom volume deal?{" "}
              <Link href="mailto:hello@channelosapp.com" className="text-accent hover:underline">
                Contact us →
              </Link>
            </p>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="py-20 border-t border-border/40 bg-surface/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-3">What's included</h2>
              <p className="text-text-2">Full feature breakdown across every plan.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/50">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-surface/80 border-b border-border/50">
                    <th className="text-left px-5 py-4 text-xs text-muted uppercase tracking-widest font-semibold w-[35%]">Feature</th>
                    {PLANS.map((p) => (
                      <th key={p.name} className={`px-4 py-4 text-xs uppercase tracking-widest font-semibold text-center ${p.recommended ? "text-accent" : "text-muted"}`}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FEATURES.map((feat, fi) => (
                    <tr key={feat} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-text-2 font-medium text-xs">{feat}</td>
                      {PLANS.map((p) => {
                        const val = COMPARE_DATA[p.name]?.[fi];
                        return (
                          <td key={p.name} className="px-4 py-3.5 text-center">
                            {val === true  && <Check  size={15} className="inline text-emerald" />}
                            {val === false && <Minus  size={15} className="inline text-border" />}
                            {typeof val === "string" && <span className="text-xs font-bold text-white">{val}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-3">
                Billing questions,{" "}
                <span className="text-gradient">answered.</span>
              </h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((f, i) => (
                <div key={i} className="glass rounded-xl border border-border/60 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-semibold text-white leading-snug">{f.q}</span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                      className={`text-muted flex-shrink-0 mt-0.5 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-accent" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-72" : "max-h-0"}`}>
                    <p className="text-sm text-text-2 leading-relaxed px-5 pb-5">{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-15 bg-gradient-to-r from-accent/50 via-transparent to-gold/20 rounded-3xl" />
              <div className="relative glass rounded-3xl border border-border/60 p-14">
                <h2 className="text-4xl font-black text-white mb-4">
                  Start free today.
                </h2>
                <p className="text-text-2 text-lg mb-8 max-w-lg mx-auto">
                  30 AI auto-replies, 3 scheduled uploads, SEO tools — no credit card, no time limit.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-8 py-4 rounded-xl transition-all glow-accent-sm text-base"
                >
                  Connect My Channel <ArrowRight size={18} />
                </Link>
                <p className="text-muted text-sm mt-5">
                  Free forever · 14-day money-back on paid plans · Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
