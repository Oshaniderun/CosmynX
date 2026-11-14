import { lazy, Suspense } from "react";
import { ArrowDown, ArrowUpRight, Compass, Orbit, Radio, Sparkles } from "lucide-react";
import { Navbar } from "./components/layout/Navbar";
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
        <p className="section-eyebrow"><span>{index}</span>{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      <p className="section-detail">{detail}</p>
    </div>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <div className="app-shell min-h-screen text-slate-100">
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
                <p className="hero-kicker"><span /> LUNAR SURFACE OPERATIONS <span className="hero-kicker__slash">/</span> SOUTH POLE</p>
                <h1 id="mission-title">A clearer view<br />of the <em>Moon.</em></h1>
                <p className="mission-hero__lead">
                  Explore the lunar environment, compare surface conditions, and plan a landing site with one connected mission workspace.
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
                  <span>Lunar horizon visual · supplied project reference</span>
                </div>
              </div>

              <aside className="hero-overview" aria-label="Mission workspace capabilities">
                <div className="hero-overview__topline">
                  <span>MISSION WORKSPACE</span>
                  <Compass size={15} aria-hidden="true" />
                </div>
                <p className="hero-overview__title">One lunar environment.<br />Three ways to explore.</p>
                <div className="hero-overview__items">
                  {overviewItems.map(({ icon: Icon, label, description }, index) => (
                    <div className="hero-overview__item" key={label}>
                      <span className="hero-overview__icon"><Icon size={16} aria-hidden="true" /></span>
                      <span className="hero-overview__text"><strong>{label}</strong><small>{description}</small></span>
                      <span className="hero-overview__index">0{index + 1}</span>
                    </div>
                  ))}
                </div>
                <a className="hero-overview__link" href="#environment">
                  View mission tools <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </aside>
            </div>
            <div className="mission-hero__bottom" aria-hidden="true">
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
                eyebrow="Mission environment"
                title="See the system in motion."
                detail="Explore 3D lunar topography, Sun and Earth geometry, South Pole surface maps, and direct-to-Earth line of sight for the selected mission window."
              />
              <div className="space-y-6">
                <UnifiedLunarExplorer />
                <PowerCommunicationPanel />
              </div>
            </section>

            <section id="site-workspace" className="dashboard-section" aria-labelledby="workspace-heading">
              <SectionHeading
                id="workspace-heading"
                index="02"
                eyebrow="Site workspace"
                title="Put candidate sites in context."
                detail="Compare South Pole landing-site scenarios side-by-side using the connected scientific services."
              />
              <div className="workspace-grid">
                <Suspense fallback={<div className="mission-panel comparison-loading" role="status">Loading comparison workspace…</div>}>
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
