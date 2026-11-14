"""Unit tests for LRO LOLA DEM, slope, roughness, and terrain safety service."""

from app.services.terrain import (
    classify_safety_rating,
    compute_terrain_safety_score,
    get_terrain_for_site,
    list_site_terrain,
)


def test_get_terrain_for_known_candidate_site():
    res = get_terrain_for_site("candidate_006")
    assert res.status == "ok"
    assert res.metrics.elevation_m == 1240.0
    assert res.metrics.mean_slope_deg == 5.2
    assert res.metrics.max_slope_deg == 10.4
    assert res.metrics.roughness_m == 0.41
    assert res.metrics.safety_rating == "safe"
    assert res.metrics.terrain_safety_score is not None
    assert 0.0 <= res.metrics.terrain_safety_score <= 100.0


def test_get_terrain_nearest_coordinate_match():
    res = get_terrain_for_site(
        site_id="custom_near_haworth",
        latitude_deg=-87.52,
        longitude_deg=-5.05,
    )
    assert res.status == "ok"
    assert res.metrics.elevation_m == 2140.0


def test_get_terrain_unavailable_outside_coverage():
    res = get_terrain_for_site(
        site_id="equatorial_site",
        latitude_deg=0.0,
        longitude_deg=0.0,
    )
    assert res.status == "unavailable"
    assert res.metrics.elevation_m is None
    assert res.metrics.safety_rating is None


def test_classify_safety_rating_and_score_bounds():
    assert classify_safety_rating(5.0, 10.0, 0.4) == "safe"
    assert classify_safety_rating(12.0, 18.0, 1.2) == "caution"
    assert classify_safety_rating(22.0, 32.0, 2.5) == "hazardous"
    assert compute_terrain_safety_score(0.0, 0.0, 0.0) == 100.0
    assert compute_terrain_safety_score(30.0, 45.0, 5.0) == 0.0


def test_list_site_terrain_returns_all_candidate_sites():
    sites = list_site_terrain()
    assert len(sites) == 9
    assert {s.site_id for s in sites} == {
        f"candidate_00{i}" for i in range(1, 10)
    }
