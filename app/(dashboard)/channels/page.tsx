"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import type { YoutubeChannel } from "@/types/database";

function ChannelsContent() {
  const [channels, setChannels] = useState<YoutubeChannel[]>([]);
  const [loading,  setLoading]  = useState(true);
  const params = useSearchParams();
  const success = params.get("success");
  const error   = params.get("error");

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then(({ channels: data }) => {
        setChannels(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function disconnectChannel(id: string) {
    if (!confirm("Disconnect this channel? Auto-replies and scheduling for it will stop.")) return;
    await fetch("/api/channels", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: false }),
    });
    setChannels((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Channels</h1>
          <p className="text-muted text-sm mt-1">Manage your connected YouTube channels.</p>
        </div>
        <a href="/api/youtube/connect"
          className="flex items-center gap-2 bg-accent hover:bg-accent-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all glow-accent-sm">
          + Connect Channel
        </a>
      </div>

      {success === "channel_connected" && (
        <div className="bg-emerald/10 border border-emerald/30 rounded-xl p-4 mb-5 text-sm text-emerald">
          ✓ Channel connected successfully! Automation will begin within 15 minutes.
        </div>
      )}
      {error && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-5 text-sm text-accent">
          {error === "channel_limit_reached"  && "You've reached your channel limit. Upgrade your plan to add more channels."}
          {error === "youtube_auth_failed"    && "Google denied the connection. Please try again."}
          {error === "token_exchange_failed"  && "Failed to exchange Google auth code. Check that YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REDIRECT_URI are set in Vercel."}
          {error === "token_missing"          && "Google returned incomplete tokens. Please try again."}
          {error === "channel_fetch_failed"   && "Connected to Google but could not fetch your YouTube channel. Make sure your Google account has a YouTube channel."}
          {error === "db_init_failed"         && "Database connection failed. Check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel."}
          {error === "save_failed"            && "Connected successfully but failed to save the channel to the database. Check Vercel logs."}
          {!["channel_limit_reached","youtube_auth_failed","token_exchange_failed","token_missing","channel_fetch_failed","db_init_failed","save_failed"].includes(error) && `Connection failed (${error}). Please try again.`}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border/50 rounded-2xl">
          <div className="w-16 h-11 bg-accent/15 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="18" viewBox="0 0 14 14" fill="currentColor" className="text-accent">
              <polygon points="3,2 11,7 3,12"/>
            </svg>
          </div>
          <p className="text-white font-bold text-lg mb-2">No channels connected</p>
          <p className="text-muted text-sm mb-6">Connect your YouTube channel to start automating comments, schedules, and SEO.</p>
          <a href="/api/youtube/connect"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-5 py-2.5 rounded-xl transition-all">
            Connect YouTube Channel
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.id} className="bg-surface border border-border/60 rounded-2xl p-5 flex items-center gap-4">
              {ch.thumbnail_url
                ? <img src={ch.thumbnail_url} alt={ch.channel_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-gold flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white truncate">{ch.channel_name}</h3>
                  {ch.channel_handle && <span className="text-xs text-muted">{ch.channel_handle}</span>}
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-auto ${ch.is_active ? "bg-emerald/15 text-emerald" : "bg-border text-muted"}`}>
                    {ch.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs text-muted">{formatNumber(ch.subscriber_count || 0)} subs</span>
                  <span className="text-xs text-muted">{ch.video_count?.toLocaleString() || 0} videos</span>
                  <span className="text-xs text-muted">Connected {new Date(ch.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`/analytics?channelId=${ch.id}`}
                  className="text-xs font-semibold text-text-2 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 border border-border/60 transition-all">
                  Analytics
                </a>
                <button onClick={() => disconnectChannel(ch.id)}
                  className="text-xs font-semibold text-muted hover:text-accent px-3 py-2 rounded-lg hover:bg-accent/5 border border-border/60 transition-all">
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 bg-surface border border-border/60 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4">What happens when you connect a channel?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "💬", title: "Comments polled", desc: "Every 15 minutes, we fetch unreplied comments and queue them for AI replies." },
            { icon: "📅", title: "Schedule activated", desc: "Scheduled videos are published automatically at their configured time." },
            { icon: "📊", title: "Analytics synced", desc: "Daily snapshots of views, CTR, watch time, and subscribers are saved to your dashboard." },
          ].map((i) => (
            <div key={i.title} className="bg-surface-2/50 rounded-xl p-4">
              <span className="text-2xl mb-2 block">{i.icon}</span>
              <p className="text-sm font-semibold text-white mb-1">{i.title}</p>
              <p className="text-xs text-muted leading-relaxed">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChannelsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-8 w-48 bg-surface rounded-lg animate-pulse mb-6" /></div>}>
      <ChannelsContent />
    </Suspense>
  );
}
