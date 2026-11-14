from fastapi import APIRouter

from app.models.schemas import LandingSite, MapLayerResource, MapLayersResponse
from app.services.nasa_data import get_lunar_map_resources
from app.services.terrain import get_terrain_for_site

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
    """Return available candidate lunar landing sites with LOLA terrain metrics."""
    enriched: list[LandingSite] = []
    for site in DEFAULT_SITES:
        terrain = get_terrain_for_site(
            site_id=site.site_id,
            latitude_deg=site.latitude_deg,
            longitude_deg=site.longitude_deg,
        )
        enriched.append(
            site.model_copy(
                update={"terrain": terrain.metrics if terrain.status == "ok" else None}
            )
        )
    return enriched


@router.get("/sites/layers", response_model=MapLayersResponse)
def get_map_layers() -> MapLayersResponse:
    """Return NASA Moon Trek South Pole (SP) and Global (EQ) WMTS layer configs."""
    moon_trek = get_lunar_map_resources()["moon_trek"]
    south_pole_layers = [
        MapLayerResource(**layer) for layer in moon_trek["south_pole_layers"]
    ]
    global_layer = MapLayerResource(
        layer_id="LRO_WAC_Mosaic_Global_303ppd_v02",
        name="LRO WAC Global Mosaic (303 ppd)",
        projection="EQ",
        coverage="Global",
        format="image/jpeg",
        tile_matrix_set="default028mm",
        max_zoom=7,
        wmts_capabilities=moon_trek["wac_wmts_capabilities"],
        tile_template=moon_trek["wac_tile_template"],
    )
    return MapLayersResponse(
        portal_url=moon_trek["portal_url"],
        south_pole_layers=south_pole_layers,
        global_layer=global_layer,
    )
