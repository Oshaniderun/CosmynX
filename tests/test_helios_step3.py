"""Tests for Step 3: HELIOS Mission Requirement Interpretation Component."""

import pytest

from app.models.helios_models import (
    HeliosInterpretResponse,
    HeliosMissionRequirements,
    HeliosObjective,
)
from app.models.schemas import ConditionsResponse, LandingSite, VisibilityMetrics
from app.services.helios_interpreter import (
    HeliosInterpretationResult,
    interpret_mission_requirements,
)
from app.services.helios_scoring import generate_recommendation_results


class TestThresholdExtraction:
    """Tests for extracting sunlight and Earth visibility percentage thresholds."""

    def test_extract_both_thresholds(self):
        query = "I need at least 70% sunlight and 80% Earth visibility."
        res = interpret_mission_requirements(query)
        assert res.status == "success"
        assert res.extracted_min_sunlight_pct == 70.0
        assert res.extracted_min_earth_visibility_pct == 80.0
        assert "Min sunlight: 70.0%" in res.summary
        assert "Min Earth visibility: 80.0%" in res.summary

    def test_extract_sunlight_only(self):
        query = "Find sites with minimum 65% sunlight availability."
        res = interpret_mission_requirements(query)
        assert res.status == "success"
        assert res.extracted_min_sunlight_pct == 65.0
        assert res.extracted_min_earth_visibility_pct is None  # Unspecified, not zero
        assert any("Earth visibility unspecified" in n for n in res.interpretation_notes)

    def test_extract_earth_visibility_only(self):
        query = "Require at least 85% communication visibility."
        res = interpret_mission_requirements(query)
        assert res.status == "success"
        assert res.extracted_min_earth_visibility_pct == 85.0
        assert res.extracted_min_sunlight_pct is None  # Unspecified, not zero

    def test_explicit_zero_sunlight_distinct_from_unspecified(self):
        """Explicit zero (0.0) must be distinguished from unspecified (None)."""
        query_zero = "I need 0% sunlight and 80% Earth visibility."
        res_zero = interpret_mission_requirements(query_zero)
        assert res_zero.extracted_min_sunlight_pct == 0.0

        query_no_min = "No minimum sunlight requirement and at least 75% Earth visibility."
        res_no_min = interpret_mission_requirements(query_no_min)
        assert res_no_min.extracted_min_sunlight_pct == 0.0

        query_unspecified = "Require at least 80% Earth visibility."
        res_unspec = interpret_mission_requirements(query_unspecified)
        assert res_unspec.extracted_min_sunlight_pct is None


class TestObjectiveExtraction:
    """Tests for classifying mission optimization objectives."""

    def test_maximize_sunlight_phrasings(self):
        examples = [
            "Prioritize solar illumination over communication visibility.",
            "Solar illumination is my top priority.",
            "Maximize sunlight for the lunar mission.",
            "Focus on solar power and sunlight.",
        ]
        for query in examples:
            res = interpret_mission_requirements(query)
            assert res.extracted_objective == HeliosObjective.MAXIMIZE_SUNLIGHT, f"Failed on: {query}"

    def test_maximize_earth_visibility_phrasings(self):
        examples = [
            "Earth visibility is my main priority.",
            "Prioritize Earth visibility over solar illumination.",
            "Maximize communication line of sight.",
            "Focus on communication visibility.",
        ]
        for query in examples:
            res = interpret_mission_requirements(query)
            assert res.extracted_objective == HeliosObjective.MAXIMIZE_EARTH_VISIBILITY, f"Failed on: {query}"

    def test_balanced_phrasings(self):
        examples = [
            "Give equal importance to sunlight and Earth visibility.",
            "I need a balanced landing site.",
            "Balance sunlight and Earth visibility equally.",
            "Equal weight between solar and communication.",
        ]
        for query in examples:
            res = interpret_mission_requirements(query)
            assert res.extracted_objective == HeliosObjective.BALANCED, f"Failed on: {query}"


