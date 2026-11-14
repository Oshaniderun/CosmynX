import { apiGet } from "../../../services/api";
import type { ConditionsResponse } from "../../../types/helios";

export function fetchConditions(siteId: string): Promise<ConditionsResponse> {
  return apiGet<ConditionsResponse>(`/api/conditions?site_id=${encodeURIComponent(siteId)}`);
}
