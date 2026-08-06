"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNumber } from "@/lib/utils";
import type { YoutubeChannel } from "@/types/database";
import type { YTAnalytics } from "@/types/youtube";

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="bg-surface border border-border/60 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data, valueKey, labelKey }: {
  data: YTAnalytics[];
  valueKey: keyof YTAnalytics;
  labelKey: keyof YTAnalytics;
}) {
  if (!data.length) return null;
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const pct = (val / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
              <div
                className="w-full bg-accent/30 hover:bg-accent/60 rounded-t transition-all"
                style={{ height: `${Math.max(pct, 2)}%` }}
                title={`${String(d[labelKey])}: ${formatNumber(val)}`}
              />
            </div>
            <span className="text-[8px] text-muted w-full text-center truncate">
              {String(d[labelKey]).slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const RANGES = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function AnalyticsPage() {
  const [channels,     setChannels]     = useState<YoutubeChannel[]>([]);
  const [selected,     setSelected]     = useState("");
  const [range,        setRange]        = useState(30);
  const [analytics,    setAnalytics]    = useState<YTAnalytics[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: rows } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);
      const channelList = (rows || []) as YoutubeChannel[];
      setChannels(channelList);
      if (channelList.length) setSelected(channelList[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setApiError(null);
    fetch(`/api/youtube/analytics?channelId=${selected}&days=${range}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setApiError(json.error);
          setAnalytics([]);
        } else {
          setAnalytics(json.analytics || []);
        }
        setLoading(false);
      })
      .catch((e) => {
        setApiError(String(e));
        setLoading(false);
      });
  }, [selected, range]);

  const selectedChannel = channels.find((c) => c.id === selected);
  const totalViews      = analytics.reduce((s, d) => s + (d.views || 0), 0);
  const totalWatchMin   = analytics.reduce((s, d) => s + (d.watchTimeMinutes || 0), 0);
  const totalSubsGained = analytics.reduce((s, d) => s + (d.subscribersGained || 0), 0);
  const avgCtr          = analytics.length
    ? analytics.reduce((s, d) => s + (d.clickThroughRate || 0), 0) / analytics.length
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-muted text-sm mt-1">Track performance across all your channels.</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button key={r.days} onClick={() => setRange(r.days)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${range === r.days ? "bg-accent text-white" : "bg-surface border border-border/60 text-muted hover:text-white"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channel selector */}
      {channels.length > 1 && (
        <div className="mb-6">
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            className="bg-surface border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none">
            {channels.map((c) => <option key={c.id} value={c.id}>{c.channel_name}</option>)}
          </select>
        </div>
      )}

      {channels.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border/50 rounded-2xl">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="text-white font-bold mb-1">No channels connected</p>
          <p className="text-muted text-sm mb-5">Connect a YouTube channel to start seeing analytics.</p>
          <a href="/api/youtube/connect"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-2 text-white font-bold px-5 py-2.5 rounded-xl transition-all">
            Connect Channel
          </a>
        </div>
      ) : (
        <>
          {/* Channel hero — sourced from DB, not YouTube API */}
          {selectedChannel && (
            <div className="bg-surface border border-border/60 rounded-2xl p-5 mb-6 flex items-center gap-4">
              {selectedChannel.thumbnail_url
                ? <img src={selectedChannel.thumbnail_url} alt={selectedChannel.channel_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-gold flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-white text-lg">{selectedChannel.channel_name}</h2>
                {selectedChannel.channel_handle && (
                  <p className="text-xs text-muted">{selectedChannel.channel_handle}</p>
                )}
              </div>
              <div className="hidden sm:flex gap-6 text-right">
                <div>
                  <p className="text-xl font-black text-white">{formatNumber(selectedChannel.subscriber_count || 0)}</p>
                  <p className="text-xs text-muted">Subscribers</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{selectedChannel.video_count?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted">Videos</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted text-sm">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Period stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Views"         value={formatNumber(totalViews)}                     icon="👁️" sub={`Last ${range} days`} />
                <StatCard label="Watch Time"    value={`${formatNumber(Math.round(totalWatchMin))}m`} icon="⏱️" sub={`Last ${range} days`} />
                <StatCard label="Subs Gained"   value={formatNumber(totalSubsGained)}                icon="📈" sub={`Last ${range} days`} />
                <StatCard label="Avg CTR"        value={`${(avgCtr * 100).toFixed(1)}%`}              icon="🎯" sub="Click-through rate" />
              </div>

              {analytics.length > 0 ? (
                <>
                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-5 mb-6">
                    <div className="bg-surface border border-border/60 rounded-2xl p-5">
                      <h3 className="font-bold text-white text-sm mb-4">Views over time</h3>
                      <BarChart data={analytics} valueKey="views" labelKey="date" />
                    </div>
                    <div className="bg-surface border border-border/60 rounded-2xl p-5">
                      <h3 className="font-bold text-white text-sm mb-4">Watch time (minutes)</h3>
                      <BarChart data={analytics} valueKey="watchTimeMinutes" labelKey="date" />
                    </div>
                  </div>

                  {/* Data table */}
                  <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/60">
                      <h3 className="font-bold text-white text-sm">Daily breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40">
                            {["Date", "Views", "Watch Time", "Subs Gained", "Avg Duration", "CTR"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs text-muted uppercase tracking-wider font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...analytics].reverse().map((row, i) => (
                            <tr key={i} className="border-b border-border/30 hover:bg-white/2 transition-colors">
                              <td className="px-5 py-3 text-muted text-xs">{row.date}</td>
                              <td className="px-5 py-3 text-white font-medium">{formatNumber(row.views || 0)}</td>
                              <td className="px-5 py-3 text-white font-medium">{formatNumber(Math.round(row.watchTimeMinutes || 0))}m</td>
                              <td className="px-5 py-3 text-white font-medium">{formatNumber(row.subscribersGained || 0)}</td>
                              <td className="px-5 py-3 text-white font-medium">{Math.round(row.averageViewDuration || 0)}s</td>
                              <td className="px-5 py-3 text-white font-medium">{((row.clickThroughRate || 0) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-surface border border-border/50 rounded-2xl">
                  <span className="text-4xl mb-4 block">{apiError ? "⚠️" : "📉"}</span>
                  <p className="text-white font-bold mb-1">{apiError ? "Analytics unavailable" : "No analytics data yet"}</p>
                  <p className="text-muted text-sm">
                    {apiError
                      ? `YouTube Analytics error: ${apiError}. Your channel may need to be older or have more views for data to appear.`
                      : "Analytics are collected daily. Check back tomorrow for your first data points."}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
