import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid-bg noise flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold/4 blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-6 rounded-md bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><polygon points="3,2 11,7 3,12" /></svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">ChannelOS</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
