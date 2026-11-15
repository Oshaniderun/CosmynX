"""Orchestrate interpretation, scientific measurements, and HELIOS scoring."""

from __future__ import annotations

import logging
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

from app.models.helios_models import HeliosMissionRequirements, HeliosObjective
from app.models.schemas import ConditionsResponse
from app.services.helios_data_consumer import (
    compute_mission_window,
    evaluate_all_candidate_sites,
    get_candidate_landing_sites,
)
from app.services.helios_interpreter import (
    HeliosInterpretationResult,
    interpret_mission_requirements,
)
from app.services.helios_scoring import HeliosEvaluationReport, generate_recommendation_results
from app.services.gemini_agent import (
    extract_intent_with_gemini,
    generate_conversational_briefing,
)

logger = logging.getLogger("helios.advisor")


class HeliosAdvisorRequest(BaseModel):
    """Natural-language mission description plus optional explicit form settings.

    Explicit settings take precedence over values parsed from the description.
    ``query`` is retained for compatibility with the earlier HELIOS request shape.
    """

    mission_description: Optional[str] = Field(default=None, max_length=4000)
    query: Optional[str] = Field(default=None, max_length=4000)
    objective: Optional[HeliosObjective] = None
    minimum_earth_visibility_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    minimum_sunlight_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    mission_duration_hours: Optional[int] = Field(default=None, ge=1, le=720)
    start_utc: Optional[str] = None
    api_key: Optional[str] = Field(default=None, max_length=512)
    chat_history: list[dict[str, str]] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_description_fields(self) -> "HeliosAdvisorRequest":
        if self.mission_description and self.query and self.mission_description != self.query:
            raise ValueError("Provide either mission_description or query, not conflicting values.")
        return self

    @property
    def prompt(self) -> str:
        return (self.mission_description or self.query or "").strip()


class HeliosAdvisorResponse(BaseModel):
    """Complete advisor outcome, including clarifications and candidate provenance."""

    status: Literal[
        "ok", "no_match", "insufficient_data", "needs_clarification", "ambiguous", "invalid"
    ]
    summary: str
    interpretation: HeliosInterpretationResult
    requirements: Optional[HeliosMissionRequirements] = None
    evaluation: Optional[HeliosEvaluationReport] = None
    clarification_questions: list[str] = Field(default_factory=list)
    unsupported_requirements: list[str] = Field(default_factory=list)
    mission_window: Optional[dict[str, str]] = None
    limitations: list[str] = Field(default_factory=list)
    ai_briefing: Optional[str] = None
    ai_model: Optional[str] = None
    ai_followups: list[str] = Field(default_factory=list)


def _resolve_requirements(
    request: HeliosAdvisorRequest,
    interpretation: HeliosInterpretationResult,
) -> HeliosMissionRequirements:
    """Apply explicit form settings, then parsed values, then model defaults."""
    base = interpretation.to_mission_requirements()
    values = base.model_dump()
    explicit = {
        "objective": request.objective,
        "minimum_earth_visibility_pct": request.minimum_earth_visibility_pct,
        "minimum_sunlight_pct": request.minimum_sunlight_pct,
        "mission_duration_hours": request.mission_duration_hours,
        "start_utc": request.start_utc,
    }
    for field, value in explicit.items():
        if value is not None:
            values[field] = value
    values["query"] = request.prompt or None
    return HeliosMissionRequirements.model_validate(values)


