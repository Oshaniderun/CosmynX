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
      <div className="flex flex-col gap-2">
        {selectedSite && (
          <div className="flex items-center gap-2 rounded bg-slate-950/60 px-2.5 py-1 text-xs text-cyan-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Target Evaluated: {selectedSite.name} ({selectedSite.site_id})</span>
          </div>
        )}
        <p>
          Mission constraint inputs, transparent site rankings, and explainable
          recommendations grounded in scientific results go here.
        </p>
      </div>
    </ModuleCard>
  );
}
