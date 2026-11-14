export interface LandingSite {
  site_id: string;
  name: string;
  region: string;
  latitude_deg: number;
  longitude_deg: number;
  description?: string | null;
}

export interface VisibilityMetrics {
  sunlit_fraction: number | null;
  earth_visible_fraction: number | null;
  sunlit_hours: number | null;
  earth_visible_hours: number | null;
}

export interface ConditionsResponse {
  site_id: string;
  latitude_deg: number;
  longitude_deg: number;
  start_utc: string;
  end_utc: string;
  step_minutes: number;
  metrics: VisibilityMetrics;
  horizon_model: string;
  status: "ok" | "pending" | "unavailable";
  source: string;
}

export interface EphemerisPoint {
  timestamp_utc: string;
  sun_azimuth_deg: number | null;
  sun_elevation_deg: number | null;
  earth_azimuth_deg: number | null;
  earth_elevation_deg: number | null;
}

export interface EphemerisResponse {
  site_id: string;
  latitude_deg: number;
  longitude_deg: number;
  start_utc: string;
  end_utc: string;
  step_minutes: number;
  source: string;
  status: "ok" | "pending" | "unavailable";
  points: EphemerisPoint[];
}
