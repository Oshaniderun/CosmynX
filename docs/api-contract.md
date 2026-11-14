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
