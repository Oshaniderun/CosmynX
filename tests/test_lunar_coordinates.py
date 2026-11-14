"""Unit tests for Lunar South Polar Stereographic projection mathematics."""

import math
import pytest

R_MOON = 1737400.0  # meters
LAMBDA_0 = 0.0      # radians


def forward_lunar_polar(lat_deg: float, lon_deg: float) -> tuple[float, float]:
    if lat_deg <= -90.0:
        return 0.0, 0.0
    phi = math.radians(lat_deg)
    lam = math.radians(lon_deg)
    k = 2.0 / (1.0 - math.sin(phi))
    x = R_MOON * k * math.cos(phi) * math.sin(lam - LAMBDA_0)
    y = R_MOON * k * math.cos(phi) * math.cos(lam - LAMBDA_0)
    return x, y


def inverse_lunar_polar(x: float, y: float) -> tuple[float, float]:
    r = math.hypot(x, y)
    if r == 0:
        return -90.0, 0.0
    c = 2.0 * math.atan(r / (2.0 * R_MOON))
    phi = c - math.pi / 2.0
    lam = math.atan2(x, y) + LAMBDA_0
    lat_deg = math.degrees(phi)
    lon_deg = (math.degrees(lam) + 180.0) % 360.0 - 180.0
    return lat_deg, lon_deg


def test_south_pole_origin():
    """South Pole (-90.0 deg) projects precisely to (0.0, 0.0) meters."""
    x, y = forward_lunar_polar(-90.0, 0.0)
    assert x == 0.0
    assert y == 0.0
    lat, lon = inverse_lunar_polar(0.0, 0.0)
    assert lat == -90.0
    assert lon == 0.0


@pytest.mark.parametrize(
    "lat,lon,expected_dist_km",
    [
        (-87.50, -5.00, 75.8),    # Haworth (~75.8 km from pole)
        (-86.00, 0.30, 121.3),    # Malapert Massif (~121.3 km from pole)
        (-88.70, -64.00, 39.4),   # de Gerlache Rim 2 (~39.4 km from pole)
        (-85.42, 31.85, 138.9),   # Mons Mouton (~138.9 km from pole)
    ],
)
def test_forward_and_inverse_roundtrip(lat, lon, expected_dist_km):
    """Verify forward and inverse roundtrip accuracy (< 1e-4 deg) and radial distance."""
    x, y = forward_lunar_polar(lat, lon)
    dist_km = math.hypot(x, y) / 1000.0
    assert math.isclose(dist_km, expected_dist_km, abs_tol=0.2)

    rev_lat, rev_lon = inverse_lunar_polar(x, y)
    assert math.isclose(lat, rev_lat, abs_tol=1e-4)
    assert math.isclose(lon, rev_lon, abs_tol=1e-4)


def test_prime_meridian_orientation():
    """Prime Meridian (lon=0.0) points toward Earth along the positive Y-axis."""
    x, y = forward_lunar_polar(-85.0, 0.0)
    assert math.isclose(x, 0.0, abs_tol=1e-3)
    assert y > 0.0  # Along positive Y


def test_east_longitude_orientation():
    """East longitude (lon=+90.0) points along the positive X-axis."""
    x, y = forward_lunar_polar(-85.0, 90.0)
    assert x > 0.0  # Along positive X
    assert math.isclose(y, 0.0, abs_tol=1e-3)
