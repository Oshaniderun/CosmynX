"""Online reference audit: from backend, python -m scripts.verify_comparison_data."""
import csv
import io
import json
import ssl
from datetime import datetime, timezone
from pathlib import Path

import httpx

from app.services.nasa_data import HORIZONS_API_URL, PROCESSED_DATA_DIR, _parse_utc_iso


def verify():
    snapshots = []
    for path in sorted(PROCESSED_DATA_DIR.glob('ephemeris_*.json')):
        cached = json.loads(path.read_text(encoding='utf-8'))
        if cached.get('start_utc') == '2026-11-20T00:00:00Z' and cached.get('end_utc') == '2026-11-20T06:00:00Z':
            identity = (cached['latitude_deg'], cached['longitude_deg'])
            if identity not in [entry[0] for entry in snapshots]:
                snapshots.append((identity, cached))
    if len(snapshots) != 3:
        raise RuntimeError('Expected the three committed six-hour NASA snapshots')
    comparisons = 0
    maximum_error = 0.0
    with httpx.Client(verify=ssl.create_default_context(), timeout=40) as client:
        for (latitude, longitude), cached in snapshots:
            print(f'Checking {latitude}, {longitude} against official Horizons...', flush=True)
            for target, field in (('10', 'sun'), ('399', 'earth')):
                params = dict(format='json', COMMAND=f"'{target}'", OBJ_DATA='NO', MAKE_EPHEM='YES',
                              EPHEM_TYPE='OBSERVER', CENTER="'coord@301'", COORD_TYPE='GEODETIC',
                              SITE_COORD=f"'{longitude},{latitude},0'", START_TIME="'2026-11-20 00:00'",
                              STOP_TIME="'2026-11-20 06:00'", STEP_SIZE="'60m'", QUANTITIES="'4'",
                              CSV_FORMAT='YES', APPARENT='AIRLESS', TIME_TYPE='UT', ELEV_CUT="'-90'")
                response = client.get(HORIZONS_API_URL, params=params)
                response.raise_for_status()
                payload = response.json()
                if 'error' in payload:
                    raise RuntimeError(payload['error'])
                raw = payload['result'].split('$$SOE', 1)[1].split('$$EOE', 1)[0].strip()
                reference = {}
                for row in csv.reader(io.StringIO(raw)):
                    stamp = datetime.strptime(row[0].strip(), '%Y-%b-%d %H:%M').replace(tzinfo=timezone.utc)
                    reference[stamp] = (float(row[3]), float(row[4]))
                for point in cached['points']:
                    expected = reference[_parse_utc_iso(point['timestamp_utc'])]
                    for index, quantity in enumerate(('azimuth', 'elevation')):
                        error = abs(point[f'{field}_{quantity}_deg'] - expected[index])
                        maximum_error = max(maximum_error, error)
                        comparisons += 1
                        if error > 0.000001:
                            raise AssertionError(f'{field} {quantity} differs by {error} degrees')
    report = dict(verified_utc=datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                  source=HORIZONS_API_URL, sites=len(snapshots), compared_angle_values=comparisons,
                  maximum_absolute_error_deg=maximum_error, tolerance_deg=0.000001,
                  scope='Three catalog sites, seven hourly epochs, Sun and Earth azimuth/elevation',
                  observer='coord@301; geodetic; 0 km reference-ellipsoid altitude; airless; UTC',
                  limitation='Agreement at these epochs is not flight qualification or validation of terrain, power, links, eclipses, or between-sample transitions.')
    destination = Path(__file__).resolve().parents[2] / 'docs' / 'member-5-data-verification.json'
    if destination.exists():
        previous = json.loads(destination.read_text(encoding='utf-8'))
        previous.update(report)
        report = previous
    destination.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    verify()
