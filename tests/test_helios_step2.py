"""Tests for Step 2: HELIOS Constraint Filtering and Explainable Scoring Engine.

All synthetic test measurements are explicitly labelled as synthetic fixtures
and never represented as NASA data.
"""

import pytest

from app.models.helios_models import (
    HeliosMissionRequirements,
    HeliosObjective,
)
from app.models.schemas import (
    ConditionsResponse,
    LandingSite,
    VisibilityMetrics,
)
from app.services.helios_scoring import (
    OBJECTIVE_WEIGHTS,
    calculate_composite_score,
    filter_mandatory_constraints,
    generate_recommendation_results,
    generate_scientific_explanation,
    rank_eligible_candidates,
)

SYNTHETIC_FIXTURE_LABEL = "SYNTHETIC TEST FIXTURE — NOT NASA DATA"


def make_synthetic_conditions(
    site_id: str,
    sunlit_fraction: float | None = 0.9,
    earth_visible_fraction: float | None = 0.8,
    sunlit_hours: float | None = 64.8,
    earth_visible_hours: float | None = 57.6,
    status: str = "ok",
) -> ConditionsResponse:
    """Helper to construct explicitly synthetic test conditions."""
    return ConditionsResponse(
        site_id=site_id,
        latitude_deg=-89.0,
        longitude_deg=0.0,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-23T00:00:00Z",
        metrics=VisibilityMetrics(
            sunlit_fraction=sunlit_fraction,
            earth_visible_fraction=earth_visible_fraction,
            sunlit_hours=sunlit_hours,
            earth_visible_hours=earth_visible_hours,
        ),
        horizon_model="synthetic",
        status=status,
        source=SYNTHETIC_FIXTURE_LABEL,
    )


class TestObjectiveWeightsAndCompositeScoring:
    """Tests for Part 2: Objective weights and score calculations."""

    def test_objective_weights_values(self):
        assert OBJECTIVE_WEIGHTS[HeliosObjective.MAXIMIZE_SUNLIGHT] == (0.75, 0.25)
        assert OBJECTIVE_WEIGHTS[HeliosObjective.MAXIMIZE_EARTH_VISIBILITY] == (0.25, 0.75)
        assert OBJECTIVE_WEIGHTS[HeliosObjective.BALANCED] == (0.50, 0.50)

    def test_calculate_composite_score_maximize_sunlight(self):
        # sun = 0.80, earth = 0.60
        # Score = (0.75 * 0.80 + 0.25 * 0.60) * 100 = (0.60 + 0.15) * 100 = 75.0
        metrics = VisibilityMetrics(sunlit_fraction=0.80, earth_visible_fraction=0.60)
        raw_score, displayed_score, breakdown = calculate_composite_score(
            metrics, HeliosObjective.MAXIMIZE_SUNLIGHT
        )
        assert raw_score == pytest.approx(75.0, abs=1e-5)
        assert displayed_score == 75.0
        assert breakdown.sunlight_weight == 0.75
        assert breakdown.earth_visibility_weight == 0.25
        assert breakdown.weighted_sunlight_score == 60.0
        assert breakdown.weighted_earth_score == 15.0
        assert breakdown.composite_score == 75.0

    def test_calculate_composite_score_maximize_earth_visibility(self):
        # sun = 0.80, earth = 0.60
        # Score = (0.25 * 0.80 + 0.75 * 0.60) * 100 = (0.20 + 0.45) * 100 = 65.0
        metrics = VisibilityMetrics(sunlit_fraction=0.80, earth_visible_fraction=0.60)
        raw_score, displayed_score, breakdown = calculate_composite_score(
            metrics, HeliosObjective.MAXIMIZE_EARTH_VISIBILITY
        )
        assert raw_score == pytest.approx(65.0, abs=1e-5)
        assert displayed_score == 65.0
        assert breakdown.weighted_sunlight_score == 20.0
        assert breakdown.weighted_earth_score == 45.0

    def test_calculate_composite_score_balanced(self):
        # sun = 0.90, earth = 0.70
        # Score = (0.50 * 0.90 + 0.50 * 0.70) * 100 = (0.45 + 0.35) * 100 = 80.0
        metrics = VisibilityMetrics(sunlit_fraction=0.90, earth_visible_fraction=0.70)
        raw_score, displayed_score, breakdown = calculate_composite_score(
            metrics, HeliosObjective.BALANCED
        )
        assert raw_score == pytest.approx(80.0, abs=1e-5)
        assert displayed_score == 80.0
        assert breakdown.weighted_sunlight_score == 45.0
        assert breakdown.weighted_earth_score == 35.0

    def test_calculate_composite_score_string_objective(self):
        metrics = VisibilityMetrics(sunlit_fraction=1.0, earth_visible_fraction=1.0)
        raw, disp, _ = calculate_composite_score(metrics, "maximize_sunlight")
        assert raw == 100.0
        assert disp == 100.0

    def test_calculate_composite_score_missing_measurements_raises(self):
        metrics_no_sun = VisibilityMetrics(sunlit_fraction=None, earth_visible_fraction=0.8)
        with pytest.raises(ValueError, match="both sunlight and Earth visibility fractions must be non-null"):
            calculate_composite_score(metrics_no_sun)

        metrics_no_earth = VisibilityMetrics(sunlit_fraction=0.8, earth_visible_fraction=None)
        with pytest.raises(ValueError, match="both sunlight and Earth visibility fractions must be non-null"):
            calculate_composite_score(metrics_no_earth)

    def test_calculate_composite_score_invalid_fractions_raises(self):
        # When constructed via model_construct, our service-level validation verifies bounds
        with pytest.raises(ValueError, match="sunlit_fraction must be in"):
            calculate_composite_score(VisibilityMetrics.model_construct(sunlit_fraction=1.5, earth_visible_fraction=0.5))

        with pytest.raises(ValueError, match="earth_visible_fraction must be in"):
            calculate_composite_score(VisibilityMetrics.model_construct(sunlit_fraction=0.5, earth_visible_fraction=-0.1))

        # Also verify Pydantic's schema-level validation prevents invalid fraction construction
        with pytest.raises(ValueError, match="less than or equal to 1"):
            VisibilityMetrics(sunlit_fraction=1.5, earth_visible_fraction=0.5)

    def test_calculate_composite_score_invalid_objective_raises(self):
        with pytest.raises(ValueError, match="Unknown objective"):
            calculate_composite_score(
                VisibilityMetrics(sunlit_fraction=0.5, earth_visible_fraction=0.5),
                "invalid_objective",
            )


