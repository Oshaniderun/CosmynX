"""Member 3 — Sun & Earth Position Visualization Service.

Consumes NASA ephemeris data from Member 2 and formats azimuth/elevation series
for the local-horizon visualization.
"""

from app.models.schemas import EphemerisResponse
from app.services.nasa_data import fetch_jpl_horizons_ephemeris


def get_ephemeris_for_site(
    site_id: str,
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
) -> EphemerisResponse:
    """Return Sun and Earth azimuth/elevation time-series for a lunar site.

    TODO (Member 3): Transform raw NASA data into EphemerisPoint records.
    """
    _raw = fetch_jpl_horizons_ephemeris(
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
    )
    return EphemerisResponse(
        site_id=site_id,
        latitude_deg=latitude_deg,
        longitude_deg=longitude_deg,
        start_utc=start_utc,
        end_utc=end_utc,
        step_minutes=step_minutes,
        status="pending",
        points=[],
    )
