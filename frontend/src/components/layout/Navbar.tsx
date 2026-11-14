import { ArrowUpRight, Moon, Orbit } from "lucide-react";

const navigation = [
  { href: "#environment", label: "Environment" },
  { href: "#site-workspace", label: "Site workspace" },
  { href: "#helios-advisor", label: "HELIOS advisor" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#02050C]/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: CosmynX Brand Mark & System Status */}
        <div className="flex items-center gap-3">
          <a className="inline-flex items-center gap-2.5 text-slate-100 hover:text-sky-300 transition" href="#mission" aria-label="CosmynX mission control home">
            <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/30 bg-[#0A1424] text-sky-400 shadow-sm">
              <Orbit className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight hidden sm:inline">
              Cosmyn<span className="text-sky-400">X</span>
            </span>
          </a>
          <div className="hidden lg:inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
            <span>NOMINAL</span>
          </div>
        </div>

        {/* Center: Prominent Centered HELIOS Title Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/30 bg-[#0A1424]/90 text-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.3)]">
              <Moon className="h-4.5 w-4.5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#02050C]" />
            </div>
            <h1 className="font-heading text-lg sm:text-xl font-bold tracking-wider text-slate-100">
              HELIOS
            </h1>
            <span className="rounded bg-sky-950/70 px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-sky-400 border border-sky-800/40">
              LUNAR NAV
            </span>
          </div>
          <p className="hidden md:block mt-0.5 text-xs font-normal tracking-normal text-slate-400">
            AI-Powered Lunar Landing Site Navigator · Artemis III Campaign
          </p>
        </div>

        {/* Right: Section Navigation Links & Plan Mission CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-medium text-slate-400" aria-label="Main navigation">
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-slate-200 transition">
                {label}
              </a>
            ))}
          </nav>
          <a
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-950/40 px-3.5 py-1.5 text-xs font-semibold text-sky-200 hover:border-sky-400/60 hover:bg-sky-900/50 hover:text-white transition shadow-sm"
            href="#helios-advisor"
          >
            Plan a mission <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
