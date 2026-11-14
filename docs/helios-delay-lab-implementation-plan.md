# HELIOS Delay Lab — implementation plan

Prepared: 14 November 2026
Planning baseline: local Dev commit 6a51937
Primary audience: junior analysts on university lunar-payload teams preparing a first site/date trade study.
Future audience to validate: space-agency interns.
Primary award directions: Best Use of Data and Best Use of Storytelling.
Conditional third direction: Best Use of Science.
Planning assumption: six contributors working in parallel for approximately 12 hours. The six-hour cut is included below.
This document specifies proposed work; its new features are not yet implemented.

## 1. Product decision

Build one coherent workflow:

Mission requirements -> delay stress test -> evidence inspection -> smallest tested recovery -> reproducible decision brief.

Core user question: "Our departure has slipped. Which tested site/date options still meet our declared visibility constraints, and how do we explain the change?"

Product description: HELIOS helps junior lunar mission analysts rehearse schedule changes using NASA ephemerides, inspect lighting and Earth-visibility trade-offs, and prepare an evidence-backed alternative plan.

Use "meets declared constraints under the geometric model." Never use "safe landing," "mission success probability," or "NASA-approved."

Success for the hackathon: a first-time target user can inspect a delayed scenario, select an eligible alternative, and produce a brief explaining the decision and its limitations. A five-minute task completion is a target to measure, not a current performance claim.

## 2. Reuse the existing implementation

Already available in Dev:
- JPL Horizons Sun/Earth retrieval, caching, coordinate conventions, retrieval metadata, and the OS-trust-store TLS fix.
- Member 3's Sun/Earth visualization, including an ephemeris prop suitable for shared selected-cell data.
- Member 4's power/communication module.
- Member 5's comparison forms, custom coordinates, delay shifts, timelines, sampled windows, outage/joint-visibility metrics, provenance, and JSON/CSV exports.
- Backend tests, recorded sample verification, Vite production build, and a root npm dev command.
- Member 6's advisor route and UI scaffolding; the advisor service still returns pending in the inspected Dev snapshot.
- The main app currently mounts modules independently. Shared scenario state and the focused workflow must be added.

An integration issue to fix first: Member 4's current visibility service counts visible samples times the step, including an inclusive end sample. Seven hourly samples over a six-hour window can therefore produce seven hours. Member 5 detects inconsistent summaries and computes clipped interval durations. Consolidate this into one shared calculation engine before adding stress-test recommendations.

Keep the old /api/compare interface working. Add the new workflow alongside it, then make Delay Lab the main entry point. Do not rebuild the 3D engine or replace the frontend framework.

## 3. Scope and release priorities

P0 — required for the focused demonstration:
1. Shared mission profile.
2. One extended dataset per site, evaluated across shifted windows.
3. Site-by-delay matrix with meets/exceeds/unknown states.
4. Cell inspection, binding constraints, and a reference comparison.
5. Deterministic recovery suggestions.
6. Four-step guided replay.
7. Printable decision brief and downloadable run JSON.
8. Real-data fixtures, mathematical tests, user checks, and clear scientific limits.

P1 — after P0 works end to end:
- Five-minute refinement for the selected scenario and final recovery candidates.
- Resolution-sensitivity warnings.
- Saved local profiles/imported run JSON.
- Annotated matrix-to-timeline transitions.
- Comparison of original and revised requirements.

Defer:
- New terrain-shadow solver or DEM pipeline.
- Certified battery, thermal, solar-array, or RF link modeling.
- New eclipse engine.
- Accounts, social features, persistent cloud databases, live collaboration.
- Voice interfaces, a general-purpose chatbot, unrelated animations.
- A continuous-time optimizer or unsupported claims of global novelty.

## 4. Proposed application flow

### A. Mission setup

Fields:
- Mission title.
- Baseline site.
- Allowed alternative sites; catalog or custom coordinates.
- Nominal departure in UTC.
- Mission duration.
- Maximum tested delay.
- Departure-grid spacing.
- Ephemeris sampling interval.
- Maximum continuous sampled darkness.
- Maximum continuous sampled Earth outage.
- Minimum simultaneous geometric Sun/Earth visibility.
- Recovery preference: retain site, or minimize additional waiting.
- Optional mission assumptions/notes.