class TestMandatoryConstraintFiltering:
    """Tests for Part 1: Mandatory constraint filtering and edge cases."""

    def test_exact_threshold_equality_passes(self):
        """A candidate exactly meeting the threshold must pass (e.g. 80.0% == 80.0%)."""
        metrics = VisibilityMetrics(sunlit_fraction=0.50, earth_visible_fraction=0.80)
        res = filter_mandatory_constraints(
            metrics, min_sunlight_pct=50.0, min_earth_visibility_pct=80.0
        )
        assert res.passed_sunlight is True
        assert res.passed_earth_visibility is True
        assert res.has_complete_data is True
        assert res.passed_all is True
        assert len(res.violations) == 0

    def test_single_constraint_failure_earth(self):
        # Earth 75% fails min 80%
        metrics = VisibilityMetrics(sunlit_fraction=0.90, earth_visible_fraction=0.75)
        res = filter_mandatory_constraints(
            metrics, min_sunlight_pct=50.0, min_earth_visibility_pct=80.0
        )
        assert res.passed_sunlight is True
        assert res.passed_earth_visibility is False
        assert res.passed_all is False
        assert len(res.violations) == 1
        assert "Earth visibility (75.0%) is below required minimum" in res.violations[0]

    def test_single_constraint_failure_sunlight(self):
        # Sunlight 40% fails min 50%
        metrics = VisibilityMetrics(sunlit_fraction=0.40, earth_visible_fraction=0.85)
        res = filter_mandatory_constraints(
            metrics, min_sunlight_pct=50.0, min_earth_visibility_pct=80.0
        )
        assert res.passed_sunlight is False
        assert res.passed_earth_visibility is True
        assert res.passed_all is False
        assert len(res.violations) == 1
        assert "Sunlight availability (40.0%) is below required minimum" in res.violations[0]

    def test_multiple_constraint_failures(self):
        metrics = VisibilityMetrics(sunlit_fraction=0.30, earth_visible_fraction=0.50)
        res = filter_mandatory_constraints(
            metrics, min_sunlight_pct=60.0, min_earth_visibility_pct=70.0
        )
        assert res.passed_sunlight is False
        assert res.passed_earth_visibility is False
        assert res.passed_all is False
        assert len(res.violations) == 2

    def test_missing_sunlight_measurement_fails_complete_data(self):
        """Missing measurement (None) is never coerced to 0.0, but fails complete_data."""
        metrics = VisibilityMetrics(sunlit_fraction=None, earth_visible_fraction=0.85)
        res = filter_mandatory_constraints(
            metrics, min_sunlight_pct=0.0, min_earth_visibility_pct=80.0
        )
        assert res.has_complete_data is False
        assert res.passed_all is False
        assert any("Sunlight availability measurement is unavailable" in v for v in res.violations)

    def test_missing_earth_measurement_fails_complete_data(self):
        metrics = VisibilityMetrics(sunlit_fraction=0.90, earth_visible_fraction=None)
        res = filter_mandatory_constraints(
            metrics, min_sunlight_pct=50.0, min_earth_visibility_pct=0.0
        )
        assert res.has_complete_data is False
        assert res.passed_all is False
        assert any("Earth visibility measurement is unavailable" in v for v in res.violations)

    def test_invalid_fraction_ranges_raises(self):
        # When constructed via model_construct, filter_mandatory_constraints verifies bounds
        with pytest.raises(ValueError, match="sunlit_fraction must be in"):
            filter_mandatory_constraints(VisibilityMetrics.model_construct(sunlit_fraction=1.2, earth_visible_fraction=0.5))

        with pytest.raises(ValueError, match="earth_visible_fraction must be in"):
            filter_mandatory_constraints(VisibilityMetrics.model_construct(sunlit_fraction=0.5, earth_visible_fraction=-0.5))

        # Schema-level validation prevents invalid fraction construction
        with pytest.raises(ValueError, match="less than or equal to 1"):
            VisibilityMetrics(sunlit_fraction=1.2, earth_visible_fraction=0.5)

    def test_invalid_threshold_ranges_raises(self):
        metrics = VisibilityMetrics(sunlit_fraction=0.5, earth_visible_fraction=0.5)
        with pytest.raises(ValueError, match="min_sunlight_pct must be in"):
            filter_mandatory_constraints(metrics, min_sunlight_pct=105.0)

        with pytest.raises(ValueError, match="min_earth_visibility_pct must be in"):
            filter_mandatory_constraints(metrics, min_earth_visibility_pct=-5.0)