def generate_recommendations(
    request: HeliosAdvisorRequest,
) -> HeliosAdvisorResponse:
    """Interpret a request, evaluate each candidate once, and return the full report."""
    interpretation = interpret_mission_requirements(request.prompt, request.start_utc)
    explicit_settings = any(
        value is not None
        for value in (
            request.objective,
            request.minimum_earth_visibility_pct,
            request.minimum_sunlight_pct,
            request.mission_duration_hours,
            request.start_utc,
        )
    )

    if interpretation.status == "invalid":
        return HeliosAdvisorResponse(
            status="invalid",
            summary=interpretation.summary,
            interpretation=interpretation,
            clarification_questions=interpretation.clarification_questions,
            unsupported_requirements=interpretation.unsupported_requirements,
            limitations=["No scientific evaluation was run until the request is resolved."],
        )

    if not request.prompt and not explicit_settings:
        return HeliosAdvisorResponse(
            status="needs_clarification",
            summary="Describe mission requirements or provide explicit mission settings to run an evaluation.",
            interpretation=interpretation,
            clarification_questions=interpretation.clarification_questions,
            unsupported_requirements=interpretation.unsupported_requirements,
        )

    # Use Google Gemini (when configured) or smart conversational defaults when the user
    # asks a free-form question or continues a multi-turn conversation.
    if (
        interpretation.status in ("no_requirements", "ambiguous")
        or interpretation.unsupported_requirements
        or interpretation.clarification_questions
        or request.chat_history
    ) and request.prompt:
        gemini_intent = extract_intent_with_gemini(
            request.prompt, request.api_key, request.chat_history
        )
        if gemini_intent:
            obj_raw = str(gemini_intent.get("objective", "balanced"))
            if obj_raw in ("maximize_sunlight", "maximize_earth_visibility", "balanced"):
                interpretation.extracted_objective = HeliosObjective(obj_raw)
            if isinstance(gemini_intent.get("minimum_sunlight_pct"), (int, float)):
                interpretation.extracted_min_sunlight_pct = max(
                    0.0, min(100.0, float(gemini_intent["minimum_sunlight_pct"]))
                )
            if isinstance(gemini_intent.get("minimum_earth_visibility_pct"), (int, float)):
                interpretation.extracted_min_earth_visibility_pct = max(
                    0.0, min(100.0, float(gemini_intent["minimum_earth_visibility_pct"]))
                )
            if isinstance(gemini_intent.get("mission_duration_hours"), (int, float)):
                interpretation.extracted_duration_hours = max(
                    1, min(720, int(gemini_intent["mission_duration_hours"]))
                )
            if isinstance(gemini_intent.get("summary"), str) and gemini_intent["summary"].strip():
                interpretation.summary = gemini_intent["summary"].strip()
            interpretation.status = "success"
            interpretation.clarification_questions = []
        elif interpretation.status in ("no_requirements", "ambiguous") or interpretation.unsupported_requirements:
            if interpretation.extracted_objective is None:
                interpretation.extracted_objective = HeliosObjective.BALANCED
            if interpretation.extracted_min_earth_visibility_pct is None:
                interpretation.extracted_min_earth_visibility_pct = 70.0
            if interpretation.extracted_min_sunlight_pct is None:
                interpretation.extracted_min_sunlight_pct = 50.0
            if interpretation.extracted_duration_hours is None:
                interpretation.extracted_duration_hours = 72
            interpretation.status = "partial"
            interpretation.clarification_questions = []
            interpretation.summary = (
                "Evaluated all 9 Artemis III candidate regions using balanced mission defaults "
                "(72 h window, ≥50% sunlight, ≥70% Earth line of sight)."
            )

    try:
        requirements = _resolve_requirements(request, interpretation)
        start_utc, end_utc = compute_mission_window(
            requirements.start_utc, requirements.mission_duration_hours
        )
    except (ValueError, TypeError) as exc:
        return HeliosAdvisorResponse(
            status="invalid",
            summary=f"Mission settings are invalid: {exc}",
            interpretation=interpretation,
            clarification_questions=[str(exc)],
            unsupported_requirements=interpretation.unsupported_requirements,
        )

    sites = get_candidate_landing_sites()
    # De-duplicate site IDs before retrieval so a candidate is queried at most once.
    unique_sites = list({site.site_id: site for site in sites}.values())
    try:
        conditions_map = evaluate_all_candidate_sites(
            sites=unique_sites,
            start_utc=start_utc,
            duration_hours=requirements.mission_duration_hours,
        )
    except Exception as exc:  # protects the API if the batch provider itself fails
        logger.exception("HELIOS scientific data batch failed")
        conditions_map = {
            site.site_id: ConditionsResponse(
                site_id=site.site_id,
                latitude_deg=site.latitude_deg,
                longitude_deg=site.longitude_deg,
                start_utc=start_utc,
                end_utc=end_utc,
                metrics={},
                horizon_model="geometric",
                status="unavailable",
                source="Scientific data service unavailable",
            )
            for site in unique_sites
        }
        limitations = [f"Scientific data service unavailable: {type(exc).__name__}."]
    else:
        limitations = []

    evaluation = generate_recommendation_results(
        sites=unique_sites,
        conditions_map=conditions_map,
        requirements=requirements,
    )
    limitations.extend(
        [
            "Sunlight percentage is geometric illumination availability, not generated electrical power.",
            "Earth visibility is geometric line-of-sight, not RF link reliability, bandwidth, or communication quality.",
            "Terrain obstruction, slope, temperature, and landing hazards are not evaluated.",
            "Suitability scores are heuristic rankings, not probabilities of mission success.",
        ]
    )
    if evaluation.status == "ok":
        summary = f"Ranked {len(evaluation.eligible)} eligible candidate site(s)."
    elif evaluation.status == "no_match":
        summary = "No candidate satisfies all mandatory mission constraints. Candidate failures and available measurements are listed below."
    else:
        summary = "Scientific measurements are insufficient to rank candidates; missing values remain unknown."
    if interpretation.unsupported_requirements:
        limitations.extend(interpretation.unsupported_requirements)

    ai_briefing, ai_model, ai_followups = generate_conversational_briefing(
        prompt=request.prompt,
        evaluation=evaluation,
        sites=unique_sites,
        duration_hours=requirements.mission_duration_hours,
        objective=requirements.objective,
        api_key=request.api_key,
        chat_history=request.chat_history,
    )

    return HeliosAdvisorResponse(
        status=evaluation.status,
        summary=summary,
        interpretation=interpretation,
        requirements=requirements,
        evaluation=evaluation,
        unsupported_requirements=interpretation.unsupported_requirements,
        mission_window={"start_utc": start_utc, "end_utc": end_utc},
        limitations=limitations,
        ai_briefing=ai_briefing,
        ai_model=ai_model,
        ai_followups=ai_followups,
    )