Thresholds are declared screening requirements. Do not label maximum darkness as proven battery endurance.

Default study: three sites, 72-hour mission, 0–72-hour delay, six-hour departure spacing, 15-minute ephemeris sampling. This produces 13 departure columns and 39 cells.

Guardrails:
- At most three sites and 25 departure columns in the initial release.
- At most 2,000 time intervals per extended site dataset.
- UTC timestamps at whole-minute precision.
- Custom coordinates: latitude [-90,90], east-positive longitude [-180,180], up to six decimal places.
- A minimum joint-visibility threshold cannot exceed the mission duration.
- Null disables a constraint; zero is a real strict threshold.
- Departure spacing must be a multiple of ephemeris spacing for the initial implementation.
- Mission duration must align to the sampling grid in the initial implementation.
- Maximum delay must align to departure spacing.
- Increasing data demand should produce a helpful validation message, never silently coarsen sampling.
- All selected sites and delays share the same duration, sampling method, model, and requirements.

### B. Delay matrix

Rows are sites. Columns are tested departures, labeled both relative to nominal departure and with UTC dates in tooltips/details.

Cell states:
- Meets: every enabled constraint has the required data and passes under the model.
- Exceeds: at least one enabled constraint has a known failing value.
- Unknown: no known constraint fails, but at least one required result is missing.

Add a separate "resolution review" indicator when a comparison at finer resolution changes a result. Exclude unresolved candidates from confident recovery statements.

Use text/icons as well as color. Keyboard users must be able to focus and select cells. Preserve a visible selected-cell state and reference-cell marker.

Clicking a cell must show:
- Exact site coordinates, departure, end, duration, and sampling step.
- Measured constraint values, thresholds, margins, and coverage.
- Continuous sampled darkness and Earth outages.
- Joint visibility duration.
- The relevant timeline and source provenance.
- Differences from the reference cell.
- Explicitly disabled constraints.

A headline can say "First tested constraint-exceeding delay: +18 h." It cannot say "Maximum safe delay: 18 h."

Do not assume conditions worsen monotonically with delay. A later cell can qualify again after an earlier cell fails.

### C. Recovery options

The user identifies the earliest available departure, usually nominal departure plus the actual delay.

A recovery candidate must:
- Start at or after that earliest available departure.
- Use an allowed site.
- Meet all enabled constraints.
- Have complete required data.
- Be evaluated with the same profile/model.
- Have no unresolved resolution-sensitive classification.

Never suggest returning to a nominal departure that is already unavailable.

Preference "retain original site":
1. Same-site candidates before different-site candidates.
2. Least additional waiting within that group.
3. Greatest minimum constraint slack, where all compared slack units are hours.
4. Stable site/cell identifier as the final tie break.

Preference "minimize additional waiting":
1. Least additional waiting.
2. Retain original site on a tie.
3. Greatest minimum slack, then stable identifier.

Return up to three candidates, each explaining:
- What changes.
- What remains fixed.
- Which metrics make it qualify.
- What trade-off remains.
- That it is the smallest tested adjustment under the selected preference, not a continuous/global optimum.

If nothing qualifies, report the searched sites, departure range, and failing/unknown constraints. Do not silently relax requirements.

### D. Replay and brief

Replay has four controlled scenes:
1. Original plan and requirements.
2. Departure delay applied.
3. Measured constraint breach shown on the timeline.
4. Eligible alternative inspected and explained.

Every scene uses a recorded run and its source samples. A narrator/template explains numeric evidence; it does not create it.

The brief includes:
- Mission title, intended user, and training/prototype label.
- Profile and version.
- Original, delayed, and chosen alternatives.
- Declared thresholds and recovery preference.
- Measured values and differences.
- Selection reasoning and rejected alternatives.
- UTC intervals, sampling step, coverage, and horizon model.
- Query fingerprints, retrieval times where recorded, and dataset hashes.
- Known limitations and disabled constraints.
- A reproducible run identifier and algorithm version.

