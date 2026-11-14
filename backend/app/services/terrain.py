"""Lunar Terrain & Safety Data Service (NASA LRO LOLA DEM, Slope, Roughness)."""

import json
import math
from pathlib import Path
from typing import Any, Optional

from app.models.schemas import TerrainSafetyMetrics, TerrainSafetyResponse

REPO_ROOT = Path(__file__).resolve().parents[3]
LOLA_TERRAIN_PATH = REPO_ROOT / "data" / "processed" / "lola_terrain_south_pole.json"
MAX_ANGULAR_MATCH_DEG = 0.5


def _load_lola_catalog() -> dict[str, Any]:
    """Load the processed LRO LOLA South Pole terrain catalog."""
    if not LOLA_TERRAIN_PATH.exists():
        return {"dataset": "NASA LRO LOLA DEM", "sites": []}
    return json.loads(LOLA_TERRAIN_PATH.read_text(encoding="utf-8"))


def _angular_distance_deg(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Compute spherical angular separation in degrees."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlambda = math.radians(lon2 - lon1)
    cos_angle = (
        math.sin(phi1) * math.sin(phi2)
        + math.cos(phi1) * math.cos(phi2) * math.cos(dlambda)
    )
    cos_angle = max(-1.0, min(1.0, cos_angle))
    return math.degrees(math.acos(cos_angle))


def compute_terrain_safety_score(
    mean_slope_deg: float, max_slope_deg: float, roughness_m: float
) -> float:
    """Compute a 0–100 landing terrain safety score from slope and roughness."""
    mean_penalty = min(45.0, (mean_slope_deg / 20.0) * 45.0)
    max_penalty = min(30.0, (max_slope_deg / 30.0) * 30.0)
    roughness_penalty = min(25.0, (roughness_m / 2.5) * 25.0)
    return round(max(0.0, 100.0 - mean_penalty - max_penalty - roughness_penalty), 1)


def classify_safety_rating(
    mean_slope_deg: float, max_slope_deg: float, roughness_m: float
) -> str:
    """Classify landing terrain safety as safe, caution, or hazardous."""
    if mean_slope_deg <= 10.0 and max_slope_deg <= 15.0 and roughness_m <= 1.0:
        return "safe"
    if mean_slope_deg <= 15.0 and max_slope_deg <= 25.0 and roughness_m <= 2.0:
        return "caution"
    return "hazardous"


def _build_metrics(entry: dict[str, Any]) -> TerrainSafetyMetrics:
    mean_slope = float(entry["mean_slope_deg"])
    max_slope = float(entry["max_slope_deg"])
    roughness = float(entry["roughness_m"])
    return TerrainSafetyMetrics(
        elevation_m=float(entry["elevation_m"]),
        mean_slope_deg=mean_slope,
        max_slope_deg=max_slope,
        roughness_m=roughness,
        psr_proximity_km=float(entry["psr_proximity_km"])
        if entry.get("psr_proximity_km") is not None
        else None,
        terrain_safety_score=compute_terrain_safety_score(
            mean_slope, max_slope, roughness
        ),
        safety_rating=classify_safety_rating(mean_slope, max_slope, roughness),
    )


def get_terrain_for_site(
    site_id: str,
    latitude_deg: Optional[float] = None,
    longitude_deg: Optional[float] = None,
) -> TerrainSafetyResponse:
    """Return LOLA DEM elevation, slope, roughness, and safety rating for a site."""
    catalog = _load_lola_catalog()
    dataset_name = catalog.get("dataset", "NASA LRO LOLA DEM")
    entries: list[dict[str, Any]] = catalog.get("sites", [])

    matched: Optional[dict[str, Any]] = next(
        (entry for entry in entries if entry.get("site_id") == site_id), None
    )

    if matched is None and latitude_deg is not None and longitude_deg is not None:
        best_dist = float("inf")
        for entry in entries:
            dist = _angular_distance_deg(
                latitude_deg,
                longitude_deg,
                float(entry["latitude_deg"]),
                float(entry["longitude_deg"]),
            )
            if dist <= MAX_ANGULAR_MATCH_DEG and dist < best_dist:
                best_dist = dist
                matched = entry

    if matched is None:
        return TerrainSafetyResponse(
            site_id=site_id,
            latitude_deg=latitude_deg if latitude_deg is not None else 0.0,
            longitude_deg=longitude_deg if longitude_deg is not None else 0.0,
            metrics=TerrainSafetyMetrics(),
            source=dataset_name,
            status="unavailable",
        )

    return TerrainSafetyResponse(
        site_id=site_id,
        latitude_deg=latitude_deg
        if latitude_deg is not None
        else float(matched["latitude_deg"]),
        longitude_deg=longitude_deg
        if longitude_deg is not None
        else float(matched["longitude_deg"]),
        metrics=_build_metrics(matched),
        source=dataset_name,
        status="ok",
        notes=matched.get("notes"),
    )


def list_site_terrain() -> list[TerrainSafetyResponse]:
    """Return LOLA terrain safety evaluations for all mapped South Pole sites."""
    catalog = _load_lola_catalog()
    dataset_name = catalog.get("dataset", "NASA LRO LOLA DEM")
    return [
        TerrainSafetyResponse(
            site_id=entry["site_id"],
            latitude_deg=float(entry["latitude_deg"]),
            longitude_deg=float(entry["longitude_deg"]),
            metrics=_build_metrics(entry),
            source=dataset_name,
            status="ok",
            notes=entry.get("notes"),
        )
        for entry in catalog.get("sites", [])
    ]
