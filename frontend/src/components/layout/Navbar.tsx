import { ArrowUpRight, Moon, Orbit } from "lucide-react";

const navigation = [
  { href: "#environment", label: "Environment" },
  { href: "#site-workspace", label: "Site workspace" },
  { href: "#helios-advisor", label: "HELIOS advisor" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-sky-200/15 bg-[#060e1e]/60 text-slate-100 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <a
            className="inline-flex items-center gap-2.5 text-slate-100 hover:text-sky-200 transition"
            href="#mission"
            aria-label="CosmynX home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-300/25 bg-[#0c1b34]/70 text-sky-200">
              <Orbit className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight hidden sm:inline">
              CosmynX
            </span>
          </a>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <Moon className="h-4.5 w-4.5 text-sky-200" />
            <h1 className="font-heading text-lg sm:text-xl font-bold tracking-wide text-white">
              HELIOS
            </h1>
          </div>
          <p className="hidden md:block mt-0.5 text-xs text-slate-300">
            Lunar Landing Site Explorer · Artemis III South Pole
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <nav
            className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-300"
            aria-label="Main navigation"
          >
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-white transition">
                {label}
              </a>
            ))}
          </nav>
          <a
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300/30 bg-[#102342]/75 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#162f57] transition"
            href="#helios-advisor"
          >
            Plan a mission <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
