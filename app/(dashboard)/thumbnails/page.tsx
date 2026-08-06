"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import type { YoutubeChannel } from "@/types/database";
import type { ThumbnailTest } from "@/types/database";

export default function ThumbnailsPage() {
  const [channels, setChannels] = useState<YoutubeChannel[]>([]);
  const [selected, setSelected] = useState("");
  const [tests,    setTests]    = useState<ThumbnailTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    video_id: "", thumbnail_a_url: "", thumbnail_b_url: "", test_duration_hours: 24,
  });
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: chs } = await supabase.from("youtube_channels").select("*").eq("user_id", user.id).eq("is_active", true);
      setChannels(chs || []);
      if (chs?.length) {
        setSelected(chs[0].id);
        const { data: ts } = await supabase.from("thumbnail_tests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        setTests(ts || []);
      }
    });
  }, []);

  async function startTest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + form.test_duration_hours);

    await supabase.from("thumbnail_tests").insert({
      channel_id:    selected,
      user_id:       user.id,
      video_id:      form.video_id,
      thumbnail_a_url: form.thumbnail_a_url,
      thumbnail_b_url: form.thumbnail_b_url,
      status:        "running",
      started_at:    new Date().toISOString(),
      ends_at:       endsAt.toISOString(),
    });

    const { data: ts } = await supabase.from("thumbnail_tests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTests(ts || []);
    setShowForm(false);
    setSaving(false);
    setForm({ video_id: "", thumbnail_a_url: "", thumbnail_b_url: "", test_duration_hours: 24 });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      running:   "bg-blue-400/15 text-blue-400",
      completed: "bg-emerald/15 text-emerald",
      paused:    "bg-border text-muted",
    };
    return `text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${map[status] || "bg-border text-muted"}`;
  }

  function winner(t: ThumbnailTest) {
    if (t.status !== "completed") return null;
    const ctrA = t.clicks_a && t.impressions_a ? t.clicks_a / t.impressions_a : 0;
    const ctrB = t.clicks_b && t.impressions_b ? t.clicks_b / t.impressions_b : 0;
    if (ctrA === ctrB) return "Tie";
    return ctrA > ctrB ? "Thumbnail A wins" : "Thumbnail B wins";
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">A/B Tests</h1>
          <p className="text-muted text-sm mt-1">Test two thumbnails head-to-head and let the data choose.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all glow-accent-sm">
          + New A/B Test
        </button>
      </div>

      {/* New test form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-border/70 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-black text-white mb-5">Start A/B Test</h2>
            <form onSubmit={startTest} className="space-y-4">
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Channel</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
                  {channels.map((c) => <option key={c.id} value={c.id}>{c.channel_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">YouTube Video ID *</label>
                <input required value={form.video_id} onChange={(e) => setForm((p) => ({ ...p, video_id: e.target.value }))}
                  placeholder="dQw4w9WgXcQ"
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
                <p className="text-[10px] text-muted mt-1">Find it in your YouTube Studio URL</p>
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Thumbnail A URL *</label>
                <input required type="url" value={form.thumbnail_a_url} onChange={(e) => setForm((p) => ({ ...p, thumbnail_a_url: e.target.value }))}
                  placeholder="https://... (publicly accessible image)"
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Thumbnail B URL *</label>
                <input required type="url" value={form.thumbnail_b_url} onChange={(e) => setForm((p) => ({ ...p, thumbnail_b_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Test Duration</label>
                <select value={form.test_duration_hours} onChange={(e) => setForm((p) => ({ ...p, test_duration_hours: Number(e.target.value) }))}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                </select>
              </div>
              <div className="bg-gold/10 border border-gold/25 rounded-xl p-3">
                <p className="text-xs text-gold">⚡ The system will alternate thumbnails every 6 hours and collect CTR data automatically.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-accent hover:bg-accent-2 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {saving ? "Starting..." : "Start Test"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-border/60 text-muted hover:text-white transition-all text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tests list */}
      {tests.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border/50 rounded-2xl">
          <span className="text-4xl mb-4 block">🖼️</span>
          <p className="text-white font-bold mb-1">No A/B tests yet</p>
          <p className="text-muted text-sm mb-5">Create your first thumbnail test to find what drives more clicks.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-5 py-2.5 rounded-xl transition-all">
            Start A/B Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((t) => {
            const ctrA = t.impressions_a ? ((t.clicks_a || 0) / t.impressions_a * 100).toFixed(1) : "—";
            const ctrB = t.impressions_b ? ((t.clicks_b || 0) / t.impressions_b * 100).toFixed(1) : "—";
            const w = winner(t);
            return (
              <div key={t.id} className="bg-surface border border-border/60 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div>
                    <p className="text-xs text-muted font-mono mb-1">Video ID: {t.video_id}</p>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(t.status)}>{t.status}</span>
                      {t.ends_at && (
                        <span className="text-[10px] text-muted">
                          {t.status === "running" ? `Ends ${formatRelativeTime(t.ends_at)}` : `Ended ${formatRelativeTime(t.ends_at)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  {w && (
                    <span className="text-xs font-bold text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1 rounded-lg flex-shrink-0">
                      🏆 {w}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Thumbnail A */}
                  <div className={`rounded-xl overflow-hidden border-2 transition-colors ${w === "Thumbnail A wins" ? "border-emerald/50" : "border-border/40"}`}>
                    {t.thumbnail_a_url
                      ? <img src={t.thumbnail_a_url} alt="Thumbnail A" className="w-full aspect-video object-cover" />
                      : <div className="w-full aspect-video bg-surface-2 flex items-center justify-center">
                          <span className="text-muted text-xs">Thumbnail A</span>
                        </div>
                    }
                    <div className="p-3 bg-surface-2/50">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Variant A</p>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm font-black text-white">{ctrA}%</p>
                          <p className="text-[10px] text-muted">CTR</p>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{(t.impressions_a || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted">Impressions</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail B */}
                  <div className={`rounded-xl overflow-hidden border-2 transition-colors ${w === "Thumbnail B wins" ? "border-emerald/50" : "border-border/40"}`}>
                    {t.thumbnail_b_url
                      ? <img src={t.thumbnail_b_url} alt="Thumbnail B" className="w-full aspect-video object-cover" />
                      : <div className="w-full aspect-video bg-surface-2 flex items-center justify-center">
                          <span className="text-muted text-xs">Thumbnail B</span>
                        </div>
                    }
                    <div className="p-3 bg-surface-2/50">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Variant B</p>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm font-black text-white">{ctrB}%</p>
                          <p className="text-[10px] text-muted">CTR</p>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{(t.impressions_b || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted">Impressions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
