"""Tests for Step 1: HELIOS Backend Data Models & Safe Scientific Data Consumer."""

import pytest
from unittest.mock import patch

from app.api.sites import DEFAULT_SITES
from app.models.helios_models import (
    ConstraintEvaluationResult,
    EnrichedHeliosRecommendation,
    HeliosMissionRequirements,
    HeliosObjective,
    ScoreBreakdown,
    ScientificProvenance,
)
from app.models.schemas import (
    ConditionsResponse,
    HeliosRecommendRequest,
    LandingSite,
    VisibilityMetrics,
)
from app.services.helios_data_consumer import (
    build_scientific_provenance,
    compute_mission_window,
    evaluate_all_candidate_sites,
    fetch_site_scientific_conditions,
    get_candidate_landing_sites,
    normalize_utc_timestamp,
)


class TestCandidateSiteRetrieval:
    """Tests candidate-site retrieval from the sites module."""

    def test_get_candidate_landing_sites(self):
        sites = get_candidate_landing_sites()
        assert len(sites) == len(DEFAULT_SITES)
        site_ids = [s.site_id for s in sites]
        assert "candidate_001" in site_ids
        assert "candidate_002" in site_ids
        assert "candidate_003" in site_ids

        # Ensure returned objects are LandingSite instances with valid coordinates
        for site in sites:
            assert isinstance(site, LandingSite)
            assert -90.0 <= site.latitude_deg <= 90.0
            assert -180.0 <= site.longitude_deg <= 180.0


class TestMissionTimeWindow:
    """Tests mission end-time calculation and UTC timestamp normalization."""

    def test_compute_mission_window_72h(self):
        start = "2026-11-20T00:00:00Z"
        duration = 72
        norm_start, norm_end = compute_mission_window(start, duration)
        assert norm_start == "2026-11-20T00:00:00Z"
        assert norm_end == "2026-11-23T00:00:00Z"

    def test_compute_mission_window_with_offset(self):
        start = "2026-11-20T05:30:00+05:30"
        duration = 24
        norm_start, norm_end = compute_mission_window(start, duration)
        assert norm_start == "2026-11-20T00:00:00Z"
        assert norm_end == "2026-11-21T00:00:00Z"

    def test_compute_mission_window_invalid_duration(self):
        with pytest.raises(ValueError, match="duration_hours must be >= 1"):
            compute_mission_window("2026-11-20T00:00:00Z", 0)

    def test_compute_mission_window_invalid_timestamp(self):
        with pytest.raises(ValueError, match="Invalid ISO 8601 timestamp"):
            compute_mission_window("not-a-valid-date", 72)

    def test_normalize_utc_timestamp_missing_timezone(self):
        with pytest.raises(ValueError, match="must include timezone"):
            normalize_utc_timestamp("2026-11-20 00:00:00")


