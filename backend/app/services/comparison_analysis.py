"""Comparison-only, duration-weighted summaries of sampled geometric visibility."""

from datetime import datetime

from app.models.schemas import OperationalWindow, SettingTransition, VisibilityInterval, VisibilityMetrics


def hours_between(start: str, end: str) -> float:
    return (datetime.fromisoformat(end.replace("Z", "+00:00")) - datetime.fromisoformat(start.replace("Z", "+00:00"))).total_seconds() / 3600


def summarize_intervals(intervals: list[VisibilityInterval], duration: float):
    coverage = {}
    metrics = {}
    for target, state_field, metric in (
        ("sunlight", "sunlit", "sunlit"), ("earth", "earth_visible", "earth_visible"),
    ):
        known = sum(hours_between(p.start_utc, p.end_utc) for p in intervals if getattr(p, state_field) is not None)
        visible = sum(hours_between(p.start_utc, p.end_utc) for p in intervals if getattr(p, state_field) is True)
        coverage[target] = min(1.0, known / duration)
        complete = abs(known - duration) < 1e-8
        metrics[f"{metric}_hours"] = visible if complete else None
        metrics[f"{metric}_fraction"] = visible / duration if complete else None
    return VisibilityMetrics(**metrics), coverage


def operational_windows(intervals: list[VisibilityInterval]) -> list[OperationalWindow]:
    windows = []
    for target in ("sunlight", "earth", "both"):
        current = None
        for point in intervals:
            visible = (point.sunlit is True if target == "sunlight" else
                       point.earth_visible is True if target == "earth" else
                       point.sunlit is True and point.earth_visible is True)
            if visible:
                if current is not None and current.end_utc == point.start_utc:
                    current.end_utc = point.end_utc
                    current.duration_hours = hours_between(current.start_utc, current.end_utc)
                else:
                    current = OperationalWindow(target=target, start_utc=point.start_utc, end_utc=point.end_utc,
                                                duration_hours=hours_between(point.start_utc, point.end_utc))
                    windows.append(current)
            else:
                current = None
    return windows


def setting_transitions(intervals: list[VisibilityInterval]) -> list[SettingTransition]:
    transitions = []
    for previous, current in zip(intervals, intervals[1:]):
        if previous.end_utc != current.start_utc:
            continue
        for target, field in (("sunlight", "sunlit"), ("earth", "earth_visible")):
            if getattr(previous, field) is True and getattr(current, field) is False:
                transitions.append(SettingTransition(
                    target=target, after_utc=previous.start_utc, by_utc=current.start_utc,
                    after_elapsed_hours=previous.elapsed_hours, by_elapsed_hours=current.elapsed_hours,
                ))
    return transitions


def continuity_metrics(intervals: list[VisibilityInterval], duration: float) -> dict[str, float | None]:
    """Continuous outage estimates are withheld when their target has unknown time."""
    _, coverage = summarize_intervals(intervals, duration)
    result = {}
    for target, field, output in (
        ("sunlight", "sunlit", "longest_darkness_hours"),
        ("earth", "earth_visible", "longest_earth_outage_hours"),
    ):
        longest = run = 0.0
        previous_end = None
        for point in intervals:
            if previous_end != point.start_utc:
                run = 0
            run = run + hours_between(point.start_utc, point.end_utc) if getattr(point, field) is False else 0
            longest = max(longest, run)
            previous_end = point.end_utc
        result[output] = longest if coverage[target] >= 1 - 1e-10 else None
    result["simultaneous_visibility_hours"] = (
        sum(hours_between(p.start_utc, p.end_utc) for p in intervals if p.sunlit is True and p.earth_visible is True)
        if all(value >= 1 - 1e-10 for value in coverage.values()) else None
    )
    return result
