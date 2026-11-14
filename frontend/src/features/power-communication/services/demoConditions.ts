import type { ConditionsResponse } from "../../../types/helios";

export const demoConditions: ConditionsResponse = {
  site_id: "candidate_001",
  latitude_deg: -89.54,
  longitude_deg: 0.0,
  start_utc: "2026-11-20T00:00:00Z",
  end_utc: "2026-11-20T06:00:00Z",
  step_minutes: 60,
  metrics: {
    sunlit_fraction: 0.67,
    earth_visible_fraction: 1.0,
    sunlit_hours: 4.0,
    earth_visible_hours: 6.0,
  },
  horizon_model: "geometric",
  status: "ok",
  source: "JPL Horizons",
};