Use an HTML print layout with print CSS and the browser's Save as PDF for the hackathon. Also export complete JSON and window CSV. Public permanent share links require persistent hosting/storage and are not part of P0.

## 5. Scientific kernel and classification

Member 4 owns a shared, pure interval-evaluation module. Extract and reuse the existing comparison interval helpers. Keep wrappers/re-exports where needed to avoid breaking current consumers.

Suggested functions:
- build_visibility_intervals(points, requested_start, requested_end, step)
- clip_intervals(intervals, window_start, window_end)
- summarize_window(intervals, duration)
- evaluate_constraints(metrics, coverage, profile)
- calculate_setting_brackets(intervals)

Rules:
- Intervals are [start,end); an endpoint sample is not another interval.
- Use elapsed duration, not sample counts, for totals.
- Hold the known sampled state across its declared interval.
- Clip at mission boundaries.
- Missing, conflicting, invalid, or non-finite samples are unknown.
- Unknown intervals break continuous windows.
- Compute per-target coverage.
- Withhold full-window metrics requiring unknown coverage.
- A known failing constraint takes precedence over an unknown different constraint.
- Never replace missing values with zero.
- Solar/Earth elevation strictly above zero is the initial airless target-center geometric criterion.
- No terrain horizon, finite disk, eclipses, observer height above actual terrain, electrical output, or link budget is inferred.

For upper limits:
margin_hours = limit_hours - measured_hours

For lower limits:
margin_hours = measured_hours - required_hours

A nonnegative margin passes that constraint. Use an agreed small numeric tolerance for floating-point comparisons. Do not combine hours and percentages into a single unnormalized score.

Compute:
- Sunlit hours and fraction.
- Earth-visible hours and fraction.
- Joint-visibility hours.
- Longest continuous sampled darkness.
- Longest continuous sampled Earth outage.
- Known duration and coverage per required target.
- Observed setting brackets.
- Per-constraint measured value, limit, margin, and status.

Summary per site:
- Meets count.
- Exceeds count.
- Unknown count.
- Total tested departures.
- First tested exceedance after nominal departure.
- Initially consecutive qualifying tested departures.
- Binding constraints and coverage.

Show "10 of 13 tested departures meet constraints; 13 of 13 have known results." Do not describe this as a success probability. If displaying a passing fraction among known cases, display known-case coverage alongside it and never rank an incomplete row as fully robust.

## 6. Efficient data path

For nominal start T0, duration D, maximum delay L, and ephemeris step s:

Request each site's dataset once over [T0, T0+L+D].

Generate offsets 0, departure_step, ..., L. Each cell uses [T0+offset, T0+offset+D].

For the default study:
- Three extended site datasets.
- Two celestial targets per site.
- Approximately six upstream target queries with the current provider.
- 577 sample epochs per site over 144 hours at 15-minute spacing.
- 39 locally evaluated windows.
- No NASA request for each individual cell.

Use bounded, sequential upstream requests initially. Cache hits should avoid upstream traffic entirely. Check cancellation/disconnection between retrieval stages where feasible. A browser abort alone must not be described as proof that server work was stopped.

NASA integration tasks:
- Keep TLS certificate and hostname verification enabled.
- Validate cached source/body/coordinates/window/step metadata.
- Include query-affecting parameters and algorithm/parser version in identities.
- Record raw response signature/API version and the returned ephemeris source identifiers where available.
- Reject unsupported parser versions explicitly rather than interpreting an unfamiliar response.
- Preserve known unavailable states and actionable diagnostics.
- Freeze the verified demo inputs and response samples for repeatable offline operation.

The Horizons API supports the observer/time/coordinate/sampling inputs used here and advises checking response version signatures:
https://ssd-api.jpl.nasa.gov/doc/horizons.html

Performance targets to measure, not promise:
- Cached default matrix calculation: under three seconds on the demo machine.
- Selecting an already computed cell: under 500 ms.
- Switching between matrix, explanation, and timelines must not trigger fresh NASA requests.

## 7. Shared models and APIs

Use a new models/stress_test.py owned by the integration lead with the science lead reviewing units. Avoid simultaneous edits by all six members to the large shared schema file.

