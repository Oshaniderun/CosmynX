"""Member 5: compare scientific outputs without inventing missing measurements."""

from datetime import datetime, timedelta
from math import isfinite
from httpx import HTTPError

from app.api.sites import DEFAULT_SITES
from app.models.schemas import (
    CompareRequest, CompareResponse, ComparisonDelta, ConditionsResponse, EphemerisResponse,
    ScenarioComparison, ScenarioInput, VisibilityInterval,
)
from app.services.comparison_demo import DEMO_SOURCE, demo_conditions
from app.services.positions import get_ephemeris_for_site
from app.services.visibility import analyze_site_conditions


def _utc(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _visible(elevation: float | None) -> bool | None:
    return elevation > 0 if elevation is not None and isfinite(elevation) else None


def _timeline(scenario: ScenarioInput, ephemeris: EphemerisResponse) -> list[VisibilityInterval]:
    # Match each requested sample independently. Gaps never inherit an earlier state.
    lookup = {}
    if ephemeris.status == "ok":
        for point in ephemeris.points:
            try:
                instant = _utc(point.timestamp_utc)
                if instant.tzinfo is not None:
                    # Conflicting duplicate samples are unknown, regardless of order.
                    lookup[instant] = point if instant not in lookup else None
            except ValueError:
                continue
    start, end = _utc(scenario.start_utc), _utc(scenario.end_utc)
    instant = start
    intervals = []
    while instant < end:
        interval_end = min(instant + timedelta(minutes=scenario.step_minutes), end)
        point = lookup.get(instant)
        intervals.append(VisibilityInterval(
            start_utc=instant.isoformat().replace("+00:00", "Z"),
            end_utc=interval_end.isoformat().replace("+00:00", "Z"),
            elapsed_hours=(instant - start).total_seconds() / 3600,
            sunlit=_visible(point.sun_elevation_deg) if point else None,
            earth_visible=_visible(point.earth_elevation_deg) if point else None,
        ))
        instant = interval_end
    return intervals


def _delta(baseline: ScenarioComparison, alternative: ScenarioComparison) -> ComparisonDelta:
    base, other = baseline.conditions, alternative.conditions
    delta = ComparisonDelta(
        baseline_scenario_id=baseline.scenario_id, scenario_id=alternative.scenario_id,
        start_delay_hours=(_utc(other.start_utc) - _utc(base.start_utc)).total_seconds() / 3600,
    )
    if base.status != "ok" or other.status != "ok":
        delta.warnings.append("Differences require available metrics for both scenarios.")
        return delta
    if base.horizon_model != other.horizon_model:
        delta.warnings.append("Different horizon models cannot be compared directly.")
        return delta
    for name in ("sunlit", "earth_visible"):
        a, b = getattr(base.metrics, f"{name}_fraction"), getattr(other.metrics, f"{name}_fraction")
        if a is not None and b is not None:
            setattr(delta, f"{name}_percentage_points", (b - a) * 100)
        a, b = getattr(base.metrics, f"{name}_hours"), getattr(other.metrics, f"{name}_hours")
        if a is not None and b is not None and baseline.duration_hours == alternative.duration_hours:
            setattr(delta, f"{name}_hours", b - a)
    if baseline.duration_hours != alternative.duration_hours:
        delta.warnings.append("Mission durations differ; hour differences are withheld. Compare fractions instead.")
    if base.step_minutes != other.step_minutes:
        delta.warnings.append("Sampling resolutions differ; short transitions may be represented differently.")
    return delta


def compare_scenarios(request: CompareRequest) -> CompareResponse:
    site_lookup = {site.site_id: site for site in DEFAULT_SITES}
    unknown = sorted({s.site_id for s in request.scenarios} - site_lookup.keys())
    if unknown:
        raise ValueError(f"Unknown landing site(s): {', '.join(unknown)}")
    scenarios = []
    for index, scenario in enumerate(request.scenarios):
        site = site_lookup[scenario.site_id]
        warnings = []
        if request.data_mode == "demo":
            conditions, timeline, warnings = demo_conditions(scenario, site.latitude_deg, site.longitude_deg)
            timeline_source = DEMO_SOURCE
        else:
            params = dict(
                site_id=site.site_id, latitude_deg=site.latitude_deg, longitude_deg=site.longitude_deg,
                start_utc=scenario.start_utc, end_utc=scenario.end_utc, step_minutes=scenario.step_minutes,
            )
            try:
                conditions = analyze_site_conditions(**params)
            except (OSError, ValueError, HTTPError):
                conditions = ConditionsResponse(**params, status="unavailable")
                warnings.append("The conditions service could not evaluate this scenario. Retry later.")
            try:
                ephemeris = get_ephemeris_for_site(**params)
                timeline = _timeline(scenario, ephemeris)
                timeline_source = ephemeris.source
            except (OSError, ValueError, HTTPError):
                timeline = []
                timeline_source = "JPL Horizons — unavailable"
                warnings.append("Ephemeris retrieval failed. Timeline data is unavailable.")
            if conditions.status != "ok":
                warnings.append("Scientific conditions are pending or unavailable; missing metrics remain unknown.")
            if conditions.horizon_model != "geometric":
                warnings.append("Timeline uses geometric elevation; summary metrics use the stated horizon model.")
        full = bool(timeline) and all(p.sunlit is not None and p.earth_visible is not None for p in timeline)
        any_known = any(p.sunlit is not None or p.earth_visible is not None for p in timeline)
        timeline_status = "ok" if full else "partial" if any_known else "unavailable"
        if timeline_status != "ok":
            warnings.append("Timeline contains unknown intervals; unknown does not mean below the horizon.")
        scenarios.append(ScenarioComparison(
            scenario_id=scenario.scenario_id or f"scenario_{index + 1}", site_name=site.name,
            duration_hours=(_utc(scenario.end_utc) - _utc(scenario.start_utc)).total_seconds() / 3600,
            conditions=conditions, timeline=timeline, timeline_status=timeline_status,
            timeline_source=timeline_source, warnings=warnings,
        ))
    statuses = [s.conditions.status for s in scenarios]
    status = "ok" if all(s == "ok" for s in statuses) else (
        "partial" if "ok" in statuses else "pending" if "pending" in statuses else "unavailable"
    )
    return CompareResponse(
        results=[s.conditions for s in scenarios], scenarios=scenarios,
        deltas=[_delta(scenarios[0], other) for other in scenarios[1:]],
        data_mode=request.data_mode, status=status,
        assumptions=[
            "The first scenario is the baseline. Differences are alternative minus baseline, not ranking scores.",
            "Timelines align by elapsed mission hours, while retaining each scenario's absolute UTC timestamps.",
            "Live timeline visibility means elevation strictly above 0 degrees at the geometric horizon.",
            "Each sample is held to the next requested step, clipped at mission end. Missing samples remain unknown.",
            "Summary metrics come from the conditions service; timeline states come from ephemeris independently.",
            "Terrain obstruction, solar array output, and communication link budgets are not modeled by geometric timelines.",
        ] + (["DEMO MODE: all displayed measurements are synthetic fixtures, not NASA data."] if request.data_mode == "demo" else []),
    )
