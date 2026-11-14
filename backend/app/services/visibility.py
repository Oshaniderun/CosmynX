"""Sampled geometric visibility and reference solar-array modelling.

Visibility durations integrate elapsed intervals between JPL Horizons samples.
Horizon crossings are linearly interpolated and remain sampled estimates; they
are not continuous visibility guarantees. Power outputs are a separate,
explicitly assumed 1 kW array model, not measured or flight-qualified power.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.models.schemas import ConditionsResponse, OperationalWindow, VisibilityMetrics
from app.services.nasa_data import fetch_jpl_horizons_ephemeris


Sample = tuple[datetime, Optional[float]]
Segment = tuple[datetime, datetime]


def _parse_utc_timestamp(timestamp: str) -> datetime:
    parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("Timestamp must include a timezone")
    return parsed.astimezone(timezone.utc)


def _samples_for(points: list[dict], field: str, start: datetime, end: datetime) -> list[Sample]:
    samples: list[Sample] = []
    for point in points:
        try:
            timestamp = _parse_utc_timestamp(point.get("timestamp_utc"))
        except (AttributeError, TypeError, ValueError):
            continue
        if not start <= timestamp <= end:
            continue
        value = point.get(field)
        try:
            elevation = None if value is None else float(value)
        except (TypeError, ValueError):
            elevation = None
        if elevation is not None and not math.isfinite(elevation):
            elevation = None
        samples.append((timestamp, elevation))
    return sorted(samples, key=lambda item: item[0])


def _complete_samples(samples: list[Sample], start: datetime, end: datetime) -> bool:
    return (
        len(samples) >= 2
        and samples[0][0] == start
        and samples[-1][0] == end
        and all(value is not None for _, value in samples)
        and all(a[0] < b[0] for a, b in zip(samples, samples[1:]))
    )


def _visible_segments(samples: list[Sample]) -> list[Optional[list[Segment]]]:
    """Return each interval's visible subintervals; None means unknown input."""
    intervals: list[Optional[list[Segment]]] = []
    for (time_a, elevation_a), (time_b, elevation_b) in zip(samples, samples[1:]):
        if time_b <= time_a or elevation_a is None or elevation_b is None:
            intervals.append(None)
            continue
        if elevation_a > 0 and elevation_b > 0:
            intervals.append([(time_a, time_b)])
        elif elevation_a <= 0 and elevation_b <= 0:
            intervals.append([])
        elif elevation_a > 0:
            ratio = elevation_a / (elevation_a - elevation_b)
            crossing = time_a + (time_b - time_a) * ratio
            intervals.append([(time_a, crossing)])
        else:
            ratio = -elevation_a / (elevation_b - elevation_a)
            crossing = time_a + (time_b - time_a) * ratio
            intervals.append([(crossing, time_b)])
    return intervals


def _duration_seconds(segments: list[Segment]) -> float:
    return sum((end - start).total_seconds() for start, end in segments)


def _estimate_visibility(
    points: list[dict], elevation_field: str, start: datetime, end: datetime
) -> tuple[Optional[float], Optional[float]]:
    """Return sampled, linearly-interpolated visibility over the actual window.

    Missing elevations, malformed or duplicate timestamps, and absent boundary
    samples make the result unknown. Missing data is never treated as zero.
    """
    mission_seconds = (end - start).total_seconds()
    if mission_seconds <= 0:
        return None, None
    samples = _samples_for(points, elevation_field, start, end)
    if not _complete_samples(samples, start, end):
        return None, None
    intervals = _visible_segments(samples)
    if any(interval is None for interval in intervals):
        return None, None
    visible_seconds = _duration_seconds(
        [segment for interval in intervals if interval for segment in interval]
    )
    visible_seconds = min(max(visible_seconds, 0.0), mission_seconds)
    visible_hours = min(round(visible_seconds / 3600.0, 2), mission_seconds / 3600.0)
    return round(visible_seconds / mission_seconds, 4), visible_hours


def _merge_segments(intervals: list[Optional[list[Segment]]]) -> list[Segment]:
    merged: list[Segment] = []
    for interval in intervals:
        if interval is None or not interval:
            continue
        for start, end in interval:
            if end <= start:
                continue
            if merged and merged[-1][1] == start:
                merged[-1] = (merged[-1][0], end)
            else:
                merged.append((start, end))
    return merged


def _window_models(target: str, segments: list[Segment], mission_seconds: float) -> list[OperationalWindow]:
    windows: list[OperationalWindow] = []
    for start, end in segments:
        hours = min((end - start).total_seconds() / 3600.0, mission_seconds / 3600.0)
        if hours <= 0:
            continue
        windows.append(OperationalWindow(
            target=target,
            start_utc=start.isoformat().replace("+00:00", "Z"),
            end_utc=end.isoformat().replace("+00:00", "Z"),
            duration_hours=hours,
        ))
    return windows