MissionProfile:
- profile_id, schema_version, title.
- nominal_start_utc, mission_duration_hours.
- baseline_site_id and allowed SiteReference entries.
- max_delay_hours, departure_step_hours, sample_step_minutes.
- constraints with nullable hour thresholds.
- recovery_preference.
- data_mode: scientific or synthetic, explicitly preserved.

StressTestRun:
- run_id, created_utc, algorithm_version.
- immutable input profile.
- departure offsets.
- sites and per-site summaries.
- compact CellSummary entries.
- provenance/dataset references.
- status and warnings.

CellSummary:
- cell_id, site_id, delay_hours, start_utc, end_utc.
- status: meets/exceeds/unknown.
- resolution_review flag.
- required coverage.
- measured metrics.
- per-constraint evaluations and binding constraint.
- reference comparison deltas.

CellDetail:
- Existing-style EphemerisResponse for Member 3.
- Visibility intervals and operational windows for Member 5.
- Setting brackets and observed outages.
- Coverage, provenance, and warnings.

RecoveryResult:
- selected failed/current cell.
- earliest available departure.
- preference and searched domain.
- ordered candidate cell IDs with deterministic reasons.
- explicit no-match/unknown outcome.

Suggested endpoints:

| Endpoint | Purpose | Owner |
|---|---|---|
| POST /api/stress-tests | Validate a profile, fetch extended data, evaluate and store a run | Member 5 orchestration; Members 2/4 providers |
| GET /api/stress-tests/{run_id} | Reload the stored run without fresh NASA calls | Member 2 storage |
| GET /api/stress-tests/{run_id}/cells/{cell_id} | Selected-window details and ephemeris | Member 5 |
| POST /api/stress-tests/{run_id}/recover | Filter/order existing cells under earliest departure and preference | Member 6 |
| POST /api/stress-tests/{run_id}/brief | Produce structured brief JSON from selected recorded cells | Member 6; Member 5 presentation |

An example request; thresholds are training assumptions, not hardware specifications:

~~~json
{
  "schema_version": "1",
  "title": "University payload delay rehearsal",
  "nominal_start_utc": "2026-11-27T00:00:00Z",
  "mission_duration_hours": 72,
  "baseline_site_id": "candidate_001",
  "sites": [
    {"site_id": "candidate_001"},
    {"site_id": "candidate_002"},
    {"site_id": "candidate_003"}
  ],
  "max_delay_hours": 72,
  "departure_step_hours": 6,
  "sample_step_minutes": 15,
  "constraints": {
    "maximum_darkness_hours": 6,
    "maximum_earth_outage_hours": 8,
    "minimum_joint_visibility_hours": 24
  },
  "recovery_preference": "minimize_additional_waiting",
  "data_mode": "scientific"
}
~~~

Start with JSON run storage under a runtime directory ignored by Git. Use server-generated run IDs, immutable saved inputs, canonical dataset hashes, and an algorithm version. The app must explain expired/missing runs and allow reimporting the exported JSON. Do not add a database solely for the demo.

Preserve /api/compare, /api/conditions, /api/ephemeris, and the current advisor interface. Bridge to the new models instead of creating separate scientific formulas.

## 8. UI architecture and responsibilities

The integration lead creates a MissionRunProvider or equivalent small React context:
- profile draft.
- current run.
- selected cell.
- reference cell.
- selected-cell details.
- earliest available departure.
- recovery preference/results.
- replay scene and request state.

No panel should silently retain an independent hardcoded site/date once a run is selected.

Main layout:
1. A short purpose statement and one illustrative training profile.
2. Mission setup.
3. Delay matrix as the main visual.
4. Selected-cell inspector beside the matrix on desktop, below it on mobile.
5. Recovery choices.
6. Guided replay / decision brief action.
7. Expandable sources, model assumptions, and resolution checks.

Member 3 receives the selected CellDetail.ephemeris through its existing ephemeris prop. Visuals must identify illustrative sizes/terrain and the sampled timestamp.

Member 5 reuses existing metric cards, operational tables, cursor controls, and exports. Comparison of reference and selected cells can remain a detail view; it should not displace the matrix.

