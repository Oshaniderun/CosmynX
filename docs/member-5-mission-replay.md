# Member 5 — Compact Mission Replay

Branch: `feature/scenario_improve`. Audience: junior mission analysts and university payload teams explaining why a departure slip changes a lunar visibility window.

## Try the data story

1. Open the running app, choose **Site workspace**, then **Run NASA delay story · 24 h**. This replaces the old two-step cached-example action.
2. The editor collapses automatically and the existing results area opens **Mission replay**. **Edit scenarios** reopens the inputs; no additional full-length dashboard is added.
3. Press **Play mission**. A synchronized playhead follows stored elapsed-time samples across all scenarios. Playback slows briefly at each known visibility change so the audience can read the consequence. It never fabricates intermediate astronomical measurements.
4. **Next event** jumps directly to a sampled transition; the keyboard-accessible slider inspects individual sample boundaries. Actual UTC times differ between rows because departure dates differ.
5. In the recorded example, **Next event** reaches mission hour +54.5: Earth is below the geometric horizon at B, while A and C still see Earth. The transition is bracketed between samples, not presented as an exact continuous-time Earthset.
6. **Full JSON** exports the complete comparison plus `replay_inspection`: selected elapsed time, each scenario's UTC time, original sample interval, nullable measurements and any transition brackets at that moment. Inspect another time and export again to retain that evidence. CSV export remains unchanged.

**Metrics & differences** retains the comparison table, with detailed cards behind a disclosure. **Timelines & windows** retains the original charts and operational windows. Only the active view renders. Playback pauses when switching views, scrolling the replay out of view, or hiding the browser tab. It stops at the last source sample rather than looping. Operating-system reduced-motion preferences disable autoplay and transitions; the slider and event jump remain usable.

## Scientific scope

Gold tracks show sampled Sun visibility and cyan tracks show sampled Earth visibility. Dim bands mean below the geometric horizon. Hatched bands and unknown readouts remain distinct from false or zero; ended mission windows are explicitly marked. The small gauges show elevation only, clipped at ±10° with fixed horizontal body positions. They are not an azimuth sky map. Visual movement between stored samples is illustrative. No terrain, power hardware, RF reliability or mission-safety prediction is added.

Member 5 explicitly requests `scientific_only=True` from the position and conditions services. This disables Dev's analytical fallback for scientific comparisons; missing NASA data stays unknown. Other modules retain their existing default fallback behavior. The explicit synthetic preview remains labeled separately.

Where complete source intervals exist, Member 5 reconciles summary totals with its held-interval replay model if the conditions service's interpolated totals differ. `summary_method` and warnings record this comparison-only calculation. This prevents displaying joint duration greater than total Earth visibility merely because two sampling models were mixed. Member 4's standalone interpolated power/visibility model is unchanged.

Transitions require known adjacent samples with a shared interval boundary. Unknown time cannot generate an event. Unequal mission durations are not extrapolated. Labels and exports use original sampled elevations, not animated screen coordinates. Equal mission hours align operational duration, not simultaneous absolute time.

## The real NASA example

Custom reference coordinates are separate from mutable catalog IDs and are not certified landing points. Friendly reference labels in the replay appear only for the exact custom coordinate pairs below; coordinates remain visible.

| Scenario | Coordinates (latitude, east longitude) | Departure UTC | Duration | Longest Earth interruption | Joint Sun/Earth visibility |
|---|---|---|---|---|---|
| A, Shackleton reference | −89.54°, 0° | 27 Nov 2026 00:00 | 72 h | 0 h | 72 h |
| B, same point delayed | −89.54°, 0° | 28 Nov 2026 00:00 | 72 h | 17.5 h | 54.5 h |
| C, Malapert reference | −86°, 2° | 28 Nov 2026 00:00 | 72 h | 0 h | 72 h |

Three complete datasets were retrieved directly from NASA JPL Horizons on 14 November 2026 UTC (15 November in Sri Lanka), with TLS verification enabled. Each contains 289 epochs at 15-minute spacing, including the exclusive mission-end snapshot. Endpoint samples add no duration. The app can replay this committed example without new NASA requests:

- `data/processed/ephemeris_3248dc19bccb.json`: A.
- `data/processed/ephemeris_6c77eefe6ef5.json`: B.
- `data/processed/ephemeris_705bfa0f0e0f.json`: C.

Stored metadata records JPL Horizons, Moon body 301, east-positive longitude, AIRLESS observation and 0 km observer altitude relative to the reference ellipsoid. Other locations/dates require their own matching NASA data. No observations from these three points establish landing safety.

## Validation and pitch

Run `npm run test:replay` from `frontend` (Node 22.18+), then `npm run build`. Pure replay tests cover shifted UTC windows, half-open boundaries, short missions ending, unknown gaps, unavailable sources, overlapping samples, transition brackets, compressed SVG tracks, exported inspections and the actual NASA example's first Earthset contrast. Run the backend suite with `python -m pytest -q`; an integration regression forces NASA offline and verifies that scientific comparisons do not invoke the analytical model.

Browser checks exercise play/pause, the transition jump, manual slider inspection, view switching, editor reopening and mobile overflow. No new animation dependency or 3D engine is introduced; the replay uses React and SVG, and makes no network requests while playing.

Pitch the causal question: **"A payload is ready one day late. What changes in its operating window?"** Show the same point before/after the shift, pause at the Earthset bracket, then compare the alternate point under the same duration and delayed date. Export that paused evidence. This makes NASA data accessible and communicates a verifiable data story, consistent with the published [Best Use of Data and Best Use of Storytelling descriptions](https://www.spaceappschallenge.org/nasa-space-apps-2024/awards/). It is a competition differentiator to demonstrate and validate, not a guarantee of an award.