def _intersection_segments(
    sun: list[Optional[list[Segment]]], earth: list[Optional[list[Segment]]]
) -> list[Optional[list[Segment]]]:
    combined: list[Optional[list[Segment]]] = []
    for sun_interval, earth_interval in zip(sun, earth):
        if sun_interval is None or earth_interval is None:
            combined.append(None)
            continue
        intersections: list[Segment] = []
        for sun_start, sun_end in sun_interval:
            for earth_start, earth_end in earth_interval:
                start, end = max(sun_start, earth_start), min(sun_end, earth_end)
                if end > start:
                    intersections.append((start, end))
        combined.append(intersections)
    return combined


def _elevation_at(time: datetime, time_a: datetime, time_b: datetime, elevation_a: float, elevation_b: float) -> float:
    span = (time_b - time_a).total_seconds()
    fraction = (time - time_a).total_seconds() / span
    return elevation_a + fraction * (elevation_b - elevation_a)


def _array_power_watts(elevation_deg: float) -> tuple[float, float, float]:
    if elevation_deg <= 0:
        return 0.0, 0.0, 0.0
    radians = math.radians(elevation_deg)
    return (
        max(0.0, 1000.0 * math.cos(radians) / math.pi),
        max(0.0, 1000.0 * math.sin(radians)),
        1000.0,
    )


def _power_model(samples: list[Sample], sun_intervals: list[Optional[list[Segment]]], complete: bool, mission_seconds: float):
    if not complete or any(interval is None for interval in sun_intervals):
        return None

    energy_wh = [0.0, 0.0, 0.0]
    for ((time_a, elevation_a), (time_b, elevation_b)), visible_segments in zip(zip(samples, samples[1:]), sun_intervals):
        if elevation_a is None or elevation_b is None or visible_segments is None:
            return None
        for visible_start, visible_end in visible_segments:
            duration_hours = (visible_end - visible_start).total_seconds() / 3600.0
            midpoint = visible_start + (visible_end - visible_start) / 2
            elevation = _elevation_at(midpoint, time_a, time_b, elevation_a, elevation_b)
            powers = _array_power_watts(elevation)
            for index, power in enumerate(powers):
                energy_wh[index] += power * duration_hours

    sunlight = _merge_segments(sun_intervals)
    longest_dark_seconds = 0.0
    cursor = samples[0][0]
    for visible_start, visible_end in sunlight:
        longest_dark_seconds = max(longest_dark_seconds, (visible_start - cursor).total_seconds())
        cursor = max(cursor, visible_end)
    longest_dark_seconds = max(longest_dark_seconds, (samples[-1][0] - cursor).total_seconds())
    longest_darkness_hours = min(longest_dark_seconds / 3600.0, mission_seconds / 3600.0)

    hotel_load_w = 100.0
    usable_kwh = longest_darkness_hours * hotel_load_w / 1000.0
    nominal_kwh = usable_kwh / 0.70
    return {
        "rated_array_kw": 1.0,
        "cumulative_energy_kwh": {
            "vertical_polar": round(energy_wh[0] / 1000.0, 3),
            "tracking": round(energy_wh[2] / 1000.0, 3),
            "horizontal": round(energy_wh[1] / 1000.0, 3),
        },
        "battery_sizing": {
            "longest_darkness_hours": round(longest_darkness_hours, 3),
            "baseline_hotel_load_watts": hotel_load_w,
            "usable_storage_kwh": round(usable_kwh, 3),
            "nominal_capacity_kwh": round(nominal_kwh, 3),
            "max_dod_percent": 70,
            "estimated_battery_mass_kg": round(nominal_kwh * 1000.0 / 150.0, 2),
            "battery_chemistry": "Space-grade Li-ion assumption (150 Wh/kg)",
        },
        "model_assumptions": [
            "Illustrative 1 kW reference array; not measured power or a hardware prediction.",
            "Array geometry uses cosine/pi for vertical polar, sine for horizontal, and ideal tracking.",
            "Battery estimate assumes 100 W hotel load, 70% depth of discharge, and 150 Wh/kg.",
            "Energy integrates the same linearly interpolated visible intervals as sunlight duration.",
        ],
    }


