import { lazy, Suspense } from "react";
import { ArrowDown, ArrowUpRight, Compass, Orbit, Radio, Sparkles } from "lucide-react";
import { Navbar } from "./components/layout/Navbar";
import { CosmicBackground } from "./components/layout/CosmicBackground";
import { UnifiedLunarExplorer } from "./features/lunar-map/components/UnifiedLunarExplorer";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";
import { MissionProvider } from "./context/MissionContext";
import lunarHorizon from "./assets/lunar-horizon.webp";

const ComparisonPanel = lazy(() => import("./features/comparison/components/ComparisonPanel").then((module) => ({ default: module.ComparisonPanel })));

const overviewItems = [
  { icon: Orbit, label: "Orbital geometry", description: "Sun, Earth & lunar position" },
  { icon: Radio, label: "Surface conditions", description: "Illumination & line of sight" },
  { icon: Sparkles, label: "Site intelligence", description: "Mission-aware recommendations" },
];

function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  detail,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-eyebrow font-mono text-xs text-sky-400">
          <span className="inline-flex items-center justify-center rounded bg-sky-950/70 border border-sky-400/30 px-1.5 py-0.5 text-[10px] text-sky-300 font-bold mr-1.5">
            {index}
          </span>
          {eyebrow}
        </p>
        <h2 id={id} className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
          {title}
        </h2>
      </div>
      <p className="section-detail text-sm text-slate-300 leading-relaxed">{detail}</p>
    </div>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <div className="relative app-shell min-h-screen text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <CosmicBackground />
        <Navbar />
        <main>
          <section
            id="mission"
            className="mission-hero"
            style={{ backgroundImage: `url("${lunarHorizon}")` }}
            aria-labelledby="mission-title"
          >
            <div className="mission-hero__shade" aria-hidden="true" />
            <div className="mission-hero__stars" aria-hidden="true" />
            <div className="mission-hero__content">
              <div className="mission-hero__copy">
                <p className="hero-kicker font-mono">
                  <span /> PIONEERING THE NEXT ERA <span className="hero-kicker__slash">/</span> LUNAR EXPLORATION
                </p>
                <h1 id="mission-title" className="font-heading">
                  A clearer view<br />of the <em>Moon.</em>
                </h1>
                <p className="mission-hero__lead">
                  Explore the lunar environment, compare surface conditions, and plan landing sites with one connected mission workspace.
                </p>
                <div className="mission-hero__actions">
                  <a className="button-primary" href="#environment">
                    Explore the environment <ArrowDown size={16} aria-hidden="true" />
                  </a>
                  <a className="button-quiet" href="#helios-advisor">
                    Open HELIOS advisor <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <div className="hero-caption">
                  <span className="hero-caption__line" />
                  <span>NASA Artemis Campaign · High-fidelity geometric telemetry</span>
                </div>
              </div>
              <aside className="hero-overview" aria-label="Mission workspace capabilities">
                <div className="hero-overview__topline font-mono">
                  <span>KEY CAPABILITIES</span>
                  <Compass size={15} aria-hidden="true" />
                </div>
                <p className="hero-overview__title font-heading">One lunar environment.<br />Three ways to explore.</p>
                <div className="hero-overview__items">
                  {overviewItems.map(({ icon: Icon, label, description }, index) => (
                    <div className="hero-overview__item" key={label}>
                      <span className="hero-overview__icon"><Icon size={16} aria-hidden="true" /></span>
                      <span className="hero-overview__text"><strong>{label}</strong><small>{description}</small></span>
                      <span className="hero-overview__index font-mono">0{index + 1}</span>
                    </div>
                  ))}
                </div>
                <a className="hero-overview__link" href="#environment">
                  View mission tools <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </aside>
            </div>
            <div className="mission-hero__bottom font-mono" aria-hidden="true">
              <span>01 — OBSERVE</span><span>02 — COMPARE</span><span>03 — PLAN</span>
              <span className="mission-hero__bottom-rule" />
              <span>GEOMETRIC DATA · MISSION CONTEXT</span>
            </div>
          </section>

          <div className="dashboard-content">
            <section id="environment" className="dashboard-section" aria-labelledby="environment-heading">
              <SectionHeading
                id="environment-heading"
                index="01"
                eyebrow="Mission environment & site explorer"
                title="See the system in motion."
                detail="Explore 3D Sun, Earth, and lunar South Pole topography, select candidate landing sites, and inspect measured illumination and direct-to-Earth line of sight."
              />
              <div className="space-y-6">
                <UnifiedLunarExplorer />
                <div className="environment-grid">
                  <div className="environment-grid__conditions col-span-full">
                    <PowerCommunicationPanel />
                  </div>
                </div>
              </div>
            </section>

            <section id="site-workspace" className="dashboard-section" aria-labelledby="workspace-heading">
              <SectionHeading
                id="workspace-heading"
                index="02"
                eyebrow="Site workspace"
                title="Put candidate sites in context."
                detail="Compare south-pole landing-site scenarios side by side using the connected scientific services."
              />
              <div className="workspace-grid">
                <Suspense fallback={<div className="mission-panel comparison-loading p-6 text-center text-slate-400 font-mono text-sm" role="status">Loading comparison workspace…</div>}>
                  <ComparisonPanel />
                </Suspense>
              </div>
            </section>
            <section id="helios-advisor" className="dashboard-section dashboard-section--advisor" aria-labelledby="advisor-heading">
              <SectionHeading
                id="advisor-heading"
                index="03"
                eyebrow="Mission planning"
                title="Make the next decision with HELIOS."
                detail="Translate mission criteria into a transparent, evidence-based site assessment. Every recommendation keeps its constraints and scientific provenance in view."
              />
              <HeliosAdvisorPanel />
            </section>

            <footer className="dashboard-footer">
              <a className="dashboard-footer__brand" href="#mission"><span className="brand-mark"><Orbit size={16} aria-hidden="true" /></span>CosmynX</a>
              <p>Lunar mission analysis · Geometric visibility is not communication reliability.</p>
              <a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">NASA Blue Marble imagery <ArrowUpRight size={13} aria-hidden="true" /></a>
            </footer>
          </div>
        </main>
      </div>
    </MissionProvider>
  );
}
