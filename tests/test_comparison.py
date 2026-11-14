"""Member 5 regression checks; run from backend: python -m unittest discover -s ../tests -v."""

import unittest
from datetime import datetime
from unittest.mock import patch

from fastapi import HTTPException
from httpx import ConnectError
from pydantic import ValidationError

from app.api.comparison import post_compare
from app.api.sites import DEFAULT_SITES
from app.models.schemas import (
    CompareRequest, ConditionsResponse, EphemerisPoint, EphemerisResponse, VisibilityMetrics,
)
from app.services.comparison import compare_scenarios


def scenario(site="candidate_001", **kwargs):
    return dict(site_id=site, start_utc="2026-11-20T00:00:00Z", end_utc="2026-11-23T00:00:00Z", **kwargs)


def request(mode="live", scenarios=None):
    return CompareRequest(scenarios=scenarios or [scenario(), scenario("candidate_002")], data_mode=mode)


def conditions(**params):
    duration = (datetime.fromisoformat(params["end_utc"].replace("Z", "+00:00")) - datetime.fromisoformat(params["start_utc"].replace("Z", "+00:00"))).total_seconds() / 3600
    fraction = 0.5 if params["site_id"] == "candidate_001" else 0.75
    return ConditionsResponse(**params, status="ok", metrics=VisibilityMetrics(
        sunlit_fraction=fraction, earth_visible_fraction=0.8,
        sunlit_hours=duration * fraction, earth_visible_hours=duration * 0.8,
    ))


def ephemeris(**params):
    return EphemerisResponse(**params, status="ok", points=[
        EphemerisPoint(timestamp_utc="2026-11-20T00:00:00Z", sun_elevation_deg=2, earth_elevation_deg=0),
        EphemerisPoint(timestamp_utc="2026-11-20T02:00:00Z", sun_elevation_deg=-1, earth_elevation_deg=1),
    ])


class ValidationTests(unittest.TestCase):
    def test_timezone_normalization(self):
        s = scenario()
        s["start_utc"] = "2026-11-20T05:30:00+05:30"
        self.assertEqual(request(scenarios=[s, scenario()]).scenarios[0].start_utc, "2026-11-20T00:00:00Z")

    def test_invalid_times(self):
        for field, value in [
            ("start_utc", "nonsense"), ("start_utc", "2026-11-20T00:00:00"),
            ("end_utc", "2026-11-20T00:00:00Z"), ("end_utc", "2026-11-19T00:00:00Z"),
            ("end_utc", "2027-01-01T00:00:00Z"),
        ]:
            with self.subTest(value=value), self.assertRaises(ValidationError):
                s = scenario()
                s[field] = value
                request(scenarios=[s, scenario()])

    def test_sample_and_count_limits(self):
        for step in [0, -1, 1441, 1]:
            with self.subTest(step=step), self.assertRaises(ValidationError):
                request(scenarios=[scenario(step_minutes=step), scenario()])
        for count in [0, 1, 5]:
            with self.subTest(count=count), self.assertRaises(ValidationError):
                CompareRequest(scenarios=[scenario()] * count)

    def test_duplicate_and_generated_id_collisions(self):
        for ids in [("same", "same"), ("scenario_2", None)]:
            with self.subTest(ids=ids), self.assertRaises(ValidationError):
                request(scenarios=[scenario(scenario_id=ids[0]), scenario(scenario_id=ids[1])])

    def test_unknown_site_rejected_before_services(self):
        with patch("app.services.comparison.analyze_site_conditions") as analyze:
            with self.assertRaises(HTTPException) as error:
                post_compare(request(scenarios=[scenario("unknown"), scenario()]))
            self.assertEqual(error.exception.status_code, 422)
            analyze.assert_not_called()


