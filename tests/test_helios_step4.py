"""Step 4 advisor orchestration and API tests with synthetic, mocked data."""

from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError
import pytest

from app.api.helios import post_recommend
from app.main import app
from app.models.helios_models import HeliosMissionRequirements
from app.models.schemas import ConditionsResponse, LandingSite, VisibilityMetrics
from app.services import helios_advisor
from app.services.helios_advisor import HeliosAdvisorRequest, generate_recommendations
from app.services.helios_interpreter import interpret_mission_requirements


SITES = [
    LandingSite(site_id="a", name="Alpha", latitude_deg=-89.0, longitude_deg=0.0),
    LandingSite(site_id="b", name="Beta", latitude_deg=-88.0, longitude_deg=1.0),
    LandingSite(site_id="c", name="Gamma", latitude_deg=-87.0, longitude_deg=2.0),
]


def conditions(site: LandingSite, sun: float | None, earth: float | None) -> ConditionsResponse:
    return ConditionsResponse(
        site_id=site.site_id,
        latitude_deg=site.latitude_deg,
        longitude_deg=site.longitude_deg,
        start_utc="2026-11-20T00:00:00Z",
        end_utc="2026-11-23T00:00:00Z",
        metrics=VisibilityMetrics(
            sunlit_fraction=sun,
            earth_visible_fraction=earth,
            sunlit_hours=None if sun is None else sun * 72,
            earth_visible_hours=None if earth is None else earth * 72,
        ),
        horizon_model="synthetic",
        status="ok" if sun is not None or earth is not None else "unavailable",
        source="SYNTHETIC TEST FIXTURE — NOT NASA DATA",
    )


def install_data(monkeypatch, data_by_id):
    monkeypatch.setattr(helios_advisor, "get_candidate_landing_sites", lambda: SITES)
    calls = []

    def fake_fetch(sites, start_utc, duration_hours):
        calls.append((sites, start_utc, duration_hours))
        return data_by_id

    monkeypatch.setattr(helios_advisor, "evaluate_all_candidate_sites", fake_fetch)
    return calls


def all_conditions(sun=0.8, earth=0.9):
    return {site.site_id: conditions(site, sun, earth) for site in SITES}


def test_valid_mission_request_runs_complete_workflow(monkeypatch):
    calls = install_data(monkeypatch, all_conditions())
    result = generate_recommendations(
        HeliosAdvisorRequest(mission_description="Balanced site, at least 60% sunlight for 72-hour mission")
    )
    assert result.status == "ok"
    assert result.requirements.objective.value == "balanced"
    assert result.requirements.minimum_sunlight_pct == 60
    assert result.mission_window["end_utc"] == "2026-11-23T00:00:00Z"
    assert len(result.evaluation.eligible) == 3
    assert len(calls) == 1


def test_natural_language_interpretation_is_included(monkeypatch):
    install_data(monkeypatch, all_conditions())
    result = generate_recommendations(
        HeliosAdvisorRequest(query="Prioritize Earth visibility; require at least 70% sunlight")
    )
    assert result.interpretation.extracted_objective.value == "maximize_earth_visibility"
    assert result.requirements.minimum_sunlight_pct == 70


def test_ambiguous_mission_stops_before_scientific_fetch(monkeypatch):
    calls = install_data(monkeypatch, all_conditions())
    result = generate_recommendations(
        HeliosAdvisorRequest(query="Prioritize sunlight but Earth visibility is my main priority")
    )
    assert result.status == "ambiguous"
    assert result.evaluation is None
    assert not calls


def test_invalid_mission_stops_before_scientific_fetch(monkeypatch):
    calls = install_data(monkeypatch, all_conditions())
    result = generate_recommendations(HeliosAdvisorRequest(query="At least 140% sunlight"))
    assert result.status == "invalid"
    assert result.evaluation is None
    assert not calls


def test_missing_objective_uses_documented_model_default(monkeypatch):
    install_data(monkeypatch, all_conditions())
    result = generate_recommendations(HeliosAdvisorRequest(query="At least 50% sunlight"))
    assert result.status == "ok"
    assert result.requirements.objective.value == "maximize_sunlight"
    assert result.requirements.objective == HeliosMissionRequirements().objective


def test_successful_scientific_data_retrieval_and_mission_window(monkeypatch):
    calls = install_data(monkeypatch, all_conditions())
    result = generate_recommendations(
        HeliosAdvisorRequest(query="A balanced landing site", start_utc="2026-12-01T12:00:00Z", mission_duration_hours=24)
    )
    assert result.mission_window == {
        "start_utc": "2026-12-01T12:00:00Z",
        "end_utc": "2026-12-02T12:00:00Z",
    }
    assert calls[0][2] == 24


