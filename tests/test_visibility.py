"""Unit tests for sampled geometric visibility calculations."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from app.models.schemas import LandingSite
from app.services.helios_data_consumer import build_scientific_provenance
from app.services.visibility import analyze_site_conditions


START_UTC = "2026-11-20T00:00:00Z"


def hourly_points(sun_elevations, earth_elevations, start_utc=START_UTC):
    start = datetime.fromisoformat(start_utc.replace("Z", "+00:00"))
    return [
        {
            "timestamp_utc": (start + timedelta(hours=index))
            .astimezone(timezone.utc)
            .strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sun_elevation_deg": sun,
            "earth_elevation_deg": earth,
        }
        for index, (sun, earth) in enumerate(zip(sun_elevations, earth_elevations))
    ]


def analyze_with_mock(points, end_utc):
    with patch("app.services.visibility.fetch_jpl_horizons_ephemeris", return_value=points):
        return analyze_site_conditions(
            site_id="test-site",
            latitude_deg=-89.0,
            longitude_deg=0.0,
            start_utc=START_UTC,
            end_utc=end_utc,
            step_minutes=60,
        )


def test_analyze_site_conditions_uses_mocked_ephemeris_without_live_requests():
    """The normal response metadata is preserved without calling NASA."""
    points = hourly_points([2.0, 1.0, 3.0], [1.0, 2.0, 2.5])
    res = analyze_with_mock(points, "2026-11-20T02:00:00Z")

    assert res.status == "ok"
    assert res.horizon_model == "geometric"
    assert res.source == "JPL Horizons"
    assert res.site_id == "test-site"
    assert res.metrics.sunlit_fraction == 1.0
    assert res.metrics.earth_visible_fraction == 1.0
    assert res.metrics.sunlit_hours == 2.0
    assert res.metrics.earth_visible_hours == 2.0
    provenance = build_scientific_provenance(
        LandingSite(
            site_id="test-site",
            name="Test Site",
            latitude_deg=-89.0,
            longitude_deg=0.0,
        ),
        res,
        duration_hours=2.0,
    )
    assert any("sampled estimates" in warning for warning in provenance.warnings)


def test_analyze_site_conditions_unavailable_when_no_points():
    """When ephemeris data is unavailable, return None metrics."""
    with patch("app.services.visibility.fetch_jpl_horizons_ephemeris", return_value=[]):
        res = analyze_site_conditions(
            site_id="site_empty",
            latitude_deg=-89.0,
            longitude_deg=0.0,
            start_utc=START_UTC,
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


def test_73_positive_hourly_samples_over_72_hours_report_72_hours():
    """Both endpoint samples define 72 elapsed intervals, not 73 hours."""
    points = hourly_points([1.0] * 73, [1.0] * 73)
    res = analyze_with_mock(points, "2026-11-23T00:00:00Z")

    assert res.metrics.sunlit_hours == 72.0
    assert res.metrics.earth_visible_hours == 72.0
    assert res.metrics.sunlit_fraction == 1.0
    assert res.metrics.earth_visible_fraction == 1.0


def test_no_positive_visibility_samples_report_zero_hours_and_percent():
    points = hourly_points([-1.0, 0.0, -2.0], [-3.0, -1.0, 0.0])
    res = analyze_with_mock(points, "2026-11-20T02:00:00Z")

    assert res.metrics.sunlit_hours == 0.0
    assert res.metrics.sunlit_fraction == 0.0
    assert res.metrics.earth_visible_hours == 0.0
    assert res.metrics.earth_visible_fraction == 0.0


def test_partial_visibility_is_independent_and_bounded_by_window():
    """Interpolate separate horizon crossings for Sun and Earth."""
    points = hourly_points(
        [10.0, -10.0, -10.0, 10.0],
        [-5.0, 5.0, 5.0, -5.0],
    )
    res = analyze_with_mock(points, "2026-11-20T03:00:00Z")

    assert res.metrics.sunlit_hours == 1.0
    assert res.metrics.sunlit_fraction == pytest.approx(1 / 3, abs=0.0001)
    assert res.metrics.earth_visible_hours == 2.0
    assert res.metrics.earth_visible_fraction == pytest.approx(2 / 3, abs=0.0001)
    for hours, fraction in (
        (res.metrics.sunlit_hours, res.metrics.sunlit_fraction),
        (res.metrics.earth_visible_hours, res.metrics.earth_visible_fraction),
    ):
        assert 0.0 <= hours <= 3.0
        assert 0.0 <= fraction <= 1.0


def test_rounded_duration_does_not_exceed_non_hour_aligned_window():
    end_utc = "2026-11-20T00:59:59Z"
    points = hourly_points([1.0, 1.0], [1.0, 1.0])
    points[-1]["timestamp_utc"] = end_utc
    res = analyze_with_mock(points, end_utc)
    actual_duration_hours = 3599 / 3600

    assert res.metrics.sunlit_hours <= actual_duration_hours
    assert res.metrics.earth_visible_hours <= actual_duration_hours


def test_missing_sampled_elevations_remain_unknown():
    points = hourly_points([2.0, None], [None, 3.0])
    res = analyze_with_mock(points, "2026-11-20T01:00:00Z")

    assert res.metrics.sunlit_fraction is None
    assert res.metrics.sunlit_hours is None
    assert res.metrics.earth_visible_fraction is None
    assert res.metrics.earth_visible_hours is None
