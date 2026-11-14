# Member 5 — HELIOS Delay Lab

Owner: Ravindu. Branch: `feature/scenario-comparison`. Implements the Member 5 core of the [Delay Lab plan](helios-delay-lab-implementation-plan.md) on top of integrated Dev `53e7210`.

## Audience and workflow

For junior mission analysts and university lunar-payload teams rehearsing a departure delay. Define visibility requirements, test a site/departure grid, inspect its limiting constraint, compare eligible tested alternatives, and explain the evidence in a printable decision brief. The app defaults to **Compare → Sites & dates**; the Delay Lab is directly available in **Delay analysis**.

1. Start the backend and frontend using the README. Open `http://127.0.0.1:5173`.
2. Select **Delay analysis** beside **Sites & dates**.
3. Press **Run delay example** to load and evaluate the recorded reference profile in one action. **Compare delays** evaluates the currently selected profile. **Edit study** reveals sites, dates, sampling and requirements; the compact summary always shows the active sites, window and limits.
4. Inspect Shackleton at +24 h, then Malapert at +24 h. All three constraints remain the same.
5. Open **Decision replay** and use **Play decision story** for a four-scene presentation, **Animate delay sweep** to inspect successive departure columns, or **Play time** to move through sampled Sun/Earth elevations. Each stops at its end and can be paused. Manual selection stops competing playback. Opening the brief or leaving Delay analysis stops playback.
6. Use arrow keys in the matrix, the mission sample slider, or the scene buttons. **Reduce animation** disables autoplay and transitions; operating-system reduced-motion preferences always take precedence. Manual controls remain available.
7. Export **Evidence JSON**, or open **Decision brief** and **Print / Save PDF**. The brief includes original, delayed and inspected metrics, declared requirements, margins, coordinates, source provenance, dataset hash and limitations.

The inspected cell changes independently of the shared dashboard. **Use this site & window in dashboard** explicitly copies the selected coordinates, UTC interval and sampling step to the other members' panels.

## Reproducible NASA reference story

These are explicitly named custom reference points, **not catalog IDs or certified landing sites**. This avoids relabeling measurements when the catalog changes.

- Shackleton reference: latitude −89.54°, east longitude 0°.
- Malapert reference: latitude −86°, east longitude 2°.
- Nominal departure: 27 November 2026, 00:00 UTC; mission duration 72 h.
- Departure grid: +0 through +72 h in 6 h increments; source sample step 15 min.
- Illustrative requirements: continuous darkness ≤6 h; Earth visibility interruption ≤8 h; joint visibility ≥24 h. These are training assumptions, not spacecraft specifications.

| Scenario | Darkness | Earth interruption | Joint visibility | Result |
|---|---:|---:|---:|---|
| Shackleton, nominal | 0 h | 0 h | 72 h | Meets |
| Shackleton, +24 h | 0 h | 17.5 h | 54.5 h | Exceeds Earth interruption limit |
| Malapert, +24 h | 0 h | 0 h | 72 h | Meets |

Two committed real Horizons snapshots cover 27 November–3 December 2026 inclusive (577 epochs per site): `data/processed/ephemeris_a3d9a6a8fa47.json` and `data/processed/ephemeris_b364c8fbf998.json`. They were retrieved on 14 November 2026 UTC through the existing NASA data service with certificate validation enabled. The preset can therefore run without a fresh NASA connection. Other profiles need matching cached data or access to Horizons. The offline regression test reproduces the table above.

## Scientific interpretation

One extended ephemeris dataset is fetched per site through Member 3's existing position service, covering nominal departure through maximum delay plus mission duration. All grid cells are evaluated locally from that dataset; each cell inspection and export reads its saved snapshot without another NASA call. The underlying service queries the Sun and Earth separately.

Elevation >0° defines target-center geometric visibility with AIRLESS observer tables and 0 km ellipsoid-relative observer altitude. Samples are held over `[start,end)`; the endpoint never adds duration. Longest darkness and Earth interruption are contiguous, duration-weighted estimates. Joint visibility is the interval intersection. Missing, duplicate, invalid, nonfinite or unavailable measurements remain unknown. A metric needing complete target coverage is withheld if any required time is unknown. A known exceeded constraint takes precedence over an unknown one; a cell meets only if every enabled requirement is known and met. Equality meets a threshold. Disabled constraints are omitted, and zero remains a strict real limit.

