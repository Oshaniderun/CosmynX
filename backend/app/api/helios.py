"""HELIOS natural-language advisor API."""

from fastapi import APIRouter, HTTPException

from app.services.helios_advisor import (
    HeliosAdvisorRequest,
    HeliosAdvisorResponse,
    generate_recommendations,
)

router = APIRouter()


@router.post("/recommend", response_model=HeliosAdvisorResponse)
def post_recommend(request: HeliosAdvisorRequest) -> HeliosAdvisorResponse:
    """Return a complete scientific evaluation for a mission description/settings."""
    response = generate_recommendations(request)
    if response.status == "invalid":
        raise HTTPException(status_code=422, detail=response.model_dump(mode="json"))
    return response
