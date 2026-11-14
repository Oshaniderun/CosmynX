from fastapi import APIRouter, HTTPException

from app.models.schemas import CompareRequest, CompareResponse
from app.services.comparison import compare_scenarios

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
def post_compare(request: CompareRequest) -> CompareResponse:
    """Compare multiple landing site or mission-date scenarios."""
    try:
        return compare_scenarios(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
