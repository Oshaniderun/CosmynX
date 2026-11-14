import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";

export function SunEarthPanel() {
  const { selectedSite } = useMission();

  return (
    <ModuleCard
      title="Sun & Earth Position Visualization"
      owner="Member 3"
      branch="feature/sun-earth"
    >
      <div className="flex flex-col gap-2">
        {selectedSite && (
          <div className="flex items-center gap-2 rounded bg-slate-950/60 px-2.5 py-1 text-xs text-cyan-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Target: {selectedSite.name} ({selectedSite.site_id})</span>
          </div>
        )}
        <p>
          Local-horizon Sun & Earth azimuth/elevation visualization and position
          timelines go here.
        </p>
      </div>
    </ModuleCard>
  );
}
