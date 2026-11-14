import connectingRidge from "../assets/connecting-ridge-skyline.json";
import type { EphemerisPoint, EphemerisResponse } from "../../../types/helios";

type Coordinates = Pick<EphemerisResponse, "latitude_deg" | "longitude_deg">;

export function getTerrainProfile(site?: Coordinates) {
  if (site?.latitude_deg === connectingRidge.latitude_deg &&
      site.longitude_deg === connectingRidge.longitude_deg) {
    return connectingRidge;
  }
}

type TerrainProfile = NonNullable<ReturnType<typeof getTerrainProfile>>;

export function skylineAt(profile: TerrainProfile, azimuth: number) {
  const bearing = ((azimuth % 360) + 360) % 360;
  const bin = bearing / profile.azimuth_step_deg;
  const lowerBin = Math.floor(bin);
  const elevations = profile.skyline_deg;
  const lower = elevations[lowerBin];
  const upper = elevations[(lowerBin + 1) % elevations.length];
  return lower + (upper - lower) * (bin - lowerBin);
}

export function terrainClearance(
  profile: TerrainProfile,
  azimuth: number | null,
  elevation: number | null,
) {
  if (azimuth === null || elevation === null) return undefined;
  const skyline = skylineAt(profile, azimuth);
  return { skyline, clearance: elevation - skyline };
}

export function summarizeSolarObstruction(profile: TerrainProfile, points: EphemerisPoint[], stepMinutes: number) {
  const samples = points.map((point) => terrainClearance(profile, point.sun_azimuth_deg, point.sun_elevation_deg));
  const obscured = samples.map((local, index) =>
    local !== undefined && (points[index].sun_elevation_deg ?? 0) > 0 && local.clearance <= 0,
  );
  const first = obscured.indexOf(true);
  if (first < 0) return undefined;

  const previous = points[first - 1];
  const current = points[first];
  const previousClearance = samples[first - 1];
  const crossing = previous && previousClearance && previousClearance.clearance > 0 &&
    Date.parse(current.timestamp_utc) - Date.parse(previous.timestamp_utc) === stepMinutes * 60_000
    ? { from: previous.timestamp_utc, to: current.timestamp_utc }
    : undefined;

  return {
    first,
    crossing,
    obscuredCount: obscured.filter(Boolean).length,
    assessedCount: samples.filter((sample) => sample !== undefined).length,
  };
}
