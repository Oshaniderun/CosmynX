"""Unit tests for NASA Moon Trek South Pole (SP) and Global (EQ) WMTS layer metadata."""

from app.api.sites import get_map_layers
from app.services.nasa_data import get_lunar_map_resources


def test_get_lunar_map_resources_includes_south_pole_layers():
    resources = get_lunar_map_resources()
    moon_trek = resources["moon_trek"]
    sp_layers = moon_trek["south_pole_layers"]
    assert len(sp_layers) == 2
    assert {layer["layer_id"] for layer in sp_layers} == {
        "LRO_WAC_Mosaic_SPole60_100mp",
        "WAC_POLE_ILL_PCT_SOUTH_100M",
    }
    for layer in sp_layers:
        assert layer["projection"] == "SP"
        assert "/Moon/SP/" in layer["tile_template"]


def test_get_map_layers_endpoint_returns_valid_schema():
    res = get_map_layers()
    assert res.portal_url == "https://trek.nasa.gov/moon/"
    assert len(res.south_pole_layers) == 2
    assert res.global_layer.projection == "EQ"
    assert res.south_pole_layers[0].extent_m == [-931100.0, -931100.0, 931100.0, 931100.0]
