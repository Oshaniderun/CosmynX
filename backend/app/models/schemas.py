from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class LandingSite(BaseModel):
    """Candidate lunar landing site."""

    site_id: str
    name: str
    region: str = "Lunar South Pole"
    latitude_deg: float = Field(..., ge=-90.0, le=90.0)
    longitude_deg: float = Field(..., ge=-180.0, le=180.0)
    description: Optional[str] = None


class EphemerisPoint(BaseModel):
    """Sun and Earth position at a single UTC timestamp."""

    timestamp_utc: str
    sun_azimuth_deg: Optional[float] = None
    sun_elevation_deg: Optional[float] = None
    earth_azimuth_deg: Optional[float] = None
    earth_elevation_deg: Optional[float] = None


class EphemerisResponse(BaseModel):
    """Time-series ephemeris response."""

    site_id: str
    latitude_deg: float
    longitude_deg: float
    start_utc: str
    end_utc: str
    step_minutes: int
    source: str = "JPL Horizons"
    status: Literal["ok", "pending", "unavailable"] = "pending"
    points: list[EphemerisPoint] = Field(default_factory=list)


class VisibilityMetrics(BaseModel):
    """Solar illumination and Earth visibility summary metrics."""

    sunlit_fraction: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    earth_visible_fraction: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    sunlit_hours: Optional[float] = Field(default=None, ge=0.0)
    earth_visible_hours: Optional[float] = Field(default=None, ge=0.0)


class ConditionsResponse(BaseModel):
    """Standard scientific data format for site conditions (README Section 10)."""

    site_id: str
    latitude_deg: float
    longitude_deg: float
    start_utc: str
    end_utc: str
    step_minutes: int = 60
    metrics: VisibilityMetrics = Field(default_factory=VisibilityMetrics)
    horizon_model: str = "geometric"
    status: Literal["ok", "pending", "unavailable"] = "pending"
    source: str = "JPL Horizons"


class ScenarioInput(BaseModel):
    """Single landing site + mission window scenario."""

    site_id: str = Field(min_length=1, max_length=100)
    start_utc: str
    end_utc: str
    step_minutes: int = Field(default=60, ge=1, le=1440)
    scenario_id: Optional[str] = Field(default=None, min_length=1, max_length=100)
    latitude_deg: Optional[float] = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    longitude_deg: Optional[float] = Field(default=None, ge=-180, le=180, allow_inf_nan=False)

    @field_validator("start_utc", "end_utc")
    @classmethod
    def normalize_utc(cls, value: str) -> str:
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError("Use an ISO 8601 timestamp with a timezone") from exc
        if parsed.tzinfo is None or parsed.utcoffset() is None:
            raise ValueError("Timestamps must include Z or a timezone offset")
        if parsed.second or parsed.microsecond:
            raise ValueError("Comparison timestamps must use whole minutes (Horizons sampling precision)")
        return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    @model_validator(mode="after")
    def validate_window(self) -> "ScenarioInput":
        if self.site_id == "custom":
            if self.latitude_deg is None or self.longitude_deg is None:
                raise ValueError("Custom sites require latitude_deg and longitude_deg")
        elif self.latitude_deg is not None or self.longitude_deg is not None:
            raise ValueError("Use site_id='custom' for custom coordinates; catalog coordinates cannot be overridden")
        start = datetime.fromisoformat(self.start_utc.replace("Z", "+00:00"))
        end = datetime.fromisoformat(self.end_utc.replace("Z", "+00:00"))
        duration = (end - start).total_seconds()
        if duration <= 0:
            raise ValueError("end_utc must be after start_utc")
        if duration > 31 * 86400:
            raise ValueError("Mission windows must not exceed 31 days")
        if duration / (self.step_minutes * 60) > 2000:
            raise ValueError("Choose a larger step: at most 2000 timeline intervals are supported")
        return self


class CompareRequest(BaseModel):
    """Request to compare multiple landing scenarios."""

    scenarios: list[ScenarioInput] = Field(min_length=2, max_length=4)
    data_mode: Literal["live", "demo"] = "live"

    @model_validator(mode="after")
    def unique_scenarios(self) -> "CompareRequest":
        ids = [s.scenario_id or f"scenario_{i + 1}" for i, s in enumerate(self.scenarios)]
        if len(ids) != len(set(ids)):
            raise ValueError("scenario_id values must be unique")
        return self


class VisibilityInterval(BaseModel):
    """Sample-and-hold state over [start_utc, end_utc); null means unknown."""

    start_utc: str
    end_utc: str
    elapsed_hours: float
    sunlit: Optional[bool] = None
    earth_visible: Optional[bool] = None
    sun_elevation_deg: Optional[float] = None
    earth_elevation_deg: Optional[float] = None


class OperationalWindow(BaseModel):
    target: Literal["sunlight", "earth", "both"]
    start_utc: str
    end_utc: str
    duration_hours: float


class SettingTransition(BaseModel):
    target: Literal["sunlight", "earth"]
    after_utc: str
    by_utc: str
    after_elapsed_hours: float
    by_elapsed_hours: float


class ScenarioComparison(BaseModel):
    scenario_id: str
    site_name: str
    duration_hours: float
    conditions: ConditionsResponse
    timeline: list[VisibilityInterval] = Field(default_factory=list)
    timeline_status: Literal["ok", "partial", "unavailable"] = "unavailable"
    timeline_source: str
    warnings: list[str] = Field(default_factory=list)
    summary_method: Literal["conditions_service", "comparison_intervals", "synthetic"] = "conditions_service"
    sun_coverage_fraction: float = 0
    earth_coverage_fraction: float = 0
    windows: list[OperationalWindow] = Field(default_factory=list)
    setting_transitions: list[SettingTransition] = Field(default_factory=list)


class ComparisonDelta(BaseModel):
    """Alternative minus baseline; fractions are expressed in percentage points."""

    baseline_scenario_id: str
    scenario_id: str
    start_delay_hours: float
    sunlit_percentage_points: Optional[float] = None
    earth_visible_percentage_points: Optional[float] = None
    sunlit_hours: Optional[float] = None
    earth_visible_hours: Optional[float] = None
    warnings: list[str] = Field(default_factory=list)


class CompareResponse(BaseModel):
    """Side-by-side comparison results."""

    results: list[ConditionsResponse] = Field(default_factory=list)
    scenarios: list[ScenarioComparison] = Field(default_factory=list)
    deltas: list[ComparisonDelta] = Field(default_factory=list)
    data_mode: Literal["live", "demo"] = "live"
    status: Literal["ok", "partial", "pending", "unavailable"] = "pending"
    assumptions: list[str] = Field(default_factory=list)


class HeliosRecommendRequest(BaseModel):
    """Mission constraints for HELIOS AI Advisor."""

    objective: Literal["maximize_sunlight", "maximize_earth_visibility", "balanced"] = (
        "maximize_sunlight"
    )
    minimum_earth_visibility_pct: float = Field(default=80.0, ge=0.0, le=100.0)
    minimum_sunlight_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    mission_duration_hours: int = Field(default=72, ge=1)
    start_utc: Optional[str] = None
    query: Optional[str] = None


class HeliosRecommendation(BaseModel):
    """Single ranked site recommendation."""

    rank: int
    site_id: str
    score: float
    metrics: VisibilityMetrics
    explanation: str
    tradeoffs: list[str] = Field(default_factory=list)


class HeliosRecommendResponse(BaseModel):
    """Ranked shortlist and scientific assumptions."""

    recommendations: list[HeliosRecommendation] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    status: Literal["ok", "no_match", "pending"] = "pending"
