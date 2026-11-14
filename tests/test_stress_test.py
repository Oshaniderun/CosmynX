"""Delay-grid invariants: immutable evidence, bounded requests and honest unknowns."""
import json
from datetime import timedelta
from pathlib import Path
from unittest.mock import Mock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.schemas import EphemerisPoint, EphemerisResponse
from app.models.stress_test import StressTestRequest, StudyMetrics
from app.services import stress_test as service


def profile(**updates):
    payload = dict(nominal_start_utc='2026-11-27T00:00:00Z', mission_duration_hours=2,
                   max_delay_hours=2, departure_step_hours=1, sample_step_minutes=60,
                   baseline_site_key='reference', sites=[dict(key='reference', name='Test point',
                   latitude_deg=-89.54, longitude_deg=0)], constraints=dict(maximum_darkness_hours=0,
                   maximum_earth_outage_hours=0, minimum_joint_visibility_hours=2))
    payload.update(updates)
    return StressTestRequest.model_validate(payload)


def ephemeris(params, states=None):
    start, end = service.instant(params['start_utc']), service.instant(params['end_utc'])
    points = []
    instant, index = start, 0
    while instant <= end:
        sun, earth = states[index] if states is not None else (1, 1)
        points.append(EphemerisPoint(timestamp_utc=service.stamp(instant), sun_elevation_deg=sun,
                                     earth_elevation_deg=earth))
        instant += timedelta(minutes=params['step_minutes'])
        index += 1
    return EphemerisResponse(**params, status='ok', points=points, retrieved_utc='2026-11-14T00:00:00Z',
                             request_fingerprint='unit-test-source')


@pytest.fixture
def provider(monkeypatch, tmp_path):
    monkeypatch.setattr(service, 'RUN_DIRECTORY', tmp_path)
    mock = Mock(side_effect=lambda **params: ephemeris(params))
    monkeypatch.setattr(service, 'get_ephemeris_for_site', mock)
    return mock


@pytest.mark.parametrize('updates', [
    dict(nominal_start_utc='2026-11-27T00:00:00'),
    dict(nominal_start_utc='2026-11-27T00:00:01Z'),
    dict(nominal_start_utc='9999-12-31T23:00:00Z'),
    dict(baseline_site_key='absent'), dict(departure_step_hours=0),
    dict(max_delay_hours=3, departure_step_hours=2),
    dict(max_delay_hours=25, departure_step_hours=1),
    dict(mission_duration_hours=168, max_delay_hours=168, departure_step_hours=24, sample_step_minutes=5),
    dict(constraints=dict(maximum_darkness_hours=None, maximum_earth_outage_hours=None, minimum_joint_visibility_hours=None)),
    dict(constraints=dict(minimum_joint_visibility_hours=3)),
    dict(sites=[dict(key='reference', name='Invalid', latitude_deg=-89.5400001, longitude_deg=0)]),
    dict(sites=[dict(key='reference', site_id='candidate_001', latitude_deg=-89, longitude_deg=0)]),
    dict(sites=[dict(key='reference', name='Invalid', latitude_deg=float('nan'), longitude_deg=0)]),
    dict(sites=[dict(key='reference', site_id='candidate_001'), dict(key='reference', site_id='candidate_002')]),
])
def test_invalid_requests_are_rejected(updates):
    with pytest.raises(ValidationError):
        profile(**updates)


def test_timezone_is_normalized():
    assert profile(nominal_start_utc='2026-11-27T05:30:00+05:30').nominal_start_utc == '2026-11-27T00:00:00Z'


