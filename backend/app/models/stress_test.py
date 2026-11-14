"""Member 5 delay studies. Each run retains its own coordinates and requirements."""
from datetime import datetime, timedelta, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.schemas import EphemerisResponse, ScenarioComparison


class StudySite(BaseModel):
    key: str = Field(pattern=r'^[A-Za-z0-9_-]{1,48}$')
    site_id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=80)
    latitude_deg: float | None = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    longitude_deg: float | None = Field(default=None, ge=-180, le=180, allow_inf_nan=False)

    @model_validator(mode='after')
    def site_reference(self):
        if self.site_id:
            if self.latitude_deg is not None or self.longitude_deg is not None:
                raise ValueError('Catalog site coordinates cannot be overridden; use a custom reference')
        elif self.latitude_deg is None or self.longitude_deg is None or not self.name:
            raise ValueError('Custom reference points require a name, latitude and longitude')
        for value in (self.latitude_deg, self.longitude_deg):
            if value is not None and value != round(value, 6):
                raise ValueError('Coordinates support at most six decimal places')
        return self


class StudyConstraints(BaseModel):
    maximum_darkness_hours: float | None = Field(default=6, ge=0, le=168, allow_inf_nan=False)
    maximum_earth_outage_hours: float | None = Field(default=8, ge=0, le=168, allow_inf_nan=False)
    minimum_joint_visibility_hours: float | None = Field(default=24, ge=0, le=168, allow_inf_nan=False)

    @model_validator(mode='after')
    def enabled(self):
        if all(value is None for value in self.model_dump().values()):
            raise ValueError('Enable at least one visibility constraint')
        return self


class StressTestRequest(BaseModel):
    title: str = Field(default='Lunar payload delay study', min_length=1, max_length=100)
    nominal_start_utc: str = '2026-11-27T00:00:00Z'
    mission_duration_hours: int = Field(default=72, ge=1, le=168)
    max_delay_hours: int = Field(default=72, ge=0, le=168)
    departure_step_hours: int = Field(default=6, ge=1, le=24)
    sample_step_minutes: Literal[5, 15, 30, 60] = 15
    baseline_site_key: str
    sites: list[StudySite] = Field(min_length=1, max_length=3)
    constraints: StudyConstraints = Field(default_factory=StudyConstraints)
    data_mode: Literal['scientific'] = 'scientific'

    @field_validator('nominal_start_utc')
    @classmethod
    def utc_minute(cls, value):
        try:
            instant = datetime.fromisoformat(value.replace('Z', '+00:00'))
            if instant.tzinfo is None or instant.utcoffset() is None:
                raise ValueError('A timezone is required')
            instant = instant.astimezone(timezone.utc)
            if instant.second or instant.microsecond:
                raise ValueError('Use whole-minute timestamps')
            return instant.isoformat().replace('+00:00', 'Z')
        except (ValueError, OverflowError) as error:
            raise ValueError('Use a whole-minute ISO timestamp with a timezone') from error

    @model_validator(mode='after')
    def limits(self):
        keys = [site.key for site in self.sites]
        if len(set(keys)) != len(keys) or self.baseline_site_key not in keys:
            raise ValueError('Site keys must be unique and the baseline must be among the selected sites')
        if self.max_delay_hours % self.departure_step_hours:
            raise ValueError('Maximum delay must align with departure-grid spacing')
        if self.max_delay_hours // self.departure_step_hours + 1 > 25:
            raise ValueError('Use a larger departure step: at most 25 departure columns are supported')
        if (self.mission_duration_hours + self.max_delay_hours) * 60 // self.sample_step_minutes > 2000:
            raise ValueError('Choose coarser sampling or a shorter study: at most 2000 intervals per site')
        minimum = self.constraints.minimum_joint_visibility_hours
        if minimum is not None and minimum > self.mission_duration_hours:
            raise ValueError('Required joint visibility cannot exceed mission duration')
        try:
            datetime.fromisoformat(self.nominal_start_utc.replace('Z', '+00:00')) + timedelta(hours=self.mission_duration_hours + self.max_delay_hours)
        except OverflowError as error:
            raise ValueError('The study end exceeds the supported calendar') from error
        return self


class ResolvedStudySite(BaseModel):
    key: str
    site_id: str
    name: str
    latitude_deg: float
    longitude_deg: float
    coordinate_type: str
    source: str


class StudyMetrics(BaseModel):
    sunlit_hours: float | None = None
    earth_visible_hours: float | None = None
    simultaneous_visibility_hours: float | None = None
    longest_darkness_hours: float | None = None
    longest_earth_outage_hours: float | None = None


class ConstraintEvaluation(BaseModel):
    key: str
    label: str
    limit_hours: float
    measured_hours: float | None
    margin_hours: float | None
    status: Literal['meets', 'exceeds', 'unknown']


class StressCell(BaseModel):
    cell_id: str
    site_key: str
    delay_hours: int
    start_utc: str
    end_utc: str
    status: Literal['meets', 'exceeds', 'unknown']
    metrics: StudyMetrics
    constraints: list[ConstraintEvaluation]
    binding_constraint: str
    sun_coverage_fraction: float
    earth_coverage_fraction: float


class StudyDataset(BaseModel):
    site_key: str
    sha256: str
    source: str
    retrieved_utc: str | None = None
    request_fingerprint: str | None = None
    sample_count: int
    warnings: list[str] = Field(default_factory=list)


class StudyRowSummary(BaseModel):
    site_key: str
    meets: int
    exceeds: int
    unknown: int
    first_exceeding_delay_hours: int | None
    initial_meeting_through_hours: int | None


class StressTestRun(BaseModel):
    run_id: str
    created_utc: str
    algorithm_version: str = 'delay-intervals-v1'
    profile: StressTestRequest
    sites: list[ResolvedStudySite]
    departure_offsets_hours: list[int]
    cells: list[StressCell]
    summaries: list[StudyRowSummary]
    datasets: list[StudyDataset]
    assumptions: list[str]


class StressCellDetail(BaseModel):
    cell: StressCell
    scenario: ScenarioComparison
    ephemeris: EphemerisResponse
