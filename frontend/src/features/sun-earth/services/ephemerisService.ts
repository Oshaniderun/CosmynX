import { apiGet } from "../../../services/api";
import type { EphemerisResponse, LandingSite } from "../../../types/helios";

// Dev ships cached observations for all three candidate sites in this window.
export const initialMissionWindow = {
  start_utc: "2026-11-20T00:00:00Z",
  end_utc: "2026-11-20T06:00:00Z",
  step_minutes: 60,
};

export function fetchEphemeris(site: LandingSite): Promise<EphemerisResponse> {
  const params = new URLSearchParams({
    site_id: site.site_id,
    latitude_deg: String(site.latitude_deg),
    longitude_deg: String(site.longitude_deg),
    start_utc: initialMissionWindow.start_utc,
    end_utc: initialMissionWindow.end_utc,
    step_minutes: String(initialMissionWindow.step_minutes),
  });
  return apiGet<EphemerisResponse>(`/api/ephemeris?${params}`);
}