def test_unavailable_scientific_data_is_reported_without_fabricating_values(monkeypatch):
    unavailable = {
        site.site_id: conditions(site, None, None).model_copy(update={"status": "unavailable"})
        for site in SITES
    }
    install_data(monkeypatch, unavailable)
    result = generate_recommendations(HeliosAdvisorRequest(query="Balanced landing site"))
    assert result.status == "insufficient_data"
    assert all(item.metrics.sunlit_fraction is None for item in result.evaluation.insufficient_data)
    assert all(item.metrics.earth_visible_fraction is None for item in result.evaluation.insufficient_data)


def test_all_candidates_eligible(monkeypatch):
    install_data(monkeypatch, all_conditions())
    result = generate_recommendations(HeliosAdvisorRequest(query="Balanced landing site"))
    assert len(result.evaluation.eligible) == len(SITES)
    assert not result.evaluation.disqualified
    assert not result.evaluation.insufficient_data


def test_all_candidates_disqualified(monkeypatch):
    install_data(monkeypatch, all_conditions(sun=0.1, earth=0.2))
    result = generate_recommendations(
        HeliosAdvisorRequest(query="At least 50% sunlight and 60% Earth visibility")
    )
    assert result.status == "no_match"
    assert len(result.evaluation.disqualified) == len(SITES)


def test_all_candidates_insufficient_data(monkeypatch):
    data = {site.site_id: conditions(site, None, None) for site in SITES}
    install_data(monkeypatch, data)
    result = generate_recommendations(HeliosAdvisorRequest(query="Balanced landing site"))
    assert result.status == "insufficient_data"
    assert len(result.evaluation.insufficient_data) == len(SITES)


def test_mixed_candidate_outcomes(monkeypatch):
    data = {
        SITES[0].site_id: conditions(SITES[0], 0.9, 0.9),
        SITES[1].site_id: conditions(SITES[1], 0.2, 0.9),
        SITES[2].site_id: conditions(SITES[2], None, 0.9),
    }
    install_data(monkeypatch, data)
    result = generate_recommendations(
        HeliosAdvisorRequest(query="At least 50% sunlight and 80% Earth visibility")
    )
    assert len(result.evaluation.eligible) == 1
    assert len(result.evaluation.disqualified) == 1
    assert len(result.evaluation.insufficient_data) == 1


def test_known_failure_and_missing_metric_is_disqualified(monkeypatch):
    data = {site.site_id: conditions(site, 0.9, 0.5) for site in SITES}
    data[SITES[0].site_id] = conditions(SITES[0], None, 0.5)
    install_data(monkeypatch, data)
    result = generate_recommendations(
        HeliosAdvisorRequest(query="At least 80% Earth visibility")
    )
    assert result.evaluation.disqualified[0].site_id == SITES[0].site_id
    assert result.evaluation.disqualified[0].metrics.sunlit_fraction is None


def test_provenance_is_preserved_for_synthetic_fixture(monkeypatch):
    install_data(monkeypatch, all_conditions())
    result = generate_recommendations(HeliosAdvisorRequest(query="Balanced landing site"))
    provenance = result.evaluation.eligible[0].provenance
    assert provenance.source == "SYNTHETIC TEST FIXTURE — NOT NASA DATA"
    assert provenance.is_synthetic is True
    assert any("SYNTHETIC TEST FIXTURE" in warning for warning in provenance.warnings)


def test_no_fabricated_measurements_and_scientific_limitations(monkeypatch):
    data = all_conditions()
    data[SITES[0].site_id] = conditions(SITES[0], None, 0.9)
    install_data(monkeypatch, data)
    result = generate_recommendations(HeliosAdvisorRequest(query="At least 80% Earth visibility"))
    candidate = next(x for x in result.evaluation.insufficient_data if x.site_id == SITES[0].site_id)
    assert candidate.metrics.sunlit_fraction is None
    assert any("not generated electrical power" in item for item in result.limitations)
    assert any("not RF link reliability" in item for item in result.limitations)


def test_geometric_visibility_terminology_and_unsupported_reliability(monkeypatch):
    install_data(monkeypatch, all_conditions())
    result = generate_recommendations(
        HeliosAdvisorRequest(query="Prioritize comms reliability and Earth visibility")
    )
    assert any("Communications reliability" in item for item in result.unsupported_requirements)
    assert any("geometric Earth line-of-sight" in item for item in result.interpretation.interpretation_notes)


