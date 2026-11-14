"""Unit tests for Member 2 — NASA Data Integration & Analytical Lunar Ephemeris."""

import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import httpx

from app.services import nasa_data
from app.services.lunar_ephemeris import compute_analytical_lunar_ephemeris


class NasaDataTests(unittest.TestCase):
    def test_parse_horizons_timestamp_and_csv(self):
        self.assertEqual(
            nasa_data._parse_horizons_timestamp("2026-Nov-20 00:00"),
            "2026-11-20T00:00:00Z",
        )

        sample_result = (
            "Header\n$$SOE\n"
            "2026-Nov-20 00:00,*,*,51.749641,4.025900,\n"
            "bad,line\n"
            "2026-Nov-20 01:00,*,*,51.243075,4.053386,\n"
            "$$EOE\nFooter"
        )
        parsed = nasa_data._parse_horizons_csv(sample_result)
        self.assertEqual(
            parsed,
            {
                "2026-11-20T00:00:00Z": (51.749641, 4.0259),
                "2026-11-20T01:00:00Z": (51.243075, 4.053386),
            },
        )

    def test_fetch_ephemeris_uses_cache_without_network(self):
        with tempfile.TemporaryDirectory() as tmpdir, patch.object(
            nasa_data, "PROCESSED_DATA_DIR", Path(tmpdir)
        ), patch.object(nasa_data, "_query_horizons_target") as query_mock:
            cache_file = nasa_data._cache_path(
                -87.5, -5.0, "2026-11-20T00:00:00Z", "2026-11-20T01:00:00Z", 60
            )
            cached_points = [
                {
                    "timestamp_utc": "2026-11-20T00:00:00Z",
                    "sun_azimuth_deg": 59.0,
                    "sun_elevation_deg": 2.8,
                    "earth_azimuth_deg": 358.0,
                    "earth_elevation_deg": 6.3,
                }
            ]
            cache_file.write_text(
                json.dumps(
                    {
                        "source": "JPL Horizons",
                        "body": "Moon (301)",
                        "longitude_convention": "East-positive (-180 to 180 deg)",
                        "latitude_deg": -87.5,
                        "longitude_deg": -5.0,
                        "start_utc": "2026-11-20T00:00:00Z",
                        "end_utc": "2026-11-20T01:00:00Z",
                        "step_minutes": 60,
                        "points": cached_points,
                    }
                ),
                encoding="utf-8",
            )

            points = nasa_data.fetch_jpl_horizons_ephemeris(
                -87.5, -5.0, "2026-11-20T00:00:00Z", "2026-11-20T01:00:00Z", 60
            )
            self.assertEqual(points, cached_points)
            query_mock.assert_not_called()

    def test_fetch_ephemeris_queries_sun_and_earth_and_caches(self):
        def fake_query(target_command, **_kwargs):
            if target_command == nasa_data.SUN_COMMAND:
                return {"2026-11-20T00:00:00Z": (60.0, 3.0)}
            return {"2026-11-20T00:00:00Z": (355.0, 6.5)}

        with tempfile.TemporaryDirectory() as tmpdir, patch.object(
            nasa_data, "PROCESSED_DATA_DIR", Path(tmpdir)
        ), patch.object(
            nasa_data, "_query_horizons_target", side_effect=fake_query
        ) as query_mock:
            points = nasa_data.fetch_jpl_horizons_ephemeris(
                -87.5, -5.0, "2026-11-20T00:00:00Z", "2026-11-20T01:00:00Z", 60
            )
            self.assertEqual(query_mock.call_count, 2)
            self.assertEqual(len(points), 1)
            self.assertEqual(points[0]["sun_azimuth_deg"], 60.0)
            self.assertEqual(points[0]["earth_elevation_deg"], 6.5)

            cache_file = nasa_data._cache_path(
                -87.5, -5.0, "2026-11-20T00:00:00Z", "2026-11-20T01:00:00Z", 60
            )
            self.assertTrue(cache_file.exists())

    def test_fetch_ephemeris_falls_back_offline_without_writing_cache(self):
        with tempfile.TemporaryDirectory() as tmpdir, patch.object(
            nasa_data, "PROCESSED_DATA_DIR", Path(tmpdir)
        ), patch.object(
            nasa_data,
            "_query_horizons_target",
            side_effect=httpx.ConnectError("offline"),
        ):
            points = nasa_data.fetch_jpl_horizons_ephemeris(
                -87.5, -5.0, "2026-11-20T00:00:00Z", "2026-11-20T06:00:00Z", 60
            )
            self.assertEqual(len(points), 7)
            cache_file = nasa_data._cache_path(
                -87.5, -5.0, "2026-11-20T00:00:00Z", "2026-11-20T06:00:00Z", 60
            )
            self.assertFalse(cache_file.exists())


class AnalyticalLunarEphemerisTests(unittest.TestCase):
    def test_analytical_ephemeris_matches_jpl_cache_within_one_degree(self):
        cache_path = (
            Path(__file__).resolve().parent.parent
            / "data"
            / "processed"
            / "ephemeris_03ef4c76fec2.json"
        )
        jpl = json.loads(cache_path.read_text(encoding="utf-8"))
        analytical = compute_analytical_lunar_ephemeris(
            latitude_deg=jpl["latitude_deg"],
            longitude_deg=jpl["longitude_deg"],
            start_utc=jpl["start_utc"],
            end_utc=jpl["end_utc"],
            step_minutes=jpl["step_minutes"],
        )

        self.assertEqual(len(analytical), len(jpl["points"]))
        for calc, ref in zip(analytical, jpl["points"]):
            self.assertEqual(calc["timestamp_utc"], ref["timestamp_utc"])
            self.assertLess(abs(calc["sun_elevation_deg"] - ref["sun_elevation_deg"]), 1.0)
            self.assertLess(abs(calc["earth_elevation_deg"] - ref["earth_elevation_deg"]), 1.0)
            self.assertTrue(0.0 <= calc["sun_azimuth_deg"] < 360.0)
            self.assertTrue(0.0 <= calc["earth_azimuth_deg"] < 360.0)

    def test_analytical_ephemeris_invalid_window_returns_empty(self):
        self.assertEqual(
            compute_analytical_lunar_ephemeris(
                -87.5, -5.0, "2026-11-20T06:00:00Z", "2026-11-20T00:00:00Z", 60
            ),
            [],
        )
