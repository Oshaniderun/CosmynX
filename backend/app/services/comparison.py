"""Member 5 — Scenario Comparison & Timelines Service.

Compares multiple landing sites or mission-date windows side-by-side.
"""

from app.api.sites import DEFAULT_SITES
from app.models.schemas import CompareRequest, CompareResponse
from app.services.visibility import analyze_site_conditions


def compare_scenarios(request: CompareRequest) -> CompareResponse:
    """Evaluate and return conditions for each requested scenario.

    TODO (Member 5): Add timeline alignment and mission-delay delta calculations.
    """
    site_lookup = {site.site_id: site for site in DEFAULT_SITES}
    results = []
    for scenario in request.scenarios:
        site = site_lookup.get(scenario.site_id)
        lat = site.latitude_deg if site else -89.0
        lon = site.longitude_deg if site else 0.0
        results.append(
            analyze_site_conditions(
                site_id=scenario.site_id,
                latitude_deg=lat,
                longitude_deg=lon,
                start_utc=scenario.start_utc,
                end_utc=scenario.end_utc,
                step_minutes=scenario.step_minutes,
            )
        )
    return CompareResponse(results=results)
