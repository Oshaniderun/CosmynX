"""Member 2 — NASA Data Integration Service.

Retrieves, normalizes, and caches Sun/Earth ephemeris data from NASA JPL Horizons,
and provides official NASA Moon Trek and LROC QuickMap resource metadata.
"""

from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from typing import Any

import httpx

HORIZONS_API_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"
SUN_COMMAND = "'10'"
EARTH_COMMAND = "'399'"
MOON_CENTER = "'coord@301'"

# Resolve <repo-root>/data/processed regardless of working directory
PROCESSED_DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "processed"


def _parse_utc_iso(utc_str: str) -> datetime:
    """Parse an ISO 8601 UTC string into a timezone-aware UTC datetime."""
    normalized = utc_str.strip()
    if normalized.endswith("Z"):
        normalized = normalized[:-1] + "+00:00"
    dt = datetime.fromisoformat(normalized)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _format_horizons_time(utc_str: str) -> str:
    """Format a UTC ISO 8601 timestamp for JPL Horizons ('YYYY-MM-DD HH:MM')."""
    return _parse_utc_iso(utc_str).strftime("%Y-%m-%d %H:%M")


def _parse_horizons_timestamp(raw_ts: str) -> str:
    """Convert JPL Horizons timestamp ('2026-Nov-20 00:00') to UTC ISO 8601."""
    cleaned = raw_ts.strip()
    for fmt in ("%Y-%b-%d %H:%M", "%Y-%b-%d %H:%M:%S", "%Y-%b-%d %H:%M:%S.%f"):
        try:
            dt = datetime.strptime(cleaned, fmt).replace(tzinfo=timezone.utc)
            return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            continue
    raise ValueError(f"Unrecognized JPL Horizons timestamp format: {raw_ts!r}")


def _parse_horizons_csv(result_text: str) -> dict[str, tuple[float, float]]:
    """Extract {timestamp_utc: (azimuth_deg, elevation_deg)} from Horizons output."""
    start_marker = "$$SOE"
    end_marker = "$$EOE"
    start_idx = result_text.find(start_marker)
    end_idx = result_text.find(end_marker)
    if start_idx == -1 or end_idx == -1 or end_idx <= start_idx:
        return {}

    block = result_text[start_idx + len(start_marker) : end_idx].strip()
    parsed: dict[str, tuple[float, float]] = {}

    for line in block.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 5:
            continue
        try:
            ts_iso = _parse_horizons_timestamp(parts[0])
            az_deg = float(parts[3])
            el_deg = float(parts[4])
            parsed[ts_iso] = (az_deg, el_deg)
        except (ValueError, IndexError):
            continue

    return parsed


def _query_horizons_target(
    target_command: str,
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int,
    timeout_seconds: float = 25.0,
) -> dict[str, tuple[float, float]]:
    """Query JPL Horizons for a single target body observed from a lunar coordinate."""
    params = {
        "format": "json",
        "COMMAND": target_command,
        "OBJ_DATA": "NO",
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "OBSERVER",
        "CENTER": MOON_CENTER,
        "COORD_TYPE": "GEODETIC",
        "SITE_COORD": f"'{longitude_deg:.6f},{latitude_deg:.6f},0'",
        "START_TIME": f"'{_format_horizons_time(start_utc)}'",
        "STOP_TIME": f"'{_format_horizons_time(end_utc)}'",
        "STEP_SIZE": f"'{step_minutes}m'",
        "QUANTITIES": "'4'",
        "CSV_FORMAT": "YES",
    }

    response = httpx.get(HORIZONS_API_URL, params=params, timeout=timeout_seconds)
    response.raise_for_status()
    payload = response.json()
    result_text = payload.get("result", "")
    return _parse_horizons_csv(result_text)


def _cache_path(
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int,
) -> Path:
    """Build a deterministic cache file path in data/processed/."""
    key_raw = (
        f"{latitude_deg:.4f}_{longitude_deg:.4f}_"
        f"{_parse_utc_iso(start_utc).strftime('%Y%m%dT%H%MZ')}_"
        f"{_parse_utc_iso(end_utc).strftime('%Y%m%dT%H%MZ')}_"
        f"{step_minutes}m"
    )
    digest = hashlib.sha256(key_raw.encode("utf-8")).hexdigest()[:12]
    return PROCESSED_DATA_DIR / f"ephemeris_{digest}.json"


