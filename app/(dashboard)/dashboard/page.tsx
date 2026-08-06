"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatNumber } from "@/lib/utils";
import type { YoutubeChannel } from "@/types/database";

function StatCard({ label, value, change, icon, color = "accent" }:
  { label: string; value: string; change?: string; icon: string; color?: string }) {
  return (
    <div className="bg-surface border border-border/60 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
          color === "accent"  ? "bg-accent/15 text-accent"   :
          color === "emerald" ? "bg-emerald/15 text-emerald" :
          color === "gold"    ? "bg-gold/15 text-gold"       :
          "bg-blue-400/15 text-blue-400"
        }`}>{icon}</div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {change && <p className="text-xs text-emerald mt-1 font-medium">{change}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [channels,   setChannels]   = useState<YoutubeChannel[]>([]);
  const [aiReplies,  setAiReplies]  = useState({ used: 0, limit: 30 });
  const [recentReplies, setRecent]  = useState<{ comment_author: string; reply_text: string; created_at: string }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: chs }, { data: profile }, { data: replies }] = await Promise.all([
        supabase.from("youtube_channels").select("*").eq("user_id", user.id).eq("is_active", true),
        supabase.from("profiles").select("ai_replies_used, ai_replies_limit").eq("id", user.id).single(),
        supabase.from("comment_replies").select("comment_author, reply_text, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      setChannels(chs || []);
      if (profile) setAiReplies({ used: profile.ai_replies_used, limit: profile.ai_replies_limit });
      setRecent(replies || []);
    };
    load();
  }, []);

  const aiPct = Math.min((aiReplies.used / aiReplies.limit) * 100, 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Overview</h1>
        <p className="text-muted text-sm mt-1">Your channel automation at a glance.</p>
      </div>

      {/* No channels CTA */}
      {channels.length === 0 && (
        <div className="bg-accent/8 border border-accent/25 rounded-2xl p-8 text-center">
          <div className="w-14 h-10 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="white"><polygon points="3,2 11,7 3,12"/></svg>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Connect your first YouTube channel</h2>
          <p className="text-text-2 text-sm mb-5">Takes 30 seconds. We'll handle the rest.</p>
          <Link href="/api/youtube/connect"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-5 py-2.5 rounded-xl transition-all">
            Connect YouTube Channel
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Channels"        value={channels.length.toString()} icon="📺" color="accent" />
        <StatCard label="AI Replies Today" value={aiReplies.used.toString()} change={`${aiReplies.limit - aiReplies.used} remaining`} icon="🤖" color="emerald" />
        <StatCard label="Videos Scheduled" value="—" icon="📅" color="gold" />
        <StatCard label="Total Replies Sent" value="—" icon="💬" color="blue" />
      </div>

      {/* AI quota */}
      <div className="bg-surface border border-border/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-white">AI Reply Quota</p>
            <p className="text-xs text-muted mt-0.5">{aiReplies.used} of {aiReplies.limit} used this month</p>
          </div>
          <Link href="/settings" className="text-xs text-accent hover:underline">Upgrade plan →</Link>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${aiPct > 85 ? "bg-accent" : "bg-emerald"}`}
            style={{ width: `${aiPct}%` }} />
        </div>
      </div>

      {/* Channels + recent replies */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Channels */}
        <div className="bg-surface border border-border/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-sm">Connected Channels</h2>
            <Link href="/channels" className="text-xs text-accent hover:underline">Manage →</Link>
          </div>
          {channels.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">No channels connected yet.</p>
          ) : (
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-center gap-3">
                  {ch.thumbnail_url
                    ? <img src={ch.thumbnail_url} alt={ch.channel_name} className="w-9 h-9 rounded-full object-cover" />
                    : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-gold" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ch.channel_name}</p>
                    <p className="text-xs text-muted">{formatNumber(ch.subscriber_count || 0)} subscribers</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${ch.is_active ? "bg-emerald" : "bg-muted"}`} />
                </div>
              ))}
            </div>
          )}
          <Link href="/api/youtube/connect"
            className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-muted hover:text-white border border-border/60 hover:border-border rounded-xl py-2.5 transition-all">
            + Add Channel
          </Link>
        </div>

        {/* Recent replies */}
        <div className="bg-surface border border-border/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-sm">Recent AI Replies</h2>
            <Link href="/comments" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          {recentReplies.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">No replies sent yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReplies.map((r, i) => (
                <div key={i} className="bg-surface-2/50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-text-2 mb-1">@{r.comment_author}</p>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">{r.reply_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-white text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/comments",  label: "Review Comments",   icon: "💬" },
            { href: "/scheduler", label: "Schedule Video",    icon: "📅" },
            { href: "/seo",       label: "Research Keywords", icon: "🔍" },
            { href: "/thumbnails",label: "Start A/B Test",    icon: "🖼️" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="bg-surface-2/60 hover:bg-surface-2 border border-border/60 rounded-xl p-4 text-center transition-all group">
              <span className="text-2xl mb-2 block">{a.icon}</span>
              <span className="text-xs font-semibold text-text-2 group-hover:text-white transition-colors">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
