import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";

export function PowerCommunicationPanel() {
  const { selectedSite } = useMission();

  return (
    <ModuleCard
      title="Solar Power & Communication Analysis"
      owner="Member 4"
      branch="feature/power-communication"
    >
      <div className="flex flex-col gap-2">
        {selectedSite && (
          <div className="flex items-center gap-2 rounded bg-slate-950/60 px-2.5 py-1 text-xs text-cyan-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Target: {selectedSite.name} ({selectedSite.site_id})</span>
          </div>
        )}
        <p>
          Sunlight availability %, Earth visibility %, and direct-to-Earth
          communication windows go here.
        </p>
      </div>
    </ModuleCard>
  );
}
