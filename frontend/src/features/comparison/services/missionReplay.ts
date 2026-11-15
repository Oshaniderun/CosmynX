import type {
  ScenarioComparison,
  VisibilityInterval,
} from "./comparisonService";

export type Body = "sunlit" | "earth_visible";
export interface ReplayEvent {
  hour: number;
  scenarioId: string;
  body: Body;
  visible: boolean;
  afterUtc: string;
  byUtc: string;
}
export interface VisibilitySegment {
  start: number;
  end: number;
  state: boolean | null;
}

const endHour = (point: VisibilityInterval) =>
  point.elapsed_hours +
  (Date.parse(point.end_utc) - Date.parse(point.start_utc)) / 3600000;
const validInterval = (point: VisibilityInterval, duration: number) =>
  Number.isFinite(point.elapsed_hours) &&
  point.elapsed_hours >= 0 &&
  Number.isFinite(endHour(point)) &&
  endHour(point) > point.elapsed_hours &&
  endHour(point) <= duration + 1e-8;

/** Stored interval boundaries only. No interpolated astronomical measurements. */
export function replayStops(scenarios: ScenarioComparison[]): number[] {
  const stops = new Set([0]);
  for (const scenario of scenarios) {
    for (const point of scenario.timeline) {
      if (validInterval(point, scenario.duration_hours))
        stops.add(point.elapsed_hours);
    }
    // Mark shorter missions ending while another scenario continues.
    if (
      scenario.duration_hours <
      Math.max(...scenarios.map((s) => s.duration_hours))
    )
      stops.add(scenario.duration_hours);
  }
  return [...stops].sort((a, b) => a - b);
}

export function replayFrame(
  scenario: ScenarioComparison,
  hour: number,
): VisibilityInterval | null {
  if (
    scenario.timeline_status === "unavailable" ||
    hour < 0 ||
    hour >= scenario.duration_hours
  )
    return null;
  const matches = scenario.timeline.filter(
    (point) =>
      validInterval(point, scenario.duration_hours) &&
      hour >= point.elapsed_hours &&
      hour < endHour(point),
  );
  return matches.length === 1 ? matches[0] : null;
}

/** Unknown gaps and nonadjacent samples never become a narrated setting/rising event. */
export function replayEvents(scenarios: ScenarioComparison[]): ReplayEvent[] {
  const events: ReplayEvent[] = [];
  for (const scenario of scenarios) {
    if (scenario.timeline_status === "unavailable") continue;
    for (let i = 1; i < scenario.timeline.length; i++) {
      const previous = scenario.timeline[i - 1],
        current = scenario.timeline[i];
      if (
        !validInterval(previous, scenario.duration_hours) ||
        !validInterval(current, scenario.duration_hours) ||
        previous.end_utc !== current.start_utc
      )
        continue;
      for (const body of ["sunlit", "earth_visible"] as const) {
        const before = previous[body],
          after = current[body];
        if (before !== null && after !== null && before !== after)
          events.push({
            hour: current.elapsed_hours,
            scenarioId: scenario.scenario_id,
            body,
            visible: after,
            afterUtc: previous.start_utc,
            byUtc: current.start_utc,
          });
      }
    }
  }
  return events.sort(
    (a, b) =>
      a.hour - b.hour ||
      a.scenarioId.localeCompare(b.scenarioId) ||
      a.body.localeCompare(b.body),
  );
}

/** Merge equal neighbours for a lightweight SVG; preserve unknown stretches and holes. */
export function visibilitySegments(
  scenario: ScenarioComparison,
  body: Body,
): VisibilitySegment[] {
  if (scenario.timeline_status === "unavailable") return [];
  const segments: VisibilitySegment[] = [];
  for (const point of scenario.timeline) {
    if (!validInterval(point, scenario.duration_hours)) continue;
    const last = segments[segments.length - 1];
    if (
      last &&
      Math.abs(last.end - point.elapsed_hours) < 1e-8 &&
      last.state === point[body]
    )
      last.end = endHour(point);
    else
      segments.push({
        start: point.elapsed_hours,
        end: endHour(point),
        state: point[body],
      });
  }
  return segments;
}

/** Preserve the inspected moment in the existing JSON export, without new UI. */
export function captureReplayInspection(
  scenarios: ScenarioComparison[],
  hour: number,
) {
  return {
    elapsed_hours: hour,
    alignment: "elapsed_mission_hours",
    scenarios: scenarios.map((scenario) => {
      const point = replayFrame(scenario, hour);
      const ended = hour >= scenario.duration_hours;
      return {
        scenario_id: scenario.scenario_id,
        inspected_utc: new Date(
          Date.parse(scenario.conditions.start_utc) +
            Math.min(hour, scenario.duration_hours) * 3600000,
        ).toISOString(),
        status: ended ? "window_ended" : point ? "sampled" : "unknown",
        sample_start_utc: point?.start_utc ?? null,
        sample_end_utc: point?.end_utc ?? null,
        sunlit: point?.sunlit ?? null,
        earth_visible: point?.earth_visible ?? null,
        sun_elevation_deg: point?.sun_elevation_deg ?? null,
        earth_elevation_deg: point?.earth_elevation_deg ?? null,
      };
    }),
    transition_brackets: replayEvents(scenarios).filter(
      (event) => Math.abs(event.hour - hour) < 1e-8,
    ),
  };
}
export type ReplayInspection = ReturnType<typeof captureReplayInspection>;
