import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Compass, Orbit, Radio, Sparkles, X } from "lucide-react";
import { Navbar } from "./components/layout/Navbar";
import { CosmicBackground } from "./components/layout/CosmicBackground";
import { UnifiedLunarExplorer } from "./features/lunar-map/components/UnifiedLunarExplorer";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";
import { MissionProvider } from "./context/MissionContext";
import lunarHorizon from "./assets/lunar-horizon.webp";
import heliosAstronaut from "./assets/helios-astronaut.webp";

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
        <p className="section-eyebrow font-mono text-xs text-sky-400"><span>{index}</span>{eyebrow}</p>
        <h2 id={id} className="font-heading text-2xl sm:text-3xl font-semibold text-slate-100">{title}</h2>
      </div>
      <p className="section-detail text-sm text-slate-300">{detail}</p>
    </div>
  );
}

export default function App() {
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);

  useEffect(() => {
    if (!advisorModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAdvisorModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      document.getElementById("helios-mission")?.focus();
    }, 120);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [advisorModalOpen]);

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
                <p className="hero-kicker font-mono"><span /> LUNAR SURFACE OPERATIONS <span className="hero-kicker__slash">/</span> SOUTH POLE</p>
                <h1 id="mission-title" className="font-heading">A clearer view<br />of the <em>Moon.</em></h1>
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
                <div className="hero-overview__topline font-mono">
                  <span>MISSION WORKSPACE</span>
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
              {!advisorModalOpen ? (
                <HeliosAdvisorPanel />
              ) : (
                <div className="mission-panel p-6 text-center text-sm text-slate-300">
                  HELIOS AI Advisor is currently open in the floating overlay.
                </div>
              )}
            </section>

            <footer className="dashboard-footer">
              <a className="dashboard-footer__brand" href="#mission"><span className="brand-mark"><Orbit size={16} aria-hidden="true" /></span>CosmynX</a>
              <p>Lunar mission analysis · Geometric visibility is not communication reliability.</p>
              <a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">NASA Blue Marble imagery <ArrowUpRight size={13} aria-hidden="true" /></a>
            </footer>
          </div>
        </main>

        {/* Floating Astronaut AI Agent Access Button */}
        <button
          type="button"
          onClick={() => setAdvisorModalOpen((open) => !open)}
          className="helios-astronaut-launcher"
          aria-label={advisorModalOpen ? "Close HELIOS AI Agent" : "Open HELIOS AI Agent"}
          aria-expanded={advisorModalOpen}
          title="Ask HELIOS AI Mission Advisor"
        >
          <span className="helios-astronaut-launcher__glow" aria-hidden="true" />
          <img
            src={heliosAstronaut}
            alt=""
            className="helios-astronaut-launcher__img"
            draggable={false}
          />
          <span className="helios-astronaut-launcher__badge">
            <span className="helios-astronaut-launcher__dot" aria-hidden="true" />
            {advisorModalOpen ? "Close AI" : "HELIOS AI"}
          </span>
        </button>

        {/* Floating HELIOS AI Agent Overlay */}
        {advisorModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="HELIOS AI Lunar Landing Advisor"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setAdvisorModalOpen(false);
              }
            }}
          >
            <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-sky-400/30 bg-[#070d19]/95 shadow-2xl shadow-sky-950/60">
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#070d19]/95 px-4 py-3 backdrop-blur-md sm:px-6">
                <div className="flex items-center gap-2.5">
                  <img
                    src={heliosAstronaut}
                    alt=""
                    className="h-9 w-auto object-contain"
                  />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">
                      Floating Mission Access · AI Agent
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      HELIOS Autonomous Lunar Landing Advisor
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdvisorModalOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-400/50 hover:text-white"
                  aria-label="Close HELIOS AI Agent overlay"
                >
                  <X size={15} />
                  Close
                </button>
              </div>
              <div className="p-3 sm:p-5">
                <HeliosAdvisorPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </MissionProvider>
  );
}
