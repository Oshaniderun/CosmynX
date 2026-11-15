import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Compass, Orbit, Radio, Sparkles, Video, VideoOff } from "lucide-react";
import { Navbar } from "./components/layout/Navbar";
import { CosmicBackground } from "./components/layout/CosmicBackground";
import { UnifiedLunarExplorer } from "./features/lunar-map/components/UnifiedLunarExplorer";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";
import { MissionProvider } from "./context/MissionContext";
import lunarHorizon from "./assets/lunar-horizon.webp";

const ComparisonPanel = lazy(() => import("./features/comparison/components/ComparisonPanel").then((module) => ({ default: module.ComparisonPanel })));

const overviewItems = [
  { icon: Orbit, label: "Orbital geometry", description: "Sun, Earth & lunar ephemeris" },
  { icon: Radio, label: "Surface conditions", description: "Solar flux & direct-to-Earth LOS" },
  { icon: Sparkles, label: "Mission intelligence", description: "Evidence-based site evaluation" },
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
        <p className="section-eyebrow font-mono text-xs text-[#B5A38D] tracking-widest uppercase">
          <span className="inline-flex items-center justify-center rounded bg-[#181818] border border-[#2E2E2E] px-2 py-0.5 text-[10px] text-[#F1F0EC] font-bold mr-2">
            {index}
          </span>
          {eyebrow}
        </p>
        <h2 id={id} className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F0EC]">
          {title}
        </h2>
      </div>
      <p className="section-detail text-sm text-[#A8A8A8] leading-relaxed">{detail}</p>
    </div>
  );
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

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
            // If browser autoplay policy requires user interaction, keep muted and retry on first gesture
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

  return (
    <MissionProvider>
      <div className="relative app-shell min-h-screen text-[#F1F0EC] bg-[#050505] flex flex-col antialiased selection:bg-[#B5A38D]/30 selection:text-white">
        <CosmicBackground />
        <Navbar />
        <main>
          {/* 1. Landing Page – Cinematic Astronaut Background Video Hero (100vh) */}
          <section
            id="mission"
            className="mission-hero"
            aria-labelledby="mission-title"
          >
            {/* Full-Screen Video Background */}
            <div className="hero-video-container" aria-hidden="true">
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

          {/* Existing Connected Workspaces */}
          <div className="dashboard-content">
            <section id="environment" className="dashboard-section" aria-labelledby="environment-heading">
              <SectionHeading
                id="environment-heading"
                index="01"
                eyebrow="Mission environment & site explorer"
                title="Lunar Environment & Topography in Motion."
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
                title="Candidate Landing Sites in Context."
                detail="Compare south-pole landing-site scenarios side by side using connected NASA elevation profiles and geometric ephemeris."
              />
              <div className="workspace-grid">
                <Suspense fallback={<div className="mission-panel p-6 text-center text-[#A8A8A8] font-mono text-sm" role="status">Loading comparison workspace…</div>}>
                  <ComparisonPanel />
                </Suspense>
              </div>
            </section>

            <section id="helios-advisor" className="dashboard-section dashboard-section--advisor" aria-labelledby="advisor-heading">
              <SectionHeading
                id="advisor-heading"
                index="03"
                eyebrow="Mission planning assistant"
                title="Scientific Mission Decisions with HELIOS."
                detail="Translate mission criteria into a transparent, evidence-based site assessment. Every recommendation keeps its constraints and scientific provenance in view."
              />
              <HeliosAdvisorPanel />
            </section>

            <footer className="dashboard-footer">
              <a className="dashboard-footer__brand" href="#mission"><span className="brand-mark"><Orbit size={16} aria-hidden="true" /></span>CosmynX</a>
              <p>Lunar mission analysis · Geometric visibility is not communication reliability.</p>
              <a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">NASA Blue Marble &amp; LRO data <ArrowUpRight size={13} aria-hidden="true" /></a>
            </footer>
          </div>
        </main>
      </div>
    </MissionProvider>
  );
}
