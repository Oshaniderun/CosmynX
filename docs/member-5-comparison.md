# Member 5 — Scenario Comparison & Timelines

Owner: Ravindu. Branch: `Ravindu` (created from `main`).

## Run and try it

Use the frontend and backend setup in the main README. The comparison panel is already mounted in `App.tsx`; no application-shell changes are required.

1. Start the backend: from `backend`, run `python -m uvicorn app.main:app --reload`.
2. Start the frontend: from `frontend`, run `npm install`, then `npm run dev`.
3. Scroll to **Compare your next move**. Choose two to four sites/date windows and press **Compare scenarios**.
4. For a working interface preview, explicitly choose **Synthetic demo preview**. Its invented values are not NASA measurements. Default demo dates are 20–23 November 2026 UTC; coverage ends at 4 December 2026 00:00 UTC (exclusive).
5. Set a delay in hours and press **Apply to B**. B copies A's site, duration, and sampling resolution, then shifts both UTC endpoints. Press **Compare scenarios** again.
6. Use timeline range controls and the shared inspection cursor. JSON export contains the complete structured result and provenance.

Scientific services are the default. Member 2's NASA retrieval and Member 4's conditions service remain placeholders on the base branch, so live mode correctly shows pending/unknown until their implementations are integrated. There is no automatic switch to demo values.

## API and HELIOS handoff

`POST /api/compare` accepts the existing `scenarios` array, with optional `scenario_id` and optional top-level `data_mode` (`live` by default). Existing consumers can continue reading `results`.

```json
{
  "data_mode": "live",
  "scenarios": [
    {
      "scenario_id": "baseline",
      "site_id": "candidate_001",
      "start_utc": "2026-11-20T00:00:00Z",
      "end_utc": "2026-11-23T00:00:00Z",
      "step_minutes": 60
    },
    {
      "scenario_id": "delayed",
      "site_id": "candidate_001",
      "start_utc": "2026-11-21T00:00:00Z",
      "end_utc": "2026-11-24T00:00:00Z",
      "step_minutes": 60
    }
  ]
}
```

Additive response fields:

- `scenarios`: input-order entries identified by `scenario_id`, each containing the original `conditions`, `duration_hours`, site name, visibility `timeline`, `timeline_status`, `timeline_source`, and warnings.
- `timeline`: explicit `[start_utc, end_utc)` intervals with `elapsed_hours`, nullable `sunlit`, and nullable `earth_visible`. Missing states remain `null`, distinct from `false`.
- `deltas`: alternatives minus the first scenario, with start delay in hours, sunlight/Earth fraction differences in **percentage points**, and duration differences in hours. Differences remain null when metrics are missing, either scenario is not `ok`, or horizon models differ. Hour differences are also withheld for unequal mission durations.
- `status`: `ok`, `partial`, `pending`, or `unavailable` for summary conditions. Each timeline has its own availability status.
- `data_mode`, `assumptions`: explicit provenance and interpretation rules.

Member 6 can consume `compare_scenarios(request)` in Python, JSON export, or the optional React `ComparisonPanel` `onComparison(result)` callback. Recommendations must accept only `data_mode == "live"`, `conditions.status == "ok"`, and complete required metrics. Do not treat deltas as ranking scores. Filter and rank according to the advisor's own mission constraints.

Validation: 2–4 scenarios; unique effective scenario IDs; known catalog sites; timezone-aware ISO timestamps normalized to UTC; end after start; windows at most 31 days; step 1–1440 minutes; at most 2,000 timeline intervals per scenario. Invalid requests return 422. Unknown sites never fall back to invented coordinates. Per-scenario scientific-service failures preserve other available results.

## Scientific assumptions

Live summary metrics are passed through from Member 4's `analyze_site_conditions`. The comparison module does not recalculate their durations or fill their missing values.

Live timelines consume Member 3's `get_ephemeris_for_site`, requiring `status == "ok"`. At each requested timestamp, a finite Sun/Earth elevation strictly greater than zero means geometrically visible. Exactly zero or negative means below the horizon. Missing, malformed, non-finite, or duplicate samples remain unknown. Samples must match the requested timestamp grid; no interpolation is performed.

Each state is held to the next requested step, clipped at the end of the mission. This is a sampled visualization, not a precise transition solver. Timelines align on elapsed mission hours; hover/inspection retains absolute UTC times. Unknown gaps are not connected. At the exclusive mission endpoint, the inspection readout is unknown. Coarse sampling may miss short transitions.

Geometric timelines do not model terrain, power hardware, or link budgets. The response retains the summary horizon model separately; differing summary models are not directly compared. Demo mode uses a deliberately invented 26-hour on/off pattern to exercise delay and chart controls. It has no astronomical interpretation.

## Verification

From `backend`:

```bash
python -m unittest discover -s ../tests -v
```

From `frontend`:

```bash
npm run build
```

The regression suite covers UTC normalization, invalid ranges and sampling, unknown/duplicate identities, delta direction and zero values, missing samples, exact-horizon states, clipped intervals, upstream failures, incompatible models, unequal durations, explicit demo provenance/coverage, and mission-delay effects.
