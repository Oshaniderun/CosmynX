import { apiGet } from "../../../services/api";
import type { EphemerisResponse, LandingSite } from "../../../types/helios";

export type MissionWindow = Pick<EphemerisResponse, "start_utc" | "end_utc" | "step_minutes">;

// Dev ships cached observations for all three candidate sites in this window.
export const initialMissionWindow: MissionWindow = {
  start_utc: "2026-11-20T00:00:00Z",
  end_utc: "2026-11-20T06:00:00Z",
  step_minutes: 60,
};

export function fetchEphemeris(site: LandingSite, window: MissionWindow): Promise<EphemerisResponse> {
  const params = new URLSearchParams({
    site_id: site.site_id,
    latitude_deg: String(site.latitude_deg),
    longitude_deg: String(site.longitude_deg),
    start_utc: window.start_utc,
    end_utc: window.end_utc,
    step_minutes: String(window.step_minutes),
  });
  return apiGet<EphemerisResponse>(`/api/ephemeris?${params}`);
}
