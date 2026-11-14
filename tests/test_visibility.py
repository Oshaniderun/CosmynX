"""Regression tests for elapsed-time sampled visibility and solar estimates."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from app.models.schemas import LandingSite
from app.services.helios_data_consumer import build_scientific_provenance
from app.services.visibility import analyze_site_conditions, calculate_visibility_transitions


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


def test_elapsed_visibility_preserves_source_and_sampled_provenance():
    points = hourly_points([2.0, 1.0, 3.0], [1.0, 2.0, 2.5])
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")

    assert result.status == "ok"
    assert result.horizon_model == "geometric"
    assert result.source == "JPL Horizons"
    assert result.metrics.sunlit_fraction == 1.0
    assert result.metrics.earth_visible_fraction == 1.0
    assert result.metrics.sunlit_hours == 2.0
    assert result.metrics.earth_visible_hours == 2.0
    provenance = build_scientific_provenance(
        LandingSite(site_id="test-site", name="Test Site", latitude_deg=-89.0, longitude_deg=0.0),
        result,
        duration_hours=2.0,
    )
    assert any("sampled estimates" in warning for warning in provenance.warnings)


def test_transitions_use_sample_timestamps_and_describe_earth_geometrically():
    points = hourly_points([2.0, 1.0, -1.0], [1.0, -1.0, -2.0])
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")

    assert result.transitions["solar"]["next_event"] == "sunset"
    assert result.transitions["solar"]["transition_utc"] == "2026-11-20T02:00:00Z"
    assert result.transitions["solar"]["hours_until"] == 2.0
    assert result.transitions["earth"]["next_event"] == "earthset"
    assert "geometric" in result.transitions["earth"]["description"].lower()
    assert "rf" not in result.transitions["earth"]["description"].lower()


def test_missing_visibility_boundaries_do_not_produce_transitions():
    points = hourly_points([1.0, 1.0, 1.0], [1.0, 1.0, 1.0])[1:]
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")
    assert result.transitions is None


def test_duplicate_timestamps_do_not_produce_transitions():
    points = hourly_points([1.0, -1.0, -2.0], [1.0, -1.0, -2.0])
    points[1]["timestamp_utc"] = points[0]["timestamp_utc"]
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")
    assert result.transitions is None


def test_out_of_order_transition_timestamps_remain_unknown():
    points = hourly_points([1.0, -1.0, -2.0, -3.0], [1.0, -1.0, -2.0, -3.0])
    timeline = [
        {"timestamp_utc": point["timestamp_utc"], "is_sunlit": point["sun_elevation_deg"] > 0,
         "is_earth_visible": point["earth_elevation_deg"] > 0}
        for point in points
    ]
    timeline[1], timeline[2] = timeline[2], timeline[1]
    result = calculate_visibility_transitions(
        timeline,
        datetime.fromisoformat(START_UTC.replace("Z", "+00:00")),
        datetime.fromisoformat("2026-11-20T03:00:00+00:00"),
    )
    assert result is None


def test_invalid_transition_timestamp_remains_unknown():
    points = hourly_points([1.0, -1.0, -2.0], [1.0, -1.0, -2.0])
    timeline = [
        {"timestamp_utc": point["timestamp_utc"], "is_sunlit": point["sun_elevation_deg"] > 0,
         "is_earth_visible": point["earth_elevation_deg"] > 0}
        for point in points
    ]
    timeline[1]["timestamp_utc"] = "not-a-timestamp"
    result = calculate_visibility_transitions(
        timeline,
        datetime.fromisoformat(START_UTC.replace("Z", "+00:00")),
        datetime.fromisoformat("2026-11-20T02:00:00+00:00"),
    )
    assert result is None


def test_invalid_source_timestamp_suppresses_transitions():
    points = hourly_points([1.0, -1.0, -2.0], [1.0, -1.0, -2.0])
    points[1]["timestamp_utc"] = "not-a-timestamp"
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")
    assert result.transitions is None


def test_unknown_visibility_state_remains_unknown():
    points = hourly_points([1.0, None, -2.0], [1.0, -1.0, -2.0])
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")
    assert result.transitions is None


def test_cached_jpl_ephemeris_drives_visibility_without_network():
    with patch(
        "app.services.nasa_data._query_horizons_target",
        side_effect=AssertionError("Expected exact matching cached ephemeris"),
    ) as query_mock:
        result = analyze_site_conditions(
            site_id="cached-site",
            latitude_deg=-87.45,
            longitude_deg=-5.2,
            start_utc=START_UTC,
            end_utc="2026-11-23T00:00:00Z",
            step_minutes=60,
        )

    query_mock.assert_not_called()
    assert result.status == "ok"
    assert result.source == "JPL Horizons"
    assert result.metrics.sunlit_hours is not None
    assert result.metrics.earth_visible_hours is not None
    assert result.metrics.sunlit_hours <= 72.0
    assert result.metrics.earth_visible_hours <= 72.0


def test_no_points_returns_unavailable_without_measurements():
    result = analyze_with_mock([], "2026-11-20T02:00:00Z")
    assert result.status == "unavailable"
    assert result.source == "JPL Horizons"
    assert result.metrics.sunlit_fraction is None
    assert result.metrics.earth_visible_fraction is None
    assert result.metrics.sunlit_hours is None
    assert result.metrics.earth_visible_hours is None
    assert result.power_modeling is None


def test_73_positive_hourly_samples_over_72_hours_produce_72_hours_everywhere():
    points = hourly_points([1.0] * 73, [1.0] * 73)
    result = analyze_with_mock(points, "2026-11-23T00:00:00Z")

    assert result.metrics.sunlit_hours == 72.0
    assert result.metrics.earth_visible_hours == 72.0
    assert result.metrics.sunlit_fraction == 1.0
    assert result.metrics.earth_visible_fraction == 1.0
    assert result.power_modeling["battery_sizing"]["longest_darkness_hours"] == 0.0
    assert result.power_modeling["cumulative_energy_kwh"]["tracking"] == 72.0
    for window in result.windows:
        assert window.duration_hours <= 72.0


def test_no_positive_samples_produce_zero_visible_time_and_full_darkness():
    points = hourly_points([-1.0, 0.0, -2.0], [-3.0, -1.0, 0.0])
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")

    assert result.metrics.sunlit_hours == 0.0
    assert result.metrics.sunlit_fraction == 0.0
    assert result.metrics.earth_visible_hours == 0.0
    assert result.metrics.earth_visible_fraction == 0.0
    assert result.power_modeling["battery_sizing"]["longest_darkness_hours"] == 2.0
    assert not result.windows


def test_partial_sun_and_earth_visibility_are_interpolated_independently():
    points = hourly_points([10.0, -10.0, -10.0, 10.0], [-5.0, 5.0, 5.0, -5.0])
    result = analyze_with_mock(points, "2026-11-20T03:00:00Z")

    assert result.metrics.sunlit_hours == 1.0
    assert result.metrics.sunlit_fraction == pytest.approx(1 / 3, abs=0.0001)
    assert result.metrics.earth_visible_hours == 2.0
    assert result.metrics.earth_visible_fraction == pytest.approx(2 / 3, abs=0.0001)
    durations = {
        target: sum(window.duration_hours for window in result.windows if window.target == target)
        for target in {window.target for window in result.windows}
    }
    assert durations["sunlight"] == pytest.approx(1.0)
    assert durations["earth"] == pytest.approx(2.0)
    assert all(window.duration_hours <= 3.0 for window in result.windows)
    assert result.power_modeling["cumulative_energy_kwh"]["tracking"] == pytest.approx(1.0)


def test_missing_elevation_is_unknown_and_does_not_become_dark_or_zero_power():
    points = hourly_points([2.0, None, 3.0], [1.0, 2.0, 3.0])
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")

    assert result.metrics.sunlit_fraction is None
    assert result.metrics.sunlit_hours is None
    assert result.metrics.earth_visible_fraction == 1.0
    assert result.metrics.earth_visible_hours == 2.0
    assert result.power_modeling is None
    assert result.timeline[1]["is_sunlit"] is None
    assert result.timeline[1]["power_watts_tracking"] is None


@pytest.mark.parametrize(
    "points,end_utc",
    [
        (hourly_points([1.0, 1.0, 1.0], [1.0, 1.0, 1.0])[1:], "2026-11-20T02:00:00Z"),
        (hourly_points([1.0, 1.0], [1.0, 1.0]), "2026-11-20T02:00:00Z"),
    ],
)
def test_missing_start_or_end_boundary_keeps_results_unknown(points, end_utc):
    result = analyze_with_mock(points, end_utc)
    assert result.metrics.sunlit_fraction is None
    assert result.metrics.sunlit_hours is None
    assert result.metrics.earth_visible_fraction is None
    assert result.metrics.earth_visible_hours is None
    assert result.power_modeling is None


def test_non_hour_aligned_window_duration_never_exceeds_elapsed_time():
    end_utc = "2026-11-20T00:59:59Z"
    points = hourly_points([1.0, 1.0], [1.0, 1.0])
    points[-1]["timestamp_utc"] = end_utc
    result = analyze_with_mock(points, end_utc)
    actual_duration_hours = 3599 / 3600

    assert result.metrics.sunlit_hours <= actual_duration_hours
    assert result.metrics.earth_visible_hours <= actual_duration_hours
    assert all(window.duration_hours <= actual_duration_hours for window in result.windows)
    assert result.power_modeling["battery_sizing"]["longest_darkness_hours"] <= actual_duration_hours


def test_duplicate_timestamp_makes_visibility_unknown():
    points = hourly_points([1.0, 1.0, 1.0], [1.0, 1.0, 1.0])
    points[1]["timestamp_utc"] = points[0]["timestamp_utc"]
    result = analyze_with_mock(points, "2026-11-20T02:00:00Z")
    assert result.metrics.sunlit_hours is None
    assert result.metrics.earth_visible_hours is None
    assert result.power_modeling is None


def test_malformed_elevation_is_unknown_in_timeline_not_zero():
    points = hourly_points(["bad", 1.0], [1.0, 1.0])
    result = analyze_with_mock(points, "2026-11-20T01:00:00Z")
    assert result.timeline[0]["sun_elevation_deg"] is None
    assert result.timeline[0]["is_sunlit"] is None
    assert result.timeline[0]["power_watts_tracking"] is None
