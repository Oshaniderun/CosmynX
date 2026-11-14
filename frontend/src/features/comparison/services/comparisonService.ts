import { apiPost } from "../../../services/api";
import type { ConditionsResponse } from "../../../types/helios";

export interface ScenarioInput {
  site_id: string;
  start_utc: string;
  end_utc: string;
  step_minutes?: number;
  scenario_id?: string;
}

export interface VisibilityInterval {
  start_utc: string;
  end_utc: string;
  elapsed_hours: number;
  sunlit: boolean | null;
  earth_visible: boolean | null;
}

export interface ScenarioComparison {
  scenario_id: string;
  site_name: string;
  duration_hours: number;
  conditions: ConditionsResponse;
  timeline: VisibilityInterval[];
  timeline_status: "ok" | "partial" | "unavailable";
  timeline_source: string;
  warnings: string[];
}

export interface ComparisonDelta {
  baseline_scenario_id: string;
  scenario_id: string;
  start_delay_hours: number;
  sunlit_percentage_points: number | null;
  earth_visible_percentage_points: number | null;
  sunlit_hours: number | null;
  earth_visible_hours: number | null;
  warnings: string[];
}

export interface CompareResponse {
  results: ConditionsResponse[];
  scenarios: ScenarioComparison[];
  deltas: ComparisonDelta[];
  data_mode: "live" | "demo";
  status: "ok" | "partial" | "pending" | "unavailable";
  assumptions: string[];
}

export function compareScenarios(
  scenarios: ScenarioInput[],
  dataMode: "live" | "demo" = "live",
) {
  return apiPost<
    { scenarios: ScenarioInput[]; data_mode: "live" | "demo" },
    CompareResponse
  >("/api/compare", { scenarios, data_mode: dataMode });
}
