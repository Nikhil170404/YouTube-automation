"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import type { YoutubeChannel } from "@/types/database";
import type { YTComment } from "@/types/youtube";

export default function CommentsPage() {
  const [channels,  setChannels]  = useState<YoutubeChannel[]>([]);
  const [selected,  setSelected]  = useState<string>("");
  const [comments,  setComments]  = useState<YTComment[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [replying,  setReplying]  = useState<string | null>(null);
  const [editText,  setEditText]  = useState<Record<string, string>>({});
  const [status,    setStatus]    = useState("");
  const [aiContext, setAiContext]  = useState("");
  const [autoMode,  setAutoMode]  = useState(false);
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

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/youtube/comments?channelId=${selected}`)
      .then((r) => r.json())
      .then(({ comments }) => { setComments(comments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selected]);

  async function generateReply(comment: YTComment) {
    setReplying(comment.id);
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
    const { reply } = await res.json();
    setEditText((p) => ({ ...p, [comment.id]: reply }));
    setReplying(null);
  }

  async function sendReply(comment: YTComment, useAI: boolean) {
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Comments</h1>
          <p className="text-muted text-sm mt-1">AI-powered replies to keep your audience engaged.</p>
        </div>
        {status && <span className="text-emerald text-sm font-semibold bg-emerald/10 border border-emerald/25 px-3 py-1.5 rounded-lg">{status}</span>}
      </div>

      {/* Channel selector + AI config */}
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
            placeholder="e.g. Friendly tech YouTuber, uses casual tone..."
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
          <p className="text-muted text-sm">No unreplied comments found. Check back after your next upload.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bulk AI reply button */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted">{comments.length} unreplied comments</p>
            <button
              className="text-xs font-semibold bg-accent/15 hover:bg-accent/25 text-accent px-4 py-2 rounded-lg border border-accent/25 transition-all">
              🤖 Auto-reply all with AI
            </button>
          </div>

          {comments.map((c) => (
            <div key={c.id} className="bg-surface border border-border/60 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                {c.authorProfileUrl
                  ? <img src={c.authorProfileUrl} alt={c.authorName} className="w-9 h-9 rounded-full flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.authorName[0]}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{c.authorName}</span>
                    <span className="text-xs text-muted">{formatRelativeTime(c.publishedAt)}</span>
                  </div>
                  <p className="text-sm text-text-2 leading-relaxed">{c.text}</p>
                </div>
              </div>

              {/* Reply area */}
              <div className="ml-12 space-y-2">
                <textarea
                  value={editText[c.id] || ""}
                  onChange={(e) => setEditText((p) => ({ ...p, [c.id]: e.target.value }))}
                  placeholder="Write a reply, or click 'AI Draft' to generate one..."
                  rows={3}
                  className="w-full bg-surface-2/60 border border-border/60 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/40 focus:outline-none resize-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => generateReply(c)}
                    disabled={replying === c.id}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-accent/15 hover:bg-accent/25 text-accent px-3 py-2 rounded-lg border border-accent/25 transition-all disabled:opacity-50">
                    {replying === c.id ? "Generating..." : "✨ AI Draft"}
                  </button>
                  <button
                    onClick={() => sendReply(c, false)}
                    disabled={!editText[c.id]?.trim() || replying === c.id}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-emerald/15 hover:bg-emerald/25 text-emerald px-3 py-2 rounded-lg border border-emerald/25 transition-all disabled:opacity-50">
                    Send Reply
                  </button>
                  <button
                    onClick={() => setComments((p) => p.filter((x) => x.id !== c.id))}
                    className="text-xs text-muted hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all ml-auto">
                    Skip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
