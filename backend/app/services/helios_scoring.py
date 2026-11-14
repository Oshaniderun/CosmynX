"""HELIOS Constraint Filtering and Explainable Scoring Engine (Feature 06 — Step 2).

This service evaluates candidate lunar landing sites against mission constraints,
computes explainable suitability scores with transparent objective weights,
ranks eligible sites with strict tie-breaking rules, and generates evidence-based
scientific explanations strictly grounded in supplied measurements.

Guarantees:
- Mandatory constraints are applied BEFORE ranking.
- Disqualified and insufficient-data candidates are strictly separated from eligible ones.
- Missing measurements (None) are NEVER treated as zero.
- No invented or fabricated scientific metrics (no RF link quality, no terrain blocking).
- Deterministic, explainable math with zero ML or LLM hallucinations.
"""

from __future__ import annotations

import logging
from typing import Literal, Optional
from pydantic import BaseModel, Field

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
    HeliosRecommendation,
    HeliosRecommendResponse,
    LandingSite,
    VisibilityMetrics,
)
from app.services.helios_data_consumer import build_scientific_provenance

logger = logging.getLogger("helios.scoring")

# Objective weights: (w_sun, w_earth)
OBJECTIVE_WEIGHTS: dict[HeliosObjective, tuple[float, float]] = {
    HeliosObjective.MAXIMIZE_SUNLIGHT: (0.75, 0.25),
    HeliosObjective.MAXIMIZE_EARTH_VISIBILITY: (0.25, 0.75),
    HeliosObjective.BALANCED: (0.50, 0.50),
}


class HeliosEvaluationReport(BaseModel):
    """Complete structured output from the HELIOS scoring and ranking engine."""

    status: Literal["ok", "no_match", "insufficient_data"] = Field(
        ...,
        description="'ok' if eligible candidates exist; 'no_match' if all fail constraints; 'insufficient_data' if measurements are missing.",
    )
    eligible: list[EnrichedHeliosRecommendation] = Field(
        default_factory=list,
        description="Ranked eligible candidate sites satisfying all mandatory constraints.",
    )
    disqualified: list[EnrichedHeliosRecommendation] = Field(
        default_factory=list,
        description="Candidate sites that failed one or more mandatory constraints.",
    )
    insufficient_data: list[EnrichedHeliosRecommendation] = Field(
        default_factory=list,
        description="Candidate sites with missing scientific measurements that could not be evaluated.",
    )
    assumptions: list[str] = Field(
        default_factory=list,
        description="Scientific assumptions and limitation notices.",
    )

    @property
    def all_recommendations(self) -> list[EnrichedHeliosRecommendation]:
        """Return combined list of all candidates (eligible first, then disqualified, then insufficient data)."""
        return self.eligible + self.disqualified + self.insufficient_data

    def to_shared_recommend_response(self) -> HeliosRecommendResponse:
        """Convert to the repository's shared HeliosRecommendResponse model."""
        recs: list[HeliosRecommendation] = []
        if self.eligible:
            recs = [e.to_shared_recommendation() for e in self.eligible]
            resp_status: Literal["ok", "no_match", "pending"] = "ok"
        elif self.disqualified:
            recs = [d.to_shared_recommendation() for d in self.disqualified]
            resp_status = "no_match"
        else:
            resp_status = "pending"

        return HeliosRecommendResponse(
            recommendations=recs,
            assumptions=self.assumptions,
            status=resp_status,
        )