Member 6 explanations should be deterministic templates in P0. An optional LLM can paraphrase structured facts later. It must never choose metrics, change constraints, invent sites, or conceal a no-match result.

UX acceptance:
- No important meaning conveyed only by red/green.
- Keyboard-selectable matrix cells and visible focus.
- Selected site, departure, and data mode are always identifiable.
- UTC and east-positive longitude are consistent.
- Synthetic mode is unmistakable and cannot feed a scientific brief.
- Unknown is visually distinct from a failed constraint.
- No unlabelled probability/confidence score.
- Long tables scroll inside the panel; the whole page does not overflow.
- Reduced-motion behavior is respected.
- Data errors preserve entered requirements and offer retry or cached example.

## 9. Six-member work allocation

| Member | Concrete deliverables | Main integration boundary |
|---|---|---|
| 1 — map/integration | Shared state, site picker, focused app flow, routing/navigation, deployment, PR integration | One profile and selected cell across all panels |
| 2 — NASA data | Extended-window retrieval, response/version/provenance checks, cache identity, run storage, frozen demo datasets | Dataset provider; no per-cell NASA calls |
| 3 — visualization/story | Selected-cell horizon view, Sun/Earth replay, four scenes, scientific visual labels | Consume CellDetail.ephemeris |
| 4 — science | Shared duration-weighted kernel, endpoint correction, continuity/coverage rules, constraint evaluation, golden tests | One metrics implementation used by conditions/comparison/stress tests |
| 5 — Ravindu | Stress-test orchestration, delay matrix, cell inspector, reference comparison, brief UI/print/export | Consume shared kernel; emit selected cell and recovery context |
| 6 — advisor | Recovery filtering and ordering, deterministic explanations, no-match handling, structured brief facts | Consume existing evaluated cells, not invented metrics |

Member 5 implementation order:
1. Agree on MissionProfile, CellSummary, CellDetail and selection callbacks.
2. Build a keyboard-usable matrix with explicitly synthetic fixtures.
3. Add POST stress-tests and detail retrieval around Member 2's extended data and Member 4's pure engine.
4. Connect real run data and coverage states.
5. Add reference-cell inspection using existing timelines/cards.
6. Hand Member 6 a stable list of evaluated cells and earliest departure.
7. Render the brief/print view and run exports.
8. Add empty/error/unknown states and mobile behavior.
9. Run end-to-end acceptance and help prepare the verified demo.

## 10. Suggested file ownership

New backend files:
- app/models/stress_test.py — Member 1 contract owner, Member 4 unit review.
- app/services/visibility_intervals.py — Member 4 shared scientific kernel.
- app/services/stress_test.py — Member 5 run orchestration and window evaluation.
- app/services/stress_run_store.py — Member 2 storage/provenance.
- app/services/recovery.py — Member 6.
- app/services/decision_brief.py — Member 6 structured explanations.
- app/api/stress_tests.py — Member 5, lead reviews router registration.
- scripts/verify_delay_demo.py — Members 2/4 reference fixture verification.

New frontend feature:
- features/delay-lab/types.ts — Member 1 contract owner.
- state/MissionRunProvider.tsx — Member 1.
- components/MissionProfileForm.tsx — Member 6 inputs, Member 1 integration.
- components/DelayMatrix.tsx — Member 5.
- components/ScenarioInspector.tsx — Member 5.
- components/RecoveryPanel.tsx — Member 6.
- components/MissionReplay.tsx — Member 3.
- components/DecisionBrief.tsx and brief-print.css — Member 5.
- services/stressTestService.ts — Member 5.

Reuse the existing comparison components rather than duplicating them into a second feature whenever possible.

## 11. Verified demonstration case

Verified during planning on 14 November 2026 using fresh official Horizons data and the existing clipped interval helpers.

Coordinates:
- Shackleton catalog site: latitude -89.54, longitude 0.
- Malapert catalog site: latitude -86, longitude 2.

Model: airless apparent target-center elevation >0 degrees; zero-km reference-ellipsoid observer; 15-minute sample-and-hold intervals; 72-hour mission.

