"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const PLANS = [
  { id: "free",       label: "Free",       price: "$0",  channels: 1,   ai: 30,     color: "text-muted" },
  { id: "starter",    label: "Starter",    price: "$19", channels: 1,   ai: 300,    color: "text-blue-400" },
  { id: "pro",        label: "Pro",        price: "$49", channels: 3,   ai: 1000,   color: "text-gold" },
  { id: "agency",     label: "Agency",     price: "$99", channels: 10,  ai: 5000,   color: "text-emerald" },
  { id: "enterprise", label: "Enterprise", price: "Custom", channels: 99, ai: -1,   color: "text-accent" },
];

export default function SettingsPage() {
  const [profile,  setProfile]  = useState<Partial<Profile>>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [pwForm,   setPwForm]   = useState({ current: "", next: "", confirm: "" });
  const [pwMsg,    setPwMsg]    = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ profile: p }) => {
        if (p) setProfile(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: profile.full_name, ai_voice_context: profile.ai_voice_context }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwMsg("Passwords don't match."); return; }
    if (pwForm.next.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwMsg(error ? error.message : "Password updated successfully.");
    if (!error) setPwForm({ current: "", next: "", confirm: "" });
  }

  const currentPlan = PLANS.find((p) => p.id === (profile.plan || "free")) || PLANS[0];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account, preferences, and billing.</p>
      </div>

      {/* Profile */}
      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <h2 className="font-bold text-white text-sm mb-5">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Full Name</label>
            <input value={profile.full_name || ""} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Email</label>
            <input value={profile.email || ""} disabled
              className="w-full bg-surface-2/50 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-muted cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">AI Voice & Tone (used across all AI features)</label>
            <textarea rows={3} value={profile.ai_voice_context || ""} onChange={(e) => setProfile((p) => ({ ...p, ai_voice_context: e.target.value }))}
              placeholder="e.g. Friendly tech creator. Uses casual conversational tone. Never sounds corporate. Signs off with 'Stay curious!'"
              className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none resize-none" />
            <p className="text-[10px] text-muted mt-1">This context is prepended to all AI comment replies, titles, and descriptions.</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-accent hover:bg-accent-2 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="text-xs text-emerald font-semibold">✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <h2 className="font-bold text-white text-sm mb-5">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">New Password</label>
            <input type="password" value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
              className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-surface-2 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none" />
          </div>
          {pwMsg && (
            <p className={`text-xs font-semibold ${pwMsg.includes("successfully") ? "text-emerald" : "text-accent"}`}>{pwMsg}</p>
          )}
          <button type="submit" disabled={!pwForm.next || !pwForm.confirm}
            className="px-5 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border/60 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
            Update Password
          </button>
        </form>
      </div>

      {/* Plan */}
      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <h2 className="font-bold text-white text-sm">Subscription Plan</h2>
          <span className={`text-sm font-black ${currentPlan.color}`}>{currentPlan.label}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-2/50 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">AI Replies</p>
            <p className="text-lg font-black text-white">
              {profile.ai_replies_used || 0}
              <span className="text-sm text-muted font-normal"> / {profile.ai_replies_limit || 30}</span>
            </p>
            <div className="mt-2 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full"
                style={{ width: `${Math.min(((profile.ai_replies_used || 0) / (profile.ai_replies_limit || 30)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="bg-surface-2/50 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Channels</p>
            <p className="text-lg font-black text-white">{currentPlan.channels === 99 ? "Unlimited" : `Up to ${currentPlan.channels}`}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLANS.filter((p) => p.id !== "free").map((p) => (
            <div key={p.id} className={`rounded-xl border p-4 transition-all ${p.id === currentPlan.id ? "border-accent/60 bg-accent/5" : "border-border/50 hover:border-border"}`}>
              <div className="flex items-start justify-between mb-2">
                <p className={`text-sm font-bold ${p.color}`}>{p.label}</p>
                <p className="text-sm font-black text-white">{p.price}<span className="text-[10px] text-muted">{p.price !== "Custom" ? "/mo" : ""}</span></p>
              </div>
              <p className="text-xs text-muted mb-3">
                {p.channels === 99 ? "Unlimited" : `${p.channels} channel${p.channels > 1 ? "s" : ""}`} · {p.ai === -1 ? "Unlimited" : `${p.ai.toLocaleString()}`} AI replies
              </p>
              {p.id !== currentPlan.id && (
                <a href={`/api/stripe/checkout?plan=${p.id}`}
                  className="block w-full text-center text-xs font-bold py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent transition-all border border-accent/25">
                  {p.price === "Custom" ? "Contact us" : "Upgrade"}
                </a>
              )}
              {p.id === currentPlan.id && (
                <p className="text-center text-xs text-accent font-bold">Current plan</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-surface border border-accent/20 rounded-2xl p-6">
        <h2 className="font-bold text-white text-sm mb-1">Danger Zone</h2>
        <p className="text-xs text-muted mb-5">These actions are permanent and cannot be undone.</p>
        <button
          onClick={() => confirm("Are you sure? This will permanently delete your account, all channels, and all data.") && supabase.auth.signOut()}
          className="text-xs font-bold text-accent hover:text-white hover:bg-accent/15 border border-accent/30 px-4 py-2 rounded-lg transition-all">
          Delete account
        </button>
      </div>
    </div>
  );
}