def filter_mandatory_constraints(
    metrics: VisibilityMetrics,
    min_sunlight_pct: float = 0.0,
    min_earth_visibility_pct: float = 80.0,
) -> ConstraintEvaluationResult:
    """Evaluate visibility metrics against mandatory mission constraints.

    Rules:
    - Missing measurements (None) must NEVER be treated as zero.
    - If either fraction is None, has_complete_data is False and the candidate cannot pass.
    - Fractions are compared against percentages: fraction * 100 >= threshold.
    - Exact threshold equality passes (>=).

    Args:
        metrics: VisibilityMetrics object.
        min_sunlight_pct: Required minimum sunlight percentage (0.0 to 100.0).
        min_earth_visibility_pct: Required minimum Earth visibility percentage (0.0 to 100.0).

    Returns:
        ConstraintEvaluationResult detailing pass/fail status and violation reasons.

    Raises:
        ValueError: If fraction values are outside [0.0, 1.0] or thresholds are outside [0.0, 100.0].
    """
    if min_sunlight_pct < 0.0 or min_sunlight_pct > 100.0:
        raise ValueError(f"min_sunlight_pct must be in [0.0, 100.0], got {min_sunlight_pct}")
    if min_earth_visibility_pct < 0.0 or min_earth_visibility_pct > 100.0:
        raise ValueError(
            f"min_earth_visibility_pct must be in [0.0, 100.0], got {min_earth_visibility_pct}"
        )

    # Validate fraction ranges if present
    if metrics.sunlit_fraction is not None:
        if metrics.sunlit_fraction < 0.0 or metrics.sunlit_fraction > 1.0:
            raise ValueError(
                f"sunlit_fraction must be in [0.0, 1.0], got {metrics.sunlit_fraction}"
            )
    if metrics.earth_visible_fraction is not None:
        if metrics.earth_visible_fraction < 0.0 or metrics.earth_visible_fraction > 1.0:
            raise ValueError(
                f"earth_visible_fraction must be in [0.0, 1.0], got {metrics.earth_visible_fraction}"
            )

    violations: list[str] = []
    has_sun_data = metrics.sunlit_fraction is not None
    has_earth_data = metrics.earth_visible_fraction is not None
    has_complete_data = has_sun_data and has_earth_data

    if not has_sun_data:
        violations.append("Sunlight availability measurement is unavailable (missing ephemeris data).")
    if not has_earth_data:
        violations.append("Earth visibility measurement is unavailable (missing ephemeris data).")

    # Evaluate every measurement that is present. A known mandatory failure is
    # conclusive even when another measurement is missing.
    req_sun_pct = round(min_sunlight_pct, 6)
    req_earth_pct = round(min_earth_visibility_pct, 6)
    measured_sun_pct = (
        round(metrics.sunlit_fraction * 100.0, 6)
        if metrics.sunlit_fraction is not None
        else None
    )
    measured_earth_pct = (
        round(metrics.earth_visible_fraction * 100.0, 6)
        if metrics.earth_visible_fraction is not None
        else None
    )
    passed_sunlight = (
        measured_sun_pct >= req_sun_pct if measured_sun_pct is not None else False
    )
    passed_earth_visibility = (
        measured_earth_pct >= req_earth_pct
        if measured_earth_pct is not None
        else False
    )

    if measured_sun_pct is not None and not passed_sunlight:
        violations.append(
            f"Sunlight availability ({metrics.sunlit_fraction * 100.0:.1f}%) is below required minimum threshold ({min_sunlight_pct:.1f}%)."
        )
    if measured_earth_pct is not None and not passed_earth_visibility:
        violations.append(
            f"Earth visibility ({metrics.earth_visible_fraction * 100.0:.1f}%) is below required minimum threshold ({min_earth_visibility_pct:.1f}%)."
        )

    passed_all = has_complete_data and passed_sunlight and passed_earth_visibility

    return ConstraintEvaluationResult(
        passed_earth_visibility=passed_earth_visibility,
        passed_sunlight=passed_sunlight,
        has_complete_data=has_complete_data,
        passed_all=passed_all,
        violations=violations,
    )