| Scenario | Departure UTC | Longest sampled darkness | Longest sampled Earth outage | Joint visibility |
|---|---|---:|---:|---:|
| Shackleton original | 27 Nov 2026 00:00 | 0 h | 0 h | 72 h |
| Shackleton after +24 h | 28 Nov 2026 00:00 | 0 h | 17.5 h | 54.5 h |
| Malapert after +24 h | 28 Nov 2026 00:00 | 0 h | 0 h | 72 h |

Training constraints: darkness <=6 h; Earth outage <=8 h; joint visibility >=24 h.

Expected model result:
- Original Shackleton scenario meets the selected constraints.
- Delayed Shackleton scenario exceeds the Earth-outage limit.
- Delayed Malapert scenario meets the same constraints.
- At an earliest available departure of 28 November 00:00 UTC, an earlier nominal departure cannot be offered as recovery.
- The explanation must say that this is a geometric screening result, not an approved relocation or landing assessment.

Do not claim Malapert is universally superior. These are specific coordinates, dates, requirements, model, and sampling choices. Save and hash the actual extended datasets as fixtures before presenting.

A second useful test is a no-feasible-alternative profile. Show that the application reports it honestly without weakening constraints.

## 12. Scientific and software acceptance

Member 4:
- Seven hourly epochs over six hours produce six total interval hours.
- Test partial final intervals.
- Test fully visible and fully invisible windows.
- Test multiple separated outages; longest outage is not total outage.
- Test missing samples and target-specific coverage.
- Test zero-degree boundary, invalid angles, non-finite values, and duplicate epochs.
- Test unknown Sun with known Earth, and vice versa.
- Verify matrix cell metrics equal direct evaluation of that exact window.
- Compare prefix/shifted-window evaluation against a simple reference implementation if optimized.
- Test threshold equality and null-disabled constraints.

Member 6:
- Exclude departures earlier than earliest availability.
- Exclude unknown and unresolved refinement cases.
- Test both ordering preferences.
- Test deterministic ties.
- Test no-match without silent requirement relaxation.
- Confirm narrative numbers equal structured values.

Members 1/5:
- Selecting a matrix cell updates all visible panels to the same site/date.
- Changing the profile invalidates old results and explanations.
- A late older request cannot overwrite a newer run.
- Cached cell selection makes no upstream request.
- Keyboard and mobile interactions work.
- Scientific and synthetic runs cannot be mixed in one decision brief.
- JSON export/import preserves the profile, data references, model version, selection, and metrics.
- Print output includes provenance and limitations and fits a readable one-page summary.

Resolution checks:
- Evaluate the final original/delayed/recovery examples at 15 and 5 minutes.
- Show measured changes in durations and event brackets.
- If a constraint classification changes, flag it for review instead of hiding the change.
- Agreement between resolutions is evidence about sampling sensitivity, not a bound on all physical/model error.

Reference checks:
- Keep the existing 84-angle audit.
- Verify parser signature/version.
- Requery a subset of demo epochs.
- Record query parameters, timestamp, tolerance, and API output source.
- Do not describe these as terrain or hardware validation.

## 13. Twelve-hour team schedule

| Time | Team result required |
|---|---|
| 0–1 h | Freeze profile/schema, kernel ownership, demo constraints, and scope. Create branches from Dev. |
| 1–3 h | Member 2 extended-data provider; Member 4 shared kernel; Member 5 matrix fixtures; Member 6 recovery functions; Member 1 shared state; Member 3 selected-cell adapter. |
| 3–5 h | First real three-site/13-departure matrix. One cell drives the inspector and visualization. Existing endpoints still pass. |
| 5–7 h | Recovery shortlist, earliest-departure rule, binding-constraint explanation, and four-scene replay connected. |
| 7–9 h | Decision brief, exports, five-minute checks, complete unknown/error/no-match flows, frozen demo data. |
| 9–10.5 h | Three target-user sessions, one scientific mentor review if available, fix observed blockers. |
| 10.5–12 h | Freeze features; deploy; verify clean-browser/cache-based demo; record pitch; prepare source/AI disclosures and award evidence using the current local submission requirements. |

Integration gates:
- Gate 1: agreed models and units before parallel implementation.
- Gate 2: validated shared interval engine before recommendation claims.
- Gate 3: complete real-data matrix before polishing replay.
- Gate 4: recovery obeys time/constraint rules before creating the decision brief.
- Gate 5: integrated tests and user task before final feature freeze.

