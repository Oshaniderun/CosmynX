import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";

export function ComparisonPanel() {
  const { selectedSite } = useMission();

  return (
    <ModuleCard
      title="Scenario Comparison & Timelines"
      owner="Member 5"
      branch="feature/comparison"
    >
      <div className="flex flex-col gap-2">
        {selectedSite && (
          <div className="flex items-center gap-2 rounded bg-slate-950/60 px-2.5 py-1 text-xs text-cyan-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Primary Site: {selectedSite.name} ({selectedSite.site_id})</span>
          </div>
        )}
        <p>
          Side-by-side landing site & mission-date comparison charts (Recharts)
          and mission-delay analysis go here.
        </p>
      </div>
    </ModuleCard>
  );
}
