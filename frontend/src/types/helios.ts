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
  elevation_m?: number | null;
  source?: string;
  coordinate_type?: string;
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

export interface OperationalWindow {
  target: "sunlight" | "earth" | "both";
  start_utc: string;
  end_utc: string;
  duration_hours: number;
}

export interface ConditionTimelinePoint {
  timestamp_utc: string;
  sun_elevation_deg: number | null;
  earth_elevation_deg: number | null;
  is_sunlit: boolean;
  is_earth_visible: boolean;
  power_watts_vertical?: number;
  power_watts_horizontal?: number;
  power_watts_tracking?: number;
}

export interface BatterySizingInfo {
  longest_darkness_hours: number;
  baseline_hotel_load_watts: number;
  usable_storage_kwh: number;
  nominal_capacity_kwh: number;
  max_dod_percent: number;
  estimated_battery_mass_kg: number;
  battery_chemistry: string;
}

export interface PowerModelingInfo {
  rated_array_kw: number;
  cumulative_energy_kwh: {
    vertical_polar: number;
    tracking: number;
    horizontal: number;
  };
  battery_sizing: BatterySizingInfo;
}

export interface VisibilityTransitionDetail {
  current_state: "sunlit" | "shadow" | "contact_active" | "blackout";
  next_event: "sunset" | "sunrise" | "earthset" | "earthrise" | "none";
  transition_utc: string | null;
  hours_until: number | null;
  description: string;
}

export interface ConditionsTransitions {
  solar: VisibilityTransitionDetail;
  earth: VisibilityTransitionDetail;
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
  windows?: OperationalWindow[];
  timeline?: ConditionTimelinePoint[];
  power_modeling?: PowerModelingInfo;
  transitions?: ConditionsTransitions;
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
