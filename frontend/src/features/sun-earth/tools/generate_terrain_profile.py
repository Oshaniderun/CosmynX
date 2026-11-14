"""Generate the Connecting Ridge skyline from NASA's Site01 LOLA GeoTIFF.

Run with numpy and Pillow installed:
  python generate_terrain_profile.py Site01_final_adj_5mpp_surf.tif
"""

import hashlib
import json
from pathlib import Path
import sys

import numpy as np
from PIL import Image

LATITUDE_DEG = -89.45
LONGITUDE_DEG = -137.0
MOON_RADIUS_M = 1_737_400.0
OBSERVER_HEIGHT_M = 2.0
MAX_DISTANCE_M = 7_000
AZIMUTH_STEP_DEG = 0.1
SOURCE_URL = "https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site01/Site01_final_adj_5mpp_surf.tif"


def main(source: Path) -> None:
    with Image.open(source) as image:
        grid = np.asarray(image)
        pixel_x, pixel_y, _ = image.tag_v2[33550]
        _, _, _, left, top, _ = image.tag_v2[33922]
        projection = image.tag_v2[34736]

    # This product is a south polar stereographic raster in the DE421 lunar
    # mean Earth frame, with pixel-is-area registration and heights in meters.
    if (grid.shape != (3200, 3200) or (pixel_x, pixel_y) != (5, 5)
            or (left, top) != (-19000, -4000) or projection[0] != -90
            or projection[5:7] != (MOON_RADIUS_M, MOON_RADIUS_M)):
        raise ValueError("Expected NASA's 5 m Connecting Ridge Site01 grid")

    def elevation(lat, lon):
        rho = 2 * MOON_RADIUS_M * np.tan((lat + np.pi / 2) / 2)
        col = (rho * np.sin(lon) - left) / pixel_x - 0.5
        row = (top - rho * np.cos(lon)) / pixel_y - 0.5
        x = np.floor(col).astype(int)
        y = np.floor(row).astype(int)
        if np.any((x < 0) | (x + 1 >= grid.shape[1]) | (y < 0) | (y + 1 >= grid.shape[0])):
            raise ValueError("Skyline ray extends outside the elevation grid")
        u, v = col - x, row - y
        height = (
            grid[y, x] * (1 - u) * (1 - v) + grid[y, x + 1] * u * (1 - v)
            + grid[y + 1, x] * (1 - u) * v + grid[y + 1, x + 1] * u * v
        )
        if not np.isfinite(height).all():
            raise ValueError("No-data pixel along a skyline ray")
        return height

    lat, lon = np.radians([LATITUDE_DEG, LONGITUDE_DEG])
    observer_radius = MOON_RADIUS_M + elevation(lat, lon) + OBSERVER_HEIGHT_M
    distances = np.arange(2.5, MAX_DISTANCE_M + 2.5, 2.5)
    arc = distances / MOON_RADIUS_M
    horizon = []
    for azimuth in np.radians(np.arange(0, 360, AZIMUTH_STEP_DEG)):
        # Follow a great circle from the observer in this true-north bearing.
        target_lat = np.arcsin(
            np.sin(lat) * np.cos(arc) + np.cos(lat) * np.sin(arc) * np.cos(azimuth)
        )
        target_lon = lon + np.arctan2(
            np.sin(azimuth) * np.sin(arc) * np.cos(lat),
            np.cos(arc) - np.sin(lat) * np.sin(target_lat),
        )
        target_radius = MOON_RADIUS_M + elevation(target_lat, target_lon)
        angles = np.degrees(np.arctan2(
            target_radius * np.cos(arc) - observer_radius,
            target_radius * np.sin(arc),
        ))
        horizon.append(round(float(np.max(angles)), 4))

    with source.open("rb") as file:
        checksum = hashlib.file_digest(file, "sha256").hexdigest()
    destination = Path(__file__).resolve().parents[1] / "assets" / "connecting-ridge-skyline.json"
    payload = {
        "source_url": SOURCE_URL,
        "source_sha256": checksum,
        "latitude_deg": LATITUDE_DEG,
        "longitude_deg": LONGITUDE_DEG,
        "observer_height_m": OBSERVER_HEIGHT_M,
        "observer_radius_m": round(float(observer_radius), 3),
        "max_distance_m": MAX_DISTANCE_M,
        "pixel_size_m": pixel_x,
        "azimuth_step_deg": AZIMUTH_STEP_DEG,
        "skyline_deg": horizon,
    }
    destination.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {len(horizon)} bearings to {destination.name}")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
