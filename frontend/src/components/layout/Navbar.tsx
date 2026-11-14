import { Moon, Orbit } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#02050C]/80 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-4 py-3 sm:px-6 md:grid-cols-3">
        {/* Left: Mission Status Indicator (Mirrors NASA Space UI top-left status) */}
        <div className="flex items-center justify-center md:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-mono text-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
            <span>SYSTEM STATUS • NOMINAL</span>
          </div>
        </div>

        {/* Center: Prominent Centered Title Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/30 bg-[#0A1424]/90 text-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.3)]">
              <Moon className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-[#02050C]" />
            </div>
            <h1 className="font-heading text-xl font-bold tracking-wider text-slate-100 sm:text-2xl">
              HELIOS
            </h1>
            <span className="rounded bg-sky-950/70 px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-sky-400 border border-sky-800/40">
              LUNAR NAV
            </span>
          </div>
          <p className="mt-1.5 text-sm font-normal tracking-normal text-slate-300">
            AI-Powered Lunar Landing Site Navigator · Artemis III Campaign
          </p>
        </div>

        {/* Right: Space Apps Campaign Pill */}
        <div className="flex items-center justify-center md:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0E1A2C]/65 px-3.5 py-1.5 text-xs font-medium text-slate-200 shadow-sm backdrop-blur-md">
            <Orbit className="h-4 w-4 text-sky-400" />
            <span className="font-mono text-xs text-slate-300">Space Apps 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
}
