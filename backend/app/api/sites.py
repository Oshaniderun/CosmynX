from fastapi import APIRouter, HTTPException, status

from app.models.schemas import CustomSiteRequest, LandingSite

router = APIRouter()

# Officially recognized NASA Artemis III candidate lunar south-pole landing regions,
# updated and announced by NASA on October 28, 2024 (NASA Press Release 24-144).
# Reference: https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-artemis-iii-lunar-landing/
#
# IMPORTANT SCIENTIFIC NOTE:
# Each candidate region represents an approximate 15 km x 15 km spatial area evaluated
# for science potential, communication visibility, terrain slope safety, and illumination.
# The coordinates below denote approximate regional centroids or landmark feature references;
# they do NOT represent single, fixed touchdown points. Elevations vary significantly across
# each 15 km x 15 km zone, and are thus set to None until high-resolution DEM sampling is applied.
DEFAULT_SITES: list[LandingSite] = [
    LandingSite(
        site_id="candidate_001",
        name="Haworth",
        region="Lunar South Pole",
        latitude_deg=-87.50,
        longitude_deg=-5.00,
        description="High-elevation rim terrain adjacent to Haworth crater's permanently shadowed cold traps (~87.5° S, 5.0° W). Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_002",
        name="Malapert Massif",
        region="Lunar South Pole",
        latitude_deg=-86.00,
        longitude_deg=0.30,
        description="Prominent highland massif rising >5,000m above surrounding floor, offering continuous direct-to-Earth communication line of sight (~86.0° S, 0.3° E). Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_003",
        name="Nobile Rim 1",
        region="Lunar South Pole",
        latitude_deg=-85.30,
        longitude_deg=31.50,
        description="Raised northwestern rim structure surrounding Nobile crater (~85.3° S, 31.5° E). High-priority region for surface and subsurface volatile science. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_004",
        name="Nobile Rim 2",
        region="Lunar South Pole",
        latitude_deg=-84.20,
        longitude_deg=60.70,
        description="High-standing eastern rim terrain adjacent to Nobile crater (~84.2° S, 60.7° E). Provides mission launch-window flexibility. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_005",
        name="de Gerlache Rim 2",
        region="Lunar South Pole",
        latitude_deg=-88.70,
        longitude_deg=-64.00,
        description="High-illumination ridge on the southern crest of de Gerlache crater (~88.7° S, 64.0° W / 296.0° E). Positioned close to permanently shadowed cold traps. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_006",
        name="Slater Plain",
        region="Lunar South Pole",
        latitude_deg=-88.08,
        longitude_deg=111.29,
        description="Highland plain situated southeast of Shackleton crater (~88.1° S, 111.3° E). Characterized by lower relative slopes suitable for lander touchdown. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_007",
        name="Peak near Cabeus B",
        region="Lunar South Pole",
        latitude_deg=-83.60,
        longitude_deg=-68.80,
        description="Northernmost Artemis III polar candidate region (~83.6° S, 68.8° W / 291.2° E), featuring elevated relief with favorable solar and communication visibility. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / LROC QuickMap",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_008",
        name="Mons Mouton Plateau",
        region="Lunar South Pole",
        latitude_deg=-84.30,
        longitude_deg=30.60,
        description="Expansive high-standing plateau (formerly Leibnitz Beta Plateau; officially named by IAU in 2023 for mathematician Melba Roy Mouton) (~84.3° S, 30.6° E). Broad, relatively flat exploration zone. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / IAU Gazetteer",
        coordinate_type="approximate_region_centroid",
    ),
    LandingSite(
        site_id="candidate_009",
        name="Mons Mouton",
        region="Lunar South Pole",
        latitude_deg=-85.42,
        longitude_deg=31.85,
        description="Massive upland mountain massif adjacent to Mons Mouton Plateau (~85.4° S, 31.9° E). Prominent topographic crest providing long illumination windows. Approximate 15 km x 15 km candidate region centroid.",
        elevation_m=None,
        source="NASA Artemis III (Updated Oct 28, 2024) / IAU Gazetteer",
        coordinate_type="approximate_region_centroid",
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

