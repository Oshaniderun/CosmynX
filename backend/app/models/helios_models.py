"""HELIOS-specific Pydantic models and schemas for Feature 06 AI Lunar Landing Advisor.

These models define mission objectives, requirements, constraint evaluations,
score breakdowns, enriched site recommendations, and scientific provenance.
They reuse base models from app.models.schemas without modifying that file.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.schemas import (
    ConditionsResponse,
    HeliosRecommendation,
    HeliosRecommendRequest,
    HeliosRecommendResponse,
    LandingSite,
    VisibilityMetrics,
)


class HeliosObjective(str, Enum):
    """Mission optimization objectives supported by the HELIOS recommendation engine."""

    MAXIMIZE_SUNLIGHT = "maximize_sunlight"
    MAXIMIZE_EARTH_VISIBILITY = "maximize_earth_visibility"
    BALANCED = "balanced"


class HeliosMissionRequirements(BaseModel):
    """Validated mission requirements for evaluating candidate lunar landing sites."""

    objective: HeliosObjective = HeliosObjective.MAXIMIZE_SUNLIGHT
    minimum_earth_visibility_pct: float = Field(
        default=80.0,
        ge=0.0,
        le=100.0,
        description="Minimum acceptable Earth visibility percentage over mission duration.",
    )
    minimum_sunlight_pct: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Minimum acceptable sunlight percentage over mission duration.",
    )
    mission_duration_hours: int = Field(
        default=72,
        ge=1,
        le=720,
        description="Mission duration in hours (1 hour to 30 days).",
    )
    start_utc: str = Field(
        default="2026-11-20T00:00:00Z",
        description="Mission start timestamp in ISO 8601 UTC format.",
    )
    query: Optional[str] = Field(
        default=None,
        description="Optional natural-language description of mission requirements.",
    )
    data_mode: Literal["live", "demo"] = Field(
        default="live",
        description="'live' uses NASA JPL Horizons data; 'demo' enables synthetic fixtures for testing.",
    )

    @field_validator("start_utc")
    @classmethod
    def validate_utc_timestamp(cls, value: str) -> str:
        """Validate and normalize ISO 8601 UTC timestamp."""
        cleaned = value.strip()
        try:
            parsed = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError(
                f"Invalid ISO 8601 timestamp: '{cleaned}'. Expected format: 'YYYY-MM-DDTHH:MM:SSZ'"
            ) from exc
        if parsed.tzinfo is None:
            raise ValueError("Timestamp must include UTC timezone ('Z' or offset like '+00:00').")
        return parsed.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    @classmethod
    def from_recommend_request(
        cls, request: HeliosRecommendRequest, default_start_utc: str = "2026-11-20T00:00:00Z"
    ) -> HeliosMissionRequirements:
        """Construct validated requirements from a shared HeliosRecommendRequest."""
        # Convert string objective to enum safely
        obj_map = {
            "maximize_sunlight": HeliosObjective.MAXIMIZE_SUNLIGHT,
            "maximize_earth_visibility": HeliosObjective.MAXIMIZE_EARTH_VISIBILITY,
            "balanced": HeliosObjective.BALANCED,
        }
        objective_enum = obj_map.get(request.objective, HeliosObjective.MAXIMIZE_SUNLIGHT)
        start_time = request.start_utc or default_start_utc

        return cls(
            objective=objective_enum,
            minimum_earth_visibility_pct=request.minimum_earth_visibility_pct,
            minimum_sunlight_pct=request.minimum_sunlight_pct,
            mission_duration_hours=request.mission_duration_hours,
            start_utc=start_time,
            query=request.query,
            data_mode="live",
        )


class ConstraintEvaluationResult(BaseModel):
    """Evaluation result against mandatory mission constraints."""

    passed_earth_visibility: bool = Field(
        ...,
        description="Whether the site satisfies the minimum Earth visibility constraint.",
    )
    passed_sunlight: bool = Field(
        ...,
        description="Whether the site satisfies the minimum sunlight constraint.",
    )
    has_complete_data: bool = Field(
        ...,
        description="Whether complete non-null scientific measurements are available.",
    )
    passed_all: bool = Field(
        ...,
        description="True if all mandatory constraints are satisfied and data is complete.",
    )
    violations: list[str] = Field(
        default_factory=list,
        description="Explicit human-readable list of failed constraints or missing data reasons.",
    )


class ScoreBreakdown(BaseModel):
    """Explainable itemization of the scoring formula components."""

    sunlight_weight: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Weight allocated to sunlight availability (w_sun).",
    )
    earth_visibility_weight: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Weight allocated to Earth visibility (w_earth).",
    )
    weighted_sunlight_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Sunlight score component (w_sun * sunlit_fraction * 100).",
    )
    weighted_earth_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Earth visibility score component (w_earth * earth_visible_fraction * 100).",
    )
    composite_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Total composite score (0-100). None if measurements are missing or disqualified.",
    )
    formula_description: str = Field(
        ...,
        description="Mathematical explanation of the scoring formula used.",
    )


class ScientificProvenance(BaseModel):
    """Traceability metadata for scientific measurements used in recommendation."""

    site_id: str
    source: str = Field(..., description="Data provider (e.g. 'JPL Horizons').")
    horizon_model: str = Field(..., description="Horizon model (e.g. 'geometric', 'synthetic').")
    status: Literal["ok", "pending", "unavailable", "insufficient_data"] = Field(
        ...,
        description="Measurement availability status from scientific service.",
    )
    start_utc: str
    end_utc: str
    duration_hours: float
    is_synthetic: bool = Field(
        default=False,
        description="True if values are synthetic test fixtures; False if official NASA calculations.",
    )
    warnings: list[str] = Field(
        default_factory=list,
        description="Scientific limitations or sampling warnings.",
    )


class EnrichedHeliosRecommendation(BaseModel):
    """Comprehensive recommendation record for a single candidate landing site."""

    rank: Optional[int] = Field(
        default=None,
        ge=1,
        description="Rank position for eligible sites (1 is best). None if disqualified.",
    )
    site_id: str
    site_name: str
    latitude_deg: float = Field(..., ge=-90.0, le=90.0)
    longitude_deg: float = Field(..., ge=-180.0, le=180.0)
    score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Composite score (0-100). None if disqualified or data unavailable.",
    )
    metrics: VisibilityMetrics
    provenance: ScientificProvenance
    constraints: ConstraintEvaluationResult
    score_breakdown: Optional[ScoreBreakdown] = None
    explanation: str
    tradeoffs: list[str] = Field(default_factory=list)

    def to_shared_recommendation(self) -> HeliosRecommendation:
        """Convert to base HeliosRecommendation defined in app.models.schemas."""
        return HeliosRecommendation(
            rank=self.rank if self.rank is not None else 999,
            site_id=self.site_id,
            score=self.score if self.score is not None else 0.0,
            metrics=self.metrics,
            explanation=self.explanation,
            tradeoffs=self.tradeoffs,
        )


class HeliosInterpretRequest(BaseModel):
    """Request to parse a natural-language mission requirements query."""

    query: str = Field(..., min_length=1, description="Natural-language mission prompt.")
    current_start_utc: Optional[str] = Field(
        default=None,
        description="Active form start_utc timestamp if available.",
    )


class HeliosInterpretResponse(BaseModel):
    """Extracted mission constraint parameters from natural-language query."""

    query: str
    interpreted: bool = Field(
        ...,
        description="True if at least one mission constraint was recognized in the text.",
    )
    extracted_objective: Optional[HeliosObjective] = None
    extracted_duration_hours: Optional[int] = Field(default=None, ge=1, le=720)
    extracted_min_earth_visibility_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    extracted_min_sunlight_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    extracted_start_utc: Optional[str] = None
    interpretation_notes: list[str] = Field(default_factory=list)
    unrecognized_tokens: list[str] = Field(default_factory=list)
