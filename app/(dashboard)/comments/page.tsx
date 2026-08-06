"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import type { YoutubeChannel, CommentRule } from "@/types/database";
import type { YTComment } from "@/types/youtube";

const TABS = ["Inbox", "Automation Rules"] as const;
type Tab = typeof TABS[number];

const BLANK_RULE = {
  name: "", channel_id: "", trigger_keywords: "", reply_template: "",
  use_ai: true, ai_context: "", video_id: "",
};

export default function CommentsPage() {
  const [tab,       setTab]       = useState<Tab>("Inbox");
  const [channels,  setChannels]  = useState<YoutubeChannel[]>([]);
  const [selected,  setSelected]  = useState<string>("");
  const [comments,  setComments]  = useState<YTComment[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [replying,  setReplying]  = useState<string | null>(null);
  const [editText,  setEditText]  = useState<Record<string, string>>({});
  const [status,    setStatus]    = useState("");
  const [aiContext, setAiContext]  = useState("");

  // Rules state
  const [rules,     setRules]     = useState<CommentRule[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(BLANK_RULE);

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then(({ channels: chs }) => {
        const active = (chs || []).filter((c: YoutubeChannel) => c.is_active);
        setChannels(active);
        if (active.length) {
          setSelected(active[0].id);
          setForm((f) => ({ ...f, channel_id: active[0].id }));
        }
      });
    fetch("/api/comment-rules")
      .then((r) => r.json())
      .then(({ rules: rs }) => setRules(rs || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/youtube/comments?channelId=${selected}`)
      .then((r) => r.json())
      .then(({ comments: cs }) => { setComments(cs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selected]);

  async function generateReply(comment: YTComment) {
    setReplying(comment.id);
    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:       "generate_reply",
          comment:      comment.text,
          authorName:   comment.authorName,
          voiceContext: aiContext || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus(`AI error: ${data.error || "Request failed"}`);
        setTimeout(() => setStatus(""), 6000);
      } else {
        setEditText((p) => ({ ...p, [comment.id]: data.reply }));
      }
    } catch {
      setStatus("AI request failed — check your internet connection.");
      setTimeout(() => setStatus(""), 5000);
    } finally {
      setReplying(null);
    }
  }

  async function sendReply(comment: YTComment) {
    const text = editText[comment.id];
    if (!text?.trim()) return;
    setReplying(comment.id);
    const res = await fetch("/api/youtube/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId:   selected,
        commentId:   comment.id,
        commentText: comment.text,
        authorName:  comment.authorName,
        useAI:       false,
        replyText:   text,
      }),
    });
    if (res.ok) {
      setComments((p) => p.filter((c) => c.id !== comment.id));
      setStatus("Reply sent!");
      setTimeout(() => setStatus(""), 3000);
    }
    setReplying(null);
  }

  async function saveRule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      channel_id:       form.channel_id,
      name:             form.name,
      trigger_keywords: form.trigger_keywords.split(",").map((k) => k.trim()).filter(Boolean),
      reply_template:   form.use_ai ? null : form.reply_template,
      use_ai:           form.use_ai,
      ai_context:       form.ai_context || null,
      video_id:         form.video_id.trim() || null,
    };
    const res = await fetch("/api/comment-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.rule) setRules((p) => [data.rule, ...p]);
    setShowForm(false);
    setSaving(false);
    setForm(BLANK_RULE);
  }

  async function toggleRule(id: string, is_active: boolean) {
    await fetch("/api/comment-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !is_active }),
    });
    setRules((p) => p.map((r) => r.id === id ? { ...r, is_active: !is_active } : r));
  }

  async function deleteRule(id: string) {
    if (!confirm("Delete this rule?")) return;
    await fetch("/api/comment-rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRules((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Comments</h1>
          <p className="text-muted text-sm mt-1">AI-powered replies to keep your audience engaged.</p>
        </div>
        {status && (
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-lg border ${
            status.startsWith("AI error") || status.startsWith("AI request")
              ? "bg-accent/10 border-accent/25 text-accent"
              : "bg-emerald/10 border-emerald/25 text-emerald"
          }`}>{status}</span>
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

      {/* ── INBOX TAB ── */}
      {tab === "Inbox" && (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Channel</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}
                className="w-full bg-surface border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
                {channels.map((c) => <option key={c.id} value={c.id}>{c.channel_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">AI Voice / Context (optional)</label>
              <input value={aiContext} onChange={(e) => setAiContext(e.target.value)}
                placeholder="e.g. Friendly tech YouTuber, casual tone..."
                className="w-full bg-surface border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted text-sm">Fetching unreplied comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 bg-surface border border-border/50 rounded-2xl">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-white font-bold mb-1">All caught up!</p>
              <p className="text-muted text-sm">No unreplied comments found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted mb-2">{comments.length} unreplied comments</p>
              {comments.map((c) => (
                <div key={c.id} className="bg-surface border border-border/60 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {c.authorProfileUrl
                      ? <img src={c.authorProfileUrl} alt={c.authorName} className="w-9 h-9 rounded-full flex-shrink-0" />
                      : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{c.authorName[0]}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{c.authorName}</span>
                        <span className="text-xs text-muted">{formatRelativeTime(c.publishedAt)}</span>
                      </div>
                      <p className="text-sm text-text-2 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                  <div className="ml-12 space-y-2">
                    <textarea
                      value={editText[c.id] || ""}
                      onChange={(e) => setEditText((p) => ({ ...p, [c.id]: e.target.value }))}
                      placeholder="Write a reply, or click 'AI Draft' to generate one..."
                      rows={3}
                      className="w-full bg-surface-2/60 border border-border/60 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/40 focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => generateReply(c)} disabled={replying === c.id}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-accent/15 hover:bg-accent/25 text-accent px-3 py-2 rounded-lg border border-accent/25 transition-all disabled:opacity-50">
                        {replying === c.id ? "Generating..." : "✨ AI Draft"}
                      </button>
                      <button onClick={() => sendReply(c)}
                        disabled={!editText[c.id]?.trim() || replying === c.id}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald/15 hover:bg-emerald/25 text-emerald px-3 py-2 rounded-lg border border-emerald/25 transition-all disabled:opacity-50">
                        Send Reply
                      </button>
                      <button onClick={() => setComments((p) => p.filter((x) => x.id !== c.id))}
                        className="text-xs text-muted hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all ml-auto">
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── AUTOMATION RULES TAB ── */}
      {tab === "Automation Rules" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-white font-semibold">Auto-reply rules</p>
              <p className="text-xs text-muted mt-0.5">Rules run every 5 min via cron. Enable Auto-reply on a channel to activate.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
              + New Rule
            </button>
          </div>

          {/* How it works info */}
          <div className="bg-blue-400/8 border border-blue-400/20 rounded-xl p-4 mb-5 text-xs text-blue-400 space-y-1">
            <p className="font-bold">How rules work:</p>
            <p>• <strong>Trigger keywords</strong> — if the comment contains any of these words, the rule fires. Leave blank to match ALL comments (catch-all).</p>
            <p>• <strong>Video ID</strong> — optional. Limit the rule to one specific video (get the ID from the YouTube URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>).</p>
            <p>• <strong>Reply mode</strong> — AI generates a fresh reply each time, or use a fixed template.</p>
            <p>• Rules are checked in order. First match wins. Go to Channels → enable Auto-reply to start automation.</p>
          </div>

          {/* New rule form */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-surface border border-border/70 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-black text-white mb-5">New Automation Rule</h2>
                <form onSubmit={saveRule} className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Rule Name *</label>
                    <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Reply to price questions"
                      className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Channel *</label>
                    <select value={form.channel_id} onChange={(e) => setForm((f) => ({ ...f, channel_id: e.target.value }))}
                      className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
                      {channels.map((c) => <option key={c.id} value={c.id}>{c.channel_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">
                      Trigger Keywords <span className="normal-case text-muted/60">(comma separated — leave blank to match ALL comments)</span>
                    </label>
                    <input value={form.trigger_keywords} onChange={(e) => setForm((f) => ({ ...f, trigger_keywords: e.target.value }))}
                      placeholder="price, cost, how much, link, discount"
                      className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">
                      Video ID <span className="normal-case text-muted/60">(optional — leave blank for entire channel)</span>
                    </label>
                    <input value={form.video_id} onChange={(e) => setForm((f) => ({ ...f, video_id: e.target.value }))}
                      placeholder="dQw4w9WgXcQ"
                      className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Reply Mode</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setForm((f) => ({ ...f, use_ai: true }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.use_ai ? "bg-accent/15 text-accent border-accent/30" : "border-border/50 text-muted hover:text-white"}`}>
                        ✨ AI Generated
                      </button>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, use_ai: false }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${!form.use_ai ? "bg-emerald/15 text-emerald border-emerald/30" : "border-border/50 text-muted hover:text-white"}`}>
                        📝 Fixed Template
                      </button>
                    </div>
                  </div>
                  {form.use_ai ? (
                    <div>
                      <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">AI Context / Voice (optional)</label>
                      <textarea rows={2} value={form.ai_context} onChange={(e) => setForm((f) => ({ ...f, ai_context: e.target.value }))}
                        placeholder="e.g. Mention our link in bio for pricing. Keep it short and friendly."
                        className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none resize-none" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Reply Template *</label>
                      <textarea required={!form.use_ai} rows={3} value={form.reply_template}
                        onChange={(e) => setForm((f) => ({ ...f, reply_template: e.target.value }))}
                        placeholder="Thanks for asking! Check the link in our description for pricing 😊"
                        className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none resize-none" />
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-accent hover:bg-accent-2 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                      {saving ? "Saving..." : "Save Rule"}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setForm(BLANK_RULE); }}
                      className="px-4 py-2.5 rounded-xl border border-border/60 text-muted hover:text-white transition-all text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {rules.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border/50 rounded-2xl">
              <span className="text-4xl mb-4 block">🤖</span>
              <p className="text-white font-bold mb-1">No rules yet</p>
              <p className="text-muted text-sm mb-5">Create your first rule to start replying automatically.</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-5 py-2.5 rounded-xl transition-all">
                + New Rule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className={`bg-surface border rounded-2xl p-5 transition-all ${rule.is_active ? "border-border/60" : "border-border/30 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white text-sm">{rule.name}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rule.is_active ? "bg-emerald/15 text-emerald" : "bg-border text-muted"}`}>
                          {rule.is_active ? "Active" : "Paused"}
                        </span>
                        {rule.use_ai
                          ? <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-accent/15 text-accent">AI</span>
                          : <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-400">Template</span>
                        }
                        <span className="text-xs text-muted ml-auto">{rule.match_count} replies sent</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted">
                        {rule.trigger_keywords.length > 0
                          ? <span>Keywords: {rule.trigger_keywords.map((k) => <span key={k} className="bg-surface-2 border border-border/60 px-1.5 py-0.5 rounded text-text-2 mr-1">{k}</span>)}</span>
                          : <span className="text-gold">⚡ Catch-all (replies to every comment)</span>
                        }
                        {rule.video_id && <span>📹 Video: <code className="text-text-2">{rule.video_id}</code></span>}
                      </div>
                      {!rule.use_ai && rule.reply_template && (
                        <p className="text-xs text-muted mt-2 bg-surface-2/50 rounded-lg px-3 py-2 line-clamp-2">{rule.reply_template}</p>
                      )}
                      {rule.use_ai && rule.ai_context && (
                        <p className="text-xs text-muted mt-2 italic">AI context: {rule.ai_context}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => toggleRule(rule.id, rule.is_active)}
                        className="text-xs font-semibold text-muted hover:text-white px-3 py-1.5 rounded-lg border border-border/60 hover:border-border transition-all">
                        {rule.is_active ? "Pause" : "Resume"}
                      </button>
                      <button onClick={() => deleteRule(rule.id)}
                        className="text-xs font-semibold text-muted hover:text-accent px-3 py-1.5 rounded-lg border border-border/60 hover:border-accent/30 transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
