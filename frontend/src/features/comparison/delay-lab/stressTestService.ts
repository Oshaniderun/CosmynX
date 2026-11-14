import type { EphemerisResponse } from "../../../types/helios";
import type { ScenarioComparison } from "../services/comparisonService";

export type CellStatus = "meets" | "exceeds" | "unknown";
export interface StudySite {
  key: string;
  site_id?: string;
  name?: string;
  latitude_deg?: number;
  longitude_deg?: number;
}
export interface StudyConstraints {
  maximum_darkness_hours: number | null;
  maximum_earth_outage_hours: number | null;
  minimum_joint_visibility_hours: number | null;
}
export interface StressProfile {
  title: string;
  nominal_start_utc: string;
  mission_duration_hours: number;
  max_delay_hours: number;
  departure_step_hours: number;
  sample_step_minutes: number;
  baseline_site_key: string;
  sites: StudySite[];
  constraints: StudyConstraints;
  data_mode: "scientific";
}
export interface ResolvedSite {
  key: string;
  site_id: string;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  coordinate_type: string;
  source: string;
}
export interface ConstraintCheck {
  key: keyof StudyConstraints;
  label: string;
  limit_hours: number;
  measured_hours: number | null;
  margin_hours: number | null;
  status: CellStatus;
}
export interface StressCell {
  cell_id: string;
  site_key: string;
  delay_hours: number;
  start_utc: string;
  end_utc: string;
  status: CellStatus;
  metrics: {
    sunlit_hours: number | null;
    earth_visible_hours: number | null;
    simultaneous_visibility_hours: number | null;
    longest_darkness_hours: number | null;
    longest_earth_outage_hours: number | null;
  };
  constraints: ConstraintCheck[];
  binding_constraint: string;
  sun_coverage_fraction: number;
  earth_coverage_fraction: number;
}
export interface StudyRun {
  run_id: string;
  created_utc: string;
  algorithm_version: string;
  profile: StressProfile;
  sites: ResolvedSite[];
  departure_offsets_hours: number[];
  cells: StressCell[];
  summaries: {
    site_key: string;
    meets: number;
    exceeds: number;
    unknown: number;
    first_exceeding_delay_hours: number | null;
    initial_meeting_through_hours: number | null;
  }[];
  datasets: {
    site_key: string;
    sha256: string;
    source: string;
    retrieved_utc: string | null;
    request_fingerprint: string | null;
    sample_count: number;
    warnings: string[];
  }[];
  assumptions: string[];
}
export interface CellDetail {
  cell: StressCell;
  scenario: ScenarioComparison;
  ephemeris: EphemerisResponse;
}

export const DEFAULT_PROFILE: StressProfile = {
  title: "University payload delay rehearsal",
  nominal_start_utc: "2026-11-27T00:00:00Z",
  mission_duration_hours: 72,
  max_delay_hours: 72,
  departure_step_hours: 6,
  sample_step_minutes: 15,
  baseline_site_key: "",
  sites: [],
  constraints: {
    maximum_darkness_hours: 6,
    maximum_earth_outage_hours: 8,
    minimum_joint_visibility_hours: 24,
  },
  data_mode: "scientific",
};
export const TRAINING_PROFILE: StressProfile = {
  ...DEFAULT_PROFILE,
  title: "A 24-hour delay changes the plan",
  baseline_site_key: "ref_shackleton",
  sites: [
    {
      key: "ref_shackleton",
      name: "Shackleton reference",
      latitude_deg: -89.54,
      longitude_deg: 0,
    },
    {
      key: "ref_malapert",
      name: "Malapert reference",
      latitude_deg: -86,
      longitude_deg: 2,
    },
  ],
};
export const statusLabel = {
  meets: "Meets",
  exceeds: "Exceeds",
  unknown: "Unknown",
};
export const hour = (value: number | null | undefined) =>
  value == null ? "Unknown" : `${value.toFixed(2).replace(/\.00$/, "")} h`;
export const utcLabel = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value)) + " UTC";
export const findCell = (run: StudyRun, key: string, delay: number) =>
  run.cells.find((cell) => cell.site_key === key && cell.delay_hours === delay);
export function eligibleAlternatives(
  run: StudyRun,
  earliestDelay: number,
  impacted: StressCell,
) {
  const slack = (cell: StressCell) =>
    Math.min(
      ...cell.constraints.map((check) => check.margin_hours ?? -Infinity),
    );
  return run.cells
    .filter(
      (cell) =>
        cell.status === "meets" &&
        cell.delay_hours >= earliestDelay &&
        cell.cell_id !== impacted.cell_id,
    )
    .sort(
      (a, b) =>
        a.delay_hours - b.delay_hours ||
        Number(a.site_key !== impacted.site_key) -
          Number(b.site_key !== impacted.site_key) ||
        slack(b) - slack(a) ||
        a.cell_id.localeCompare(b.cell_id),
    );
}

const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail
              .map((item: { msg?: string }) => item.msg ?? "Invalid input")
              .join("; ")
          : `Request failed (${response.status}).`;
    throw new Error(detail);
  }
  return data as T;
}
export const createStudy = (profile: StressProfile, signal: AbortSignal) =>
  request<StudyRun>("/api/stress-tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
    signal,
  });
export const getCell = (runId: string, cellId: string, signal: AbortSignal) =>
  request<CellDetail>(
    `/api/stress-tests/${runId}/cells/${encodeURIComponent(cellId)}`,
    { signal },
  );
export const exportStudy = (runId: string) =>
  request<Record<string, unknown>>(`/api/stress-tests/${runId}/export`);
export function downloadJSON(data: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 20000);
}