def test_one_extended_fetch_per_site_details_and_export_are_offline(provider):
    run = service.create_study(profile(sites=[dict(key='reference', site_id='candidate_001'),
                                             dict(key='second', site_id='candidate_002')]))
    assert provider.call_count == 2
    assert all(call.kwargs['end_utc'] == '2026-11-27T04:00:00Z' for call in provider.call_args_list)
    assert len(run.cells) == 6
    assert all(cell.status == 'meets' for cell in run.cells)
    assert all(cell.metrics.simultaneous_visibility_hours == 2 for cell in run.cells)
    with TestClient(app) as client:
        assert client.get(f'/api/stress-tests/{run.run_id}').status_code == 200
        detail = client.get(f'/api/stress-tests/{run.run_id}/cells/reference:d1').json()
        assert len(detail['scenario']['timeline']) == 2
        assert len(detail['ephemeris']['points']) == 3  # endpoint is a snapshot, not an extra hour
        exported = client.get(f'/api/stress-tests/{run.run_id}/export').json()
        assert exported['format'] == 'helios-delay-study-v1'
        assert len(exported['datasets']) == 2
    assert provider.call_count == 2


def test_non_monotonic_rows_and_endpoint_duration(provider):
    provider.side_effect = lambda **params: ephemeris(params, [(1, 1), (1, -1), (1, 1), (1, 1), (-1, -1)])
    run = service.create_study(profile(mission_duration_hours=1, max_delay_hours=3,
                                      constraints=dict(maximum_darkness_hours=0, maximum_earth_outage_hours=0,
                                                       minimum_joint_visibility_hours=1)))
    assert [cell.status for cell in run.cells] == ['meets', 'exceeds', 'meets', 'meets']
    assert run.summaries[0].first_exceeding_delay_hours == 1
    assert run.summaries[0].initial_meeting_through_hours == 0
    assert run.cells[-1].metrics.simultaneous_visibility_hours == 1


def test_unknown_source_never_becomes_zero(provider):
    provider.side_effect = OSError('offline')
    run = service.create_study(profile())
    assert all(cell.status == 'unknown' for cell in run.cells)
    assert all(cell.metrics.longest_darkness_hours is None for cell in run.cells)
    assert run.datasets[0].sample_count == 0
    assert run.datasets[0].warnings


def test_known_failure_has_precedence_over_unknown():
    state, checks, binding = service.evaluate_constraints(StudyMetrics(longest_earth_outage_hours=1), profile())
    assert state == 'exceeds'
    assert binding == 'maximum_earth_outage_hours'
    assert any(check.status == 'unknown' for check in checks)


def test_equality_meets_and_disabled_constraints_are_absent():
    request = profile(constraints=dict(maximum_darkness_hours=None, maximum_earth_outage_hours=0,
                                       minimum_joint_visibility_hours=None))
    state, checks, _ = service.evaluate_constraints(StudyMetrics(longest_earth_outage_hours=0), request)
    assert state == 'meets'
    assert len(checks) == 1 and checks[0].margin_hours == 0


def test_partial_data_withholds_only_affected_target(provider):
    provider.side_effect = lambda **params: ephemeris(params, [(None, -1), (1, -1), (1, 1), (1, 1), (1, 1)])
    cell = service.create_study(profile()).cells[0]
    assert cell.sun_coverage_fraction == .5 and cell.earth_coverage_fraction == 1
    assert cell.metrics.longest_darkness_hours is None
    assert cell.metrics.longest_earth_outage_hours == 2
    assert cell.status == 'exceeds'


def test_mismatched_source_and_nonfinite_measurements_are_unknown(provider):
    def invalid(**params):
        data = ephemeris(params)
        data.points[0].sun_elevation_deg = float('nan')
        return data
    provider.side_effect = invalid
    run = service.create_study(profile())
    assert run.cells[0].status == 'unknown'
    assert service.load_study(run.run_id)[1]['reference']['points'][0]['sun_elevation_deg'] is None
    provider.side_effect = lambda **params: ephemeris(params).model_copy(update={'latitude_deg': 0})
    assert service.create_study(profile()).cells[0].status == 'unknown'


