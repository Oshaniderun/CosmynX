"""Explicitly synthetic UI fixtures. Never used as a NASA-data fallback."""

from datetime import datetime, timedelta

from app.models.schemas import ConditionsResponse, ScenarioInput, VisibilityInterval, VisibilityMetrics

DEMO_SOURCE = "Synthetic comparison fixture — NOT NASA measurements"
DEMO_START = datetime.fromisoformat("2026-11-20T00:00:00+00:00")
DEMO_END = DEMO_START + timedelta(days=14)

# Invented hourly on/off schedules, solely to exercise charts and delay controls.
SCHEDULES = {
    "candidate_001": ((0, 18), (4, 24)),
    "candidate_002": ((3, 24), (0, 16)),
    "candidate_003": ((6, 18), (0, 24)),
}


def demo_conditions(
    scenario: ScenarioInput, latitude: float, longitude: float,
) -> tuple[ConditionsResponse, list[VisibilityInterval], list[str]]:
    start = datetime.fromisoformat(scenario.start_utc.replace("Z", "+00:00"))
    end = datetime.fromisoformat(scenario.end_utc.replace("Z", "+00:00"))
    covered = DEMO_START <= start < end <= DEMO_END
    intervals = []
    sun_hours = earth_hours = 0.0
    sun_window, earth_window = SCHEDULES[scenario.site_id]
    instant = start
    while instant < end:
        interval_end = min(instant + timedelta(minutes=scenario.step_minutes), end)
        hour = (instant - DEMO_START).total_seconds() / 3600
        # A drifting synthetic cycle makes a mission delay visibly change the fixtures.
        phase = hour % 26
        sun = sun_window[0] <= phase < sun_window[1] if covered else None
        earth = earth_window[0] <= phase < earth_window[1] if covered else None
        duration = (interval_end - instant).total_seconds() / 3600
        sun_hours += duration if sun else 0
        earth_hours += duration if earth else 0
        intervals.append(VisibilityInterval(
            start_utc=instant.isoformat().replace("+00:00", "Z"),
            end_utc=interval_end.isoformat().replace("+00:00", "Z"),
            elapsed_hours=(instant - start).total_seconds() / 3600,
            sunlit=sun, earth_visible=earth,
        ))
        instant = interval_end
    total = (end - start).total_seconds() / 3600
    metrics = VisibilityMetrics(
        sunlit_fraction=sun_hours / total, earth_visible_fraction=earth_hours / total,
        sunlit_hours=sun_hours, earth_visible_hours=earth_hours,
    ) if covered else VisibilityMetrics()
    conditions = ConditionsResponse(
        site_id=scenario.site_id, latitude_deg=latitude, longitude_deg=longitude,
        start_utc=scenario.start_utc, end_utc=scenario.end_utc,
        step_minutes=scenario.step_minutes, metrics=metrics, horizon_model="synthetic",
        status="ok" if covered else "unavailable", source=DEMO_SOURCE,
    )
    warnings = ["Synthetic preview only. Do not use these values for mission planning."]
    if not covered:
        warnings.append("Demo coverage is 20 November–4 December 2026 UTC; choose a window entirely within it.")
    return conditions, intervals, warnings
