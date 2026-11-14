import { ArrowUpRight, Orbit } from "lucide-react";

const navigation = [
  { href: "#environment", label: "Environment" },
  { href: "#site-workspace", label: "Site workspace" },
  { href: "#helios-advisor", label: "HELIOS advisor" },
];

export function Navbar() {
  return (
    <header className="mission-nav">
      <div className="mission-nav__inner">
        <a className="mission-brand" href="#mission" aria-label="CosmynX mission control home">
          <span className="brand-mark"><Orbit size={17} aria-hidden="true" /></span>
          <span className="mission-brand__name">Cosmyn<span>X</span></span>
          <span className="mission-brand__divider" />
          <span className="mission-brand__descriptor">LUNAR MISSION CONTROL</span>
        </a>
        <nav className="mission-nav__links" aria-label="Main navigation">
          {navigation.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a className="mission-nav__cta" href="#helios-advisor">
          Plan a mission <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
