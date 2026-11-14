"""Member 5: compare scientific outputs without inventing missing measurements."""

from datetime import datetime, timedelta
from math import isfinite
from app.services.comparison_analysis import summarize_intervals, operational_windows, setting_transitions, continuity_metrics
from httpx import HTTPError

from app.api.sites import DEFAULT_SITES
from app.models.schemas import (
    CompareRequest, CompareResponse, ComparisonDelta, ConditionsResponse, EphemerisResponse,
    ScenarioComparison, ScenarioInput, VisibilityInterval, VisibilityMetrics, LandingSite,
)
from app.services.comparison_demo import DEMO_SOURCE, demo_conditions
from app.services.positions import get_ephemeris_for_site
from app.services.visibility import analyze_site_conditions


def _utc(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _visible(elevation: float | None) -> bool | None:
    return elevation > 0 if elevation is not None and isfinite(elevation) and -90 <= elevation <= 90 else None


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
            sun_elevation_deg=point.sun_elevation_deg if point and _visible(point.sun_elevation_deg) is not None else None,
            earth_elevation_deg=point.earth_elevation_deg if point and _visible(point.earth_elevation_deg) is not None else None,
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
    unknown = sorted({s.site_id for s in request.scenarios if s.site_id != "custom"} - site_lookup.keys())
    if unknown:
        raise ValueError(f"Unknown landing site(s): {', '.join(unknown)}")
    if request.data_mode == "demo" and any(s.site_id == "custom" for s in request.scenarios):
        raise ValueError("Synthetic preview supports catalog sites only; use scientific services for custom coordinates")
    scenarios = []
    for index, scenario in enumerate(request.scenarios):
        site = site_lookup[scenario.site_id] if scenario.site_id != "custom" else LandingSite(
            site_id="custom", name=f"Custom site ({scenario.latitude_deg:.4f}°, {scenario.longitude_deg:.4f}° E)",
            latitude_deg=scenario.latitude_deg, longitude_deg=scenario.longitude_deg,
        )
        duration = (_utc(scenario.end_utc) - _utc(scenario.start_utc)).total_seconds() / 3600
        summary_method = "synthetic" if request.data_mode == "demo" else "conditions_service"
        retrieved_utc = request_fingerprint = None
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
                if (conditions.site_id != site.site_id or conditions.latitude_deg != site.latitude_deg
                        or conditions.longitude_deg != site.longitude_deg
                        or _utc(conditions.start_utc) != _utc(scenario.start_utc)
                        or _utc(conditions.end_utc) != _utc(scenario.end_utc)
                        or conditions.step_minutes != scenario.step_minutes):
                    raise ValueError("Conditions do not match the requested scenario")
            except (OSError, ValueError, HTTPError):
                conditions = ConditionsResponse(**params, status="unavailable")
                warnings.append("The conditions service could not evaluate this scenario. Retry later.")
            try:
                ephemeris = get_ephemeris_for_site(**params)
                if (ephemeris.site_id != site.site_id or ephemeris.latitude_deg != site.latitude_deg
                        or ephemeris.longitude_deg != site.longitude_deg
                        or _utc(ephemeris.start_utc) != _utc(scenario.start_utc)
                        or _utc(ephemeris.end_utc) != _utc(scenario.end_utc)
                        or ephemeris.step_minutes != scenario.step_minutes):
                    raise ValueError("Ephemeris does not match the requested scenario")
                timeline = _timeline(scenario, ephemeris)
                timeline_source = ephemeris.source
                retrieved_utc = ephemeris.retrieved_utc
                request_fingerprint = ephemeris.request_fingerprint
            except (OSError, ValueError, HTTPError):
                timeline = []
                timeline_source = "JPL Horizons — unavailable"
                warnings.append("Ephemeris retrieval failed. Timeline data is unavailable.")
            # Member 4 may still be pending on Dev. Keep this fallback inside comparison;
            # it uses the same explicit sampled intervals, never artificial measurements.
            sampled_metrics, _ = summarize_intervals(timeline, duration)
            invalid = any(value is None or not isfinite(value) for value in conditions.metrics.model_dump().values())
            invalid = invalid or any(
                getattr(conditions.metrics, f"{name}_hours") is not None and (
                    getattr(conditions.metrics, f"{name}_hours") > duration + 1e-8 or
                    abs(getattr(conditions.metrics, f"{name}_hours") - (getattr(conditions.metrics, f"{name}_fraction") or 0) * duration) > max(0.02, duration * 0.0001)
                ) for name in ("sunlit", "earth_visible")
            )
            if conditions.status != "ok" or invalid:
                if all(value is not None for value in sampled_metrics.model_dump().values()):
                    conditions = ConditionsResponse(**params, metrics=sampled_metrics, status="ok", source=timeline_source)
                    summary_method = "comparison_intervals"
                    warnings.append("Summary derived from complete JPL Horizons timeline intervals; sampled geometric estimates, not hardware power or link performance.")
                elif conditions.status == "ok":
                    conditions = ConditionsResponse(**params, metrics=VisibilityMetrics(), status="unavailable", source=timeline_source)
                    warnings.append("Inconsistent or incomplete summary measurements were excluded.")
            if conditions.status != "ok":
                warnings.append("Scientific conditions are pending or unavailable; missing metrics remain unknown.")
            if conditions.horizon_model != "geometric":
                warnings.append("Timeline uses geometric elevation; summary metrics use the stated horizon model.")
        full = bool(timeline) and all(p.sunlit is not None and p.earth_visible is not None for p in timeline)
        any_known = any(p.sunlit is not None or p.earth_visible is not None for p in timeline)
        timeline_status = "ok" if full else "partial" if any_known else "unavailable"
        if timeline_status != "ok":
            warnings.append("Timeline contains unknown intervals; unknown does not mean below the horizon.")
        _, coverage = summarize_intervals(timeline, duration)
        scenarios.append(ScenarioComparison(
            scenario_id=scenario.scenario_id or f"scenario_{index + 1}", site_name=site.name,
            duration_hours=(_utc(scenario.end_utc) - _utc(scenario.start_utc)).total_seconds() / 3600,
            conditions=conditions, timeline=timeline, timeline_status=timeline_status,
            timeline_source=timeline_source, warnings=warnings, summary_method=summary_method,
            sun_coverage_fraction=coverage["sunlight"], earth_coverage_fraction=coverage["earth"],
            windows=operational_windows(timeline), setting_transitions=setting_transitions(timeline),
            **continuity_metrics(timeline, duration),
            retrieved_utc=retrieved_utc, request_fingerprint=request_fingerprint,
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
            "Summary method is stated per scenario: validated conditions-service output, or duration-weighted complete comparison intervals.",
            "Sun/Earth elevations are airless apparent target-center angles. No atmospheric refraction or terrain horizon is applied.",
            "Setting times are brackets between consecutive known samples, not exact event predictions. No setting outside the mission is inferred.",
            "Window endpoints use sample-and-hold intervals; partial coverage is explicit and unknown intervals break windows.",
            "Terrain obstruction, solar array output, and communication link budgets are not modeled by geometric timelines.",
        ] + (["DEMO MODE: all displayed measurements are synthetic fixtures, not NASA data."] if request.data_mode == "demo" else []),
    )