def calculate_composite_score(
    metrics: VisibilityMetrics,
    objective: HeliosObjective | str = HeliosObjective.MAXIMIZE_SUNLIGHT,
) -> tuple[float, float, ScoreBreakdown]:
    """Calculate the explainable composite suitability score for an eligible candidate.

    Formula:
        Score = (w_sun * sunlit_fraction + w_earth * earth_visible_fraction) * 100

    Weights:
        - maximize_sunlight: w_sun = 0.75, w_earth = 0.25
        - maximize_earth_visibility: w_sun = 0.25, w_earth = 0.75
        - balanced: w_sun = 0.50, w_earth = 0.50

    Args:
        metrics: VisibilityMetrics with non-null fractions.
        objective: HeliosObjective enum or objective string.

    Returns:
        tuple of (full_precision_score, displayed_rounded_score, ScoreBreakdown).

    Raises:
        ValueError: If measurements are None, fractions outside [0.0, 1.0], or invalid objective.
    """
    if metrics.sunlit_fraction is None or metrics.earth_visible_fraction is None:
        raise ValueError("Cannot calculate composite score: both sunlight and Earth visibility fractions must be non-null.")

    if metrics.sunlit_fraction < 0.0 or metrics.sunlit_fraction > 1.0:
        raise ValueError(f"sunlit_fraction must be in [0.0, 1.0], got {metrics.sunlit_fraction}")
    if metrics.earth_visible_fraction < 0.0 or metrics.earth_visible_fraction > 1.0:
        raise ValueError(f"earth_visible_fraction must be in [0.0, 1.0], got {metrics.earth_visible_fraction}")

    # Resolve objective enum
    if isinstance(objective, str):
        try:
            objective_enum = HeliosObjective(objective)
        except ValueError as exc:
            raise ValueError(f"Unknown objective '{objective}'. Must be one of {[o.value for o in HeliosObjective]}") from exc
    else:
        objective_enum = objective

    w_sun, w_earth = OBJECTIVE_WEIGHTS[objective_enum]

    weighted_sun = w_sun * metrics.sunlit_fraction * 100.0
    weighted_earth = w_earth * metrics.earth_visible_fraction * 100.0
    raw_score = weighted_sun + weighted_earth
    displayed_score = round(raw_score, 1)

    formula_desc = (
        f"Score = ({w_sun:.2f} * {metrics.sunlit_fraction:.4f} + {w_earth:.2f} * {metrics.earth_visible_fraction:.4f}) * 100 "
        f"= {weighted_sun:.2f} + {weighted_earth:.2f} = {raw_score:.2f} (Displayed: {displayed_score:.1f})"
    )

    breakdown = ScoreBreakdown(
        sunlight_weight=w_sun,
        earth_visibility_weight=w_earth,
        weighted_sunlight_score=round(weighted_sun, 2),
        weighted_earth_score=round(weighted_earth, 2),
        composite_score=displayed_score,
        formula_description=formula_desc,
    )

    return raw_score, displayed_score, breakdown


def rank_eligible_candidates(
    candidate_records: list[dict],
) -> list[dict]:
    """Sort eligible candidate records and assign sequential ranks.

    Sorting Rules:
    1. Composite score (highest first, using full precision).
    2. Sunlight fraction (highest first).
    3. Earth visibility fraction (highest first).
    4. Alphabetical site name (ascending: 'A' before 'B').

    Args:
        candidate_records: List of dicts, each containing:
            - 'site': LandingSite
            - 'metrics': VisibilityMetrics
            - 'raw_score': float
            - 'displayed_score': float
            - 'breakdown': ScoreBreakdown
            - 'constraints': ConstraintEvaluationResult
            - 'provenance': ScientificProvenance

    Returns:
        List of candidate records sorted with sequential 'rank' (1, 2, 3...) assigned.
    """
    if not candidate_records:
        return []

    # Python sort is stable. Negative values achieve descending order.
    sorted_records = sorted(
        candidate_records,
        key=lambda item: (
            -item["raw_score"],
            -item["metrics"].sunlit_fraction,
            -item["metrics"].earth_visible_fraction,
            item["site"].name,
        ),
    )

    for rank_idx, record in enumerate(sorted_records, start=1):
        record["rank"] = rank_idx

    return sorted_records


