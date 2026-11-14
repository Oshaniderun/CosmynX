# HELIOS Shared API Contract

Base URL (local): `http://localhost:8000`

| Endpoint | Method | Owner | Purpose |
|---|---|---|---|
| `/api/health` | GET | Member 1 | Basic backend health check |
| `/api/sites` | GET | Member 1 / 2 | Retrieve available lunar landing sites |
| `/api/ephemeris` | GET | Member 2 / 3 | Retrieve Sun/Earth position data |
| `/api/conditions` | GET | Member 4 | Retrieve sunlight and communication metrics |
| `/api/compare` | POST | Member 5 | Compare selected landing scenarios |
| `/api/helios/recommend` | POST | Member 6 | Generate ranked landing recommendations |

## Conventions
- **Timestamps**: UTC in ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`).
- **Coordinates**: Decimal degrees (`latitude_deg`, `longitude_deg`).
- **Angles**: Degrees.
- **Durations**: Hours.
- **Visibility Fractions**: `0.0` to `1.0` (UI calculates percentages from these).

## Scenario comparison (Member 5)

`POST /api/compare` retains `scenarios` input and `results` output. It also supports optional scenario IDs, explicit `data_mode` (`live` by default, `demo` for synthetic fixtures), custom coordinates (`site_id: "custom"` with latitude and east-positive longitude), per-scenario visibility intervals with sampled elevation angles, coverage, operational windows, setting-time brackets, summary calculation method, and differences against the first scenario. Fraction differences use percentage points; durations use hours. Missing values remain null.

See [the comparison contract and HELIOS handoff](member-5-comparison.md) for request examples, validation limits, result fields, provenance, and sampling assumptions.

Comparison results also expose nullable `simultaneous_visibility_hours`, `longest_darkness_hours`, and `longest_earth_outage_hours`, plus optional Horizons `retrieved_utc` and `request_fingerprint`. Continuity totals require complete relevant timeline coverage. Custom coordinates support at most six decimal places.