class TestCandidateRankingAndTieBreaking:
    """Tests for Part 3: Candidate ranking, full precision sorting, and tie-breaking."""

    def test_ranking_sorts_by_score_descending(self):
        site_a = LandingSite(site_id="s1", name="Alpha", latitude_deg=-89.0, longitude_deg=0.0)
        site_b = LandingSite(site_id="s2", name="Beta", latitude_deg=-89.0, longitude_deg=10.0)

        records = [
            {
                "site": site_a,
                "metrics": VisibilityMetrics(sunlit_fraction=0.70, earth_visible_fraction=0.70),
                "raw_score": 70.0,
            },
            {
                "site": site_b,
                "metrics": VisibilityMetrics(sunlit_fraction=0.90, earth_visible_fraction=0.90),
                "raw_score": 90.0,
            },
        ]
        ranked = rank_eligible_candidates(records)
        assert ranked[0]["site"].site_id == "s2"
        assert ranked[0]["rank"] == 1
        assert ranked[1]["site"].site_id == "s1"
        assert ranked[1]["rank"] == 2

    def test_tie_breaking_higher_sunlight_wins(self):
        """When scores are equal, candidate with higher sunlight fraction ranks first."""
        # Objective balanced (50/50):
        # Candidate 1: sun=0.90, earth=0.70 -> Score = 80.0
        # Candidate 2: sun=0.70, earth=0.90 -> Score = 80.0
        site_sun = LandingSite(site_id="s_sun", name="Sun Favored", latitude_deg=-89.0, longitude_deg=0.0)
        site_earth = LandingSite(site_id="s_earth", name="Earth Favored", latitude_deg=-89.0, longitude_deg=10.0)

        records = [
            {
                "site": site_earth,
                "metrics": VisibilityMetrics(sunlit_fraction=0.70, earth_visible_fraction=0.90),
                "raw_score": 80.0,
            },
            {
                "site": site_sun,
                "metrics": VisibilityMetrics(sunlit_fraction=0.90, earth_visible_fraction=0.70),
                "raw_score": 80.0,
            },
        ]
        ranked = rank_eligible_candidates(records)
        assert ranked[0]["site"].site_id == "s_sun"  # Higher sunlight wins tie-break
        assert ranked[0]["rank"] == 1
        assert ranked[1]["site"].site_id == "s_earth"
        assert ranked[1]["rank"] == 2

    def test_tie_breaking_higher_earth_visibility_wins(self):
        """When score and sunlight are equal, higher Earth visibility wins."""
        # Hypothetical scenario where sunlight fractions match and Earth fraction is evaluated
        site_1 = LandingSite(site_id="s1", name="Site One", latitude_deg=-89.0, longitude_deg=0.0)
        site_2 = LandingSite(site_id="s2", name="Site Two", latitude_deg=-89.0, longitude_deg=10.0)

        records = [
            {
                "site": site_1,
                "metrics": VisibilityMetrics(sunlit_fraction=0.80, earth_visible_fraction=0.85),
                "raw_score": 81.25,
            },
            {
                "site": site_2,
                "metrics": VisibilityMetrics(sunlit_fraction=0.80, earth_visible_fraction=0.80),
                "raw_score": 81.25,
            },
        ]
        ranked = rank_eligible_candidates(records)
        assert ranked[0]["site"].site_id == "s1"
        assert ranked[0]["rank"] == 1
        assert ranked[1]["site"].site_id == "s2"
        assert ranked[1]["rank"] == 2

    def test_tie_breaking_alphabetical_site_name(self):
        """When scores and metrics are identical, sort alphabetically by site name."""
        site_z = LandingSite(site_id="sz", name="Zulu Ridge", latitude_deg=-89.0, longitude_deg=0.0)
        site_a = LandingSite(site_id="sa", name="Alpha Peak", latitude_deg=-89.0, longitude_deg=10.0)

        records = [
            {
                "site": site_z,
                "metrics": VisibilityMetrics(sunlit_fraction=0.85, earth_visible_fraction=0.85),
                "raw_score": 85.0,
            },
            {
                "site": site_a,
                "metrics": VisibilityMetrics(sunlit_fraction=0.85, earth_visible_fraction=0.85),
                "raw_score": 85.0,
            },
        ]
        ranked = rank_eligible_candidates(records)
        assert ranked[0]["site"].name == "Alpha Peak"
        assert ranked[0]["rank"] == 1
        assert ranked[1]["site"].name == "Zulu Ridge"
        assert ranked[1]["rank"] == 2

    def test_sequential_ranks_no_gaps(self):
        records = [
            {"site": LandingSite(site_id=f"s{i}", name=f"Site {i}", latitude_deg=-89.0, longitude_deg=0.0),
             "metrics": VisibilityMetrics(sunlit_fraction=0.5 + i * 0.1, earth_visible_fraction=0.5),
             "raw_score": 50.0 + i * 10}
            for i in range(5)
        ]
        ranked = rank_eligible_candidates(records)
        ranks = [r["rank"] for r in ranked]
        assert ranks == [1, 2, 3, 4, 5]