def generate_scientific_explanation(
    site: LandingSite,
    metrics: VisibilityMetrics,
    constraints: ConstraintEvaluationResult,
    score_breakdown: Optional[ScoreBreakdown] = None,
    rank: Optional[int] = None,
    objective: HeliosObjective = HeliosObjective.MAXIMIZE_SUNLIGHT,
    duration_hours: Optional[float] = None,
) -> tuple[str, list[str]]:
    """Generate deterministic, scientifically grounded explanations and trade-offs.

    Guarantees:
    - Every statement references actual supplied measurements.
    - Zero hallucinated parameters (no RF link quality, no terrain blocking).

    Returns:
        tuple of (explanation_text, list_of_tradeoffs).
    """
    tradeoffs: list[str] = []

    # Case A: Insufficient scientific data
    # Known failures take precedence over missing measurements for classification.
    has_known_failure = (
        (metrics.sunlit_fraction is not None and not constraints.passed_sunlight)
        or (
            metrics.earth_visible_fraction is not None
            and not constraints.passed_earth_visibility
        )
    )
    if not constraints.has_complete_data and not has_known_failure:
        explanation = (
            f"{site.name} ({site.site_id}) could not be evaluated due to missing scientific measurements. "
            f"Reasons: {'; '.join(constraints.violations)}."
        )
        tradeoffs.append("Incomplete ephemeris data: site cannot be ranked until measurement gaps are resolved.")
        return explanation, tradeoffs

    # Case B: A known constraint failure (measurements that are absent stay unknown).
    sun_pct_str = (
        f"{metrics.sunlit_fraction * 100.0:.1f}%"
        if metrics.sunlit_fraction is not None
        else "unknown"
    )
    earth_pct_str = (
        f"{metrics.earth_visible_fraction * 100.0:.1f}%"
        if metrics.earth_visible_fraction is not None
        else "unknown"
    )
    sun_hours_str = f" ({metrics.sunlit_hours:.1f} hours)" if metrics.sunlit_hours is not None else ""
    earth_hours_str = f" ({metrics.earth_visible_hours:.1f} hours)" if metrics.earth_visible_hours is not None else ""

    if has_known_failure or not constraints.passed_all:
        explanation = (
            f"{site.name} is disqualified from the candidate shortlist. "
            f"Measured sunlight availability: {sun_pct_str}{sun_hours_str}; "
            f"Measured Earth visibility: {earth_pct_str}{earth_hours_str}. "
            f"Constraint violations: {'; '.join(constraints.violations)}."
        )
        for violation in constraints.violations:
            tradeoffs.append(f"Unmet requirement: {violation}")
        return explanation, tradeoffs

    # Case C: Eligible candidate
    score_str = f"{score_breakdown.composite_score:.1f}/100" if score_breakdown else "N/A"
    rank_str = f"Ranked #{rank}" if rank is not None else "Eligible"

    obj_descriptions = {
        HeliosObjective.MAXIMIZE_SUNLIGHT: "favoring solar illumination (75% weight) over Earth visibility (25% weight)",
        HeliosObjective.MAXIMIZE_EARTH_VISIBILITY: "favoring geometric direct-to-Earth line-of-sight visibility (75% weight) over sunlight (25% weight)",
        HeliosObjective.BALANCED: "with equal balance between sunlight (50% weight) and Earth visibility (50% weight)",
    }
    obj_phrase = obj_descriptions.get(objective, "based on selected mission objective")

    explanation = (
        f"{rank_str} with suitability score {score_str}. {site.name} provides "
        f"{sun_pct_str}{sun_hours_str} of sunlight and {earth_pct_str}{earth_hours_str} "
        f"of direct-to-Earth line of sight, evaluated {obj_phrase}."
    )

    # Grounded trade-offs derived strictly from supplied measurements
    if metrics.sunlit_fraction < 1.0:
        dark_fraction = 1.0 - metrics.sunlit_fraction
        dark_pct = dark_fraction * 100.0
        if duration_hours is not None:
            dark_hours = duration_hours * dark_fraction
            tradeoffs.append(
                f"Darkness interval: {dark_hours:.1f} hours ({dark_pct:.1f}% of mission window) without solar illumination."
            )
        else:
            tradeoffs.append(
                f"Darkness interval: {dark_pct:.1f}% of the mission window without solar illumination."
            )

    if metrics.earth_visible_fraction < 1.0:
        comm_gap_fraction = 1.0 - metrics.earth_visible_fraction
        comm_gap_pct = comm_gap_fraction * 100.0
        if duration_hours is not None:
            comm_gap_hours = duration_hours * comm_gap_fraction
            tradeoffs.append(
                f"No geometric Earth line of sight: {comm_gap_hours:.1f} hours ({comm_gap_pct:.1f}% of mission window)."
            )
        else:
            tradeoffs.append(
                f"No geometric Earth line of sight: {comm_gap_pct:.1f}% of the mission window."
            )

    if metrics.sunlit_fraction == 1.0 and metrics.earth_visible_fraction == 1.0:
        tradeoffs.append(
            "Sampled estimate: 100% solar illumination and 100% direct-to-Earth line of sight over the modeled mission window."
        )

    return explanation, tradeoffs


