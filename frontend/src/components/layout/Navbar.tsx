import { ArrowUpRight, Moon, Orbit } from "lucide-react";

const navigation = [
  { href: "#environment", label: "Environment" },
  { href: "#site-workspace", label: "Site workspace" },
  { href: "#helios-advisor", label: "HELIOS advisor" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.1] bg-[#030305]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: CosmynX Brand Mark & System Status */}
        <div className="flex items-center gap-3">
          <a className="inline-flex items-center gap-2.5 text-white hover:text-slate-300 transition group" href="#mission" aria-label="CosmynX mission control home">
            <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white shadow-sm group-hover:border-white/40 transition">
              <Orbit className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight text-white hidden sm:inline">
              Cosmyn<span className="text-white/60">X</span>
            </span>
          </a>
          <div className="hidden lg:inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-mono text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
            <span>SYSTEM NOMINAL</span>
          </div>
        </div>

        {/* Center: Prominent Centered HELIOS Title Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white shadow-sm">
              <Moon className="h-4.5 w-4.5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-white ring-2 ring-[#030305]" />
            </div>
            <h1 className="font-heading text-lg sm:text-xl font-bold tracking-wider text-white">
              HELIOS
            </h1>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-white border border-white/20">
              LUNAR NAV
            </span>
          </div>
          <p className="hidden md:block mt-0.5 text-xs font-normal tracking-normal text-slate-400">
            Autonomous Lunar Landing Site Navigator · Artemis III Campaign
          </p>
        </div>

        {/* Right: Section Navigation Links & Plan Mission CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-medium text-slate-300" aria-label="Main navigation">
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-white transition duration-200">
                {label}
              </a>
            ))}
          </nav>
          <a
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-slate-200 transition shadow-sm"
            href="#helios-advisor"
          >
            Plan a mission <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
