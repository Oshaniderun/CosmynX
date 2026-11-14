import { apiPost } from "../../../services/api";

export interface HeliosRecommendRequest {
  objective: "maximize_sunlight" | "maximize_earth_visibility" | "balanced";
  minimum_earth_visibility_pct: number;
  minimum_sunlight_pct?: number;
  mission_duration_hours: number;
  start_utc?: string;
  query?: string;
}

export function requestRecommendations(payload: HeliosRecommendRequest) {
  return apiPost<HeliosRecommendRequest, unknown>("/api/helios/recommend", payload);
}