def test_coordinate_snapshot_survives_catalog_edit(provider, monkeypatch):
    run = service.create_study(profile(sites=[dict(key='reference', site_id='candidate_001')]))
    saved = run.sites[0].latitude_deg
    monkeypatch.setattr(service, 'DEFAULT_SITES', [])
    detail = service.cell_detail(run.run_id, run.cells[0].cell_id)
    assert detail.scenario.conditions.latitude_deg == saved


def test_dataset_tampering_is_rejected(provider):
    run = service.create_study(profile())
    path = service.RUN_DIRECTORY / f'{run.run_id}.json'
    payload = json.loads(path.read_text())
    payload['datasets']['reference']['points'][0]['earth_elevation_deg'] = -40
    path.write_text(json.dumps(payload))
    with pytest.raises(ValueError, match='integrity'):
        service.load_study(run.run_id)
    with TestClient(app) as client:
        assert client.get(f'/api/stress-tests/{run.run_id}/export').status_code == 503


def test_unknown_and_duplicate_coordinates_are_rejected_before_fetch(provider):
    with pytest.raises(ValueError, match='Unknown catalog'):
        service.create_study(profile(sites=[dict(key='reference', site_id='does-not-exist')]))
    with pytest.raises(ValueError, match='distinct'):
        service.create_study(profile(sites=[dict(key='reference', name='A', latitude_deg=1, longitude_deg=2),
                                          dict(key='second', name='B', latitude_deg=1, longitude_deg=2)]))
    provider.assert_not_called()


def test_api_post_validation_and_missing_records(provider):
    with TestClient(app) as client:
        response = client.post('/api/stress-tests', json=profile().model_dump(mode='json'))
        assert response.status_code == 201
        run_id = response.json()['run_id']
        assert client.get(f'/api/stress-tests/{run_id}/cells/no-such-cell').status_code == 404
        assert client.get(f'/api/stress-tests/{uuid4()}').status_code == 404
        assert client.get('/api/stress-tests/not-a-uuid').status_code == 422
        assert client.post('/api/stress-tests', json={}).status_code == 422


def test_committed_nasa_delay_story_reproduces_observed_consequence(provider):
    """Real Horizons snapshots, offline. This is regression evidence, not flight validation."""
    directory = Path(__file__).resolve().parents[1] / 'data' / 'processed'
    sources = {
        -89.54: json.loads((directory / 'ephemeris_a3d9a6a8fa47.json').read_text()),
        -86: json.loads((directory / 'ephemeris_b364c8fbf998.json').read_text()),
    }
    def recorded(**params):
        source = sources[params['latitude_deg']]
        assert source['source'] == 'JPL Horizons'
        assert source['start_utc'] == params['start_utc'] and source['end_utc'] == params['end_utc']
        assert source['longitude_deg'] == params['longitude_deg'] and source['step_minutes'] == params['step_minutes']
        return EphemerisResponse(**params, status='ok', points=source['points'],
                                 retrieved_utc=source['retrieved_utc'], request_fingerprint=source.get('request_fingerprint'))
    provider.side_effect = recorded
    run = service.create_study(profile(mission_duration_hours=72, max_delay_hours=72, departure_step_hours=6,
                                      sample_step_minutes=15, sites=[
        dict(key='reference', name='Shackleton reference', latitude_deg=-89.54, longitude_deg=0),
        dict(key='alternative', name='Malapert reference', latitude_deg=-86, longitude_deg=2)],
        constraints=dict(maximum_darkness_hours=6, maximum_earth_outage_hours=8, minimum_joint_visibility_hours=24)))
    cells = {cell.cell_id: cell for cell in run.cells}
    assert cells['reference:d0'].status == 'meets'
    assert cells['reference:d24'].status == 'exceeds'
    assert cells['reference:d24'].metrics.longest_earth_outage_hours == 17.5
    assert cells['reference:d24'].metrics.simultaneous_visibility_hours == 54.5
    assert cells['alternative:d24'].status == 'meets'
    assert cells['alternative:d24'].metrics.longest_earth_outage_hours == 0
    assert cells['alternative:d24'].metrics.simultaneous_visibility_hours == 72
