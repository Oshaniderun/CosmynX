from fastapi import APIRouter

from app.models.schemas import HeliosRecommendRequest, HeliosRecommendResponse
from app.services.helios_advisor import generate_recommendations

router = APIRouter()


@router.post("/recommend", response_model=HeliosRecommendResponse)
def post_recommend(request: HeliosRecommendRequest) -> HeliosRecommendResponse:
    """Generate ranked landing site recommendations with explainable reasoning."""
    return generate_recommendations(request)