class TestScientificDataConsumer:
    """Tests safe interaction with analyze_site_conditions() under various states."""

    @pytest.fixture
    def test_site(self) -> LandingSite:
        return LandingSite(
            site_id="candidate_001",
            name="Shackleton Crater Rim",
            region="Lunar South Pole",
            latitude_deg=-89.54,
            longitude_deg=0.0,
        )

    def test_successful_scientific_service_response(self, test_site):
        mock_response = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            step_minutes=60,
            metrics=VisibilityMetrics(
                sunlit_fraction=0.9167,
                earth_visible_fraction=0.8056,
                sunlit_hours=66.0,
                earth_visible_hours=58.0,
            ),
            horizon_model="geometric",
            status="ok",
            source="JPL Horizons",
        )

        with patch(
            "app.services.helios_data_consumer.analyze_site_conditions",
            return_value=mock_response,
        ) as mock_analyze:
            result = fetch_site_scientific_conditions(
                site=test_site,
                start_utc="2026-11-20T00:00:00Z",
                duration_hours=72,
            )

            mock_analyze.assert_called_once_with(
                site_id="candidate_001",
                latitude_deg=-89.54,
                longitude_deg=0.0,
                start_utc="2026-11-20T00:00:00Z",
                end_utc="2026-11-23T00:00:00Z",
                step_minutes=60,
            )
            assert result.status == "ok"
            assert result.source == "JPL Horizons"
            assert result.metrics.sunlit_fraction == 0.9167
            assert result.metrics.earth_visible_fraction == 0.8056

    def test_missing_sunlight_measurement_preserved_as_none(self, test_site):
        """Never replaces missing sunlight fraction with 0.0."""
        mock_response = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(
                sunlit_fraction=None,
                earth_visible_fraction=0.8056,
                sunlit_hours=None,
                earth_visible_hours=58.0,
            ),
            status="ok",
            source="JPL Horizons",
        )

        with patch(
            "app.services.helios_data_consumer.analyze_site_conditions",
            return_value=mock_response,
        ):
            result = fetch_site_scientific_conditions(
                site=test_site,
                start_utc="2026-11-20T00:00:00Z",
                duration_hours=72,
            )
            # CRITICAL RULE: None must remain None, never coerced to 0.0
            assert result.metrics.sunlit_fraction is None
            assert result.metrics.sunlit_hours is None
            assert result.metrics.earth_visible_fraction == 0.8056

    def test_missing_earth_visibility_measurement_preserved_as_none(self, test_site):
        """Never replaces missing Earth visibility fraction with 0.0."""
        mock_response = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(
                sunlit_fraction=0.9167,
                earth_visible_fraction=None,
                sunlit_hours=66.0,
                earth_visible_hours=None,
            ),
            status="ok",
            source="JPL Horizons",
        )

        with patch(
            "app.services.helios_data_consumer.analyze_site_conditions",
            return_value=mock_response,
        ):
            result = fetch_site_scientific_conditions(
                site=test_site,
                start_utc="2026-11-20T00:00:00Z",
                duration_hours=72,
            )
            assert result.metrics.sunlit_fraction == 0.9167
            assert result.metrics.earth_visible_fraction is None
            assert result.metrics.earth_visible_hours is None

    def test_unavailable_scientific_service_response(self, test_site):
        mock_response = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(),
            status="unavailable",
            source="JPL Horizons",
        )

        with patch(
            "app.services.helios_data_consumer.analyze_site_conditions",
            return_value=mock_response,
        ):
            result = fetch_site_scientific_conditions(
                site=test_site,
                start_utc="2026-11-20T00:00:00Z",
                duration_hours=72,
            )
            assert result.status == "unavailable"
            assert result.metrics.sunlit_fraction is None
            assert result.metrics.earth_visible_fraction is None

    def test_exception_handling_from_scientific_service(self, test_site):
        """Service exception must be caught safely and return unavailable without crashing."""
        with patch(
            "app.services.helios_data_consumer.analyze_site_conditions",
            side_effect=RuntimeError("Upstream JPL Horizons connection timed out"),
        ):
            result = fetch_site_scientific_conditions(
                site=test_site,
                start_utc="2026-11-20T00:00:00Z",
                duration_hours=72,
            )
            assert result.status == "unavailable"
            assert result.site_id == "candidate_001"
            assert result.metrics.sunlit_fraction is None
            assert "Service Error" in result.source

    def test_evaluate_all_candidate_sites(self):
        sites = [
            LandingSite(site_id="candidate_001", name="Site 1", latitude_deg=-89.0, longitude_deg=0.0),
            LandingSite(site_id="candidate_002", name="Site 2", latitude_deg=-88.0, longitude_deg=10.0),
        ]
        mock_response = ConditionsResponse(
            site_id="mock",
            latitude_deg=-89.0,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(sunlit_fraction=0.8, earth_visible_fraction=0.7),
            status="ok",
        )
        with patch(
            "app.services.helios_data_consumer.analyze_site_conditions",
            return_value=mock_response,
        ):
            results = evaluate_all_candidate_sites(
                sites=sites,
                start_utc="2026-11-20T00:00:00Z",
                duration_hours=72,
            )
            assert len(results) == 2
            assert "candidate_001" in results
            assert "candidate_002" in results


