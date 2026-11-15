"""Member 6 — Scientific Data Consumer for HELIOS AI Lunar Landing Advisor.

Consumes candidate landing sites from app.api.sites and queries Member 4's
analyze_site_conditions() in app.services.visibility.

Guarantees:
- Never fabricates or invents NASA ephemeris or visibility measurements.
- Never replaces missing measurements (None) with zero.
- Correctly calculates UTC mission intervals [start_utc, start_utc + duration_hours].
- Preserves scientific provenance: source, horizon_model, and status.
- Isolates errors so a single site failure never crashes the advisor batch.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import logging
from typing import Optional

from app.api.sites import DEFAULT_SITES, get_sites
from app.models.helios_models import ScientificProvenance
from app.models.schemas import ConditionsResponse, LandingSite, VisibilityMetrics
from app.services.visibility import analyze_site_conditions

logger = logging.getLogger("helios.data_consumer")


def normalize_utc_timestamp(timestamp_str: str) -> str:
    """Validate and normalize an ISO 8601 UTC timestamp string to 'YYYY-MM-DDTHH:MM:SSZ'.

    Args:
        timestamp_str: ISO 8601 timestamp with 'Z' or a valid UTC offset.

    Returns:
        Normalized UTC timestamp formatted as 'YYYY-MM-DDTHH:MM:SSZ'.

    Raises:
        ValueError: If the string is not valid ISO 8601 or missing timezone info.
    """
    cleaned = timestamp_str.strip()
    try:
        dt = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(
            f"Invalid ISO 8601 timestamp: '{timestamp_str}'. Expected format: 'YYYY-MM-DDTHH:MM:SSZ'"
        ) from exc

    if dt.tzinfo is None:
        raise ValueError(
            f"Timestamp '{timestamp_str}' must include timezone (e.g. 'Z' or '+00:00')."
        )

    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def compute_mission_window(start_utc: str, duration_hours: int) -> tuple[str, str]:
    """Compute normalized start and end UTC timestamps from start_utc and duration_hours.

    Args:
        start_utc: ISO 8601 UTC start timestamp.
        duration_hours: Mission duration in hours (>= 1).

    Returns:
        tuple of (normalized_start_utc, normalized_end_utc).

    Raises:
        ValueError: If duration_hours < 1 or start_utc is invalid.
    """
    if duration_hours < 1:
        raise ValueError(f"duration_hours must be >= 1, got {duration_hours}")

    norm_start = normalize_utc_timestamp(start_utc)
    start_dt = datetime.fromisoformat(norm_start.replace("Z", "+00:00"))
    end_dt = start_dt + timedelta(hours=duration_hours)
    norm_end = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    return norm_start, norm_end


def get_candidate_landing_sites() -> list[LandingSite]:
    """Return the list of candidate lunar landing sites enriched with LRO LOLA terrain metrics."""
    try:
        return get_sites()
    except Exception:
        return list(DEFAULT_SITES)


def fetch_site_scientific_conditions(
    site: LandingSite,
    start_utc: str,
    duration_hours: int,
    step_minutes: int = 60,
) -> ConditionsResponse:
    """Fetch scientific visibility metrics for a single landing site and mission window.

    Calls analyze_site_conditions() from Member 4's visibility service.
    If the service raises an exception or data is unavailable, returns a safe
    ConditionsResponse with status='unavailable' and preserves missing values as None.
    Never fabricates measurements or replaces None with zero.
    """
    try:
        norm_start, norm_end = compute_mission_window(start_utc, duration_hours)
    except ValueError as exc:
        logger.warning("Invalid mission window for %s: %s", site.site_id, exc)
        return ConditionsResponse(
            site_id=site.site_id,
            latitude_deg=site.latitude_deg,
            longitude_deg=site.longitude_deg,
            start_utc=start_utc,
            end_utc=start_utc,
            step_minutes=step_minutes,
            metrics=VisibilityMetrics(),
            horizon_model="geometric",
            status="unavailable",
            source="HELIOS Data Consumer — Invalid Window",
        )

    try:
        conditions = analyze_site_conditions(
            site_id=site.site_id,
            latitude_deg=site.latitude_deg,
            longitude_deg=site.longitude_deg,
            start_utc=norm_start,
            end_utc=norm_end,
            step_minutes=step_minutes,
        )
        return conditions
    except Exception as exc:
        logger.warning(
            "Scientific visibility service failed for site '%s' (%s): %s",
            site.site_id,
            site.name,
            exc,
        )
        return ConditionsResponse(
            site_id=site.site_id,
            latitude_deg=site.latitude_deg,
            longitude_deg=site.longitude_deg,
            start_utc=norm_start,
            end_utc=norm_end,
            step_minutes=step_minutes,
            metrics=VisibilityMetrics(),
            horizon_model="geometric",
            status="unavailable",
            source="JPL Horizons — Service Error",
        )


def evaluate_all_candidate_sites(
    sites: Optional[list[LandingSite]] = None,
    start_utc: str = "2026-11-20T00:00:00Z",
    duration_hours: int = 72,
    step_minutes: int = 60,
) -> dict[str, ConditionsResponse]:
    """Retrieve scientific conditions for all specified candidate landing sites.

    Args:
        sites: List of LandingSite objects. Defaults to get_candidate_landing_sites().
        start_utc: Mission start time in UTC.
        duration_hours: Mission duration in hours.
        step_minutes: Sampling resolution in minutes.

    Returns:
        dict mapping site_id to its ConditionsResponse.
    """
    candidates = sites if sites is not None else get_candidate_landing_sites()
    results: dict[str, ConditionsResponse] = {}

    for site in candidates:
        results[site.site_id] = fetch_site_scientific_conditions(
            site=site,
            start_utc=start_utc,
            duration_hours=duration_hours,
            step_minutes=step_minutes,
        )

    return results


def build_scientific_provenance(
    site: LandingSite,
    conditions: ConditionsResponse,
    duration_hours: float,
) -> ScientificProvenance:
    """Extract and format provenance metadata from a site's ConditionsResponse.

    Guarantees that missing data is never hidden or disguised as valid data.
    """
    warnings: list[str] = []
    status = conditions.status

    if conditions.status != "ok":
        warnings.append(
            f"Scientific measurements are '{conditions.status}'; actual illumination and line-of-sight are unknown."
        )

    if conditions.metrics.sunlit_fraction is None:
        warnings.append("Sunlight fraction measurement is missing from ephemeris.")
    if conditions.metrics.earth_visible_fraction is None:
        warnings.append("Earth visibility fraction measurement is missing from ephemeris.")

    if conditions.horizon_model == "geometric":
        warnings.append(
            "Geometric horizon model: elevation > 0 deg does not model terrain shadow casting."
        )

    if conditions.status == "ok" and (
        conditions.metrics.sunlit_fraction is not None
        or conditions.metrics.earth_visible_fraction is not None
    ):
        warnings.append(
            "Visibility fractions and durations are sampled estimates; horizon crossings are linearly interpolated between ephemeris timestamps."
        )

    is_synthetic = (
        "synthetic" in conditions.source.lower()
        or conditions.horizon_model == "synthetic"
    )
    if is_synthetic:
        warnings.append("SYNTHETIC TEST FIXTURE: Values are not real NASA measurements.")

    return ScientificProvenance(
        site_id=site.site_id,
        source=conditions.source,
        horizon_model=conditions.horizon_model,
        status=status,
        start_utc=conditions.start_utc,
        end_utc=conditions.end_utc,
        duration_hours=duration_hours,
        is_synthetic=is_synthetic,
        warnings=warnings,
    )
