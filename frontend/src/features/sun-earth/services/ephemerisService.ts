import { apiGet } from "../../../services/api";
import type { EphemerisResponse } from "../../../types/helios";

export function fetchEphemeris(siteId: string): Promise<EphemerisResponse> {
  return apiGet<EphemerisResponse>(`/api/ephemeris?site_id=${encodeURIComponent(siteId)}`);
}