The first tested exceedance is reported without assuming that later departures always worsen. The result is a discrete search, not a maximum safe delay, probability of success, continuous-time optimum or flight certification. Terrain horizons, eclipses, finite target disks, RF link budgets, hardware power/endurance and operational safety validation remain outside Member 5. Animated gauges use a clipped ±10° elevation scale and fixed horizontal positions; they are illustrative displays of real sampled elevations, not a spatial sky map or continuous ephemeris solver.

## API and Member 6 handoff

`POST /api/stress-tests` creates a recorded study (201). Example request:

```json
{
  "title": "A 24-hour delay changes the plan",
  "nominal_start_utc": "2026-11-27T00:00:00Z",
  "mission_duration_hours": 72,
  "max_delay_hours": 72,
  "departure_step_hours": 6,
  "sample_step_minutes": 15,
  "baseline_site_key": "ref_shackleton",
  "sites": [
    {"key": "ref_shackleton", "name": "Shackleton reference", "latitude_deg": -89.54, "longitude_deg": 0},
    {"key": "ref_malapert", "name": "Malapert reference", "latitude_deg": -86, "longitude_deg": 2}
  ],
  "constraints": {
    "maximum_darkness_hours": 6,
    "maximum_earth_outage_hours": 8,
    "minimum_joint_visibility_hours": 24
  },
  "data_mode": "scientific"
}
```

Catalog references use `{ "key": "haworth", "site_id": "candidate_001" }` with no coordinate overrides. Runs snapshot the resolved catalog coordinates and labels. Custom references require name and finite latitude/east longitude in ±90°/±180° with at most six decimals. Site keys are unique; coordinate pairs must be distinct. Bounds: 1–3 sites, 1–168 h missions, 0–168 h maximum delay, 1–24 h integer departure spacing, at most 25 columns, 5/15/30/60 min sample steps, at most 2,000 intervals per site. Maximum delay must align to departure spacing. Whole-minute timezone-aware dates normalize to UTC. At least one constraint must be enabled. Invalid requests return 422.

- `GET /api/stress-tests/{run_id}`: original profile, resolved sites, grid cells, row summaries, dataset metadata, assumptions and algorithm version `delay-intervals-v1`.
- `GET /api/stress-tests/{run_id}/cells/{cell_id}`: cell plus the existing Member 5 `ScenarioComparison` contract and clipped ephemeris samples. IDs such as `ref_shackleton:d24` identify explicit tested windows.
- `GET /api/stress-tests/{run_id}/export`: `{format: "helios-delay-study-v1", run, datasets}` with full source snapshots. The UI adds inspected-cell and earliest-availability selection fields when downloading.

Each constraint carries `limit_hours`, nullable `measured_hours`/`margin_hours` and `meets`/`exceeds`/`unknown`. Positive margin meets, negative margin exceeds; disabled constraints are absent. Member 6 should filter for available departure and `status == "meets"` before applying its own recommendation policy. The preview orders eligible cells by departure time, original site on a tie, greatest minimum constraint margin, then stable cell ID. This is transparent screening, not the advisor's ranking implementation. No LLM or Member 4 hardware-model changes are included.

Recorded runs live under ignored `data/processed/delay_runs/`; atomic writes prevent half-saved runs. UUID filenames prevent path traversal. Dataset SHA-256 hashes are verified before serving stored results/details/exports; corruption returns 503, absent runs/cells 404. Hashes detect accidental dataset changes and are not signatures or external authenticity certification. Runtime studies remain local to the server and are not committed. Retain a JSON export to share evidence. Canceling the UI request preserves the form; an in-progress server fetch may still finish caching data.

## Validation

Install test dependencies with `python -m pip install -r backend/requirements-dev.txt`, then run `python -m pytest -q` from the repository root; `npm run build` from `frontend`. Tests cover request bounds, exact threshold equality, strict zero/disabled constraints, nonmonotonic delay rows, interval endpoint duration, missing/invalid/source-mismatched data, known failure with another unknown constraint, one fetch per site, offline cell inspection/export, coordinate snapshots, dataset corruption, API status codes and the real NASA reference story. Browser checks cover selection, keyboard navigation, playback, decision brief and responsive layout. This validates prototype behavior within the stated geometric model.

This implements Member 5's delay-grid, inspection, evidence and story workflow. Independent higher-resolution verification, terrain/hardware validation, advisor integration, shared imported-run workflows and the other members' work remain separate tasks in the full team plan.
