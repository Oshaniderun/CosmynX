"""Build the offline Connecting Ridge replay from NASA/JPL SPICE kernels.

Run with NumPy and SpiceyPy installed:
  python generate_obstruction_replay.py /path/to/kernel-directory
"""

from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import sys

import numpy as np
import spiceypy as spice

KERNELS = (
    "spk/planets/de440s.bsp",
    "pck/moon_pa_de440_200625.bpc",
    "fk/satellites/moon_de440_250416.tf",
    "lsk/naif0012.tls",
)
FRAME = "MOON_ME_DE440_ME421"
START = datetime(2027, 1, 13, 10, tzinfo=timezone.utc)
HOURS = 30


def utc(date: datetime) -> str:
    return date.strftime("%Y-%m-%dT%H:%M:%SZ")


def main(kernel_dir: Path) -> None:
    assets = Path(__file__).resolve().parents[1] / "assets"
    profile = json.loads((assets / "connecting-ridge-skyline.json").read_text(encoding="utf-8"))
    latitude, longitude = np.radians([profile["latitude_deg"], profile["longitude_deg"]])
    up = np.array([np.cos(latitude) * np.cos(longitude), np.cos(latitude) * np.sin(longitude), np.sin(latitude)])
    east = np.array([-np.sin(longitude), np.cos(longitude), 0])
    north = np.cross(up, east)
    observer = up * profile["observer_radius_m"] / 1_000
    provenance = {}
    for name in KERNELS:
        file = kernel_dir / Path(name).name
        spice.furnsh(str(file))
        with file.open("rb") as stream:
            provenance[name] = hashlib.file_digest(stream, "sha256").hexdigest()

    points = []
    try:
        for hour in range(HOURS + 1):
            timestamp = utc(START + timedelta(hours=hour))
            epoch = spice.str2et(timestamp)
            point = {"timestamp_utc": timestamp}
            for body in ("SUN", "EARTH"):
                state, _ = spice.spkcpo(body, epoch, FRAME, "OBSERVER", "CN+S", observer, "MOON", FRAME)
                e, n, u = (state[:3] @ axis for axis in (east, north, up))
                azimuth = np.degrees(np.arctan2(e, n)) % 360
                elevation = np.degrees(np.arctan2(u, np.hypot(e, n)))
                point[f"{body.lower()}_azimuth_deg"] = round(float(azimuth), 6)
                point[f"{body.lower()}_elevation_deg"] = round(float(elevation), 6)
            points.append(point)
    finally:
        spice.kclear()

    example = {
        "site_id": "candidate_002",
        "latitude_deg": profile["latitude_deg"],
        "longitude_deg": profile["longitude_deg"],
        "start_utc": points[0]["timestamp_utc"],
        "end_utc": points[-1]["timestamp_utc"],
        "step_minutes": 60,
        "status": "ok",
        "source": "NASA/JPL SPICE (DE440)",
        "points": points,
    }
    payload = {"ephemeris": example, "frame": FRAME, "kernel_sha256": provenance}
    (assets / "connecting-ridge-obstruction.json").write_text(
        json.dumps(payload, indent=2) + "\n", encoding="utf-8",
    )


if __name__ == "__main__":
    main(Path(sys.argv[1]))
