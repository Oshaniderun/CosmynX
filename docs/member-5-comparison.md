# Member 5 — Scenario Comparison & Timelines

The main Member 5 interface is now the **[HELIOS Delay Lab](member-5-delay-lab.md)** with a site/departure stress matrix, animated inspection and reproducible decision brief. The original panel described below is retained under **Advanced side-by-side comparison**.

Owner: Ravindu. Branch: `feature/scenario-comparison` (renamed from `Ravindu`). Integrated `Dev` commit `51c22f6`, including NASA retrieval, Member 3 visualizations, and Member 4 analysis, on 14 November 2026. No other members’ feature branches were merged separately.

## Run and try it

Use the frontend and backend setup in the main README. The comparison panel is already mounted in `App.tsx`; no application-shell changes are required.

1. Start the backend: from `backend`, run `python -m uvicorn app.main:app --reload`.
2. Start the frontend: from `frontend`, run `npm install`, then `npm run dev`.
3. Scroll to **Compare your next move**. Choose two to four sites/date windows and press **Compare scenarios**.
4. For a working interface preview, explicitly choose **Synthetic demo preview**. Its invented values are not NASA measurements. Default demo dates are 20–23 November 2026 UTC; coverage ends at 4 December 2026 00:00 UTC (exclusive).
5. Set a delay in hours and press **Apply to B**. B copies A's site, duration, and sampling resolution, then shifts both UTC endpoints. Press **Compare scenarios** again.
6. Use timeline range controls and the shared inspection cursor. JSON export contains the complete structured result and provenance.

Scientific services are the default. Member 2’s real Horizons retrieval and Member 3’s updated visualizations are integrated from Dev. Member 4’s conditions service is now integrated from Dev. Member 5 validates its returned metrics and derives comparison-only duration-weighted summaries from complete real ephemeris intervals when those metrics are unavailable, pending, incomplete, or inconsistent with mission duration. This also prevents an inclusive endpoint sample from being counted as an extra duration bin. The Member 4 implementation is preserved as merged from Dev. Each result identifies `summary_method`. Incomplete intervals never produce full-mission fallback metrics, and live requests never switch to synthetic values.

Press **Load cached NASA example · 6 hours**, then **Compare scenarios** to use the committed real Horizons data for 20 November 2026, 00:00–06:00 UTC. This does not require a fresh NASA request. New locations/dates require the upstream service and network. The frontend can cancel a request and enforces a four-minute timeout; validation errors from the API are displayed directly.

For custom comparisons, select **Custom lunar coordinates** in scientific mode. Enter latitude in [-90, 90] and east-positive longitude in [-180, 180]. Delay-to-B preserves custom coordinates. Synthetic mode supports only the three catalog sites.

## API and HELIOS handoff

`POST /api/compare` accepts the existing `scenarios` array, with optional `scenario_id`, custom coordinate fields, and optional top-level `data_mode` (`live` by default). Existing consumers can continue reading `results`.

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
- `summary_method`: `conditions_service`, `comparison_intervals`, or `synthetic`.
- `sun_coverage_fraction`, `earth_coverage_fraction`: duration-weighted proportions with known timeline states.
- `windows`: contiguous sampled above-horizon intervals for `sunlight`, `earth`, or `both`, with UTC endpoints and duration. Unknown intervals split windows.
- `setting_transitions`: observed true-to-false brackets between adjacent known samples, retaining both UTC and elapsed-hour bounds. These are not exact sunset/Earthset times or predictions beyond the mission.
- Each timeline interval now includes nullable `sun_elevation_deg` and `earth_elevation_deg` for the cursor’s sampled angle readout. Invalid angles outside [-90, 90] are unknown.
- `data_mode`, `assumptions`: explicit provenance and interpretation rules.

Member 6 can consume `compare_scenarios(request)` in Python, JSON export, or the optional React `ComparisonPanel` `onComparison(result)` callback. Recommendations must accept only `data_mode == "live"`, `conditions.status == "ok"`, and complete required metrics. Do not treat deltas as ranking scores. Filter and rank according to the advisor's own mission constraints.

Validation: 2–4 scenarios; unique effective scenario IDs; known catalog sites, or `site_id: "custom"` with both `latitude_deg` and `longitude_deg` (catalog coordinates cannot be overridden); timezone-aware ISO timestamps at whole-minute precision normalized to UTC; end after start; windows at most 31 days; step 1–1440 minutes; at most 2,000 timeline intervals per scenario. Invalid requests return 422. Unknown sites never fall back to invented coordinates. Per-scenario scientific-service failures preserve other available results.

## Scientific assumptions

