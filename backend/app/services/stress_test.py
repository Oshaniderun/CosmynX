"""Member 5: immutable, real-data site-by-delay studies; no per-cell NASA calls."""
from datetime import datetime, timedelta, timezone
import hashlib
import json
from math import isfinite
from pathlib import Path
from uuid import UUID, uuid4

from httpx import HTTPError

from app.api.sites import DEFAULT_SITES
from app.models.schemas import ConditionsResponse, EphemerisResponse, ScenarioComparison, ScenarioInput
from app.models.stress_test import (
    ConstraintEvaluation, ResolvedStudySite, StressCell, StressCellDetail, StressTestRequest,
    StressTestRun, StudyDataset, StudyMetrics, StudyRowSummary,
)
from app.services.comparison import _timeline
from app.services.comparison_analysis import continuity_metrics, operational_windows, setting_transitions, summarize_intervals
from app.services.positions import get_ephemeris_for_site

RUN_DIRECTORY = Path(__file__).resolve().parents[3] / 'data' / 'processed' / 'delay_runs'
ASSUMPTIONS = [
    'Scientific mode uses NASA/JPL Horizons samples. Missing data is never replaced with synthetic measurements.',
    'Airless target-center elevation above 0 degrees defines geometric visibility; observer altitude is 0 km relative to the reference ellipsoid.',
    'Terrain obstruction, finite target disks, eclipses, real electrical power, and RF link budgets are outside this comparison model.',
    'Each sample is held across [start,end); endpoint samples do not add duration. Results are sampled estimates, not continuous-time guarantees.',
    'Requirements are user-declared visibility thresholds, not validated spacecraft endurance or flight-safety limits.',
    'Coordinates and datasets are saved with this run. Later catalog edits do not change a recorded study.',
    'Meets/exceeds describes only enabled constraints at tested departures. It is not a probability of mission success.',
]


