import type { EphemerisResponse } from "../../../types/helios";

export const demoEphemeris: EphemerisResponse = {
  site_id: "demo",
  latitude_deg: -89.54,
  longitude_deg: 0,
  start_utc: "2026-11-20T00:00:00Z",
  end_utc: "2026-11-20T05:00:00Z",
  step_minutes: 60,
  status: "ok",
  source: "Simulated demo data",
  points: [
    { timestamp_utc: "2026-11-20T00:00:00Z", sun_azimuth_deg: 110, sun_elevation_deg: 4, earth_azimuth_deg: 35, earth_elevation_deg: -2 },
    { timestamp_utc: "2026-11-20T01:00:00Z", sun_azimuth_deg: 116, sun_elevation_deg: 3, earth_azimuth_deg: 36, earth_elevation_deg: -1 },
    { timestamp_utc: "2026-11-20T02:00:00Z", sun_azimuth_deg: 122, sun_elevation_deg: 2.5, earth_azimuth_deg: 37, earth_elevation_deg: 0 },
    { timestamp_utc: "2026-11-20T03:00:00Z", sun_azimuth_deg: 128, sun_elevation_deg: 0.5, earth_azimuth_deg: 38, earth_elevation_deg: 0.8 },
    { timestamp_utc: "2026-11-20T04:00:00Z", sun_azimuth_deg: 134, sun_elevation_deg: -0.6, earth_azimuth_deg: 39, earth_elevation_deg: 1.5 },
    { timestamp_utc: "2026-11-20T05:00:00Z", sun_azimuth_deg: 140, sun_elevation_deg: -2, earth_azimuth_deg: 40, earth_elevation_deg: 2 },
  ],
};