def test_interpreter_supported_requirement_only():
    result = interpret_mission_requirements("At least 70% sunlight")
    assert result.status == "success"
    assert result.extracted_min_sunlight_pct == 70
    assert result.unsupported_requirements == []
    assert result.clarification_questions == []


def test_interpreter_unsupported_requirement_only_requires_clarification():
    result = interpret_mission_requirements("Avoid steep slopes")
    assert result.status == "partial"
    assert result.unsupported_requirements
    assert result.clarification_questions


def test_interpreter_supported_and_unsupported_requires_clarification():
    result = interpret_mission_requirements("At least 70% sunlight and avoid steep slopes")
    assert result.status == "partial"
    assert result.extracted_min_sunlight_pct == 70
    assert result.unsupported_requirements
    assert result.clarification_questions


def test_interpreter_multiple_unsupported_requirements_are_listed():
    result = interpret_mission_requirements("Avoid steep slopes and water ice deposits")
    assert len(result.unsupported_requirements) >= 2
    assert result.clarification_questions


def test_interpreter_empty_input_requires_clarification():
    result = interpret_mission_requirements("")
    assert result.status == "no_requirements"
    assert result.clarification_questions


def test_unsupported_requirement_stops_scientific_retrieval_even_with_explicit_settings(monkeypatch):
    calls = install_data(monkeypatch, all_conditions())
    result = generate_recommendations(
        HeliosAdvisorRequest(
            query="At least 70% sunlight and avoid steep slopes",
            minimum_earth_visibility_pct=80.0,
        )
    )
    assert result.status == "needs_clarification"
    assert result.interpretation.extracted_min_sunlight_pct == 70
    assert result.unsupported_requirements
    assert result.evaluation is None
    assert not calls


@pytest.mark.parametrize("status", ["pending", "unavailable"])
def test_non_ok_status_with_non_null_metrics_never_gets_ranked(monkeypatch, status):
    data = all_conditions()
    for site in SITES[:2]:
        data[site.site_id] = conditions(site, 0.95, 0.95).model_copy(update={"status": status})
    install_data(monkeypatch, data)
    result = generate_recommendations(HeliosAdvisorRequest(query="Balanced landing site"))

    by_id = {item.site_id: item for item in result.evaluation.insufficient_data}
    assert set(by_id) == {"a", "b"}
    for candidate in by_id.values():
        assert candidate.rank is None
        assert candidate.score is None
        assert candidate.metrics.sunlit_fraction == 0.95
        assert candidate.metrics.earth_visible_fraction == 0.95
        assert candidate.provenance.status == status
    assert [item.site_id for item in result.evaluation.eligible] == ["c"]


def test_api_endpoint_success(monkeypatch):
    install_data(monkeypatch, all_conditions())
    with TestClient(app) as client:
        response = client.post(
            "/api/helios/recommend",
            json={"mission_description": "Balanced landing site for a 72-hour mission"},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert len(body["evaluation"]["eligible"]) == 3
    assert body["evaluation"]["eligible"][0]["provenance"]["source"].startswith("SYNTHETIC")


def test_api_validation_errors():
    with TestClient(app) as client:
        response = client.post("/api/helios/recommend", json={"minimum_sunlight_pct": 101})
    assert response.status_code == 422


def test_api_invalid_interpretation_returns_422(monkeypatch):
    install_data(monkeypatch, all_conditions())
    with pytest.raises(HTTPException) as exc:
        post_recommend(HeliosAdvisorRequest(query="At least 150% sunlight"))
    assert exc.value.status_code == 422
    assert exc.value.detail["status"] == "invalid"


def test_api_clarification_required_response(monkeypatch):
    calls = install_data(monkeypatch, all_conditions())
    with TestClient(app) as client:
        response = client.post(
            "/api/helios/recommend",
            json={"mission_description": "At least 70% sunlight and avoid steep slopes"},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "needs_clarification"
    assert body["clarification_questions"]
    assert body["unsupported_requirements"]
    assert body["interpretation"]["extracted_min_sunlight_pct"] == 70
    assert body["evaluation"] is None
    assert not calls


def test_api_unavailable_data_is_a_successful_structured_response(monkeypatch):
    install_data(monkeypatch, {site.site_id: conditions(site, None, None) for site in SITES})
    response = post_recommend(HeliosAdvisorRequest(query="Balanced landing site"))
    assert response.status == "insufficient_data"