def fetch_jpl_horizons_ephemeris(
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
    use_cache: bool = True,
) -> list[dict[str, Any]]:
    """Fetch, normalize, and cache Sun/Earth ephemeris from NASA JPL Horizons.

    Coordinates use East-positive longitude (-180 to 180 deg) and geodetic
    latitude (-90 to 90 deg) on the Moon (body 301). Timestamps are UTC ISO 8601.
    Returns an empty list if upstream data is unavailable (never invents values).
    """
    cache_file = _cache_path(
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
    )

    if use_cache and cache_file.exists():
        try:
            cached = json.loads(cache_file.read_text(encoding="utf-8"))
            if isinstance(cached, dict) and isinstance(cached.get("points"), list):
                return cached["points"]
        except (OSError, json.JSONDecodeError):
            pass

    try:
        sun_series = _query_horizons_target(
            target_command=SUN_COMMAND,
            latitude_deg=latitude_deg,
            longitude_deg=longitude_deg,
            start_utc=start_utc,
            end_utc=end_utc,
            step_minutes=step_minutes,
        )
        earth_series = _query_horizons_target(
            target_command=EARTH_COMMAND,
            latitude_deg=latitude_deg,
            longitude_deg=longitude_deg,
            start_utc=start_utc,
            end_utc=end_utc,
            step_minutes=step_minutes,
        )
    except (httpx.HTTPError, ValueError):
        return []

    timestamps = sorted(set(sun_series.keys()) | set(earth_series.keys()))
    if not timestamps:
        return []

    points: list[dict[str, Any]] = []
    for ts in timestamps:
        sun_az, sun_el = sun_series.get(ts, (None, None))
        earth_az, earth_el = earth_series.get(ts, (None, None))
        points.append(
            {
                "timestamp_utc": ts,
                "sun_azimuth_deg": sun_az,
                "sun_elevation_deg": sun_el,
                "earth_azimuth_deg": earth_az,
                "earth_elevation_deg": earth_el,
            }
        )

    if use_cache:
        PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
        cache_payload = {
            "source": "JPL Horizons",
            "body": "Moon (301)",
            "longitude_convention": "East-positive (-180 to 180 deg)",
            "latitude_deg": latitude_deg,
            "longitude_deg": longitude_deg,
            "start_utc": _parse_utc_iso(start_utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_utc": _parse_utc_iso(end_utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "step_minutes": step_minutes,
            "points": points,
        }
        cache_file.write_text(json.dumps(cache_payload, indent=2), encoding="utf-8")

    return points


def get_lunar_map_resources() -> dict[str, Any]:
    """Return official NASA Moon Trek (EQ + SP) and LROC QuickMap portal metadata."""
    return {
        "moon_trek": {
            "name": "NASA Moon Trek",
            "portal_url": "https://trek.nasa.gov/moon/",
            "wmts_base_url": "https://trek.nasa.gov/tiles/Moon/EQ/",
            "south_pole_wmts_base_url": "https://trek.nasa.gov/tiles/Moon/SP/",
            "wac_wmts_capabilities": "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/WMTSCapabilities.xml",
            "wac_tile_template": "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
            "south_pole_layers": [
                {
                    "layer_id": "LRO_WAC_Mosaic_SPole60_100mp",
                    "name": "LRO WAC South Pole Mosaic (100 m/px)",
                    "projection": "SP",
                    "coverage": "60S to 90S",
                    "format": "image/png",
                    "tile_matrix_set": "default028mm",
                    "max_zoom": 4,
                    "extent_m": [-931100.0, -931100.0, 931100.0, 931100.0],
                    "wmts_capabilities": "https://trek.nasa.gov/tiles/Moon/SP/LRO_WAC_Mosaic_SPole60_100mp/1.0.0/WMTSCapabilities.xml",
                    "tile_template": "https://trek.nasa.gov/tiles/Moon/SP/LRO_WAC_Mosaic_SPole60_100mp/1.0.0/default/default028mm/{z}/{y}/{x}.png",
                },
                {
                    "layer_id": "WAC_POLE_ILL_PCT_SOUTH_100M",
                    "name": "LRO WAC South Pole Solar Illumination % (100 m/px)",
                    "projection": "SP",
                    "coverage": "South Pole",
                    "format": "image/png",
                    "tile_matrix_set": "default028mm",
                    "max_zoom": 5,
                    "extent_m": [-931100.0, -931100.0, 931100.0, 931100.0],
                    "wmts_capabilities": "https://trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT_SOUTH_100M/1.0.0/WMTSCapabilities.xml",
                    "tile_template": "https://trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT_SOUTH_100M/1.0.0/default/default028mm/{z}/{y}/{x}.png",
                },
            ],
            "purpose": "Lunar maps, South Pole polar-projection layers, and terrain visualization",
        },
        "lroc_quickmap": {
            "name": "LROC QuickMap",
            "portal_url": "https://quickmap.lroc.asu.edu/",
            "purpose": "Lunar surface imagery, topography, and landing site exploration",
        },
        "jpl_horizons": {
            "name": "NASA JPL Horizons",
            "portal_url": "https://ssd.jpl.nasa.gov/horizons/",
            "api_url": HORIZONS_API_URL,
            "purpose": "Sun and Earth ephemeris calculations for lunar locations",
        },
    }


def list_cached_datasets() -> list[dict[str, Any]]:
    """Return metadata for all cached ephemeris datasets in data/processed/."""
    if not PROCESSED_DATA_DIR.exists():
        return []
    datasets: list[dict[str, Any]] = []
    for path in sorted(PROCESSED_DATA_DIR.glob("ephemeris_*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            datasets.append(
                {
                    "file": path.name,
                    "latitude_deg": data.get("latitude_deg"),
                    "longitude_deg": data.get("longitude_deg"),
                    "start_utc": data.get("start_utc"),
                    "end_utc": data.get("end_utc"),
                    "step_minutes": data.get("step_minutes"),
                    "point_count": len(data.get("points", [])),
                }
            )
        except (OSError, json.JSONDecodeError):
            continue
    return datasets
