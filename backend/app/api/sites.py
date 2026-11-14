from fastapi import APIRouter

from app.models.schemas import LandingSite

router = APIRouter()

# Initial candidate south pole sites; Member 1 & 2 can expand or load from data/
DEFAULT_SITES: list[LandingSite] = [
    LandingSite(
        site_id="candidate_001",
        name="Shackleton Crater Rim",
        region="Lunar South Pole",
        latitude_deg=-89.54,
        longitude_deg=0.0,
        description="High-elevation crater rim near the lunar south pole.",
    ),
    LandingSite(
        site_id="candidate_002",
        name="Connecting Ridge",
        region="Lunar South Pole",
        latitude_deg=-89.45,
        longitude_deg=-137.0,
        description="Ridge between Shackleton and de Gerlache craters.",
    ),
    LandingSite(
        site_id="candidate_003",
        name="Malapert Massif",
        region="Lunar South Pole",
        latitude_deg=-86.0,
        longitude_deg=2.0,
        description="Elevated massif with favorable Earth line-of-sight.",
    ),
]


@router.get("/sites", response_model=list[LandingSite])
def get_sites() -> list[LandingSite]:
    """Return available candidate lunar landing sites."""
    return DEFAULT_SITES
