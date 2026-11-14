from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import TerrainSafetyResponse
from app.services.terrain import get_terrain_for_site, list_site_terrain

router = APIRouter()


@router.get("/terrain", response_model=TerrainSafetyResponse)
def get_terrain(
    site_id: str = Query("candidate_001"),
    latitude_deg: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude_deg: Optional[float] = Query(None, ge=-180.0, le=180.0),
) -> TerrainSafetyResponse:
    """Retrieve LRO LOLA DEM elevation, slope, roughness, and safety rating."""
    return get_terrain_for_site(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
    )


@router.get("/terrain/sites", response_model=list[TerrainSafetyResponse])
def get_all_site_terrain() -> list[TerrainSafetyResponse]:
    """Return LOLA terrain safety evaluations for all mapped South Pole sites."""
    return list_site_terrain()
