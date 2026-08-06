"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const NAV = [
  { href: "/dashboard",   label: "Overview",   icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" },
  { href: "/channels",    label: "Channels",   icon: "M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { href: "/comments",    label: "Comments",   icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" },
  { href: "/scheduler",   label: "Scheduler",  icon: "M3 9h18M8 2v4M16 2v4M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" },
  { href: "/analytics",   label: "Analytics",  icon: "M18 20V10M12 20V4M6 20v-6" },
  { href: "/seo",         label: "SEO Tools",  icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { href: "/thumbnails",  label: "A/B Tests",  icon: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 5l-5-5L5 18" },
  { href: "/settings",    label: "Settings",   icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]           = useState<{ email?: string; full_name?: string } | null>(null);
  const [sidebarOpen, setSidebar] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser({ email: user.email, full_name: user.user_metadata?.full_name });
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const Sidebar = () => (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full bg-surface border-r border-border/60">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-5 rounded bg-accent flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="white"><polygon points="3,2 11,7 3,12"/></svg>
          </div>
          <span className="text-white font-bold text-sm">ChannelOS</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <p className="text-[9px] text-muted uppercase tracking-[0.18em] font-bold px-2 mb-2">Navigation</p>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                active
                  ? "bg-accent/15 text-white font-semibold"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}>
              <Icon d={item.icon} size={15} />
              {item.label}
              {item.href === "/comments" && (
                <span className="ml-auto text-[9px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white font-bold text-sm">
            {(user?.full_name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white font-semibold truncate">{user?.full_name || "Creator"}</p>
            <p className="text-[10px] text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="w-full text-left text-xs text-muted hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
          <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-void overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-56"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebar(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-4 bg-surface/50 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setSidebar(true)} className="md:hidden text-muted hover:text-white p-1">
            <Icon d="M3 12h18M3 6h18M3 18h18" size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/channels?connect=true"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-accent/15 hover:bg-accent/25 text-accent px-3 py-1.5 rounded-lg transition-all border border-accent/25">
              <Icon d="M12 5v14M5 12h14" size={13} />
              Connect Channel
            </Link>
            <Link href="/settings" className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white font-bold text-sm">
              {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