class TestScientificExplanations:
    """Tests for Part 4: Explanations grounded in actual supplied data."""

    def test_explanation_accuracy_eligible(self):
        site = LandingSite(site_id="candidate_001", name="Shackleton Crater Rim", latitude_deg=-89.54, longitude_deg=0.0)
        metrics = VisibilityMetrics(
            sunlit_fraction=0.9167,
            earth_visible_fraction=0.8056,
            sunlit_hours=66.0,
            earth_visible_hours=58.0,
        )
        constraints = filter_mandatory_constraints(metrics, min_sunlight_pct=0.0, min_earth_visibility_pct=80.0)
        _, _, breakdown = calculate_composite_score(metrics, HeliosObjective.MAXIMIZE_SUNLIGHT)

        explanation, tradeoffs = generate_scientific_explanation(
            site=site,
            metrics=metrics,
            constraints=constraints,
            score_breakdown=breakdown,
            rank=1,
            objective=HeliosObjective.MAXIMIZE_SUNLIGHT,
            duration_hours=72.0,
        )

        assert "Ranked #1 with suitability score 88.9/100" in explanation
        assert "91.7% (66.0 hours) of sunlight" in explanation
        assert "80.6% (58.0 hours) of direct-to-Earth line of sight" in explanation
        assert "favoring solar illumination" in explanation

        # Trade-offs must be grounded in numbers
        assert any("Darkness interval" in t and "6.0 hours" in t for t in tradeoffs)
        assert any("Communication blackout" in t and "14.0 hours" in t for t in tradeoffs)

        # Ensure NO hallucinated terms exist
        for forbidden in ["RF link quality", "terrain blocking", "power generation", "signal-to-noise"]:
            assert forbidden.lower() not in explanation.lower()

    def test_explanation_accuracy_disqualified(self):
        site = LandingSite(site_id="candidate_002", name="Connecting Ridge", latitude_deg=-89.45, longitude_deg=-137.0)
        metrics = VisibilityMetrics(
            sunlit_fraction=0.70,
            earth_visible_fraction=0.60,
            sunlit_hours=50.4,
            earth_visible_hours=43.2,
        )
        constraints = filter_mandatory_constraints(metrics, min_sunlight_pct=0.0, min_earth_visibility_pct=80.0)

        explanation, tradeoffs = generate_scientific_explanation(
            site=site,
            metrics=metrics,
            constraints=constraints,
            rank=None,
        )

        assert "Connecting Ridge is disqualified from the candidate shortlist" in explanation
        assert "70.0% (50.4 hours)" in explanation
        assert "60.0% (43.2 hours)" in explanation
        assert "Constraint violations" in explanation
        assert any("Earth visibility (60.0%) is below required minimum threshold (80.0%)" in t for t in tradeoffs)

    def test_explanation_accuracy_insufficient_data(self):
        site = LandingSite(site_id="candidate_003", name="Malapert Massif", latitude_deg=-86.0, longitude_deg=2.0)
        metrics = VisibilityMetrics(sunlit_fraction=None, earth_visible_fraction=0.85)
        constraints = filter_mandatory_constraints(metrics)

        explanation, tradeoffs = generate_scientific_explanation(
            site=site,
            metrics=metrics,
            constraints=constraints,
        )

        assert "could not be evaluated due to missing scientific measurements" in explanation
        assert any("Incomplete ephemeris data" in t for t in tradeoffs)


