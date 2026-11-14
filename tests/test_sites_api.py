"""Unit and integration tests for Member 1 backend site management."""

import sys
from pathlib import Path
import pytest

# Ensure backend directory is in path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.api.sites import DEFAULT_SITES, get_sites, get_site, validate_custom_site
from app.models.schemas import CustomSiteRequest, LandingSite
from app.services.comparison import compare_scenarios
from app.models.schemas import CompareRequest, ScenarioInput
from fastapi import HTTPException


def test_default_sites_count_and_types():
    """Verify that DEFAULT_SITES contains the 9 updated NASA Artemis III candidate regions."""
    assert len(DEFAULT_SITES) == 9
    for site in DEFAULT_SITES:
        assert isinstance(site, LandingSite)
        assert site.site_id.startswith("candidate_")
        assert -90.0 <= site.latitude_deg <= -80.0
        assert -180.0 <= site.longitude_deg <= 180.0
        # Elevation is None to avoid misrepresenting a 15km x 15km region as a single flat landing point
        assert site.elevation_m is None
        assert "NASA Artemis III (Updated Oct 28, 2024)" in site.source
        assert site.coordinate_type == "approximate_region_centroid"


def test_get_sites_endpoint():
    """Verify GET /api/sites returns all candidate sites."""
    sites = get_sites()
    assert len(sites) == 9
    ids = [s.site_id for s in sites]
    assert "candidate_001" in ids
    assert "candidate_002" in ids
    assert "candidate_003" in ids
    assert "candidate_009" in ids


def test_get_site_by_id_success():
    """Verify GET /api/sites/{site_id} returns correct landing site."""
    site = get_site("candidate_001")
    assert site.site_id == "candidate_001"
    assert site.name == "Haworth"
    assert site.latitude_deg == -87.50
    assert site.longitude_deg == -5.00
    assert site.elevation_m is None


def test_get_site_by_id_not_found():
    """Verify GET /api/sites/{site_id} raises 404 for nonexistent ID."""
    with pytest.raises(HTTPException) as exc_info:
        get_site("candidate_999")
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower()


def test_validate_custom_site():
    """Verify custom site coordinate validation and 0-360 deg longitude normalization."""
    # Test 0-360 deg conversion: 224 deg -> -136 deg
    req = CustomSiteRequest(
        name="Custom Ridge Point",
        latitude_deg=-89.4,
        longitude_deg=224.0,
    )
    custom_site = validate_custom_site(req)
    assert custom_site.name == "Custom Ridge Point"
    assert custom_site.latitude_deg == -89.4
    assert custom_site.longitude_deg == -136.0
    assert custom_site.site_id.startswith("custom_")
    assert custom_site.coordinate_type == "custom_user_pin"


def test_comparison_service_compatibility():
    """Verify that Member 5 comparison service functions with the updated DEFAULT_SITES."""
    req = CompareRequest(
        scenarios=[
            ScenarioInput(
                site_id="candidate_001",
                start_utc="2026-11-20T00:00:00Z",
                end_utc="2026-11-23T00:00:00Z",
            ),
            ScenarioInput(
                site_id="candidate_003",
                start_utc="2026-11-20T00:00:00Z",
                end_utc="2026-11-23T00:00:00Z",
            ),
        ]
    )
    res = compare_scenarios(req)
    assert len(res.results) == 2
    assert res.results[0].site_id == "candidate_001"
    assert res.results[0].latitude_deg == -87.50
    assert res.results[0].longitude_deg == -5.00
    assert res.results[1].site_id == "candidate_003"
    assert res.results[1].latitude_deg == -85.30
    assert res.results[1].longitude_deg == 31.50
