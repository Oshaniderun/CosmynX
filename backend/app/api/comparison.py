from fastapi import APIRouter

from app.models.schemas import CompareRequest, CompareResponse
from app.services.comparison import compare_scenarios

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
def post_compare(request: CompareRequest) -> CompareResponse:
    """Compare multiple landing site or mission-date scenarios."""
    return compare_scenarios(request)
