from fastapi import APIRouter, Query

from app.models.schemas import EphemerisResponse
from app.services.positions import get_ephemeris_for_site

router = APIRouter()


@router.get("/ephemeris", response_model=EphemerisResponse)
def get_ephemeris(
    site_id: str = Query("candidate_001"),
    latitude_deg: float = Query(-89.54, ge=-90.0, le=90.0),
    longitude_deg: float = Query(0.0, ge=-180.0, le=180.0),
    start_utc: str = Query("2026-11-20T00:00:00Z"),
    end_utc: str = Query("2026-11-23T00:00:00Z"),
    step_minutes: int = Query(60, ge=1, le=1440),
) -> EphemerisResponse:
    """Retrieve Sun and Earth position data for a lunar site and time window."""
    return get_ephemeris_for_site(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
    )
