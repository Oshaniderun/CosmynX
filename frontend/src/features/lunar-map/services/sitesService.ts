import { apiGet } from "../../../services/api";
import type { LandingSite } from "../../../types/helios";

export function fetchCandidateSites(): Promise<LandingSite[]> {
  return apiGet<LandingSite[]>("/api/sites");
}
