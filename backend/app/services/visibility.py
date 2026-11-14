"""Member 4 — Solar Power & Communication Analysis Service.

Calculates geometric sunlight availability and Earth visibility metrics
from ephemeris elevation angles provided by NASA JPL Horizons.
"""

import math
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

    # Build timeline points, power outputs, and operational windows
    timeline = []
    windows: list[OperationalWindow] = []
    current_earth_window: OperationalWindow | None = None
    current_sun_window: OperationalWindow | None = None
    step_hours = round(step_minutes / 60.0, 2)

    # Streak tracking for battery sizing & solar survival
    curr_dark_streak = 0
    max_dark_streak = 0
    curr_sun_streak = 0
    max_sun_streak = 0

    total_power_wh_vertical = 0.0
    total_power_wh_horizontal = 0.0
    total_power_wh_tracking = 0.0

    sun_elevations_positive: list[float] = []

    for pt in points:
        sun_el = pt.get("sun_elevation_deg")
        earth_el = pt.get("earth_elevation_deg")
        ts = pt.get("timestamp_utc", "")

        is_sun = bool(sun_el is not None and sun_el > 0)
        is_earth = bool(earth_el is not None and earth_el > 0)

        # Solar power output modeling for 1 kW rated reference array
        if is_sun and sun_el is not None:
            sun_elevations_positive.append(sun_el)
            curr_sun_streak += 1
            if curr_sun_streak > max_sun_streak:
                max_sun_streak = curr_sun_streak
            curr_dark_streak = 0

            theta_rad = math.radians(sun_el)
            # Polar vertical panel normal faces the low horizon (incidence = cos(elev))
            # Accounting for 4-sided/cylindrical perimeter geometry factor (~1/pi):
            p_vertical = round(1000.0 * math.cos(theta_rad) * (1.0 / math.pi), 1)
            p_horizontal = round(1000.0 * math.sin(theta_rad), 1)
            p_tracking = 1000.0
        else:
            curr_dark_streak += 1
            if curr_dark_streak > max_dark_streak:
                max_dark_streak = curr_dark_streak
            curr_sun_streak = 0

            p_vertical = 0.0
            p_horizontal = 0.0
            p_tracking = 0.0

        total_power_wh_vertical += p_vertical * step_hours
        total_power_wh_horizontal += p_horizontal * step_hours
        total_power_wh_tracking += p_tracking * step_hours

        timeline.append({
            "timestamp_utc": ts,
            "sun_elevation_deg": sun_el,
            "earth_elevation_deg": earth_el,
            "is_sunlit": is_sun,
            "is_earth_visible": is_earth,
            "power_watts_vertical": p_vertical,
            "power_watts_horizontal": p_horizontal,
            "power_watts_tracking": p_tracking,
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

    longest_darkness_hours = round(max_dark_streak * step_hours, 2)
    longest_sunlit_hours = round(max_sun_streak * step_hours, 2)
    mean_sun_el = (
        round(sum(sun_elevations_positive) / len(sun_elevations_positive), 2)
        if sun_elevations_positive
        else None
    )

    # Battery sizing parameters (assuming baseline 100W survival hotel load & 70% DoD)
    baseline_hotel_load_w = 100.0
    usable_kwh_100w = round((longest_darkness_hours * baseline_hotel_load_w) / 1000.0, 3)
    nominal_kwh_100w = round(usable_kwh_100w / 0.70, 3)
    battery_mass_kg = round(nominal_kwh_100w * 1000.0 / 150.0, 2)  # 150 Wh/kg space Li-ion

    power_modeling = {
        "rated_array_kw": 1.0,
        "cumulative_energy_kwh": {
            "vertical_polar": round(total_power_wh_vertical / 1000.0, 2),
            "tracking": round(total_power_wh_tracking / 1000.0, 2),
            "horizontal": round(total_power_wh_horizontal / 1000.0, 2),
        },
        "battery_sizing": {
            "longest_darkness_hours": longest_darkness_hours,
            "baseline_hotel_load_watts": baseline_hotel_load_w,
            "usable_storage_kwh": usable_kwh_100w,
            "nominal_capacity_kwh": nominal_kwh_100w,
            "max_dod_percent": 70,
            "estimated_battery_mass_kg": battery_mass_kg,
            "battery_chemistry": "Space-Grade Li-ion (150 Wh/kg)",
        },
    }

    metrics = VisibilityMetrics(
        sunlit_fraction=sunlit_fraction,
        earth_visible_fraction=earth_visible_fraction,
        sunlit_hours=sunlit_hours,
        earth_visible_hours=earth_visible_hours,
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
        windows=windows,
        timeline=timeline,
        power_modeling=power_modeling,
    )
