import { apiGet } from "../../../services/api";
import type { LandingSite, MapLayersResponse } from "../../../types/helios";

export function fetchCandidateSites(): Promise<LandingSite[]> {
  return apiGet<LandingSite[]>("/api/sites");
}

export function fetchMapLayers(): Promise<MapLayersResponse> {
  return apiGet<MapLayersResponse>("/api/sites/layers");
}
