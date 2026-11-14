import { ModuleCard } from "../../../components/shared/ModuleCard";

export function LunarMapPanel() {
  return (
    <ModuleCard
      title="Interactive Lunar Map & Site Selection"
      owner="Member 1"
      branch="feature/lunar-map"
    >
      <p>
        OpenLayers lunar surface map, candidate landing site markers, and
        coordinate/date selection controls go here.
      </p>
    </ModuleCard>
  );
}