Live summary metrics prefer Member 4’s `analyze_site_conditions` when all required measurements are present, finite, consistent with mission duration, and identify the requested scenario. Otherwise, the comparison module uses its own complete timeline intervals to compute each visible duration and divide it by the full mission duration. Endpoint samples are never counted as an extra time bin. Partial data cannot be presented as a full-mission fraction. The response records the calculation method and warning. It never changes another member’s analysis service.

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


## Resource review and final scope

Reviewed the supplied resources on 14 November 2026:

- [JPL Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html) and [official API](https://ssd-api.jpl.nasa.gov/doc/horizons.html): observer-table quantity 4 provides apparent azimuth/elevation relative to the local horizontal plane. Lunar comparisons use airless target-center elevations; no terrestrial atmospheric refraction correction is applied. A >0° center-angle threshold is an explicitly simplified model, not a terrain-aware limb or eclipse model. A cached Shackleton solar sample (20 November 2026 00:00 UTC: 1.817654°) was independently checked against the official live API during verification.
- [LROC QuickMap](https://quickmap.lroc.im-ldi.com/) and [provider documentation](https://files.actgate.com/quickmap/LROC_QuickMap_Oct2020/index.html): imagery, numeric terrain layers, and profiles support site inspection. Member 5 links to this resource but does not claim to ingest its terrain or calculate terrain horizons.
- [NASA Moon Trek](https://trek.nasa.gov/moon/) and [NASA Treks](https://trek.nasa.gov/home/): imagery and elevation-profile tools provide spatial/terrain context. The comparison panel links to these rather than presenting imagery as evidence of an unobstructed view.
- [CSA Moon exploration](https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/): mission and exploration context; it is not a source of numerical ephemerides.

The finalized Member 5 scope is rapid comparison of sites, custom coordinates, dates, delays, sampled elevations, operational windows, setting-time brackets, and structured handoff to HELIOS. It does not take ownership of the lunar map, terrain horizon solver, hardware power model, radio link budget, AI advisor, or Member 3’s eclipse replay. In particular, the comparison’s positive solar elevation threshold is not an eclipse/illumination solver. Terrain, eclipses, observer height, finite target disks, and hardware constraints require further modeling before mission use.

## Accuracy audit and interface update — 14 November 2026

The numerical source is real JPL Horizons in scientific mode; synthetic mode remains explicitly opt-in. The [recorded verification](member-5-data-verification.json) compares **84 azimuth/elevation values** from all three original six-hour snapshots against fresh official API responses. Maximum difference was **0.0 degrees at the returned precision**, with a 0.000001-degree comparison tolerance. This verifies those samples, not every location, date, or operational prediction.

A previously uncached 21–24 November 2026 comparison succeeded for two sites, returning 72 complete hourly intervals per site. The secure client now uses Python’s default OS certificate context (certificate and hostname verification remain required); the earlier bundled-CA path failed on this Windows environment. Cache keys retain the six decimal places sent to Horizons. New and legacy entries must match their exact coordinate, window, step, body, convention, and source metadata before reuse. Custom comparison coordinates are limited to six decimal places. Retrieved time and request fingerprint are retained where available; older snapshots explicitly have no recorded retrieval time.

Sampling matters: at Malapert Massif, an actual solar crossing was bracketed at **3 December 2026 10:00–11:00 UTC** with hourly data. Five-minute data narrowed the bracket to **10:00–10:05 UTC**. This is a bracket, not a validated exact event time or terrain-shadow result. Five-minute sampling is available within the existing 2,000-interval limit.

The overview adds simultaneous geometric Sun/Earth visibility, longest contiguous sampled darkness, and longest contiguous sampled Earth outage. These are duration-weighted estimates, withheld when relevant coverage is unknown. Scenario duplication and baseline promotion simplify exploration. Results are separated into details and timelines, with CSV window export, JSON export, and provenance.

Rerun the online reference audit from `backend` with `python -m scripts.verify_comparison_data`. The offline suite also covers nearby-site cache collisions, mismatched legacy metadata, TLS verification, explicit airless UTC queries, coordinate precision, and outage continuity.

## Operational readiness boundary

This application is a **research and mission-screening prototype**, not an approved flight or landing-decision system. Using NASA ephemerides and passing software tests do not establish mission suitability.

The responsible project must define acceptance criteria and independently validate the model for its intended use. [NASA-STD-7009B](https://standards.nasa.gov/standard/NASA/NASA-STD-7009) describes modeling/simulation credibility practices and project-defined acceptance; this repository has not demonstrated compliance or received NASA approval.

Engineering extensions include terrain/DEM horizon masks and observer height; finite Sun/Earth disks and occultation/eclipse treatment; validated event solving and uncertainty/convergence studies; actual power/thermal and radio link-budget constraints; agreed coordinate frames and mission margins; and independent mission-specific review. These extend beyond Member 5’s geometric comparison module. Sampled outages must not be interpreted as proven battery or communication safety margins.
