"""Member 4 — Solar Power & Communication Analysis Service.

Calculates geometric sunlight availability and Earth visibility metrics
from ephemeris elevation angles provided by NASA JPL Horizons.
"""

from app.models.schemas import ConditionsResponse, OperationalWindow, VisibilityMetrics
from app.services.nasa_data import fetch_jpl_horizons_ephemeris


def analyze_site_conditions(
    site_id: str,
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
) -> ConditionsResponse:
    """Compute sunlight and Earth visibility fractions and durations.

    Uses the geometric horizon model where elevation_deg > 0 indicates visibility.
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

    # Valid points with non-None elevation angles
    valid_sun_points = [
        p for p in points if p.get("sun_elevation_deg") is not None
    ]
    valid_earth_points = [
        p for p in points if p.get("earth_elevation_deg") is not None
    ]

    # Geometric horizon model: elevation_deg > 0
    if valid_sun_points:
        sunlit_count = sum(1 for p in valid_sun_points if p["sun_elevation_deg"] > 0)
        sunlit_fraction = round(sunlit_count / len(valid_sun_points), 4)
        sunlit_hours = round(sunlit_count * (step_minutes / 60.0), 2)
    else:
        sunlit_fraction = None
        sunlit_hours = None

    if valid_earth_points:
        earth_visible_count = sum(
            1 for p in valid_earth_points if p["earth_elevation_deg"] > 0
        )
        earth_visible_fraction = round(earth_visible_count / len(valid_earth_points), 4)
        earth_visible_hours = round(earth_visible_count * (step_minutes / 60.0), 2)
    else:
        earth_visible_fraction = None
        earth_visible_hours = None

    metrics = VisibilityMetrics(
        sunlit_fraction=sunlit_fraction,
        earth_visible_fraction=earth_visible_fraction,
        sunlit_hours=sunlit_hours,
        earth_visible_hours=earth_visible_hours,
    )

    # Build timeline points and continuous operational windows
    timeline = []
    windows: list[OperationalWindow] = []
    current_earth_window: OperationalWindow | None = None
    current_sun_window: OperationalWindow | None = None
    step_hours = round(step_minutes / 60.0, 2)

    for pt in points:
        sun_el = pt.get("sun_elevation_deg")
        earth_el = pt.get("earth_elevation_deg")
        ts = pt.get("timestamp_utc", "")

        is_sun = bool(sun_el is not None and sun_el > 0)
        is_earth = bool(earth_el is not None and earth_el > 0)

        timeline.append({
            "timestamp_utc": ts,
            "sun_elevation_deg": sun_el,
            "earth_elevation_deg": earth_el,
            "is_sunlit": is_sun,
            "is_earth_visible": is_earth,
        })

        if is_earth:
            if current_earth_window is None:
                current_earth_window = OperationalWindow(
                    target="earth",
                    start_utc=ts,
                    end_utc=ts,
                    duration_hours=step_hours,
                )
                windows.append(current_earth_window)
            else:
                current_earth_window.end_utc = ts
                current_earth_window.duration_hours = round(
                    current_earth_window.duration_hours + step_hours, 2
                )
        else:
            current_earth_window = None

        if is_sun:
            if current_sun_window is None:
                current_sun_window = OperationalWindow(
                    target="sunlight",
                    start_utc=ts,
                    end_utc=ts,
                    duration_hours=step_hours,
                )
                windows.append(current_sun_window)
            else:
                current_sun_window.end_utc = ts
                current_sun_window.duration_hours = round(
                    current_sun_window.duration_hours + step_hours, 2
                )
        else:
            current_sun_window = None

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
    )
