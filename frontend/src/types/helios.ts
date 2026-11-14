export interface TerrainSafetyMetrics {
  elevation_m: number | null;
  mean_slope_deg: number | null;
  max_slope_deg: number | null;
  roughness_m: number | null;
  psr_proximity_km: number | null;
  terrain_safety_score: number | null;
  safety_rating: "safe" | "caution" | "hazardous" | null;
}

export interface TerrainSafetyResponse {
  site_id: string;
  latitude_deg: number;
  longitude_deg: number;
  metrics: TerrainSafetyMetrics;
  source: string;
  status: "ok" | "unavailable";
  notes?: string | null;
}

export interface LandingSite {
  site_id: string;
  name: string;
  region: string;
  latitude_deg: number;
  longitude_deg: number;
  description?: string | null;
  terrain?: TerrainSafetyMetrics | null;
}

export interface MapLayerResource {
  layer_id: string;
  name: string;
  projection: "SP" | "EQ";
  coverage: string;
  format: string;
  tile_matrix_set: string;
  max_zoom: number;
  extent_m?: number[] | null;
  wmts_capabilities: string;
  tile_template: string;
}

export interface MapLayersResponse {
  portal_url: string;
  south_pole_layers: MapLayerResource[];
  global_layer: MapLayerResource;
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
