import { apiPost } from "../../../services/api";
import type { ConditionsResponse } from "../../../types/helios";

export interface ScenarioInput {
  site_id: string;
  start_utc: string;
  end_utc: string;
  step_minutes?: number;
}

export function compareScenarios(scenarios: ScenarioInput[]) {
  return apiPost<{ scenarios: ScenarioInput[] }, { results: ConditionsResponse[] }>(
    "/api/compare",
    { scenarios }
  );
}