def instant(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def stamp(value):
    return value.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')


def resolve_sites(profile: StressTestRequest) -> list[ResolvedStudySite]:
    catalog = {site.site_id: site for site in DEFAULT_SITES}
    resolved = []
    identities = set()
    for entry in profile.sites:
        if entry.site_id:
            if entry.site_id not in catalog:
                raise ValueError(f'Unknown catalog site: {entry.site_id}')
            site = catalog[entry.site_id]
            latitude, longitude = round(site.latitude_deg, 6), round((site.longitude_deg + 180) % 360 - 180, 6)
            name, coordinate_type, source = site.name, site.coordinate_type, site.source
        else:
            latitude, longitude = entry.latitude_deg, entry.longitude_deg
            name, coordinate_type, source = entry.name, 'custom_reference_point', 'User-defined reference coordinates'
        if (latitude, longitude) in identities:
            raise ValueError('Select distinct coordinate pairs; duplicate sites would repeat the same study')
        identities.add((latitude, longitude))
        resolved.append(ResolvedStudySite(key=entry.key, site_id=entry.site_id or f'custom_{entry.key}', name=name,
                        latitude_deg=latitude, longitude_deg=longitude, coordinate_type=coordinate_type, source=source))
    return resolved


def evaluate_constraints(metrics: StudyMetrics, profile: StressTestRequest):
    checks = []
    for key, metric, label, direction in (
        ('maximum_darkness_hours', 'longest_darkness_hours', 'Continuous darkness', 'max'),
        ('maximum_earth_outage_hours', 'longest_earth_outage_hours', 'Earth visibility interruption', 'max'),
        ('minimum_joint_visibility_hours', 'simultaneous_visibility_hours', 'Joint Sun/Earth visibility', 'min'),
    ):
        limit = getattr(profile.constraints, key)
        if limit is None:
            continue
        measured = getattr(metrics, metric)
        margin = None if measured is None else limit - measured if direction == 'max' else measured - limit
        state = 'unknown' if margin is None else 'meets' if margin >= -1e-9 else 'exceeds'
        checks.append(ConstraintEvaluation(key=key, label=label, limit_hours=limit, measured_hours=measured,
                                           margin_hours=margin, status=state))
    failed = [check for check in checks if check.status == 'exceeds']
    missing = [check for check in checks if check.status == 'unknown']
    state = 'exceeds' if failed else 'unknown' if missing else 'meets'
    binding = min(failed, key=lambda check: check.margin_hours) if failed else missing[0] if missing else min(checks, key=lambda check: check.margin_hours)
    return state, checks, binding.key


def evaluate_window(profile, site, ephemeris, delay):
    start = instant(profile.nominal_start_utc) + timedelta(hours=delay)
    end = start + timedelta(hours=profile.mission_duration_hours)
    window = ScenarioInput(site_id='custom', latitude_deg=site.latitude_deg, longitude_deg=site.longitude_deg,
                           start_utc=stamp(start), end_utc=stamp(end), step_minutes=profile.sample_step_minutes)
    timeline = _timeline(window, ephemeris)
    summary, coverage = summarize_intervals(timeline, profile.mission_duration_hours)
    continuity = continuity_metrics(timeline, profile.mission_duration_hours)
    metrics = StudyMetrics(sunlit_hours=summary.sunlit_hours, earth_visible_hours=summary.earth_visible_hours, **continuity)
    state, checks, binding = evaluate_constraints(metrics, profile)
    cell = StressCell(cell_id=f'{site.key}:d{delay}', site_key=site.key, delay_hours=delay, start_utc=stamp(start), end_utc=stamp(end),
                      status=state, metrics=metrics, constraints=checks, binding_constraint=binding,
                      sun_coverage_fraction=coverage['sunlight'], earth_coverage_fraction=coverage['earth'])
    return cell, timeline, summary, coverage


def create_study(profile: StressTestRequest) -> StressTestRun:
    sites = resolve_sites(profile)
    start = instant(profile.nominal_start_utc)
    end = start + timedelta(hours=profile.mission_duration_hours + profile.max_delay_hours)
    offsets = list(range(0, profile.max_delay_hours + 1, profile.departure_step_hours))
    cells, metadata, datasets, rows = [], [], {}, []
    for site in sites:
        params = dict(site_id=site.site_id, latitude_deg=site.latitude_deg, longitude_deg=site.longitude_deg,
                      start_utc=stamp(start), end_utc=stamp(end), step_minutes=profile.sample_step_minutes)
        warnings = []
        try:
            data = get_ephemeris_for_site(**params)
            if (data.site_id != site.site_id or data.latitude_deg != site.latitude_deg or data.longitude_deg != site.longitude_deg
                    or instant(data.start_utc) != start or instant(data.end_utc) != end or data.step_minutes != profile.sample_step_minutes
                    or data.source != 'JPL Horizons'):
                raise ValueError('The returned ephemeris does not match the requested site, interval, or source')
            # Ensure invalid numeric values remain unknown and JSON exports stay standards-compliant.
            for point in data.points:
                for field in ('sun_elevation_deg', 'earth_elevation_deg', 'sun_azimuth_deg', 'earth_azimuth_deg'):
                    value = getattr(point, field)
                    if value is not None and (not isfinite(value) or ('elevation' in field and abs(value) > 90)):
                        setattr(point, field, None)
        except (OSError, ValueError, HTTPError):
            data = EphemerisResponse(**params, status='unavailable', source='JPL Horizons')
            warnings.append('The NASA dataset could not be evaluated. Retry the study; no values were invented.')
        if data.status != 'ok':
            warnings.append('Source data is unavailable or pending; affected required results remain unknown.')
        payload = data.model_dump(mode='json')
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True, allow_nan=False).encode()).hexdigest()
        datasets[site.key] = payload
        metadata.append(StudyDataset(site_key=site.key, sha256=digest, source=data.source, retrieved_utc=data.retrieved_utc,
                        request_fingerprint=data.request_fingerprint, sample_count=len(data.points), warnings=warnings))
        row = [evaluate_window(profile, site, data, delay)[0] for delay in offsets]
        cells.extend(row)
        initial = None
        for cell in row:
            if cell.status != 'meets':
                break
            initial = cell.delay_hours
        rows.append(StudyRowSummary(site_key=site.key, meets=sum(c.status == 'meets' for c in row),
                    exceeds=sum(c.status == 'exceeds' for c in row), unknown=sum(c.status == 'unknown' for c in row),
                    first_exceeding_delay_hours=next((c.delay_hours for c in row if c.status == 'exceeds'), None),
                    initial_meeting_through_hours=initial))
    run = StressTestRun(run_id=str(uuid4()), created_utc=stamp(datetime.now(timezone.utc)), profile=profile,
                       sites=sites, departure_offsets_hours=offsets, cells=cells, summaries=rows,
                       datasets=metadata, assumptions=ASSUMPTIONS)
    RUN_DIRECTORY.mkdir(parents=True, exist_ok=True)
    path = RUN_DIRECTORY / f'{run.run_id}.json'
    staging = path.with_suffix('.tmp')
    staging.write_text(json.dumps({'run': run.model_dump(mode='json'), 'datasets': datasets}, allow_nan=False), encoding='utf-8')
    staging.replace(path)
    return run