class TestDurationExtraction:
    """Tests for extracting mission duration in hours and days."""

    def test_duration_in_hours(self):
        query = "A 72-hour mission with 70% sunlight."
        res = interpret_mission_requirements(query)
        assert res.extracted_duration_hours == 72

    def test_duration_in_days(self):
        query = "I need a landing site for a 3-day mission with 80% Earth visibility."
        res = interpret_mission_requirements(query)
        assert res.extracted_duration_hours == 72

    def test_duration_in_weeks(self):
        query = "Plan for a 1-week mission."
        res = interpret_mission_requirements(query)
        assert res.extracted_duration_hours == 168


class TestComplexPhrasing:
    """Tests complex inputs combining multiple parameters."""

    def test_all_parameters_together(self):
        query = "I need a balanced landing site for a 72-hour mission with at least 65% sunlight and 80% Earth visibility."
        res = interpret_mission_requirements(query)
        assert res.status == "success"
        assert res.extracted_objective == HeliosObjective.BALANCED
        assert res.extracted_duration_hours == 72
        assert res.extracted_min_sunlight_pct == 65.0
        assert res.extracted_min_earth_visibility_pct == 80.0
        assert "Objective: balanced" in res.summary
        assert "Min sunlight: 65.0%" in res.summary
        assert "Min Earth visibility: 80.0%" in res.summary
        assert "Duration: 72h" in res.summary

    def test_with_explicit_start_date(self):
        query = "Mission starting 2026-11-20 for 48 hours prioritizing solar power."
        res = interpret_mission_requirements(query)
        assert res.status == "success"
        assert res.extracted_start_utc == "2026-11-20T00:00:00Z"
        assert res.extracted_duration_hours == 48
        assert res.extracted_objective == HeliosObjective.MAXIMIZE_SUNLIGHT


class TestValidationAndAmbiguityHandling:
    """Tests for error detection, bounds validation, and conflicting inputs."""

    def test_invalid_percentage_over_100(self):
        query = "I need at least 120% sunlight and 80% Earth visibility."
        res = interpret_mission_requirements(query)
        assert res.status == "invalid"
        assert any("must be between 0.0 and 100.0%" in err for err in res.errors)

    def test_invalid_negative_percentage(self):
        query = "Require -10% Earth visibility."
        res = interpret_mission_requirements(query)
        assert res.status == "invalid"
        assert any("must be between 0.0 and 100.0%" in err for err in res.errors)

    def test_invalid_negative_or_zero_duration(self):
        query_neg = "Plan for -24 hours."
        res_neg = interpret_mission_requirements(query_neg)
        assert res_neg.status == "invalid"
        assert any("must be positive (> 0 hours)" in err for err in res_neg.errors)

        query_zero = "Plan for 0 days."
        res_zero = interpret_mission_requirements(query_zero)
        assert res_zero.status == "invalid"
        assert any("must be positive (> 0 days)" in err for err in res_zero.errors)

    def test_contradictory_objectives(self):
        query = "Prioritize solar illumination over communication, but Earth visibility is my main priority."
        res = interpret_mission_requirements(query)
        assert res.status == "ambiguous"
        assert res.extracted_objective is None
        assert any("Contradictory objectives detected" in err for err in res.errors)
        assert any("Please resolve conflicting priorities" in q for q in res.clarification_questions)

    def test_contradictory_thresholds(self):
        query = "I need at least 60% sunlight and at least 80% sunlight."
        res = interpret_mission_requirements(query)
        assert res.status == "ambiguous"
        assert any("Contradictory sunlight thresholds detected" in err for err in res.errors)

    def test_empty_and_whitespace_input(self):
        res_empty = interpret_mission_requirements("")
        assert res_empty.status == "no_requirements"
        assert "No requirements provided" in res_empty.summary

        res_ws = interpret_mission_requirements("   \n\t  ")
        assert res_ws.status == "no_requirements"
        assert "No requirements provided" in res_ws.summary

    def test_unsupported_requirements_detection(self):
        """Keywords for slope, boulders, water ice, thermal, etc. are flagged."""
        query = "I need at least 70% sunlight, slope less than 5 degrees, and water ice presence."
        res = interpret_mission_requirements(query)
        assert res.status == "partial"
        assert res.extracted_min_sunlight_pct == 70.0
        assert len(res.unsupported_requirements) >= 2
        assert any("Terrain slope" in u for u in res.unsupported_requirements)
        assert any("Water ice" in u for u in res.unsupported_requirements)


