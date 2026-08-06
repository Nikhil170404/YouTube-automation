import Link from "next/link";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/#features",   label: "Features"      },
      { href: "/#how",        label: "How It Works"  },
      { href: "/#comparison", label: "Compare"       },
      { href: "/pricing",     label: "Pricing"       },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/#features", label: "Comment Automation"    },
      { href: "/#features", label: "Video Scheduler"       },
      { href: "/#features", label: "YouTube SEO"           },
      { href: "/#features", label: "Thumbnail A/B Testing" },
      { href: "/#features", label: "For Agencies"          },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about",   label: "About"       },
      { href: "/blog",    label: "Blog"        },
      { href: "/pricing", label: "Pricing"     },
      { href: "/#faq",    label: "FAQ"         },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy",     label: "Privacy Policy" },
      { href: "/terms",       label: "Terms of Use"   },
      { href: "/sitemap.xml", label: "Sitemap"        },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-14 bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 mb-12">
          {/* Brand — spans 2 cols on lg */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-6 rounded-md bg-accent flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                  <polygon points="3,2 11,7 3,12" />
                </svg>
              </div>
              <span className="text-white font-bold text-[15px]">ChannelOS</span>
            </Link>
            <p className="text-text-2 text-sm leading-relaxed max-w-xs mb-5">
              The all-in-one YouTube channel automation platform for creators and agencies. Replace your tool stack with one.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://twitter.com/channelosapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow ChannelOS on Twitter / X"
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted hover:text-white hover:border-border transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com/@channelosapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ChannelOS YouTube channel"
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted hover:text-red-500 hover:border-border transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] text-muted uppercase tracking-[0.15em] font-bold mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-text-2 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">© 2026 ChannelOS. All rights reserved.</p>
          <p className="text-xs text-muted">Not affiliated with or endorsed by YouTube or Google LLC.</p>
        </div>
      </div>
    </footer>
  );
}
