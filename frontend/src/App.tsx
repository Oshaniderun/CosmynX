import { useState } from "react";
import { ArrowRightLeft, Globe2, Radio, Sparkles } from "lucide-react";
import { MissionProvider } from "./context/MissionContext";
import { Navbar } from "./components/layout/Navbar";
import { LunarMapPanel } from "./features/lunar-map/components/LunarMapPanel";
import { SunEarthPanel } from "./features/sun-earth/components/SunEarthPanel";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { ComparisonWorkspace } from "./features/comparison/components/ComparisonWorkspace";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";
import "./components/layout/workspace.css";

const sections = [
  { id: "compare", label: "Compare", icon: ArrowRightLeft },
  { id: "explore", label: "Lunar explorer", icon: Globe2 },
  { id: "power", label: "Power & comms", icon: Radio },
  { id: "advisor", label: "AI advisor", icon: Sparkles },
] as const;

export default function App() {
  const [section, setSection] = useState<string>("compare");
  const [visited, setVisited] = useState(() => new Set(["compare"]));
  return (
    <MissionProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <nav className="helios-workspace-nav" aria-label="Mission workspace">
          <div>
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={section === id ? "page" : undefined}
                aria-controls={`workspace-${id}`}
                onClick={() => {
                  setSection(id);
                  setVisited((current) => new Set([...current, id]));
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <span className="helios-workspace-note">
              LUNAR MISSION WORKSPACE
            </span>
          </div>
        </nav>
        <main className="helios-workspace-main">
          <div
            className="helios-panel"
            id="workspace-compare"
            hidden={section !== "compare"}
          >
            <ComparisonWorkspace active={section === "compare"} />
          </div>
          <div
            className="helios-panel helios-explorer"
            id="workspace-explore"
            hidden={section !== "explore"}
          >
            {visited.has("explore") && (
              <>
                <LunarMapPanel />
                <SunEarthPanel />
              </>
            )}
          </div>
          <div
            className="helios-panel"
            id="workspace-power"
            hidden={section !== "power"}
          >
            {visited.has("power") && <PowerCommunicationPanel />}
          </div>
          <div
            className="helios-panel"
            id="workspace-advisor"
            hidden={section !== "advisor"}
          >
            {visited.has("advisor") && <HeliosAdvisorPanel />}
          </div>
        </main>
      </div>
    </MissionProvider>
  );
}
