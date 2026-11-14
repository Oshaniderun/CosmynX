import { apiGet } from "../../../services/api";
import type { ConditionsResponse } from "../../../types/helios";

export interface ConditionsQueryParams {
  site_id?: string;
  latitude_deg?: number;
  longitude_deg?: number;
  start_utc?: string;
  end_utc?: string;
  step_minutes?: number;
}

export function fetchConditions(
  siteIdOrParams?: string | ConditionsQueryParams
): Promise<ConditionsResponse> {
  const params: ConditionsQueryParams =
    typeof siteIdOrParams === "string"
      ? { site_id: siteIdOrParams }
      : siteIdOrParams ?? {};

  const query = new URLSearchParams();
  if (params.site_id) query.set("site_id", params.site_id);
  if (params.latitude_deg !== undefined) {
    query.set("latitude_deg", params.latitude_deg.toString());
  }
  if (params.longitude_deg !== undefined) {
    query.set("longitude_deg", params.longitude_deg.toString());
  }
  if (params.start_utc) query.set("start_utc", params.start_utc);
  if (params.end_utc) query.set("end_utc", params.end_utc);
  if (params.step_minutes !== undefined) {
    query.set("step_minutes", params.step_minutes.toString());
  }

  const qs = query.toString();
  return apiGet<ConditionsResponse>(`/api/conditions${qs ? `?${qs}` : ""}`);
}