class TestScientificProvenance:
    """Tests preservation of provenance metadata and warnings."""

    def test_provenance_preservation_ok(self):
        site = LandingSite(site_id="candidate_001", name="Shackleton", latitude_deg=-89.54, longitude_deg=0.0)
        conditions = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(sunlit_fraction=0.9, earth_visible_fraction=0.8),
            status="ok",
            source="JPL Horizons",
            horizon_model="geometric",
        )
        prov = build_scientific_provenance(site, conditions, duration_hours=72.0)
        assert prov.site_id == "candidate_001"
        assert prov.source == "JPL Horizons"
        assert prov.horizon_model == "geometric"
        assert prov.status == "ok"
        assert prov.is_synthetic is False
        assert any("Geometric horizon model" in w for w in prov.warnings)

    def test_provenance_flags_synthetic_fixture(self):
        site = LandingSite(site_id="candidate_001", name="Shackleton", latitude_deg=-89.54, longitude_deg=0.0)
        conditions = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(sunlit_fraction=0.5, earth_visible_fraction=0.5),
            status="ok",
            source="Synthetic comparison fixture — NOT NASA measurements",
            horizon_model="synthetic",
        )
        prov = build_scientific_provenance(site, conditions, duration_hours=72.0)
        assert prov.is_synthetic is True
        assert any("SYNTHETIC TEST FIXTURE" in w for w in prov.warnings)

    def test_provenance_missing_measurements_warning(self):
        site = LandingSite(site_id="candidate_001", name="Shackleton", latitude_deg=-89.54, longitude_deg=0.0)
        conditions = ConditionsResponse(
            site_id="candidate_001",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            metrics=VisibilityMetrics(),
            status="unavailable",
            source="JPL Horizons",
        )
        prov = build_scientific_provenance(site, conditions, duration_hours=72.0)
        assert prov.status == "unavailable"
        assert any("Sunlight fraction measurement is missing" in w for w in prov.warnings)
        assert any("Earth visibility fraction measurement is missing" in w for w in prov.warnings)


class TestHeliosModelsSerialization:
    """Tests Pydantic validation and JSON serialization of HELIOS models."""

    def test_helios_mission_requirements_valid(self):
        req = HeliosMissionRequirements(
            objective=HeliosObjective.BALANCED,
            minimum_earth_visibility_pct=75.0,
            minimum_sunlight_pct=50.0,
            mission_duration_hours=48,
            start_utc="2026-11-20T00:00:00Z",
        )
        data = req.model_dump()
        assert data["objective"] == "balanced"
        assert data["minimum_earth_visibility_pct"] == 75.0
        assert data["minimum_sunlight_pct"] == 50.0
        assert data["mission_duration_hours"] == 48

        # Test JSON round-trip
        json_str = req.model_dump_json()
        assert "balanced" in json_str
        parsed = HeliosMissionRequirements.model_validate_json(json_str)
        assert parsed.objective == HeliosObjective.BALANCED

    def test_helios_mission_requirements_from_shared_request(self):
        shared_req = HeliosRecommendRequest(
            objective="maximize_earth_visibility",
            minimum_earth_visibility_pct=85.0,
            minimum_sunlight_pct=20.0,
            mission_duration_hours=72,
            start_utc="2026-11-20T12:00:00Z",
            query="find site with good comms",
        )
        req = HeliosMissionRequirements.from_recommend_request(shared_req)
        assert req.objective == HeliosObjective.MAXIMIZE_EARTH_VISIBILITY
        assert req.minimum_earth_visibility_pct == 85.0
        assert req.start_utc == "2026-11-20T12:00:00Z"
        assert req.query == "find site with good comms"

    def test_score_breakdown_and_enriched_recommendation(self):
        breakdown = ScoreBreakdown(
            sunlight_weight=0.75,
            earth_visibility_weight=0.25,
            weighted_sunlight_score=68.75,
            weighted_earth_score=20.14,
            composite_score=88.89,
            formula_description="Score = (0.75 * 0.9167 + 0.25 * 0.8056) * 100",
        )
        constraints = ConstraintEvaluationResult(
            passed_earth_visibility=True,
            passed_sunlight=True,
            has_complete_data=True,
            passed_all=True,
        )
        provenance = ScientificProvenance(
            site_id="candidate_001",
            source="JPL Horizons",
            horizon_model="geometric",
            status="ok",
            start_utc="2026-11-20T00:00:00Z",
            end_utc="2026-11-23T00:00:00Z",
            duration_hours=72.0,
        )
        rec = EnrichedHeliosRecommendation(
            rank=1,
            site_id="candidate_001",
            site_name="Shackleton Crater Rim",
            latitude_deg=-89.54,
            longitude_deg=0.0,
            score=88.9,
            metrics=VisibilityMetrics(sunlit_fraction=0.9167, earth_visible_fraction=0.8056),
            provenance=provenance,
            constraints=constraints,
            score_breakdown=breakdown,
            explanation="Ranked #1 with score 88.9",
            tradeoffs=["High sunlight", "Terrain blocking risk"],
        )

        shared = rec.to_shared_recommendation()
        assert shared.rank == 1
        assert shared.site_id == "candidate_001"
        assert shared.score == 88.9
        assert len(shared.tradeoffs) == 2
