import { ModuleCard } from "../../../components/shared/ModuleCard";

export function PowerCommunicationPanel() {
  return (
    <ModuleCard
      title="Solar Power & Communication Analysis"
      owner="Member 4"
      branch="feature/power-communication"
    >
      <p>
        Sunlight availability %, Earth visibility %, and direct-to-Earth
        communication windows go here.
      </p>
    </ModuleCard>
  );
}
