"""Unit tests for Member 4 — Solar Power & Communication Analysis."""

import os
import sys

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.models.schemas import EphemerisPoint
from app.services.visibility import (
    analyze_site_conditions,
    compute_visibility_metrics,
    generate_simulated_ephemeris,
)


def test_compute_visibility_metrics_all_sunlit_and_visible():
    points = [
        EphemerisPoint(
            timestamp_utc=f"2026-11-20T0{i}:00:00Z",
            sun_azimuth_deg=90.0 + i,
            sun_elevation_deg=2.0,
            earth_azimuth_deg=40.0,
            earth_elevation_deg=5.0,
        )
        for i in range(5)
    ]
    metrics, windows, timeline, current, next_trans = compute_visibility_metrics(
        points=points,
        step_minutes=60,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-20T04:00:00Z",
    )

    assert metrics.sunlit_fraction == 1.0
    assert metrics.earth_visible_fraction == 1.0
    assert metrics.sunlit_hours == 4.0
    assert metrics.earth_visible_hours == 4.0
    assert len(windows) == 1
    assert windows[0].duration_hours == 5.0
    assert len(timeline) == 5
    assert current == "Illuminated | DTE Available"
    assert next_trans is None


def test_compute_visibility_metrics_dark_and_blackout():
    points = [
        EphemerisPoint(
            timestamp_utc=f"2026-11-20T0{i}:00:00Z",
            sun_azimuth_deg=90.0,
            sun_elevation_deg=-2.5,
            earth_azimuth_deg=40.0,
            earth_elevation_deg=-3.0,
        )
        for i in range(4)
    ]
    metrics, windows, timeline, current, next_trans = compute_visibility_metrics(
        points=points,
        step_minutes=60,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-20T03:00:00Z",
    )

    assert metrics.sunlit_fraction == 0.0
    assert metrics.earth_visible_fraction == 0.0
    assert metrics.sunlit_hours == 0.0
    assert metrics.earth_visible_hours == 0.0
    assert len(windows) == 0
    assert current == "In Shadow | DTE Blackout"


def test_communication_windows_detection():
    # 2 hours visible, 2 hours blackout, 2 hours visible
    elevations = [2.0, 1.5, -1.0, -2.0, 3.0, 4.0]
    points = [
        EphemerisPoint(
            timestamp_utc=f"2026-11-20T0{i}:00:00Z",
            sun_elevation_deg=1.0,
            earth_elevation_deg=elevations[i],
        )
        for i in range(6)
    ]

    metrics, windows, timeline, current, next_trans = compute_visibility_metrics(
        points=points,
        step_minutes=60,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-20T05:00:00Z",
    )

    assert len(windows) == 2
    assert windows[0].window_id == 1
    assert windows[0].start_utc == "2026-11-20T00:00:00Z"
    assert windows[0].end_utc == "2026-11-20T01:00:00Z"
    assert windows[1].window_id == 2
    assert windows[1].start_utc == "2026-11-20T04:00:00Z"
    assert windows[1].end_utc == "2026-11-20T05:00:00Z"


def test_generate_simulated_ephemeris():
    points = generate_simulated_ephemeris(
        latitude_deg=-89.54,
        longitude_deg=0.0,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-21T00:00:00Z",
        step_minutes=60,
    )
    assert len(points) == 25
    for pt in points:
        assert pt.sun_elevation_deg is not None
        assert pt.earth_elevation_deg is not None
        assert 0.0 <= pt.sun_azimuth_deg < 360.0


def test_analyze_site_conditions_endpoint_integration():
    res = analyze_site_conditions(
        site_id="candidate_001",
        latitude_deg=-89.54,
        longitude_deg=0.0,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-23T00:00:00Z",
        step_minutes=60,
    )
    assert res.status == "ok"
    assert res.metrics.sunlit_fraction is not None
    assert res.metrics.earth_visible_fraction is not None
    assert len(res.timeline) > 0
