import { MissionProvider } from "./context/MissionContext";
import { Navbar } from "./components/layout/Navbar";
import { CosmicBackground } from "./components/layout/CosmicBackground";
import { LunarMapPanel } from "./features/lunar-map/components/LunarMapPanel";
import { SunEarthPanel } from "./features/sun-earth/components/SunEarthPanel";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { ComparisonPanel } from "./features/comparison/components/ComparisonPanel";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";

export default function App() {
  return (
    <MissionProvider>
      <div className="relative min-h-screen text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <CosmicBackground />
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 grid gap-6 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <LunarMapPanel />
          </div>
          <SunEarthPanel />
          <PowerCommunicationPanel />
          <ComparisonPanel />
          <HeliosAdvisorPanel />
        </main>
      </div>
    </MissionProvider>
  );
}
