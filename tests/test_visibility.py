"""Unit tests for Member 4 — Solar Power & Communication Analysis."""

from pathlib import Path
import sys
from unittest.mock import patch

# Ensure backend directory is in sys.path for test runners, IDEs, and direct script execution
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.services.visibility import analyze_site_conditions


def test_analyze_site_conditions_with_cached_data():
    """Verify integration with Member 2 cached JPL Horizons ephemeris data."""
    res = analyze_site_conditions(
        site_id="candidate_001",
        latitude_deg=-89.54,
        longitude_deg=0.0,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-20T06:00:00Z",
        step_minutes=60,
    )

    assert res.status == "ok"
    assert res.horizon_model == "geometric"
    assert res.source == "JPL Horizons"
    assert res.site_id == "candidate_001"
    assert res.metrics.sunlit_fraction is not None
    assert 0.0 <= res.metrics.sunlit_fraction <= 1.0
    assert res.metrics.earth_visible_fraction is not None
    assert 0.0 <= res.metrics.earth_visible_fraction <= 1.0
    assert res.metrics.sunlit_hours is not None
    assert res.metrics.earth_visible_hours is not None


def test_analyze_site_conditions_unavailable_when_no_points():
    """When ephemeris data is unavailable, return status='unavailable' with None metrics."""
    with patch("app.services.visibility.fetch_jpl_horizons_ephemeris", return_value=[]):
        res = analyze_site_conditions(
            site_id="site_empty",
            latitude_deg=-89.0,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-21T00:00:00Z",
            step_minutes=60,
        )

        assert res.status == "unavailable"
        assert res.horizon_model == "geometric"
        assert res.source == "JPL Horizons"
        assert res.metrics.sunlit_fraction is None
        assert res.metrics.earth_visible_fraction is None
        assert res.metrics.sunlit_hours is None
        assert res.metrics.earth_visible_hours is None


def test_geometric_horizon_calculation():
    """Verify correct counting of points above horizon (elevation_deg > 0)."""
    mock_points = [
        {
            "timestamp_utc": "2026-11-20T00:00:00Z",
            "sun_elevation_deg": 1.5,
            "earth_elevation_deg": 4.0,
        },
        {
            "timestamp_utc": "2026-11-20T01:00:00Z",
            "sun_elevation_deg": -0.5,
            "earth_elevation_deg": 2.0,
        },
        {
            "timestamp_utc": "2026-11-20T02:00:00Z",
            "sun_elevation_deg": 0.0,  # geometric horizon boundary, not > 0
            "earth_elevation_deg": -1.0,
        },
        {
            "timestamp_utc": "2026-11-20T03:00:00Z",
            "sun_elevation_deg": 2.2,
            "earth_elevation_deg": 0.5,
        },
    ]

    with patch("app.services.visibility.fetch_jpl_horizons_ephemeris", return_value=mock_points):
        res = analyze_site_conditions(
            site_id="site_calc",
            latitude_deg=-89.0,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-20T03:00:00Z",
            step_minutes=60,
        )

        assert res.status == "ok"
        # 2 out of 4 points have sun_elevation_deg > 0 (1.5, 2.2)
        assert res.metrics.sunlit_fraction == 0.5
        assert res.metrics.sunlit_hours == 2.0
        # 3 out of 4 points have earth_elevation_deg > 0 (4.0, 2.0, 0.5)
        assert res.metrics.earth_visible_fraction == 0.75
        assert res.metrics.earth_visible_hours == 3.0


def test_handling_none_elevation_fields():
    """Points with None elevations must not cause errors and are excluded from counts."""
    mock_points = [
        {
            "timestamp_utc": "2026-11-20T00:00:00Z",
            "sun_elevation_deg": 2.0,
            "earth_elevation_deg": None,
        },
        {
            "timestamp_utc": "2026-11-20T01:00:00Z",
            "sun_elevation_deg": None,
            "earth_elevation_deg": 3.0,
        },
    ]

    with patch("app.services.visibility.fetch_jpl_horizons_ephemeris", return_value=mock_points):
        res = analyze_site_conditions(
            site_id="site_partial",
            latitude_deg=-89.0,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-20T01:00:00Z",
            step_minutes=60,
        )

        assert res.status == "ok"
        assert res.metrics.sunlit_fraction == 1.0
        assert res.metrics.sunlit_hours == 1.0
        assert res.metrics.earth_visible_fraction == 1.0
        assert res.metrics.earth_visible_hours == 1.0
