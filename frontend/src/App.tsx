import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  Orbit,
  Radio,
  Sparkles,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { Navbar } from "./components/layout/Navbar";
import { CosmicBackground } from "./components/layout/CosmicBackground";
import { UnifiedLunarExplorer } from "./features/lunar-map/components/UnifiedLunarExplorer";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";
import { MissionProvider } from "./context/MissionContext";
import lunarHorizon from "./assets/lunar-horizon.webp";
import heliosAstronaut from "./assets/helios-astronaut.webp";

const ComparisonPanel = lazy(() =>
  import("./features/comparison/components/ComparisonPanel").then((module) => ({
    default: module.ComparisonPanel,
  })),
);

const overviewItems = [
  { icon: Orbit, label: "Orbital geometry", description: "Sun, Earth & lunar ephemeris" },
  { icon: Radio, label: "Surface conditions", description: "Solar flux & direct-to-Earth LOS" },
  { icon: Sparkles, label: "Mission intelligence", description: "Evidence-based site evaluation" },
];

function SectionHeading({
  id,
  title,
  detail,
}: {
  id: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2 id={id} className="font-heading text-2xl sm:text-3xl font-semibold text-white">
          {title}
        </h2>
      </div>
      <p className="section-detail text-sm text-slate-300">{detail}</p>
    </div>
  );
}