class ScientificComparisonTests(unittest.TestCase):
    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=lambda **params: EphemerisResponse(**params, status="unavailable"))
    @patch("app.services.comparison.analyze_site_conditions", side_effect=lambda **params: ConditionsResponse(**params))
    def test_live_pending_is_not_synthetic(self, *_):
        result = compare_scenarios(request())
        self.assertEqual(result.data_mode, "live")
        self.assertEqual(result.status, "pending")
        self.assertTrue(all(s.conditions.metrics.sunlit_fraction is None for s in result.scenarios))
        self.assertTrue(all(s.timeline_status == "unavailable" for s in result.scenarios))
        self.assertIsNone(result.deltas[0].sunlit_percentage_points)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    @patch("app.services.comparison.analyze_site_conditions", side_effect=conditions)
    def test_deltas_and_known_zero(self, analyze, fetch):
        result = compare_scenarios(request())
        delta = result.deltas[0]
        self.assertEqual(result.status, "ok")
        self.assertEqual(delta.sunlit_percentage_points, 25)
        self.assertEqual(delta.sunlit_hours, 18)
        self.assertEqual(delta.earth_visible_percentage_points, 0)
        self.assertEqual(result.results, [s.conditions for s in result.scenarios])
        expected_lon = next(s.longitude_deg for s in DEFAULT_SITES if s.site_id == "candidate_002")
        self.assertEqual(analyze.call_args_list[1].kwargs["longitude_deg"], expected_lon)
        self.assertEqual(fetch.call_count, 2)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    @patch("app.services.comparison.analyze_site_conditions", side_effect=conditions)
    def test_unknown_gaps_and_horizon_threshold(self, *_):
        result = compare_scenarios(request())
        timeline = result.scenarios[0].timeline
        self.assertEqual(result.scenarios[0].timeline_status, "partial")
        self.assertTrue(timeline[0].sunlit)
        self.assertFalse(timeline[0].earth_visible)  # exactly 0 degrees is not visible
        self.assertIsNone(timeline[1].sunlit)
        self.assertFalse(timeline[2].sunlit)
        self.assertTrue(timeline[2].earth_visible)
        self.assertEqual(timeline[2].elapsed_hours, 2)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    @patch("app.services.comparison.analyze_site_conditions", side_effect=conditions)
    def test_final_interval_is_clipped(self, *_):
        s = scenario()
        s["end_utc"] = "2026-11-20T02:30:00Z"
        result = compare_scenarios(request(scenarios=[s, s]))
        self.assertEqual(len(result.scenarios[0].timeline), 3)
        self.assertEqual(result.scenarios[0].timeline[-1].end_utc, s["end_utc"])
        self.assertEqual(result.scenarios[0].duration_hours, 2.5)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    @patch("app.services.comparison.analyze_site_conditions", side_effect=conditions)
    def test_unequal_duration_withholds_hour_delta(self, *_):
        s = scenario("candidate_002")
        s["end_utc"] = "2026-11-24T00:00:00Z"
        result = compare_scenarios(request(scenarios=[scenario(), s]))
        self.assertIsNone(result.deltas[0].sunlit_hours)
        self.assertEqual(result.deltas[0].sunlit_percentage_points, 25)
        self.assertTrue(result.deltas[0].warnings)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ConnectError("offline"))
    @patch("app.services.comparison.analyze_site_conditions", side_effect=ConnectError("offline"))
    def test_upstream_failure_is_explicit(self, *_):
        result = compare_scenarios(request())
        self.assertEqual(result.status, "unavailable")
        self.assertEqual(result.scenarios[0].timeline, [])
        self.assertIsNone(result.deltas[0].sunlit_hours)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    def test_partial_service_failure_preserves_other_scenario(self, _):
        def analyze(**params):
            if params["site_id"] == "candidate_001":
                raise ConnectError("offline")
            return conditions(**params)
        with patch("app.services.comparison.analyze_site_conditions", side_effect=analyze):
            result = compare_scenarios(request())
        self.assertEqual(result.status, "partial")
        self.assertEqual(result.scenarios[1].conditions.metrics.sunlit_fraction, 0.75)
        self.assertIsNone(result.deltas[0].sunlit_percentage_points)

    @patch("app.services.comparison.analyze_site_conditions", side_effect=conditions)
    def test_nonfinite_and_duplicate_samples_are_unknown(self, _):
        def bad_ephemeris(**params):
            data = ephemeris(**params)
            data.points[0].sun_elevation_deg = float("nan")
            data.points.extend([data.points[1], data.points[1]])
            return data
        with patch("app.services.comparison.get_ephemeris_for_site", side_effect=bad_ephemeris):
            result = compare_scenarios(request())
        self.assertIsNone(result.scenarios[0].timeline[0].sunlit)
        self.assertIsNone(result.scenarios[0].timeline[2].earth_visible)

    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    def test_incompatible_models_withhold_differences(self, _):
        def different_model(**params):
            data = conditions(**params)
            if params["site_id"] == "candidate_002":
                data.horizon_model = "terrain"
            return data
        with patch("app.services.comparison.analyze_site_conditions", side_effect=different_model):
            result = compare_scenarios(request())
        self.assertIsNone(result.deltas[0].sunlit_percentage_points)
        self.assertIn("horizon models", result.deltas[0].warnings[0])


