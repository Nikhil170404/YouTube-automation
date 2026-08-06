"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { YoutubeChannel } from "@/types/database";

type KeywordResult = { keyword: string; relevance: number };

const TABS = ["Keyword Research", "Title Optimizer", "Description Generator"] as const;
type Tab = typeof TABS[number];

export default function SeoPage() {
  const [channels,     setChannels]     = useState<YoutubeChannel[]>([]);
  const [selected,     setSelected]     = useState("");
  const [tab,          setTab]          = useState<Tab>("Keyword Research");
  const [loading,      setLoading]      = useState(false);
  const [kwQuery,      setKwQuery]      = useState("");
  const [kwResults,    setKwResults]    = useState<KeywordResult[]>([]);
  const [titleInput,   setTitleInput]   = useState("");
  const [titleKws,     setTitleKws]     = useState("");
  const [titleResults, setTitleResults] = useState<string[]>([]);
  const [descTitle,    setDescTitle]    = useState("");
  const [descKeyPoints,setDescKeyPoints]= useState("");
  const [descKws,      setDescKws]      = useState("");
  const [description,  setDescription]  = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: rows } = await supabase.from("youtube_channels").select("*").eq("user_id", user.id).eq("is_active", true);
      const channelList = (rows || []) as YoutubeChannel[];
      setChannels(channelList);
      if (channelList.length) setSelected(channelList[0].id);
    });
  }, []);

  async function searchKeywords() {
    if (!kwQuery.trim()) return;
    setLoading(true);
    const res = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "keyword_research", query: kwQuery }),
    });
    const data = await res.json();
    setKwResults(data.keywords || []);
    setLoading(false);
  }

  async function optimizeTitle() {
    if (!titleInput.trim()) return;
    setLoading(true);
    const res = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "optimize_title", title: titleInput, keywords: titleKws }),
    });
    const data = await res.json();
    setTitleResults(data.titles || []);
    setLoading(false);
  }

  async function generateDescription() {
    if (!descTitle.trim()) return;
    setLoading(true);
    const res = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_description",
        title: descTitle,
        keyPoints: descKeyPoints.split("\n").filter(Boolean),
        keywords: descKws,
        channelName: channels.find((c) => c.id === selected)?.channel_name || "",
      }),
    });
    const data = await res.json();
    setDescription(data.description || "");
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">SEO Tools</h1>
          <p className="text-muted text-sm mt-1">Optimize your videos to rank higher and reach more viewers.</p>
        </div>
        {channels.length > 1 && (
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            className="bg-surface border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
            {channels.map((c) => <option key={c.id} value={c.id}>{c.channel_name}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface border border-border/60 rounded-xl mb-6 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-accent text-white" : "text-muted hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Keyword Research */}
      {tab === "Keyword Research" && (
        <div className="space-y-5">
          <div className="bg-surface border border-border/60 rounded-2xl p-6">
            <h2 className="font-bold text-white text-sm mb-4">Find high-traffic keywords</h2>
            <div className="flex gap-3">
              <input
                value={kwQuery}
                onChange={(e) => setKwQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchKeywords()}
                placeholder="e.g. React tutorial, how to make money online..."
                className="flex-1 bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none"
              />
              <button onClick={searchKeywords} disabled={loading || !kwQuery.trim()}
                className="px-5 py-2.5 bg-accent hover:bg-accent-2 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                {loading ? "Searching..." : "🔍 Research"}
              </button>
            </div>
          </div>

          {kwResults.length > 0 && (
            <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-bold text-white text-sm">Keyword suggestions</h3>
              </div>
              <div className="divide-y divide-border/30">
                {kwResults.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted w-4">{i + 1}</span>
                      <button
                        onClick={() => navigator.clipboard?.writeText(kw.keyword)}
                        className="text-sm text-white font-medium hover:text-accent transition-colors text-left">
                        {kw.keyword}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${kw.relevance}%` }} />
                      </div>
                      <span className="text-xs text-muted w-8 text-right">{kw.relevance}%</span>
                      <button onClick={() => navigator.clipboard?.writeText(kw.keyword)}
                        className="text-[10px] text-muted hover:text-accent px-2 py-0.5 rounded border border-border/60 hover:border-accent/40 transition-all">
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Title Optimizer */}
      {tab === "Title Optimizer" && (
        <div className="space-y-5">
          <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-sm">Optimize your video title</h2>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Current Title</label>
              <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)}
                placeholder="How I Made $10,000 in One Month..."
                className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Target Keywords (optional)</label>
              <input value={titleKws} onChange={(e) => setTitleKws(e.target.value)}
                placeholder="passive income, make money online, side hustle"
                className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
            </div>
            <button onClick={optimizeTitle} disabled={loading || !titleInput.trim()}
              className="px-5 py-2.5 bg-accent hover:bg-accent-2 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
              {loading ? "Generating..." : "✨ Generate 5 Alternatives"}
            </button>
          </div>

          {titleResults.length > 0 && (
            <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-bold text-white text-sm">Optimized titles</h3>
              </div>
              <div className="divide-y divide-border/30">
                {titleResults.map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-bold text-accent w-5">{i + 1}</span>
                      <p className="text-sm text-white">{t}</p>
                    </div>
                    <button onClick={() => navigator.clipboard?.writeText(t)}
                      className="text-[10px] text-muted hover:text-accent px-2 py-0.5 rounded border border-border/60 hover:border-accent/40 transition-all flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description Generator */}
      {tab === "Description Generator" && (
        <div className="space-y-5">
          <div className="bg-surface border border-border/60 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-sm">Generate an SEO-optimized description</h2>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Video Title *</label>
              <input value={descTitle} onChange={(e) => setDescTitle(e.target.value)}
                placeholder="Video title..."
                className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Key Points (one per line)</label>
              <textarea rows={4} value={descKeyPoints} onChange={(e) => setDescKeyPoints(e.target.value)}
                placeholder={"- Main topic covered\n- Step 1 explained\n- Tools used"}
                className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Target Keywords</label>
              <input value={descKws} onChange={(e) => setDescKws(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
            </div>
            <button onClick={generateDescription} disabled={loading || !descTitle.trim()}
              className="px-5 py-2.5 bg-accent hover:bg-accent-2 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
              {loading ? "Generating..." : "✨ Generate Description"}
            </button>
          </div>

          {description && (
            <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <h3 className="font-bold text-white text-sm">Generated description</h3>
                <button onClick={() => navigator.clipboard?.writeText(description)}
                  className="text-xs text-accent hover:underline">Copy all</button>
              </div>
              <div className="p-5">
                <pre className="text-sm text-text-2 whitespace-pre-wrap leading-relaxed font-sans">{description}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
