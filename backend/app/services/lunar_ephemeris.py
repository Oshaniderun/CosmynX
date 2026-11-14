"""Analytical lunar Sun & Earth azimuth/elevation ephemeris (offline fallback).

Uses IAU 2015 lunar pole & prime meridian orientation and Meeus solar/lunar
orbital series to compute selenographic topocentric Sun and Earth azimuth and
elevation when JPL Horizons is unreachable.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
from typing import Any

MOON_RADIUS_KM = 1737.4
AU_KM = 149597870.7


def _parse_utc(utc_str: str) -> datetime:
    dt = datetime.fromisoformat(utc_str.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _julian_date(dt: datetime) -> float:
    """Compute Julian Date (UT) from a UTC datetime."""
    dt_utc = dt.astimezone(timezone.utc)
    y, m = dt_utc.year, dt_utc.month
    day_frac = (
        dt_utc.day
        + (dt_utc.hour + (dt_utc.minute + dt_utc.second / 60.0) / 60.0) / 24.0
    )
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + (a // 4)
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + day_frac + b - 1524.5


def _rot_z(v: tuple[float, float, float], angle: float) -> tuple[float, float, float]:
    c, s = math.cos(angle), math.sin(angle)
    x, y, z = v
    return (c * x + s * y, -s * x + c * y, z)


def _rot_x(v: tuple[float, float, float], angle: float) -> tuple[float, float, float]:
    c, s = math.cos(angle), math.sin(angle)
    x, y, z = v
    return (x, c * y + s * z, -s * y + c * z)


def _sun_and_moon_j2000_km(
    d: float,
) -> tuple[tuple[float, float, float], tuple[float, float, float]]:
    """Compute geocentric Sun and Moon J2000 equatorial vectors (km)."""
    g = math.radians(357.529 + 0.98560028 * d)
    q = 280.459 + 0.98564736 * d
    lam_s = math.radians(q + 1.915 * math.sin(g) + 0.020 * math.sin(2.0 * g))
    r_s = (1.00014 - 0.01671 * math.cos(g) - 0.00014 * math.cos(2.0 * g)) * AU_KM
    eps = math.radians(23.4393 - 0.00000036 * d)
    cos_e, sin_e = math.cos(eps), math.sin(eps)

    sun_geo = (
        r_s * math.cos(lam_s),
        r_s * cos_e * math.sin(lam_s),
        r_s * sin_e * math.sin(lam_s),
    )

    l_m = 218.316 + 13.176396 * d
    m_m = math.radians(134.963 + 13.064993 * d)
    f_m = math.radians(93.272 + 13.229350 * d)
    d_m = math.radians(297.850 + 12.190749 * d)

    lam_m = math.radians(
        l_m
        + 6.289 * math.sin(m_m)
        + 1.274 * math.sin(2.0 * d_m - m_m)
        + 0.658 * math.sin(2.0 * d_m)
        + 0.214 * math.sin(2.0 * m_m)
        - 0.186 * math.sin(g)
        - 0.114 * math.sin(2.0 * f_m)
    )
    bet_m = math.radians(
        5.128 * math.sin(f_m)
        + 0.280 * math.sin(m_m + f_m)
        - 0.277 * math.sin(m_m - f_m)
        - 0.173 * math.sin(2.0 * d_m - f_m)
    )
    dist_m = (
        385001.0
        - 20905.0 * math.cos(m_m)
        - 3699.0 * math.cos(2.0 * d_m - m_m)
        - 2956.0 * math.cos(2.0 * d_m)
        - 570.0 * math.cos(2.0 * m_m)
    )

    cb = math.cos(bet_m)
    x_ec = dist_m * cb * math.cos(lam_m)
    y_ec = dist_m * cb * math.sin(lam_m)
    z_ec = dist_m * math.sin(bet_m)

    moon_geo = (
        x_ec,
        cos_e * y_ec - sin_e * z_ec,
        sin_e * y_ec + cos_e * z_ec,
    )
    return sun_geo, moon_geo


def _moon_orientation_angles(d: float) -> tuple[float, float, float]:
    """Return IAU 2015 Moon (alpha0, delta0, W) in radians."""
    t = d / 36525.0
    e1 = math.radians(125.045 - 0.0529921 * d)
    e2 = math.radians(250.089 - 0.1059842 * d)
    e3 = math.radians(260.008 + 13.0120009 * d)
    e4 = math.radians(176.625 + 13.3407154 * d)
    e5 = math.radians(357.529 + 0.9856003 * d)
    e6 = math.radians(311.589 + 26.4057084 * d)
    e7 = math.radians(134.963 + 13.0649930 * d)
    e8 = math.radians(276.617 + 0.3287146 * d)
    e9 = math.radians(34.226 + 1.7484877 * d)
    e10 = math.radians(15.134 - 0.1589763 * d)
    e11 = math.radians(119.743 + 0.0036096 * d)
    e12 = math.radians(239.961 + 0.1643573 * d)
    e13 = math.radians(25.053 + 12.9590088 * d)

    alpha0 = math.radians(
        269.9949
        + 0.0031 * t
        - 3.8787 * math.sin(e1)
        - 0.1204 * math.sin(e2)
        + 0.0700 * math.sin(e3)
        - 0.0172 * math.sin(e4)
        + 0.0072 * math.sin(e6)
        - 0.0052 * math.sin(e10)
        + 0.0043 * math.sin(e13)
    )
    delta0 = math.radians(
        66.5392
        + 0.0130 * t
        + 1.5419 * math.cos(e1)
        + 0.0239 * math.cos(e2)
        - 0.0278 * math.cos(e3)
        + 0.0068 * math.cos(e4)
        - 0.0029 * math.cos(e6)
        + 0.0009 * math.cos(e7)
        + 0.0008 * math.cos(e10)
        - 0.0009 * math.cos(e13)
    )
    w = math.radians(
        38.3213
        + 13.17635815 * d
        - 1.4e-12 * d * d
        + 3.5610 * math.sin(e1)
        + 0.1208 * math.sin(e2)
        - 0.0642 * math.sin(e3)
        + 0.0158 * math.sin(e4)
        + 0.0252 * math.sin(e5)
        - 0.0066 * math.sin(e6)
        - 0.0047 * math.sin(e7)
        - 0.0046 * math.sin(e8)
        + 0.0028 * math.sin(e9)
        + 0.0052 * math.sin(e10)
        + 0.0040 * math.sin(e11)
        + 0.0019 * math.sin(e12)
        - 0.0044 * math.sin(e13)
    )
    return alpha0, delta0, w


def _az_el_from_body_fixed(
    target_bf: tuple[float, float, float],
    lat_rad: float,
    lon_rad: float,
) -> tuple[float, float]:
    """Compute topocentric (azimuth_deg, elevation_deg) from Moon body-fixed vector."""
    sin_lat, cos_lat = math.sin(lat_rad), math.cos(lat_rad)
    sin_lon, cos_lon = math.sin(lon_rad), math.cos(lon_rad)

    obs = (
        MOON_RADIUS_KM * cos_lat * cos_lon,
        MOON_RADIUS_KM * cos_lat * sin_lon,
        MOON_RADIUS_KM * sin_lat,
    )
    rel = (target_bf[0] - obs[0], target_bf[1] - obs[1], target_bf[2] - obs[2])

    east = -sin_lon * rel[0] + cos_lon * rel[1]
    north = -sin_lat * cos_lon * rel[0] - sin_lat * sin_lon * rel[1] + cos_lat * rel[2]
    up = cos_lat * cos_lon * rel[0] + cos_lat * sin_lon * rel[1] + sin_lat * rel[2]

    norm = math.sqrt(east * east + north * north + up * up)
    if norm == 0.0:
        return (0.0, 0.0)
    az = math.degrees(math.atan2(east, north)) % 360.0
    el = math.degrees(math.asin(max(-1.0, min(1.0, up / norm))))
    return (round(az, 6), round(el, 6))


def compute_analytical_lunar_ephemeris(
    latitude_deg: float,
    longitude_deg: float,
    start_utc: str,
    end_utc: str,
    step_minutes: int = 60,
) -> list[dict[str, Any]]:
    """Compute Sun and Earth apparent azimuth/elevation series for any lunar site."""
    start_dt = _parse_utc(start_utc)
    end_dt = _parse_utc(end_utc)
    if end_dt <= start_dt or step_minutes <= 0:
        return []

    lat_rad = math.radians(latitude_deg)
    lon_rad = math.radians(longitude_deg)
    step = timedelta(minutes=step_minutes)
    points: list[dict[str, Any]] = []

    current = start_dt
    while current <= end_dt:
        jd = _julian_date(current)
        d = jd - 2451545.0
        sun_geo, moon_geo = _sun_and_moon_j2000_km(d)
        sun_sel = (
            sun_geo[0] - moon_geo[0],
            sun_geo[1] - moon_geo[1],
            sun_geo[2] - moon_geo[2],
        )
        earth_sel = (-moon_geo[0], -moon_geo[1], -moon_geo[2])

        alpha0, delta0, w = _moon_orientation_angles(d)
        sun_bf = _rot_z(
            _rot_x(_rot_z(sun_sel, math.pi / 2.0 + alpha0), math.pi / 2.0 - delta0),
            w,
        )
        earth_bf = _rot_z(
            _rot_x(_rot_z(earth_sel, math.pi / 2.0 + alpha0), math.pi / 2.0 - delta0),
            w,
        )

        sun_az, sun_el = _az_el_from_body_fixed(sun_bf, lat_rad, lon_rad)
        earth_az, earth_el = _az_el_from_body_fixed(earth_bf, lat_rad, lon_rad)

        points.append(
            {
                "timestamp_utc": current.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "sun_azimuth_deg": sun_az,
                "sun_elevation_deg": sun_el,
                "earth_azimuth_deg": earth_az,
                "earth_elevation_deg": earth_el,
            }
        )
        current += step

    return points
