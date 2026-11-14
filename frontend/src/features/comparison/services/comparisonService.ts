import type { ConditionsResponse } from "../../../types/helios";

export interface ScenarioInput {
  site_id: string;
  start_utc: string;
  end_utc: string;
  step_minutes?: number;
  scenario_id?: string;
  latitude_deg?: number;
  longitude_deg?: number;
}

export interface VisibilityInterval {
  start_utc: string;
  end_utc: string;
  elapsed_hours: number;
  sunlit: boolean | null;
  earth_visible: boolean | null;
  sun_elevation_deg: number | null;
  earth_elevation_deg: number | null;
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
  summary_method: "conditions_service" | "comparison_intervals" | "synthetic";
  simultaneous_visibility_hours: number | null;
  longest_darkness_hours: number | null;
  longest_earth_outage_hours: number | null;
  retrieved_utc: string | null;
  request_fingerprint: string | null;
  sun_coverage_fraction: number;
  earth_coverage_fraction: number;
  windows: {
    target: "sunlight" | "earth" | "both";
    start_utc: string;
    end_utc: string;
    duration_hours: number;
  }[];
  setting_transitions: {
    target: "sunlight" | "earth";
    after_utc: string;
    by_utc: string;
    after_elapsed_hours: number;
    by_elapsed_hours: number;
  }[];
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

export async function compareScenarios(
  scenarios: ScenarioInput[],
  dataMode: "live" | "demo" = "live",
  signal?: AbortSignal,
): Promise<CompareResponse> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
  const response = await fetch(`${base}/api/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarios, data_mode: dataMode }),
    signal,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      typeof payload?.detail === "string"
        ? payload.detail
        : Array.isArray(payload?.detail)
          ? payload.detail
              .map((item: { msg?: string }) => item.msg ?? "Invalid input")
              .join("; ")
          : `Comparison request failed (${response.status}).`;
    throw new Error(detail);
  }
  return response.json() as Promise<CompareResponse>;
}
