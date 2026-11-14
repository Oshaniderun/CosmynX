"""Regression checks for NASA request identity, TLS, and comparison continuity."""
import json
import os
import ssl
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from pydantic import ValidationError

from app.models.schemas import ScenarioInput, VisibilityInterval
from app.services import nasa_data
from app.services.comparison_analysis import continuity_metrics


class DataIntegrityTests(unittest.TestCase):
    def test_nearby_sites_do_not_share_new_cache_key(self):
        args = (0, '2026-11-20T00:00:00Z', '2026-11-20T06:00:00Z', 60)
        self.assertNotEqual(nasa_data._cache_path(-89.540001, *args), nasa_data._cache_path(-89.540002, *args))
        self.assertEqual(nasa_data._cache_path(-89.540001, *args, legacy=True), nasa_data._cache_path(-89.540002, *args, legacy=True))

    def test_legacy_cache_metadata_must_match_exact_coordinates_and_window(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'legacy.json'
            payload = dict(source='JPL Horizons', body='Moon (301)', longitude_convention='East-positive (-180 to 180 deg)', latitude_deg=-89.540001,
                           longitude_deg=0, start_utc='2026-11-20T00:00:00Z', end_utc='2026-11-20T06:00:00Z', step_minutes=60, points=[])
            path.write_text(json.dumps(payload), encoding='utf-8')
            args = (0, payload['start_utc'], payload['end_utc'], 60)
            self.assertIsNotNone(nasa_data._matching_cache(path, -89.540001, *args))
            self.assertIsNone(nasa_data._matching_cache(path, -89.540002, *args))
            self.assertIsNone(nasa_data._matching_cache(path, -89.540001, 0, payload['start_utc'], '2026-11-21T06:00:00Z', 60))
            payload['start_utc'] = 42
            path.write_text(json.dumps(payload), encoding='utf-8')
            self.assertIsNone(nasa_data._matching_cache(path, -89.540001, 0, '2026-11-20T00:00:00Z', payload['end_utc'], 60))

    @patch.dict(os.environ, {'SSLKEYLOGFILE': ''})
    @patch('app.services.nasa_data.httpx.get')
    def test_requests_keep_tls_verification_and_explicit_airless_utc(self, get):
        get.return_value.json.return_value = {'result': '$$SOE\n2026-Nov-20 00:00,*,i,53.607749,1.817654,\n$$EOE'}
        data = nasa_data._query_horizons_target("'10'", -89.54, 0, '2026-11-20T00:00:00Z', '2026-11-20T01:00:00Z', 60)
        options = get.call_args.kwargs
        self.assertIsInstance(options['verify'], ssl.SSLContext)
        self.assertEqual(options['verify'].verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(options['verify'].check_hostname)
        self.assertEqual(options['params']['APPARENT'], 'AIRLESS')
        self.assertEqual(options['params']['TIME_TYPE'], 'UT')
        self.assertEqual(data['2026-11-20T00:00:00Z'], (53.607749, 1.817654))

    def test_coordinate_precision_is_explicit(self):
        with self.assertRaises(ValidationError):
            ScenarioInput(site_id='custom', latitude_deg=-89.5400001, longitude_deg=0, start_utc='2026-11-20T00:00:00Z', end_utc='2026-11-21T00:00:00Z')


class ContinuityTests(unittest.TestCase):
    @staticmethod
    def intervals(states):
        return [VisibilityInterval(start_utc=f'2026-11-20T{i:02}:00:00Z', end_utc=f'2026-11-20T{i+1:02}:00:00Z', elapsed_hours=i,
                                   sunlit=sun, earth_visible=earth) for i, (sun, earth) in enumerate(states)]

    def test_longest_outages_are_contiguous_and_joint_is_intersection(self):
        result = continuity_metrics(self.intervals([(False, True), (False, False), (True, False), (True, True), (False, True)]), 5)
        self.assertEqual(result['longest_darkness_hours'], 2)
        self.assertEqual(result['longest_earth_outage_hours'], 2)
        self.assertEqual(result['simultaneous_visibility_hours'], 1)

    def test_unknown_target_withholds_only_affected_results(self):
        result = continuity_metrics(self.intervals([(None, False), (True, False)]), 2)
        self.assertIsNone(result['longest_darkness_hours'])
        self.assertIsNone(result['simultaneous_visibility_hours'])
        self.assertEqual(result['longest_earth_outage_hours'], 2)

    def test_all_visible_means_zero_sampled_outage(self):
        result = continuity_metrics(self.intervals([(True, True), (True, True)]), 2)
        self.assertEqual(result['longest_darkness_hours'], 0)
        self.assertEqual(result['longest_earth_outage_hours'], 0)
        self.assertEqual(result['simultaneous_visibility_hours'], 2)