class TestRecommendationResultsOutcomes:
    """Tests for Part 5: Full workflow and outcome scenarios."""

    @pytest.fixture
    def sites(self) -> list[LandingSite]:
        return [
            LandingSite(site_id="candidate_001", name="Shackleton", latitude_deg=-89.54, longitude_deg=0.0),
            LandingSite(site_id="candidate_002", name="Connecting Ridge", latitude_deg=-89.45, longitude_deg=-137.0),
            LandingSite(site_id="candidate_003", name="Malapert Massif", latitude_deg=-86.0, longitude_deg=2.0),
        ]

    def test_all_candidates_eligible(self, sites):
        conditions = {
            "candidate_001": make_synthetic_conditions("candidate_001", 0.95, 0.85),
            "candidate_002": make_synthetic_conditions("candidate_002", 0.90, 0.82),
            "candidate_003": make_synthetic_conditions("candidate_003", 0.85, 0.90),
        }
        req = HeliosMissionRequirements(
            objective=HeliosObjective.MAXIMIZE_SUNLIGHT,
            minimum_earth_visibility_pct=80.0,
            minimum_sunlight_pct=80.0,
        )
        report = generate_recommendation_results(sites, conditions, req)

        assert report.status == "ok"
        assert len(report.eligible) == 3
        assert len(report.disqualified) == 0
        assert len(report.insufficient_data) == 0
        assert [e.rank for e in report.eligible] == [1, 2, 3]

    def test_mixed_candidates_eligible_and_disqualified(self, sites):
        conditions = {
            "candidate_001": make_synthetic_conditions("candidate_001", 0.95, 0.85), # Pass
            "candidate_002": make_synthetic_conditions("candidate_002", 0.60, 0.85), # Fails sun (min 70%)
            "candidate_003": make_synthetic_conditions("candidate_003", 0.90, 0.70), # Fails earth (min 80%)
        }
        req = HeliosMissionRequirements(
            objective=HeliosObjective.BALANCED,
            minimum_earth_visibility_pct=80.0,
            minimum_sunlight_pct=70.0,
        )
        report = generate_recommendation_results(sites, conditions, req)

        assert report.status == "ok"
        assert len(report.eligible) == 1
        assert report.eligible[0].site_id == "candidate_001"
        assert report.eligible[0].rank == 1
        assert len(report.disqualified) == 2
        disqualified_ids = [d.site_id for d in report.disqualified]
        assert "candidate_002" in disqualified_ids
        assert "candidate_003" in disqualified_ids
        for d in report.disqualified:
            assert d.rank is None
            assert d.score is None

    def test_all_candidates_disqualified_no_match(self, sites):
        """When all candidates fail mandatory constraints, status must be 'no_match'."""
        conditions = {
            "candidate_001": make_synthetic_conditions("candidate_001", 0.70, 0.75),
            "candidate_002": make_synthetic_conditions("candidate_002", 0.60, 0.70),
            "candidate_003": make_synthetic_conditions("candidate_003", 0.65, 0.65),
        }
        req = HeliosMissionRequirements(
            objective=HeliosObjective.MAXIMIZE_EARTH_VISIBILITY,
            minimum_earth_visibility_pct=80.0,  # Nobody has >= 80%
        )
        report = generate_recommendation_results(sites, conditions, req)

        assert report.status == "no_match"
        assert len(report.eligible) == 0
        assert len(report.disqualified) == 3
        assert len(report.insufficient_data) == 0
        assert any("NO MATCH" in a for a in report.assumptions)

        shared = report.to_shared_recommend_response()
        assert shared.status == "no_match"

    def test_all_candidates_insufficient_data(self, sites):
        """When all candidates have missing measurements, status must be 'insufficient_data'."""
        conditions = {
            "candidate_001": make_synthetic_conditions("candidate_001", None, None, status="unavailable"),
            "candidate_002": make_synthetic_conditions("candidate_002", None, 0.8, status="unavailable"),
            "candidate_003": make_synthetic_conditions("candidate_003", 0.8, None, status="unavailable"),
        }
        req = HeliosMissionRequirements()
        report = generate_recommendation_results(sites, conditions, req)

        assert report.status == "insufficient_data"
        assert len(report.eligible) == 0
        assert len(report.disqualified) == 0
        assert len(report.insufficient_data) == 3
        assert any("INSUFFICIENT DATA" in a for a in report.assumptions)

    def test_mixed_all_three_categories(self, sites):
        conditions = {
            "candidate_001": make_synthetic_conditions("candidate_001", 0.95, 0.90), # Eligible
            "candidate_002": make_synthetic_conditions("candidate_002", 0.50, 0.90), # Disqualified (min sun 70%)
            "candidate_003": make_synthetic_conditions("candidate_003", None, 0.90), # Insufficient data
        }
        req = HeliosMissionRequirements(
            minimum_sunlight_pct=70.0,
            minimum_earth_visibility_pct=80.0,
        )
        report = generate_recommendation_results(sites, conditions, req)

        assert report.status == "ok"
        assert len(report.eligible) == 1
        assert report.eligible[0].site_id == "candidate_001"
        assert len(report.disqualified) == 1
        assert report.disqualified[0].site_id == "candidate_002"
        assert len(report.insufficient_data) == 1
        assert report.insufficient_data[0].site_id == "candidate_003"
        assert len(report.all_recommendations) == 3
