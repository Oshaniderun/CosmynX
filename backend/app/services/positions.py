"""Member 3 — Sun & Earth Position Visualization Service.

Consumes NASA ephemeris data from Member 2 and formats azimuth/elevation series
for the local-horizon visualization.
"""

from app.models.schemas import EphemerisPoint, EphemerisResponse
from app.services.nasa_data import fetch_jpl_horizons_ephemeris, get_cached_ephemeris_metadata


def get_ephemeris_for_site(
    site_id: str,
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
    scientific_only: bool = False,
) -> EphemerisResponse:
    """Return Sun and Earth azimuth/elevation time-series for a lunar site."""
    raw_points = fetch_jpl_horizons_ephemeris(
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
        use_cache=True,
        allow_analytical_fallback=not scientific_only,
    )
    points = [EphemerisPoint(**point) for point in raw_points]
    return EphemerisResponse(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
        source="JPL Horizons",
        status="ok" if points else "unavailable",
        points=points,
        **get_cached_ephemeris_metadata(latitude_deg, longitude_deg, start_utc, end_utc, step_minutes),
    )
