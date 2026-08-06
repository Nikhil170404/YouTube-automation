"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import type { YoutubeChannel, ThumbnailTest } from "@/types/database";

export default function ThumbnailsPage() {
  const [channels, setChannels] = useState<YoutubeChannel[]>([]);
  const [selected, setSelected] = useState("");
  const [tests,    setTests]    = useState<ThumbnailTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    video_id: "", variant_a_url: "", variant_b_url: "", test_duration_hours: 24,
  });

  function loadTests() {
    fetch("/api/thumbnails").then((r) => r.json()).then(({ tests: ts }) => setTests(ts || []));
  }

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then(({ channels: chs }) => {
        const active = (chs || []).filter((c: YoutubeChannel) => c.is_active);
        setChannels(active);
        if (active.length) setSelected(active[0].id);
      });
    loadTests();
  }, []);

  async function startTest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/thumbnails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel_id:    selected,
        video_id:      form.video_id,
        variant_a_url: form.variant_a_url,
        variant_b_url: form.variant_b_url,
      }),
    });
    loadTests();
    setShowForm(false);
    setSaving(false);
    setForm({ video_id: "", variant_a_url: "", variant_b_url: "", test_duration_hours: 24 });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      running:   "bg-blue-400/15 text-blue-400",
      completed: "bg-emerald/15 text-emerald",
      paused:    "bg-border text-muted",
    };
    return `text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${map[status] || "bg-border text-muted"}`;
  }

  function winnerLabel(t: ThumbnailTest) {
    if (t.status !== "completed" || t.winner === null) return null;
    return t.winner === "a" ? "Thumbnail A wins" : "Thumbnail B wins";
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
                <input required type="url" value={form.variant_a_url} onChange={(e) => setForm((p) => ({ ...p, variant_a_url: e.target.value }))}
                  placeholder="https://... (publicly accessible image)"
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Thumbnail B URL *</label>
                <input required type="url" value={form.variant_b_url} onChange={(e) => setForm((p) => ({ ...p, variant_b_url: e.target.value }))}
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
            const ctrA = t.variant_a_ctr != null ? (t.variant_a_ctr * 100).toFixed(1) : "—";
            const ctrB = t.variant_b_ctr != null ? (t.variant_b_ctr * 100).toFixed(1) : "—";
            const w = winnerLabel(t);
            return (
              <div key={t.id} className="bg-surface border border-border/60 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div>
                    <p className="text-xs text-muted font-mono mb-1">Video ID: {t.video_id}</p>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(t.status)}>{t.status}</span>
                      {t.ended_at && (
                        <span className="text-[10px] text-muted">
                          Ended {formatRelativeTime(t.ended_at)}
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
                  <div className={`rounded-xl overflow-hidden border-2 transition-colors ${t.winner === "a" ? "border-emerald/50" : "border-border/40"}`}>
                    {t.variant_a_url
                      ? <img src={t.variant_a_url} alt="Thumbnail A" className="w-full aspect-video object-cover" />
                      : <div className="w-full aspect-video bg-surface-2 flex items-center justify-center">
                          <span className="text-muted text-xs">Thumbnail A</span>
                        </div>
                    }
                    <div className="p-3 bg-surface-2/50">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Variant A</p>
                      <p className="text-sm font-black text-white">{ctrA}{ctrA !== "—" ? "%" : ""} <span className="text-[10px] text-muted font-normal">CTR</span></p>
                    </div>
                  </div>

                  {/* Thumbnail B */}
                  <div className={`rounded-xl overflow-hidden border-2 transition-colors ${t.winner === "b" ? "border-emerald/50" : "border-border/40"}`}>
                    {t.variant_b_url
                      ? <img src={t.variant_b_url} alt="Thumbnail B" className="w-full aspect-video object-cover" />
                      : <div className="w-full aspect-video bg-surface-2 flex items-center justify-center">
                          <span className="text-muted text-xs">Thumbnail B</span>
                        </div>
                    }
                    <div className="p-3 bg-surface-2/50">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Variant B</p>
                      <p className="text-sm font-black text-white">{ctrB}{ctrB !== "—" ? "%" : ""} <span className="text-[10px] text-muted font-normal">CTR</span></p>
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
