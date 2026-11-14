"""Member 2 — NASA Data Integration Service.

Handles retrieving, normalizing, and caching Sun/Earth ephemeris data from
NASA JPL Horizons and lunar mapping metadata from Moon Trek / LROC QuickMap.
"""

from typing import Any


def fetch_jpl_horizons_ephemeris(
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
) -> list[dict[str, Any]]:
    """Fetch and normalize Sun/Earth ephemeris from JPL Horizons.

    TODO (Member 2): Implement real JPL Horizons API query + local caching in data/processed/.
    """
    return []
