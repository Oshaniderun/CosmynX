from fastapi import APIRouter, HTTPException, status

from app.models.schemas import CustomSiteRequest, LandingSite

router = APIRouter()

# Officially recognized NASA Artemis III candidate lunar south-pole landing regions.
# Coordinates sourced from NASA LRO LOLA/LROC datasets and Artemis III candidate announcements.
DEFAULT_SITES: list[LandingSite] = [
    LandingSite(
        site_id="candidate_001",
        name="Peak Near Shackleton",
        region="Lunar South Pole",
        latitude_deg=-89.70,
        longitude_deg=129.00,
        description="High-illumination ridge near Shackleton crater rim (~89.7° S, 129.0° E). Official NASA Artemis III candidate region.",
        elevation_m=1250.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
    LandingSite(
        site_id="candidate_002",
        name="Connecting Ridge",
        region="Lunar South Pole",
        latitude_deg=-89.50,
        longitude_deg=-136.00,
        description="Prominent ridge connecting Shackleton and de Gerlache craters (~89.5° S, 136.0° W / 224.0° E). Long-duration solar illumination corridor.",
        elevation_m=1420.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
    LandingSite(
        site_id="candidate_003",
        name="Malapert Massif",
        region="Lunar South Pole",
        latitude_deg=-86.00,
        longitude_deg=0.30,
        description="Elevated highland massif rising >5,000m above base with continuous direct-to-Earth line of sight (~86.0° S, 0.3° E).",
        elevation_m=5100.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="peak_centroid",
    ),
    LandingSite(
        site_id="candidate_004",
        name="de Gerlache Rim 1",
        region="Lunar South Pole",
        latitude_deg=-88.50,
        longitude_deg=-68.00,
        description="High-illumination northern crest of de Gerlache crater (~88.5° S, 68.0° W). Target for permanently shadowed cold-trap volatile access.",
        elevation_m=980.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
    LandingSite(
        site_id="candidate_005",
        name="Haworth Crater Rim",
        region="Lunar South Pole",
        latitude_deg=-87.45,
        longitude_deg=-5.00,
        description="Elevated ridge immediately adjacent to Haworth crater's permanently shadowed region (~87.45° S, 5.0° W).",
        elevation_m=1150.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
    LandingSite(
        site_id="candidate_006",
        name="Faustini Rim A",
        region="Lunar South Pole",
        latitude_deg=-87.90,
        longitude_deg=90.00,
        description="High southern terrain on the eastern rim of Faustini crater (~87.9° S, 90.0° E). Favorable solar visibility.",
        elevation_m=850.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
    LandingSite(
        site_id="candidate_007",
        name="Nobile Rim 1",
        region="Lunar South Pole",
        latitude_deg=-85.30,
        longitude_deg=31.50,
        description="Target exploration zone on the northwestern rim of Nobile crater (~85.3° S, 31.5° E). High subsurface volatile potential.",
        elevation_m=1320.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
    LandingSite(
        site_id="candidate_008",
        name="Amundsen Rim",
        region="Lunar South Pole",
        latitude_deg=-84.50,
        longitude_deg=85.00,
        description="Expansive southern highland rim of Amundsen crater (~84.5° S, 85.0° E). Relatively smooth, stable terrain for lander touchdown.",
        elevation_m=1600.0,
        source="NASA Artemis III / LRO LOLA",
        coordinate_type="region_center",
    ),
]


@router.get("/sites", response_model=list[LandingSite])
def get_sites() -> list[LandingSite]:
    """Return available candidate lunar landing sites."""
    return DEFAULT_SITES


@router.get("/sites/{site_id}", response_model=LandingSite)
def get_site(site_id: str) -> LandingSite:
    """Retrieve details for a specific candidate lunar landing site."""
    for site in DEFAULT_SITES:
        if site.site_id == site_id:
            return site
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Landing site '{site_id}' not found.",
    )


@router.post("/sites/validate", response_model=LandingSite)
def validate_custom_site(request: CustomSiteRequest) -> LandingSite:
    """Validate user-entered lunar coordinates and return a structured LandingSite."""
    lon = request.longitude_deg
    if lon > 180.0:
        lon -= 360.0

    return LandingSite(
        site_id=f"custom_{abs(int(request.latitude_deg * 100))}_{abs(int(lon * 100))}",
        name=request.name or "Custom Lunar Site",
        region="Lunar South Pole (Custom)",
        latitude_deg=request.latitude_deg,
        longitude_deg=lon,
        description=request.description
        or f"Custom site selected at lat {request.latitude_deg:.3f}°, lon {lon:.3f}°.",
        source="User Coordinate Input",
        coordinate_type="custom_user_pin",
    )