def calculate_visibility_transitions(
    timeline: list[dict], start: datetime, end: datetime
) -> Optional[dict]:
    """Estimate sampled horizon transitions only for complete, known boundary coverage."""
    if not timeline:
        return None
    try:
        start = _parse_utc_timestamp(start.isoformat())
        end = _parse_utc_timestamp(end.isoformat())
        timestamps = [
            _parse_utc_timestamp(point["timestamp_utc"])
            for point in timeline
        ]
    except (AttributeError, KeyError, TypeError, ValueError):
        return None
    if (end <= start or timestamps[0] != start or timestamps[-1] != end
            or any(previous >= current for previous, current in zip(timestamps, timestamps[1:]))):
        return None
    if any(
        not isinstance(point.get("is_sunlit"), bool)
        or not isinstance(point.get("is_earth_visible"), bool)
        for point in timeline
    ):
        return None

    transitions = {}
    for target, state_key, positive_event, negative_event, positive_label, negative_label in (
        ("solar", "is_sunlit", "sunset", "sunrise", "sunlit", "shadow"),
        ("earth", "is_earth_visible", "earthset", "earthrise", "contact_active", "blackout"),
    ):
        initial = timeline[0][state_key]
        event = "none"
        event_time = None
        hours_until = None
        for point, timestamp in zip(timeline[1:], timestamps[1:]):
            if point[state_key] != initial:
                event_time = timestamp
                event = positive_event if initial else negative_event
                hours_until = round((event_time - start).total_seconds() / 3600.0, 2)
                break
        initial_label = positive_label if initial else negative_label
        if target == "earth":
            state_description = "Earth geometrically above the horizon" if initial else "Earth below the geometric horizon"
        else:
            state_description = "Sun above the geometric horizon" if initial else "Sun below the geometric horizon"
        if event == "none":
            description = f"{state_description} throughout sampled window"
        else:
            description = f"{event.capitalize()} in {hours_until:.2f} hours (sampled geometric transition)"
        transitions[target] = {
            "current_state": initial_label,
            "next_event": event,
            "transition_utc": event_time.isoformat().replace("+00:00", "Z") if event_time else None,
            "hours_until": hours_until,
            "description": description,
        }
    return transitions


def analyze_site_conditions(
    site_id: str,
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
) -> ConditionsResponse:
    """Compute elapsed-time, sampled geometric visibility and power estimates."""
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
        start, end = _parse_utc_timestamp(start_utc), _parse_utc_timestamp(end_utc)
    except (TypeError, ValueError):
        start = end = None

    if start is None or end is None or end <= start:
        sun_samples: list[Sample] = []
        earth_samples: list[Sample] = []
        sun_intervals: list[Optional[list[Segment]]] = []
        earth_intervals: list[Optional[list[Segment]]] = []
        sun_fraction = sun_hours = earth_fraction = earth_hours = None
        mission_seconds = 0.0
    else:
        mission_seconds = (end - start).total_seconds()
        sun_samples = _samples_for(points, "sun_elevation_deg", start, end)
        earth_samples = _samples_for(points, "earth_elevation_deg", start, end)
        sun_intervals = _visible_segments(sun_samples)
        earth_intervals = _visible_segments(earth_samples)
        sun_fraction, sun_hours = _estimate_visibility(points, "sun_elevation_deg", start, end)
        earth_fraction, earth_hours = _estimate_visibility(points, "earth_elevation_deg", start, end)

    metrics = VisibilityMetrics(
        sunlit_fraction=sun_fraction,
        earth_visible_fraction=earth_fraction,
        sunlit_hours=sun_hours,
        earth_visible_hours=earth_hours,
    )

    raw_times = []
    all_source_timestamps_valid = True
    for point in points:
        try:
            timestamp = _parse_utc_timestamp(point.get("timestamp_utc"))
        except (AttributeError, TypeError, ValueError):
            all_source_timestamps_valid = False
            continue
        if start is not None and end is not None and start <= timestamp <= end:
            raw_times.append((timestamp, point))
    raw_times.sort(key=lambda item: item[0])

    timeline = []
    for timestamp, point in raw_times:
        def finite_elevation(field: str) -> Optional[float]:
            try:
                value = point.get(field)
                parsed = None if value is None else float(value)
                return parsed if parsed is not None and math.isfinite(parsed) else None
            except (TypeError, ValueError):
                return None

        sun = finite_elevation("sun_elevation_deg")
        earth = finite_elevation("earth_elevation_deg")
        sun_known = sun is not None
        earth_known = earth is not None
        p_vert, p_horiz, p_track = _array_power_watts(sun) if sun_known else (None, None, None)
        timeline.append({
            "timestamp_utc": timestamp.isoformat().replace("+00:00", "Z"),
            "sun_elevation_deg": sun,
            "earth_elevation_deg": earth,
            "is_sunlit": (sun > 0) if sun_known else None,
            "is_earth_visible": (earth > 0) if earth_known else None,
            "power_watts_vertical": p_vert,
            "power_watts_horizontal": p_horiz,
            "power_watts_tracking": p_track,
        })

    if start is not None and end is not None:
        sun_segments = _merge_segments(sun_intervals)
        earth_segments = _merge_segments(earth_intervals)
        both_segments = _merge_segments(_intersection_segments(sun_intervals, earth_intervals))
        windows = (
            _window_models("sunlight", sun_segments, mission_seconds)
            + _window_models("earth", earth_segments, mission_seconds)
            + _window_models("both", both_segments, mission_seconds)
        )
        power_modeling = _power_model(
            sun_samples,
            sun_intervals,
            _complete_samples(sun_samples, start, end),
            mission_seconds,
        )
    else:
        windows = []
        power_modeling = None

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
        windows=windows,
        timeline=timeline,
        power_modeling=power_modeling,
        transitions=(calculate_visibility_transitions(timeline, start, end)
                     if start is not None and end is not None and all_source_timestamps_valid else None),
    )