Six-hour cut:
- Three catalog sites only.
- One verified profile, editable constraints, and 13 departure columns.
- Matrix, cell timeline, deterministic top recovery, one-page print view.
- A short four-scene guided flow using existing visuals.
- Keep complete provenance and unknown/no-match behavior.
- Defer custom-site stress testing, saved profiles, public sharing, and LLM integration.

## 14. User validation and judging evidence

Recruit three accessible target-like users and one scientific reviewer if possible. Do not claim interviews with NASA personnel unless they occurred.

Task:
"Your proposed departure is delayed by 24 hours. Identify an alternative that meets the declared constraints, explain the reason, and produce a brief."

Record:
- Completion time.
- Whether the selected alternative actually meets the profile under the model.
- Whether the user can identify the binding constraint.
- Whether they understand the geometric/terrain limitation.
- Where they hesitate, misread colors, or lose the selected date.
- Exact feedback and changes made.

If comparing against the existing comparison screen, use equivalent tasks and vary task order to reduce simple learning effects. Describe results as a small usability pilot, not a statistically established speed improvement.

Award evidence:
- Data: transparent source -> sampled intervals -> constraints -> decision, plus a reproducible JSON run.
- Storytelling: a participant-driven original/delay/consequence/recovery narrative with actual data.
- Science: a stated hypothesis, controlled comparison, reference checks, sampling refinement, and explicit limitations.

Possible hypothesis:
"Sites with identical nominal visibility totals can respond differently to a departure delay."
The verified Shackleton/Malapert example supports this specific case. Do not generalize beyond the tested domain.

## 15. Demo and pitch sequence

Show:
1. A junior analyst's 72-hour payload exercise and declared constraints.
2. The original Shackleton case.
3. A 24-hour departure slip.
4. The Earth-outage constraint becoming exceeded in the matrix/timeline.
5. An eligible Malapert alternative at the earliest available departure.
6. The source-backed explanation and printable brief.
7. The sampling/terrain limitation and one no-match example if time permits.

Core pitch:
"HELIOS helps junior lunar mission analysts respond to launch delays. Using NASA ephemerides, it tests site-and-date alternatives against declared lighting and communication constraints, identifies the smallest tested adjustment, and produces a reproducible decision brief. Users can see what changed, why an alternative qualifies, and what the model cannot establish."

Use the available local pitch format/time limit. This schedule is a development proposal, not an assertion of the event's official deadline or submission format.

## 16. Branch and merge workflow

Suggested branches:
- feature/mission-workflow — Member 1.
- feature/extended-ephemeris — Member 2.
- feature/decision-replay — Member 3.
- feature/visibility-kernel — Member 4.
- feature/delay-stress-test — Member 5.
- feature/recovery-advisor — Member 6.

Create each from the current Dev and avoid shared-file ownership conflicts. Merge the contract/shared state and scientific-kernel PRs first, then data provider/orchestration, then UI/recovery/replay/brief.

Update contracts in docs/api-contract.md with each API change. Use small PRs with the exact behavior, tested cases, and limitations. Run the full backend suite and npm run build against the final integrated Dev, not only individual branches.

## 17. Definition of done

The focused release is complete when:
- One shared profile produces the bounded real-data delay matrix.
- Every cell has a traceable deterministic classification.
- Unknown intervals never appear as zero outages or zero darkness.
- A selected cell updates science, comparison, explanation, and replay consistently.
- Recovery uses only eligible allowed sites/departures at or after earliest availability.
- The verified delay/recovery case reproduces under frozen data.
- Finer sampling differences and model limits are visible.
- A reproducible, readable brief exports successfully.
- First-time users can complete the task without developer coaching.
- The integrated tests/build and clean-browser demonstration pass.
- The team can explain why this workflow matters to its chosen user.

It remains a geometric mission-screening and training prototype. Operational mission adoption requires mission-specific terrain, observer-height, finite-disk/occultation, power/thermal, RF, uncertainty, and independent acceptance work beyond this hackathon scope.
