/**
 * Lunar South Polar Stereographic Coordinate Reference System (CRS)
 *
 * Adheres to IAU/IAG planetary cartography standards and NASA LOLA polar conventions:
 * - Lunar mean radius (R): 1,737,400.0 meters.
 * - Tangent plane: Lunar South Pole (latitude -90.0 deg).
 * - Central meridian: 0.0 deg (Prime Meridian pointing towards Earth along the +Y axis).
 * - Longitude convention: East positive (+X at 90 deg E, -X at 90 deg W / -90 deg).
 * - Projection Code: LUNAR:SOUTH_POLE_STEREOGRAPHIC
 */

import { Projection, addProjection, addCoordinateTransforms, get as getProjection } from "ol/proj";

export const LUNAR_MEAN_RADIUS_M = 1737400.0;
export const LUNAR_SOUTH_POLE_PROJ_CODE = "LUNAR:SOUTH_POLE_STEREOGRAPHIC";

// 250 km radius covers from South Pole (-90 deg) down to ~81.8 deg S
export const LUNAR_POLAR_EXTENT: [number, number, number, number] = [
  -250000, -250000, 250000, 250000,
];

/**
 * Forward transformation: Lunar Latitude/Longitude -> South Polar Stereographic (x, y) in meters.
 *
 * @param latDeg Latitude in decimal degrees (e.g. -89.7)
 * @param lonDeg Longitude in decimal degrees (e.g. 129.0)
 * @returns [x, y] coordinates in meters
 */
export function forwardLunarPolar(latDeg: number, lonDeg: number): [number, number] {
  if (latDeg <= -90.0) {
    return [0, 0];
  }
  const phi = (latDeg * Math.PI) / 180.0;
  const lam = (lonDeg * Math.PI) / 180.0;
  const k = 2.0 / (1.0 - Math.sin(phi));
  const x = LUNAR_MEAN_RADIUS_M * k * Math.cos(phi) * Math.sin(lam);
  const y = LUNAR_MEAN_RADIUS_M * k * Math.cos(phi) * Math.cos(lam);
  return [x, y];
}

/**
 * Inverse transformation: South Polar Stereographic (x, y) in meters -> Lunar Latitude/Longitude.
 *
 * @param x X coordinate in meters
 * @param y Y coordinate in meters
 * @returns [latDeg, lonDeg] in decimal degrees
 */
export function inverseLunarPolar(x: number, y: number): [number, number] {
  const r = Math.hypot(x, y);
  if (r === 0) {
    return [-90.0, 0.0];
  }
  const c = 2.0 * Math.atan(r / (2.0 * LUNAR_MEAN_RADIUS_M));
  const phi = c - Math.PI / 2.0;
  const lam = Math.atan2(x, y);
  const latDeg = (phi * 180.0) / Math.PI;
  let lonDeg = (lam * 180.0) / Math.PI;
  // Normalize to [-180, 180]
  lonDeg = ((lonDeg + 180.0) % 360.0 + 360.0) % 360.0 - 180.0;
  return [latDeg, lonDeg];
}

/**
 * Idempotently registers the lunar polar stereographic projection with OpenLayers.
 */
export function setupLunarProjection(): Projection {
  const existing = getProjection(LUNAR_SOUTH_POLE_PROJ_CODE);
  if (existing) {
    return existing;
  }

  const lunarProjection = new Projection({
    code: LUNAR_SOUTH_POLE_PROJ_CODE,
    extent: LUNAR_POLAR_EXTENT,
    worldExtent: [-180, -90, 180, -80],
    units: "m",
    axisOrientation: "enu",
  });

  addProjection(lunarProjection);

  // OpenLayers expects [lon, lat] in EPSG:4326 and [x, y] in projected CRS
  addCoordinateTransforms(
    "EPSG:4326",
    lunarProjection,
    (coordinate: number[]): number[] => {
      const [lon, lat] = coordinate;
      return forwardLunarPolar(lat, lon);
    },
    (coordinate: number[]): number[] => {
      const [x, y] = coordinate;
      const [lat, lon] = inverseLunarPolar(x, y);
      return [lon, lat];
    }
  );

  return lunarProjection;
}
