from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


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


class CommunicationWindow(BaseModel):
    """Continuous direct-to-Earth communication window."""

    window_id: int
    start_utc: str
    end_utc: str
    duration_hours: float
    max_elevation_deg: float
    min_elevation_deg: float


class ConditionTimelinePoint(BaseModel):
    """Discrete timestamp condition for timeline charts."""

    timestamp_utc: str
    sun_elevation_deg: Optional[float] = None
    earth_elevation_deg: Optional[float] = None
    is_sunlit: bool
    is_earth_visible: bool


class VisibilityMetrics(BaseModel):
    """Solar illumination and Earth visibility summary metrics."""

    sunlit_fraction: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    earth_visible_fraction: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    sunlit_hours: Optional[float] = Field(default=None, ge=0.0)
    earth_visible_hours: Optional[float] = Field(default=None, ge=0.0)
    mean_sun_elevation_deg: Optional[float] = None
    max_sun_elevation_deg: Optional[float] = None
    mean_earth_elevation_deg: Optional[float] = None
    max_earth_elevation_deg: Optional[float] = None
    longest_sunlit_stretch_hours: Optional[float] = None
    longest_dark_stretch_hours: Optional[float] = None
    communication_windows_count: int = 0


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
    current_condition: Optional[str] = None
    next_transition: Optional[dict[str, Any]] = None
    windows: list[CommunicationWindow] = Field(default_factory=list)
    timeline: list[ConditionTimelinePoint] = Field(default_factory=list)


class ScenarioInput(BaseModel):
    """Single landing site + mission window scenario."""

    site_id: str
    start_utc: str
    end_utc: str
    step_minutes: int = 60


class CompareRequest(BaseModel):
    """Request to compare multiple landing scenarios."""

    scenarios: list[ScenarioInput]


class CompareResponse(BaseModel):
    """Side-by-side comparison results."""

    results: list[ConditionsResponse] = Field(default_factory=list)


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
