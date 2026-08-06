"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { YoutubeChannel, ScheduledVideo } from "@/types/database";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  draft:      "bg-border text-muted",
  scheduled:  "bg-blue-400/15 text-blue-400",
  uploading:  "bg-gold/15 text-gold",
  published:  "bg-emerald/15 text-emerald",
  failed:     "bg-accent/15 text-accent",
};

export default function SchedulerPage() {
  const [channels,  setChannels]  = useState<YoutubeChannel[]>([]);
  const [videos,    setVideos]    = useState<ScheduledVideo[]>([]);
  const [selected,  setSelected]  = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", tags: "", privacy_status: "public" as const,
    scheduled_at: "", video_file_url: "", thumbnail_url: "",
  });

  function loadVideos() {
    fetch("/api/scheduler").then((r) => r.json()).then(({ videos: vids }) => setVideos(vids || []));
  }

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then(({ channels: chs }) => {
        const active = (chs || []).filter((c: YoutubeChannel) => c.is_active);
        setChannels(active);
        if (active.length) setSelected(active[0].id);
      });
    loadVideos();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/scheduler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel_id:     selected,
        title:          form.title,
        description:    form.description,
        tags:           form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        privacy_status: form.privacy_status,
        scheduled_at:   new Date(form.scheduled_at).toISOString(),
        video_file_url: form.video_file_url || null,
        thumbnail_url:  form.thumbnail_url  || null,
      }),
    });
    loadVideos();
    setShowForm(false);
    setSaving(false);
    setForm({ title: "", description: "", tags: "", privacy_status: "public", scheduled_at: "", video_file_url: "", thumbnail_url: "" });
  }

  async function deleteVideo(id: string) {
    await fetch("/api/scheduler", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setVideos((p) => p.filter((v) => v.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Scheduler</h1>
          <p className="text-muted text-sm mt-1">Queue videos to publish automatically at the perfect time.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all glow-accent-sm">
          + Schedule Video
        </button>
      </div>

      {/* Schedule video form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-border/70 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-black text-white mb-5">Schedule a Video</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Channel</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
                  {channels.map((c) => <option key={c.id} value={c.id}>{c.channel_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Title *</label>
                <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none"
                  placeholder="Your video title..." />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none resize-none"
                  placeholder="Video description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Tags (comma-sep)</label>
                  <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none"
                    placeholder="tag1, tag2, tag3" />
                </div>
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Privacy</label>
                  <select value={form.privacy_status} onChange={(e) => setForm((p) => ({ ...p, privacy_status: e.target.value as any }))}
                    className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Publish Date & Time *</label>
                <input required type="datetime-local" value={form.scheduled_at}
                  onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Video URL (Google Drive / direct link)</label>
                <input type="url" value={form.video_file_url} onChange={(e) => setForm((p) => ({ ...p, video_file_url: e.target.value }))}
                  className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none"
                  placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-accent hover:bg-accent-2 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {saving ? "Saving..." : "Schedule Video"}
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

      {/* Upcoming videos */}
      {videos.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border/50 rounded-2xl">
          <span className="text-4xl mb-4 block">📅</span>
          <p className="text-white font-bold mb-1">No videos scheduled</p>
          <p className="text-muted text-sm mb-5">Schedule your first video and we'll publish it automatically.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-5 py-2.5 rounded-xl transition-all">
            Schedule Video
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="bg-surface border border-border/60 rounded-2xl p-5 flex gap-4 items-start">
              {v.thumbnail_url
                ? <img src={v.thumbnail_url} alt={v.title} className="w-24 h-14 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-24 h-14 bg-surface-2 rounded-xl flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm leading-tight">{v.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[v.status]}`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {format(new Date(v.scheduled_at), "MMM d, yyyy 'at' h:mm a")} · {v.privacy_status}
                </p>
                {v.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {v.tags.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-surface-2 border border-border/60 px-2 py-0.5 rounded text-muted">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => deleteVideo(v.id)}
                className="text-xs text-muted hover:text-accent transition-colors flex-shrink-0 mt-0.5">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
