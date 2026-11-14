import { Sparkles } from "lucide-react";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";

export function HeliosAdvisorPanel() {
  const { selectedSite } = useMission();

  return (
    <ModuleCard
      title="HELIOS AI Lunar Landing Advisor"
      owner="Member 6"
      branch="feature/helios-ai"
    >
      <div className="flex flex-col gap-3">
        {selectedSite && (
          <div className="flex items-center gap-2.5 rounded-lg border border-sky-500/30 bg-[#060D19]/80 backdrop-blur-md px-3.5 py-2 text-sm font-mono text-sky-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-sky-400 ring-2 ring-sky-400/30 animate-pulse" />
            <span>Target Evaluated: <strong className="text-white">{selectedSite.name}</strong> ({selectedSite.site_id})</span>
          </div>
        )}
        <div className="rounded-xl border border-white/[0.08] bg-[#0A1424]/70 backdrop-blur-md p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-heading uppercase tracking-wider text-xs">Autonomous Decision Engine</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Multi-criteria decision framework evaluates candidate lunar touchdown zones based on solar power continuous duration, direct-to-Earth communication availability, and terrain slope safety.
          </p>
        </div>
      </div>
    </ModuleCard>
  );
}