class TestIntegrationContracts:
    """Tests compatibility with existing Step 1 and Step 2 data models."""

    def test_to_interpret_response_model(self):
        query = "I need 75% sunlight and 80% Earth visibility."
        res = interpret_mission_requirements(query)
        response_model = res.to_interpret_response()

        assert isinstance(response_model, HeliosInterpretResponse)
        assert response_model.query == query
        assert response_model.interpreted is True
        assert response_model.extracted_min_sunlight_pct == 75.0
        assert response_model.extracted_min_earth_visibility_pct == 80.0

    def test_to_mission_requirements_model(self):
        query = "Prioritize solar power for a 48-hour mission with at least 85% sunlight."
        res = interpret_mission_requirements(query)
        mission_req = res.to_mission_requirements()

        assert isinstance(mission_req, HeliosMissionRequirements)
        assert mission_req.objective == HeliosObjective.MAXIMIZE_SUNLIGHT
        assert mission_req.mission_duration_hours == 48
        assert mission_req.minimum_sunlight_pct == 85.0
        assert mission_req.minimum_earth_visibility_pct == 80.0  # Default applied safely
        assert mission_req.start_utc == "2026-11-20T00:00:00Z"

    def test_feed_interpreted_requirements_into_step2_scoring(self):
        """End-to-end integration: user text -> interpreter -> Step 2 recommendation report."""
        query = "Find a balanced landing site for a 72-hour mission with at least 80% sunlight and 80% Earth visibility."
        interp = interpret_mission_requirements(query)
        req = interp.to_mission_requirements()

        # Provide candidate sites and synthetic conditions
        sites = [
            LandingSite(site_id="candidate_001", name="Shackleton", latitude_deg=-89.54, longitude_deg=0.0),
            LandingSite(site_id="candidate_002", name="Connecting Ridge", latitude_deg=-89.45, longitude_deg=-137.0),
        ]
        conditions = {
            "candidate_001": ConditionsResponse(
                site_id="candidate_001",
                latitude_deg=-89.54,
                longitude_deg=0.0,
                start_utc=req.start_utc,
                end_utc="2026-11-23T00:00:00Z",
                metrics=VisibilityMetrics(sunlit_fraction=0.90, earth_visible_fraction=0.85),
                horizon_model="synthetic",
                status="ok",
                source="SYNTHETIC TEST FIXTURE — NOT NASA DATA",
            ),
            "candidate_002": ConditionsResponse(
                site_id="candidate_002",
                latitude_deg=-89.45,
                longitude_deg=-137.0,
                start_utc=req.start_utc,
                end_utc="2026-11-23T00:00:00Z",
                metrics=VisibilityMetrics(sunlit_fraction=0.70, earth_visible_fraction=0.85),  # Fails 80% sun
                horizon_model="synthetic",
                status="ok",
                source="SYNTHETIC TEST FIXTURE — NOT NASA DATA",
            ),
        }

        # Step 2 scoring engine consumes the requirement directly
        report = generate_recommendation_results(sites, conditions, req)
        assert report.status == "ok"
        assert len(report.eligible) == 1
        assert report.eligible[0].site_id == "candidate_001"
        assert report.eligible[0].rank == 1
        assert len(report.disqualified) == 1
        assert report.disqualified[0].site_id == "candidate_002"
