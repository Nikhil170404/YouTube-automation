"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Metadata } from "next";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/dashboard";
  const errParam     = searchParams.get("error");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(errParam || "");

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(redirect);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirect}`,
        scopes: "email profile",
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl border border-border/60 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
          <p className="text-text-2 text-sm">Sign in to your ChannelOS account</p>
        </div>

        {error && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 mb-5 text-sm text-accent">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <button onClick={handleGoogleLogin} disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-border/70 rounded-xl py-3 text-sm font-semibold text-white transition-all mb-5 disabled:opacity-50">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[11px] text-muted uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-surface-2/60 border border-border/70 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-semibold">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-surface-2/60 border border-border/70 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:border-accent/60 focus:outline-none transition-colors"
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-2 text-white font-bold py-3 rounded-xl transition-all glow-accent-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          No account?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-2 font-semibold transition-colors">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}
