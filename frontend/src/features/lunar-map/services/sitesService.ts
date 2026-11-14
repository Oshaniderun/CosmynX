import { apiGet, apiPost } from "../../../services/api";
import type { LandingSite } from "../../../types/helios";

export interface CustomSitePayload {
  name?: string;
  latitude_deg: number;
  longitude_deg: number;
  description?: string;
}

export function fetchCandidateSites(): Promise<LandingSite[]> {
  return apiGet<LandingSite[]>("/api/sites");
}

export function fetchSiteById(siteId: string): Promise<LandingSite> {
  return apiGet<LandingSite>(`/api/sites/${encodeURIComponent(siteId)}`);
}

export function validateCustomSite(payload: CustomSitePayload): Promise<LandingSite> {
  return apiPost<CustomSitePayload, LandingSite>("/api/sites/validate", payload);
}
