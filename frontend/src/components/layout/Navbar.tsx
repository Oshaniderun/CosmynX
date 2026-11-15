import { ArrowUpRight, Moon, Orbit } from "lucide-react";

const navigation = [
  { href: "#environment", label: "Environment" },
  { href: "#site-workspace", label: "Site Workspace" },
  { href: "#helios-advisor", label: "HELIOS Advisor" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#222222] bg-[#0A0A0A]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: CosmynX Brand Mark & Scientific System Status */}
        <div className="flex items-center gap-3">
          <a className="inline-flex items-center gap-2.5 text-[#F1F0EC] hover:text-[#B5A38D] transition" href="#mission" aria-label="CosmynX mission control home">
            <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-md border border-[#333333] bg-[#141414] text-[#B5A38D]">
              <Orbit className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight hidden sm:inline text-[#F1F0EC]">
              Cosmyn<span className="text-[#B5A38D]">X</span>
            </span>
          </a>
          <div className="hidden lg:inline-flex items-center gap-2 rounded border border-[#2E2E2E] bg-[#141414] px-2.5 py-1 text-[11px] font-mono text-[#A8A8A8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#689D82]" />
            <span className="tracking-wider">STATUS: NOMINAL</span>
          </div>
        </div>

        {/* Center: Prominent Centered Scientific HELIOS Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#333333] bg-[#141414] text-[#B5A38D]">
              <Moon className="h-3.5 w-3.5" />
            </div>
            <h1 className="font-heading text-lg font-bold tracking-wider text-[#F1F0EC]">
              HELIOS
            </h1>
            <span className="rounded bg-[#1A1A1A] px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-[#B5A38D] border border-[#2C2C2C]">
              LUNAR NAV
            </span>
          </div>
          <p className="hidden md:block mt-0.5 text-[11px] font-normal tracking-wide text-[#737373]">
            NASA Artemis Campaign · Lunar South Pole Surface Navigator
          </p>
        </div>

        {/* Right: Section Navigation Links & Scientific Plan CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[#A8A8A8]" aria-label="Main navigation">
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-[#F1F0EC] transition duration-150">
                {label}
              </a>
            ))}
          </nav>
          <a
            className="inline-flex items-center gap-1.5 rounded-md border border-[#333333] bg-[#181818] px-3.5 py-1.5 text-xs font-medium text-[#F1F0EC] hover:border-[#B5A38D] hover:bg-[#202020] transition"
            href="#helios-advisor"
          >
            Plan a mission <ArrowUpRight className="h-3.5 w-3.5 text-[#B5A38D]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