class DemoTests(unittest.TestCase):
    def test_demo_is_opt_in_and_labeled(self):
        with patch("app.services.comparison.analyze_site_conditions") as analyze:
            result = compare_scenarios(request("demo"))
        analyze.assert_not_called()
        self.assertEqual(result.status, "ok")
        self.assertTrue(all("NOT NASA" in s.conditions.source for s in result.scenarios))
        self.assertTrue(any("synthetic" in a for a in result.assumptions))

    def test_demo_outside_coverage_is_unknown(self):
        scenarios = [scenario(), scenario("candidate_002")]
        scenarios[1]["start_utc"] = "2026-12-20T00:00:00Z"
        scenarios[1]["end_utc"] = "2026-12-23T00:00:00Z"
        result = compare_scenarios(request("demo", scenarios))
        self.assertEqual(result.status, "partial")
        self.assertIsNone(result.scenarios[1].conditions.metrics.sunlit_fraction)
        self.assertIsNone(result.deltas[0].sunlit_hours)

    def test_delay_preserves_identity_and_changes_demo(self):
        delayed = scenario()
        delayed["start_utc"] = "2026-11-21T00:00:00Z"
        delayed["end_utc"] = "2026-11-24T00:00:00Z"
        result = compare_scenarios(request("demo", [scenario(scenario_id="base"), dict(delayed, scenario_id="delay")]))
        self.assertEqual(result.deltas[0].start_delay_hours, 24)
        self.assertEqual(result.deltas[0].scenario_id, "delay")
        self.assertEqual(result.scenarios[0].duration_hours, result.scenarios[1].duration_hours)
        self.assertTrue(result.deltas[0].sunlit_hours != 0 or result.deltas[0].earth_visible_hours != 0)

    def test_demo_metrics_match_interval_durations(self):
        s = scenario(step_minutes=180)
        s["end_utc"] = "2026-11-20T02:30:00Z"
        result = compare_scenarios(request("demo", [s, s]))
        self.assertEqual(result.scenarios[0].conditions.metrics.sunlit_hours, 2.5)
        self.assertEqual(result.scenarios[0].conditions.metrics.sunlit_fraction, 1)

