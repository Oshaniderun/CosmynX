from fastapi import APIRouter, Query

from app.models.schemas import ConditionsResponse
from app.services.visibility import analyze_site_conditions

router = APIRouter()


@router.get("/conditions", response_model=ConditionsResponse)
def get_conditions(
    site_id: str = Query("candidate_001"),
    latitude_deg: float = Query(-89.54, ge=-90.0, le=90.0),
    longitude_deg: float = Query(0.0, ge=-180.0, le=180.0),
    start_utc: str = Query("2026-11-20T00:00:00Z"),
    end_utc: str = Query("2026-11-23T00:00:00Z"),
    step_minutes: int = Query(60, ge=1, le=1440),
) -> ConditionsResponse:
    """Retrieve sunlight and Earth communication visibility metrics."""
    return analyze_site_conditions(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
    )
