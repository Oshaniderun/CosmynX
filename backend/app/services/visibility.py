"""Member 4 — Solar Power & Communication Analysis Service.

Calculates geometric sunlight availability and Earth visibility metrics
from ephemeris elevation angles provided by NASA JPL Horizons. Visibility
fractions and durations are sampled estimates, with horizon crossings linearly
interpolated between ephemeris timestamps.
"""

from datetime import datetime, timezone
from typing import Optional

from app.models.schemas import ConditionsResponse, VisibilityMetrics
from app.services.nasa_data import fetch_jpl_horizons_ephemeris


def _parse_utc_timestamp(timestamp: str) -> datetime:
    """Parse an ISO 8601 timestamp and normalize it to UTC."""
    parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError(f"Timestamp '{timestamp}' must include a timezone.")
    return parsed.astimezone(timezone.utc)


def _estimate_visibility(
    points: list[dict],
    elevation_field: str,
    start: datetime,
    end: datetime,
) -> tuple[Optional[float], Optional[float]]:
    """Estimate visible fraction and hours over the elapsed mission window.

    Elevation is treated as linear between consecutive ephemeris samples, so
    positive-time intervals are estimated at the zero-elevation crossing.
    Metrics remain unknown when the samples do not cover both window boundaries
    or contain missing elevations; missing measurements are never treated as 0.
    """
    mission_seconds = (end - start).total_seconds()
    if mission_seconds <= 0:
        return None, None

    samples: list[tuple[datetime, Optional[float]]] = []
    for point in points:
        timestamp = point.get("timestamp_utc")
        try:
            sample_time = _parse_utc_timestamp(timestamp)
        except (AttributeError, TypeError, ValueError):
            continue
        if start <= sample_time <= end:
            value = point.get(elevation_field)
            try:
                elevation = None if value is None else float(value)
            except (TypeError, ValueError):
                elevation = None
            samples.append((sample_time, elevation))

    samples.sort(key=lambda sample: sample[0])
    if len(samples) < 2 or samples[0][0] != start or samples[-1][0] != end:
        return None, None
    if any(elevation is None for _, elevation in samples):
        return None, None

    visible_seconds = 0.0
    for (time_a, elevation_a), (time_b, elevation_b) in zip(samples, samples[1:]):
        interval_seconds = (time_b - time_a).total_seconds()
        if interval_seconds <= 0:
            return None, None

        # The geometric horizon is strictly elevation > 0. Interpolate the
        # crossing within each sampled interval when visibility changes.
        if elevation_a > 0 and elevation_b > 0:
            visible_seconds += interval_seconds
        elif elevation_a > 0 >= elevation_b:
            visible_seconds += interval_seconds * elevation_a / (elevation_a - elevation_b)
        elif elevation_b > 0 >= elevation_a:
            visible_seconds += interval_seconds * elevation_b / (elevation_b - elevation_a)

    # Guard floating-point rounding and ensure duration cannot exceed the
    # actual mission window.
    visible_seconds = min(max(visible_seconds, 0.0), mission_seconds)
    visible_hours = min(round(visible_seconds / 3600.0, 2), mission_seconds / 3600.0)
    fraction = round(visible_seconds / mission_seconds, 4)
    return fraction, visible_hours


def analyze_site_conditions(
    site_id: str,
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
) -> ConditionsResponse:
    """Compute sampled geometric visibility fractions and durations.

    Uses the geometric horizon model where elevation_deg > 0 indicates
    visibility. Exact horizon-crossing times are not available from hourly
    samples, so crossings are estimated by linear interpolation between samples.
    """
    points = fetch_jpl_horizons_ephemeris(
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
        use_cache=True,
    )

    if not points:
        return ConditionsResponse(
            site_id=site_id,
            latitude_deg=latitude_deg,
            longitude_deg=longitude_deg,
            start_utc=start_utc,
            end_utc=end_utc,
            step_minutes=step_minutes,
            metrics=VisibilityMetrics(),
            horizon_model="geometric",
            status="unavailable",
            source="JPL Horizons",
        )

    try:
        start = _parse_utc_timestamp(start_utc)
        end = _parse_utc_timestamp(end_utc)
    except (TypeError, ValueError):
        sun_fraction, sun_hours = None, None
        earth_fraction, earth_hours = None, None
    else:
        sun_fraction, sun_hours = _estimate_visibility(
            points, "sun_elevation_deg", start, end
        )
        earth_fraction, earth_hours = _estimate_visibility(
            points, "earth_elevation_deg", start, end
        )

    metrics = VisibilityMetrics(
        sunlit_fraction=sun_fraction,
        earth_visible_fraction=earth_fraction,
        sunlit_hours=sun_hours,
        earth_visible_hours=earth_hours,
    )

    return ConditionsResponse(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
        metrics=metrics,
        horizon_model="geometric",
        status="ok",
        source="JPL Horizons",
    )
