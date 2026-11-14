import { MissionProvider } from "./context/MissionContext";
import { Navbar } from "./components/layout/Navbar";
import { LunarMapPanel } from "./features/lunar-map/components/LunarMapPanel";
import { SunEarthPanel } from "./features/sun-earth/components/SunEarthPanel";
import { PowerCommunicationPanel } from "./features/power-communication/components/PowerCommunicationPanel";
import { ComparisonPanel } from "./features/comparison/components/ComparisonPanel";
import { HeliosAdvisorPanel } from "./features/helios-ai/components/HeliosAdvisorPanel";

export default function App() {
  return (
    <MissionProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-2">
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