def load_study(run_id: str):
    path = RUN_DIRECTORY / f'{UUID(str(run_id))}.json'
    if not path.is_file():
        raise FileNotFoundError('This saved study is not available on this server. Run the profile again.')
    payload = json.loads(path.read_text(encoding='utf-8'))
    run = StressTestRun.model_validate(payload['run'])
    # Validate stored datasets against their immutable identities before serving details or exports.
    for metadata in run.datasets:
        digest = hashlib.sha256(json.dumps(payload['datasets'][metadata.site_key], sort_keys=True, allow_nan=False).encode()).hexdigest()
        if digest != metadata.sha256:
            raise ValueError('The stored study dataset failed its integrity check. Rerun the study.')
    return run, payload['datasets']


def cell_detail(run_id: str, cell_id: str) -> StressCellDetail:
    run, datasets = load_study(run_id)
    cell = next((cell for cell in run.cells if cell.cell_id == cell_id), None)
    if cell is None:
        raise FileNotFoundError('The selected cell is not part of this study')
    site = next(site for site in run.sites if site.key == cell.site_key)
    ephemeris = EphemerisResponse.model_validate(datasets[site.key])
    computed, timeline, summary, coverage = evaluate_window(run.profile, site, ephemeris, cell.delay_hours)
    full = all(value is not None for value in summary.model_dump().values())
    known = any(point.sunlit is not None or point.earth_visible is not None for point in timeline)
    conditions = ConditionsResponse(site_id=site.site_id, latitude_deg=site.latitude_deg, longitude_deg=site.longitude_deg,
                    start_utc=cell.start_utc, end_utc=cell.end_utc, step_minutes=run.profile.sample_step_minutes,
                    metrics=summary, status='ok' if full else 'unavailable', source=ephemeris.source)
    scenario = ScenarioComparison(scenario_id=cell.cell_id, site_name=site.name, duration_hours=run.profile.mission_duration_hours,
                   conditions=conditions, timeline=timeline, timeline_status='ok' if full else 'partial' if known else 'unavailable',
                   timeline_source=ephemeris.source, summary_method='comparison_intervals',
                   sun_coverage_fraction=coverage['sunlight'], earth_coverage_fraction=coverage['earth'],
                   windows=operational_windows(timeline), setting_transitions=setting_transitions(timeline),
                   **continuity_metrics(timeline, run.profile.mission_duration_hours),
                   retrieved_utc=ephemeris.retrieved_utc, request_fingerprint=ephemeris.request_fingerprint)
    window_ephemeris = ephemeris.model_copy(update={
        'start_utc': cell.start_utc, 'end_utc': cell.end_utc,
        'points': [point for point in ephemeris.points if _in_window(point.timestamp_utc, cell.start_utc, cell.end_utc)],
    })
    return StressCellDetail(cell=computed, scenario=scenario, ephemeris=window_ephemeris)


def _in_window(value, start, end):
    try:
        point = instant(value)
        return point.tzinfo is not None and instant(start) <= point <= instant(end)
    except ValueError:
        return False