export default function App() {
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const container = videoContainerRef.current;
      if (!container) return;
      const fadeDistance = Math.max(window.innerHeight * 0.75, 400);
      const progress = Math.min(1, Math.max(0, window.scrollY / fadeDistance));
      const nextOpacity = 1 - progress * 0.88;
      container.style.opacity = nextOpacity.toFixed(3);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            setIsPlaying(false);
          });
      }
    }
  }, []);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

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
      <div className="relative app-shell min-h-screen flex flex-col antialiased">
        <CosmicBackground />
        <Navbar />
        <main className="relative z-10">
          {/* 1. Landing Page – Cinematic Astronaut Background Video Hero (100vh) */}
          <section
            id="mission"
            className="mission-hero"
            aria-labelledby="mission-title"
          >
            {/* Full-Screen Video Background */}
            <div ref={videoContainerRef} className="hero-video-container" aria-hidden="true">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={lunarHorizon}
                className="hero-video"
                aria-label="Cinematic astronaut walking on the lunar surface"
              >
                <source src="/videos/astronaut-lunar-eva.mp4" type="video/mp4" />
                <source src="/videos/astronaut-lunar-eva.webm" type="video/webm" />
              </video>
              <div className="hero-video-overlay" />
              <div className="hero-vignette" />
            </div>

            {/* Video Playback Toggle & Archival Badge */}
            <div className="absolute top-24 right-6 sm:right-10 z-10 flex items-center gap-2 font-mono text-[10px] text-[#A8A8A8] bg-[#0A0A0A]/80 backdrop-blur-md border border-[#262626] rounded-md px-2.5 py-1">
              <button
                type="button"
                onClick={toggleVideoPlayback}
                className="flex items-center gap-1.5 hover:text-[#F1F0EC] transition"
                title={isPlaying ? "Pause cinematic footage" : "Play cinematic footage"}
                aria-label={isPlaying ? "Pause lunar video" : "Play lunar video"}
              >
                {isPlaying ? <Video size={12} className="text-[#B5A38D]" /> : <VideoOff size={12} className="text-[#737373]" />}
                <span>{isPlaying ? "LUNAR EVA · ACTIVE" : "LUNAR EVA · PAUSED"}</span>
              </button>
            </div>

            {/* Hero Main Content */}
            <div className="mission-hero__content">
              <div className="mission-hero__copy">
                <p className="hero-kicker font-mono">
                  <span /> NASA ARTEMIS CAMPAIGN <span className="hero-kicker__slash">/</span> LUNAR SURFACE EXPLORATION
                </p>
                <h1 id="mission-title" className="font-heading">
                  HELIOS
                </h1>
                <p className="mission-hero__subtitle">
                  Exploring the Moon. Understanding the Future.
                </p>
                <p className="mission-hero__lead">
                  An intelligent lunar exploration platform combining terrain analysis, solar power assessment, communication insights, and mission planning.
                </p>
                <div className="mission-hero__actions">
                  <a className="button-primary" href="#environment">
                    Explore the environment <ArrowDown size={15} aria-hidden="true" />
                  </a>
                  <a className="button-quiet" href="#helios-advisor">
                    Open HELIOS advisor <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
                <div className="hero-caption">
                  <span className="hero-caption__line" />
                  <span>Authentic Lunar Surface EVA Footage · NASA Historic Archive</span>
                </div>
              </div>

              {/* Scientific Mission Workspace Overview */}
              <aside className="hero-overview" aria-label="Mission workspace capabilities">
                <div className="hero-overview__topline font-mono">
                  <span>MISSION WORKSPACE</span>
                  <Compass size={14} aria-hidden="true" />
                </div>
                <p className="hero-overview__title font-heading">Scientific Lunar Mission Intelligence</p>
                <div className="hero-overview__items">
                  {overviewItems.map(({ icon: Icon, label, description }, index) => (
                    <div className="hero-overview__item" key={label}>
                      <span className="hero-overview__icon"><Icon size={15} aria-hidden="true" /></span>
                      <span className="hero-overview__text"><strong>{label}</strong><small>{description}</small></span>
                      <span className="hero-overview__index font-mono">0{index + 1}</span>
                    </div>
                  ))}
                </div>
                <a className="hero-overview__link" href="#environment">
                  Open Mission Telemetry <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </aside>
            </div>

            {/* Bottom Telemetry Rule */}
            <div className="mission-hero__bottom font-mono" aria-hidden="true">
              <span>01 — TOPOGRAPHY</span>
              <span>02 — SOLAR &amp; COMMS</span>
              <span>03 — SITE ADVISOR</span>
              <span className="mission-hero__bottom-rule" />
              <span>NASA LRO / LOLA 30M TOPOGRAPHY · JPL HORIZONS EPHEMERIS</span>
            </div>
          </section>

          <div className="dashboard-light-surface">
            <div className="dashboard-content">
              <section id="environment" className="dashboard-section" aria-labelledby="environment-heading">
                <SectionHeading
                  id="environment-heading"
                  title="See the system in motion."
                  detail="Explore 3D Sun, Earth, and lunar South Pole topography, select candidate landing sites, and inspect illumination and direct-to-Earth visibility."
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
                  title="Put candidate sites in context."
                  detail="Compare south-pole landing-site scenarios side by side."
                />
                <div className="workspace-grid">
                  <Suspense
                    fallback={
                      <div className="mission-panel comparison-loading p-6 text-center text-slate-300 text-sm" role="status">
                        Loading comparison workspace…
                      </div>
                    }
                  >
                    <ComparisonPanel />
                  </Suspense>
                </div>
              </section>

              <section id="helios-advisor" className="dashboard-section dashboard-section--advisor" aria-labelledby="advisor-heading">
                <SectionHeading
                  id="advisor-heading"
                  title="Make the next decision with HELIOS."
                  detail="Ask questions about the lunar South Pole landing sites and continue the conversation."
                />
                {!advisorModalOpen ? (
                  <HeliosAdvisorPanel />
                ) : (
                  <div className="mission-panel p-6 text-center text-sm text-slate-200">
                    HELIOS Advisor is currently open in the floating window.
                  </div>
                )}
              </section>

              <footer className="dashboard-footer">
                <a className="dashboard-footer__brand" href="#mission">
                  <span className="brand-mark">
                    <Orbit size={16} aria-hidden="true" />
                  </span>
                  CosmynX
                </a>
                <p>Lunar South Pole Mission Explorer</p>
                <a
                  href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA Blue Marble imagery <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </footer>
            </div>
          </div>
        </main>

        {/* Floating Astronaut AI Agent Access Button */}
        <button
          type="button"
          onClick={() => setAdvisorModalOpen((open) => !open)}
          className="helios-astronaut-launcher"
          aria-label={advisorModalOpen ? "Close HELIOS AI Agent" : "Open HELIOS AI Agent"}
          aria-expanded={advisorModalOpen}
          title="Ask HELIOS Mission Advisor"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="HELIOS Lunar Landing Advisor"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setAdvisorModalOpen(false);
              }
            }}
          >
            <div className="helios-modal-light relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-sky-200/20 bg-[#081224]/75 text-slate-100 shadow-2xl backdrop-blur-md">
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-sky-200/15 bg-[#081224]/80 px-5 py-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <img
                    src={heliosAstronaut}
                    alt=""
                    className="h-9 w-auto object-contain"
                  />
                  <p className="text-base font-semibold text-white">
                    HELIOS Lunar Landing Advisor
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdvisorModalOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200/20 bg-[#0c1b34]/70 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-[#13284c] hover:text-white"
                  aria-label="Close HELIOS Advisor overlay"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <HeliosAdvisorPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </MissionProvider>
  );
}