class FinalizedComparisonTests(unittest.TestCase):
    def test_custom_coordinates_and_validation(self):
        custom = scenario("custom", latitude_deg=-88.1, longitude_deg=-170)
        self.assertEqual(request(scenarios=[custom, scenario()]).scenarios[0].latitude_deg, -88.1)
        for entry in [scenario("custom"), scenario("custom", latitude_deg=-91, longitude_deg=0), scenario(latitude_deg=0, longitude_deg=0)]:
            with self.subTest(entry=entry), self.assertRaises(ValidationError):
                request(scenarios=[entry, scenario()])
        custom["start_utc"] = "2026-11-20T00:00:30Z"
        with self.assertRaises(ValidationError):
            request(scenarios=[custom, scenario()])

    def test_custom_demo_is_rejected(self):
        with self.assertRaises(ValueError):
            compare_scenarios(request("demo", [scenario("custom", latitude_deg=-88, longitude_deg=0), scenario()]))

    @patch("app.services.comparison.analyze_site_conditions", side_effect=lambda **params: ConditionsResponse(**params))
    def test_real_cached_nasa_example_has_complete_metrics(self, _):
        # Uses committed 6-hour NASA Horizons ephemeris fixtures at (-89.54, 0.0) and (-89.45, -137.0)
        scenarios = [
            dict(site_id="custom", scenario_id="cached_001", latitude_deg=-89.54, longitude_deg=0.0,
                 start_utc="2026-11-20T00:00:00Z", end_utc="2026-11-20T06:00:00Z"),
            dict(site_id="custom", scenario_id="cached_002", latitude_deg=-89.45, longitude_deg=-137.0,
                 start_utc="2026-11-20T00:00:00Z", end_utc="2026-11-20T06:00:00Z"),
        ]
        result = compare_scenarios(request(scenarios=scenarios))
        self.assertEqual(result.status, "ok")
        self.assertEqual(result.data_mode, "live")
        self.assertTrue(all(s.summary_method == "comparison_intervals" for s in result.scenarios))
        self.assertTrue(all(s.sun_coverage_fraction == 1 and s.earth_coverage_fraction == 1 for s in result.scenarios))
        self.assertTrue(all(s.conditions.metrics.sunlit_hours <= 6 for s in result.scenarios))
        self.assertTrue(all(s.timeline[0].sun_elevation_deg is not None for s in result.scenarios))
        self.assertEqual(result.scenarios[0].conditions.metrics.sunlit_hours, 6)
        self.assertEqual(result.scenarios[0].conditions.metrics.earth_visible_hours, 6)

    @patch("app.services.comparison.analyze_site_conditions", side_effect=lambda **params: ConditionsResponse(**params))
    def test_duration_weighting_windows_and_bracketed_settings(self, _):
        def samples(**params):
            return EphemerisResponse(**params, status="ok", points=[
                EphemerisPoint(timestamp_utc="2026-11-20T00:00:00Z", sun_elevation_deg=2, earth_elevation_deg=1),
                EphemerisPoint(timestamp_utc="2026-11-20T01:00:00Z", sun_elevation_deg=-1, earth_elevation_deg=1),
                EphemerisPoint(timestamp_utc="2026-11-20T02:00:00Z", sun_elevation_deg=-2, earth_elevation_deg=-1),
            ])
        entries = [scenario(), scenario()]
        for entry in entries:
            entry["end_utc"] = "2026-11-20T02:30:00Z"
        with patch("app.services.comparison.get_ephemeris_for_site", side_effect=samples):
            result = compare_scenarios(request(scenarios=entries))
        first = result.scenarios[0]
        self.assertAlmostEqual(first.conditions.metrics.sunlit_fraction, 0.4)
        self.assertAlmostEqual(first.conditions.metrics.earth_visible_fraction, 0.8)
        self.assertEqual([w.duration_hours for w in first.windows], [1, 2, 1])
        self.assertEqual(first.setting_transitions[0].target, "sunlight")
        self.assertEqual(first.setting_transitions[0].after_elapsed_hours, 0)
        self.assertEqual(first.setting_transitions[0].by_elapsed_hours, 1)

    @patch("app.services.comparison.analyze_site_conditions", side_effect=lambda **params: ConditionsResponse(**params))
    @patch("app.services.comparison.get_ephemeris_for_site", side_effect=ephemeris)
    def test_gaps_break_windows_and_prevent_complete_summary(self, *_):
        result = compare_scenarios(request())
        first = result.scenarios[0]
        self.assertEqual(first.conditions.status, "pending")
        self.assertIsNone(first.conditions.metrics.sunlit_fraction)
        self.assertLess(first.sun_coverage_fraction, 1)
        self.assertEqual(first.windows[0].duration_hours, 1)
        self.assertEqual(first.setting_transitions, [])

    @patch("app.services.comparison.analyze_site_conditions", side_effect=lambda **params: ConditionsResponse(**params))
    def test_response_for_wrong_site_is_not_used(self, _):
        def wrong(**params):
            data = ephemeris(**params)
            data.latitude_deg = 5
            return data
        with patch("app.services.comparison.get_ephemeris_for_site", side_effect=wrong):
            result = compare_scenarios(request())
        self.assertEqual(result.scenarios[0].timeline_status, "unavailable")
        self.assertEqual(result.scenarios[0].sun_coverage_fraction, 0)

    def test_invalid_service_duration_is_replaced_by_complete_intervals(self):
        def invalid(**params):
            return ConditionsResponse(**params, status="ok", metrics=VisibilityMetrics(
                sunlit_fraction=1, earth_visible_fraction=1, sunlit_hours=7, earth_visible_hours=7))
        entries = [
            dict(site_id="custom", scenario_id="cached_001", latitude_deg=-89.54, longitude_deg=0.0,
                 start_utc="2026-11-20T00:00:00Z", end_utc="2026-11-20T06:00:00Z"),
            dict(site_id="custom", scenario_id="cached_002", latitude_deg=-89.45, longitude_deg=-137.0,
                 start_utc="2026-11-20T00:00:00Z", end_utc="2026-11-20T06:00:00Z"),
        ]
        with patch("app.services.comparison.analyze_site_conditions", side_effect=invalid):
            result = compare_scenarios(request(scenarios=entries))
        self.assertTrue(all(s.conditions.metrics.sunlit_hours <= 6 for s in result.scenarios))
        self.assertEqual(result.scenarios[0].summary_method, "comparison_intervals")


if __name__ == "__main__":
    unittest.main()
