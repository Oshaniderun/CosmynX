from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query
from pydantic import AwareDatetime

from app.models.schemas import EphemerisResponse
from app.services.positions import get_ephemeris_for_site

router = APIRouter()


@router.get("/ephemeris", response_model=EphemerisResponse)
def get_ephemeris(
    site_id: str = Query("candidate_001"),
    latitude_deg: float = Query(-89.54, ge=-90.0, le=90.0),
    longitude_deg: float = Query(0.0, ge=-180.0, le=180.0),
    start_utc: AwareDatetime = Query(datetime(2026, 11, 20, tzinfo=timezone.utc)),
    end_utc: AwareDatetime = Query(datetime(2026, 11, 23, tzinfo=timezone.utc)),
    step_minutes: int = Query(60, ge=1, le=1440),
) -> EphemerisResponse:
    """Retrieve Sun and Earth position data for a lunar site and time window."""
    if end_utc <= start_utc:
        raise HTTPException(status_code=422, detail="end_utc must be after start_utc.")

    return get_ephemeris_for_site(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
        end_utc=end_utc.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
        step_minutes=step_minutes,
    )