def generate_recommendation_results(
    sites: list[LandingSite],
    conditions_map: dict[str, ConditionsResponse],
    requirements: HeliosMissionRequirements,
) -> HeliosEvaluationReport:
    """Evaluate, filter, score, and rank all candidate landing sites.

    Returns three clearly separated groups:
    1. eligible: Ranked 1, 2, 3... with composite scores and breakdowns.
    2. disqualified: Candidates that failed mandatory constraints (rank=None, score=None).
    3. insufficient_data: Candidates with missing measurements (rank=None, score=None).

    Handles all outcomes:
    - All eligible
    - Some eligible, some disqualified
    - All disqualified (status='no_match')
    - All insufficient data (status='insufficient_data')
    - Mixed candidate outcomes
    """
    eligible_raw: list[dict] = []
    disqualified_list: list[EnrichedHeliosRecommendation] = []
    insufficient_list: list[EnrichedHeliosRecommendation] = []

    for site in sites:
        conditions = conditions_map.get(site.site_id)
        if conditions is None:
            # Create a safe placeholder for un-evaluated site
            conditions = ConditionsResponse(
                site_id=site.site_id,
                latitude_deg=site.latitude_deg,
                longitude_deg=site.longitude_deg,
                start_utc=requirements.start_utc,
                end_utc=requirements.start_utc,
                metrics=VisibilityMetrics(),
                status="unavailable",
                source="Scientific Service",
            )

        provenance = build_scientific_provenance(
            site=site,
            conditions=conditions,
            duration_hours=float(requirements.mission_duration_hours),
        )

        if conditions.status != "ok":
            status_violation = (
                f"Scientific data status is '{conditions.status}'; the candidate cannot be ranked until status is 'ok'."
            )
            missing_measurements = []
            if conditions.metrics.sunlit_fraction is None:
                missing_measurements.append("Sunlight availability measurement is missing.")
            if conditions.metrics.earth_visible_fraction is None:
                missing_measurements.append("Earth visibility measurement is missing.")
            constraints = ConstraintEvaluationResult(
                passed_earth_visibility=False,
                passed_sunlight=False,
                has_complete_data=False,
                passed_all=False,
                violations=[status_violation, *missing_measurements],
            )
            rec = EnrichedHeliosRecommendation(
                rank=None,
                site_id=site.site_id,
                site_name=site.name,
                latitude_deg=site.latitude_deg,
                longitude_deg=site.longitude_deg,
                score=None,
                metrics=conditions.metrics,
                provenance=provenance,
                constraints=constraints,
                score_breakdown=None,
                explanation=(
                    f"{site.name} ({site.site_id}) is not ranked because scientific data status "
                    f"is '{conditions.status}'. Returned metric values are preserved but not used "
                    "until the data status is 'ok'."
                ),
                tradeoffs=["Scientific measurements are pending or unavailable and cannot support a ranking."],
            )
            insufficient_list.append(rec)
            continue

        constraints = filter_mandatory_constraints(
            metrics=conditions.metrics,
            min_sunlight_pct=requirements.minimum_sunlight_pct,
            min_earth_visibility_pct=requirements.minimum_earth_visibility_pct,
        )

        # Categorize
        has_known_failure = (
            (
                conditions.metrics.sunlit_fraction is not None
                and not constraints.passed_sunlight
            )
            or (
                conditions.metrics.earth_visible_fraction is not None
                and not constraints.passed_earth_visibility
            )
        )

        if has_known_failure:
            explanation, tradeoffs = generate_scientific_explanation(
                site=site,
                metrics=conditions.metrics,
                constraints=constraints,
                rank=None,
                objective=requirements.objective,
                duration_hours=float(requirements.mission_duration_hours),
            )
            rec = EnrichedHeliosRecommendation(
                rank=None,
                site_id=site.site_id,
                site_name=site.name,
                latitude_deg=site.latitude_deg,
                longitude_deg=site.longitude_deg,
                score=None,
                metrics=conditions.metrics,
                provenance=provenance,
                constraints=constraints,
                score_breakdown=None,
                explanation=explanation,
                tradeoffs=tradeoffs,
            )
            disqualified_list.append(rec)

        elif not constraints.has_complete_data:
            explanation, tradeoffs = generate_scientific_explanation(
                site=site,
                metrics=conditions.metrics,
                constraints=constraints,
                rank=None,
                objective=requirements.objective,
                duration_hours=float(requirements.mission_duration_hours),
            )
            rec = EnrichedHeliosRecommendation(
                rank=None,
                site_id=site.site_id,
                site_name=site.name,
                latitude_deg=site.latitude_deg,
                longitude_deg=site.longitude_deg,
                score=None,
                metrics=conditions.metrics,
                provenance=provenance,
                constraints=constraints,
                score_breakdown=None,
                explanation=explanation,
                tradeoffs=tradeoffs,
            )
            insufficient_list.append(rec)

        elif not constraints.passed_all:
            explanation, tradeoffs = generate_scientific_explanation(
                site=site,
                metrics=conditions.metrics,
                constraints=constraints,
                rank=None,
                objective=requirements.objective,
                duration_hours=float(requirements.mission_duration_hours),
            )
            rec = EnrichedHeliosRecommendation(
                rank=None,
                site_id=site.site_id,
                site_name=site.name,
                latitude_deg=site.latitude_deg,
                longitude_deg=site.longitude_deg,
                score=None,
                metrics=conditions.metrics,
                provenance=provenance,
                constraints=constraints,
                score_breakdown=None,
                explanation=explanation,
                tradeoffs=tradeoffs,
            )
            disqualified_list.append(rec)

        else:
            # Eligible candidate: compute score
            raw_score, displayed_score, breakdown = calculate_composite_score(
                metrics=conditions.metrics,
                objective=requirements.objective,
            )
            eligible_raw.append(
                {
                    "site": site,
                    "metrics": conditions.metrics,
                    "provenance": provenance,
                    "constraints": constraints,
                    "raw_score": raw_score,
                    "displayed_score": displayed_score,
                    "breakdown": breakdown,
                }
            )

    # Rank eligible candidates
    ranked_records = rank_eligible_candidates(eligible_raw)
    eligible_list: list[EnrichedHeliosRecommendation] = []

    for item in ranked_records:
        explanation, tradeoffs = generate_scientific_explanation(
            site=item["site"],
            metrics=item["metrics"],
            constraints=item["constraints"],
            score_breakdown=item["breakdown"],
            rank=item["rank"],
            objective=requirements.objective,
            duration_hours=float(requirements.mission_duration_hours),
        )
        rec = EnrichedHeliosRecommendation(
            rank=item["rank"],
            site_id=item["site"].site_id,
            site_name=item["site"].name,
            latitude_deg=item["site"].latitude_deg,
            longitude_deg=item["site"].longitude_deg,
            score=item["displayed_score"],
            metrics=item["metrics"],
            provenance=item["provenance"],
            constraints=item["constraints"],
            score_breakdown=item["breakdown"],
            explanation=explanation,
            tradeoffs=tradeoffs,
        )
        eligible_list.append(rec)

    # Determine overall report status
    if eligible_list:
        status: Literal["ok", "no_match", "insufficient_data"] = "ok"
    elif insufficient_list and not disqualified_list:
        status = "insufficient_data"
    else:
        # Either all disqualified, or mixed disqualified and insufficient
        status = "no_match"

    # Assemble assumptions
    w_sun, w_earth = OBJECTIVE_WEIGHTS[requirements.objective]
    assumptions = [
        f"Mission objective: '{requirements.objective.value}' (Sunlight weight: {w_sun:.2f}, Earth visibility weight: {w_earth:.2f}).",
        f"Mandatory constraints applied: Minimum Earth visibility >= {requirements.minimum_earth_visibility_pct:.1f}%, Minimum sunlight >= {requirements.minimum_sunlight_pct:.1f}%.",
        "Suitability scores are explainable heuristic rankings (0-100) and do NOT represent probabilities of mission success.",
        "Horizon model is geometric line-of-sight (elevation > 0 deg) and does not model terrain shadow casting.",
    ]
    if status == "no_match":
        assumptions.append(
            "NO MATCH: No candidate landing site satisfies all mandatory constraints. Consider lowering the minimum threshold."
        )
    elif status == "insufficient_data":
        assumptions.append(
            "INSUFFICIENT DATA: Ephemeris measurements are unavailable for candidate sites during this mission interval."
        )

    return HeliosEvaluationReport(
        status=status,
        eligible=eligible_list,
        disqualified=disqualified_list,
        insufficient_data=insufficient_list,
        assumptions=assumptions,
    )
