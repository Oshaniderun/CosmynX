"""Member 6 — HELIOS AI Lunar Landing Advisor Service.

Filters candidate sites by mandatory constraints, ranks them transparently,
and produces evidence-based explanations grounded in scientific results.
"""

from app.models.schemas import HeliosRecommendRequest, HeliosRecommendResponse


def generate_recommendations(
    request: HeliosRecommendRequest,
) -> HeliosRecommendResponse:
    """Filter, rank, and explain candidate lunar landing sites.

    TODO (Member 6): Consume real metrics from visibility service, apply constraint
    filtering, compute weighted ranking scores, and generate explanations.
    """
    return HeliosRecommendResponse(
        recommendations=[],
        assumptions=[
            "Geometric horizon model (terrain obstruction not yet modeled).",
            f"Objective: {request.objective}; minimum Earth visibility: {request.minimum_earth_visibility_pct}%.",
        ],
        status="pending",
    )
