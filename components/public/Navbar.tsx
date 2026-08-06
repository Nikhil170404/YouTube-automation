"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown, Menu, X, Zap, BarChart3,
  MessageSquare, Calendar, Search, Image, Building2,
  ArrowRight, Play,
} from "lucide-react";

type DropdownItem = {
  href: string;
  label: string;
  desc: string;
  Icon: React.ElementType;
};

const PRODUCT_ITEMS: DropdownItem[] = [
  { href: "/#features",   label: "Features",    desc: "All six core capabilities in one place", Icon: Zap        },
  { href: "/#how",        label: "How It Works", desc: "Up and running in 30 seconds",           Icon: Play       },
  { href: "/#comparison", label: "Compare",      desc: "vs. TubeBuddy, VidIQ, and more",        Icon: BarChart3  },
];

const SOLUTIONS_ITEMS: DropdownItem[] = [
  { href: "/#features", label: "Comment Automation",    desc: "AI replies that sound like you",       Icon: MessageSquare },
  { href: "/#features", label: "Video Scheduler",       desc: "Plan your entire content calendar",   Icon: Calendar      },
  { href: "/#features", label: "YouTube SEO",           desc: "Keywords, tags, and title tools",     Icon: Search        },
  { href: "/#features", label: "Thumbnail A/B Testing", desc: "Data-driven CTR improvement",        Icon: Image         },
  { href: "/#features", label: "For Agencies",          desc: "Multi-channel management at scale",  Icon: Building2     },
];

function NavDropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 min-w-[260px]">
      <div className="nav-dropdown-panel glass rounded-2xl border border-border/70 shadow-2xl shadow-black/50 p-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors mt-0.5">
              <item.Icon size={14} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <div className="text-xs text-muted leading-snug mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DropdownTrigger({
  label,
  items,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string;
  items: DropdownItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(onClose, 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); onOpen(); }}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors font-medium px-3 py-1"
      >
        {label}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-accent" : ""}`}
        />
      </button>
      {isOpen && <NavDropdown items={items} onClose={onClose} />}
    </div>
  );
}

export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu,   setOpenMenu]   = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeAll = () => setOpenMenu(null);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-6 rounded-md bg-accent flex items-center justify-center group-hover:glow-accent-sm transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <polygon points="3,2 11,7 3,12" />
            </svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">ChannelOS</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center">
          <DropdownTrigger
            label="Product"
            items={PRODUCT_ITEMS}
            isOpen={openMenu === "product"}
            onOpen={() => setOpenMenu("product")}
            onClose={closeAll}
          />
          <DropdownTrigger
            label="Solutions"
            items={SOLUTIONS_ITEMS}
            isOpen={openMenu === "solutions"}
            onOpen={() => setOpenMenu("solutions")}
            onClose={closeAll}
          />
          <Link href="/pricing" className="text-sm text-muted hover:text-white transition-colors font-medium px-3 py-1">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm text-muted hover:text-white transition-colors font-medium px-3 py-1">
            Blog
          </Link>
          <Link href="/about" className="text-sm text-muted hover:text-white transition-colors font-medium px-3 py-1">
            About
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <Link href="/login" className="text-sm text-muted hover:text-white transition-colors font-medium px-3 py-1.5">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all glow-accent-sm"
          >
            Start Free
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-muted hover:text-white p-1 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden mobile-nav-panel border-t border-border/60 bg-void/95 backdrop-blur-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-5 space-y-1">
            {/* Product */}
            <div className="mb-1">
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold px-3 py-2">Product</p>
              {PRODUCT_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-text-2 hover:text-white transition-colors"
                >
                  <item.Icon size={15} className="text-accent flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-border/40 pt-3 mb-1">
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold px-3 py-2">Solutions</p>
              {SOLUTIONS_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-text-2 hover:text-white transition-colors"
                >
                  <item.Icon size={15} className="text-accent flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-border/40 pt-3">
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/blog",    label: "Blog"    },
                { href: "/about",   label: "About"   },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-text-2 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border/40 pt-4 flex flex-col gap-2.5 pb-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-center text-text-2 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="bg-accent text-white text-sm font-semibold py-3 rounded-xl text-center flex items-center justify-center gap-2"
              >
                Start for Free <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
