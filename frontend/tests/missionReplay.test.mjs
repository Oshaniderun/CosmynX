import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  replayEvents,
  replayFrame,
  replayStops,
  visibilitySegments,
  captureReplayInspection,
} from "../src/features/comparison/services/missionReplay.ts";

test("exported replay evidence retains unknowns and does not extrapolate ended windows", () => {
  const a = {
    ...scenario([interval(0, 1)], 1),
    conditions: { start_utc: "2026-11-27T00:00:00Z" },
  };
  const b = {
    ...scenario([interval(0, 1), interval(2, 3)], 3, "B"),
    conditions: { start_utc: "2026-11-28T00:00:00Z" },
  };
  const snapshot = captureReplayInspection([a, b], 1.5);
  assert.equal(snapshot.scenarios[0].status, "window_ended");
  assert.equal(snapshot.scenarios[0].inspected_utc, "2026-11-27T01:00:00.000Z");
  assert.equal(snapshot.scenarios[1].status, "unknown");
  assert.equal(snapshot.scenarios[1].inspected_utc, "2026-11-28T01:30:00.000Z");
  assert.equal(snapshot.scenarios[1].sunlit, null);
  assert.equal(snapshot.scenarios[1].sample_start_utc, null);
});

function interval(
  start,
  end,
  sun = true,
  earth = true,
  base = "2026-11-27T00:00:00Z",
) {
  return {
    elapsed_hours: start,
    start_utc: new Date(Date.parse(base) + start * 3600000).toISOString(),
    end_utc: new Date(Date.parse(base) + end * 3600000).toISOString(),
    sunlit: sun,
    earth_visible: earth,
    sun_elevation_deg: sun === null ? null : sun ? 1 : -1,
    earth_elevation_deg: earth === null ? null : earth ? 1 : -1,
  };
}
function scenario(timeline, duration = 4, id = "A") {
  return {
    scenario_id: id,
    duration_hours: duration,
    timeline_status: "ok",
    timeline,
  };
}

test("one elapsed-time cursor aligns independent UTC mission windows", () => {
  const a = scenario([interval(0, 1), interval(1, 2, false, true)], 2);
  const b = scenario(
    [
      interval(0, 1, true, true, "2026-11-28T00:00:00Z"),
      interval(1, 2, true, false, "2026-11-28T00:00:00Z"),
    ],
    2,
    "B",
  );
  assert.deepEqual(replayStops([a, b]), [0, 1]);
  assert.equal(replayFrame(a, 1).sunlit, false);
  assert.equal(replayFrame(b, 1).earth_visible, false);
  assert.notEqual(replayFrame(a, 1).start_utc, replayFrame(b, 1).start_utc);
});
test("half-open mission intervals never extend a short scenario", () => {
  const a = scenario([interval(0, 1), interval(1, 2, false)], 2);
  const b = scenario([interval(0, 1), interval(1, 2), interval(2, 3)], 3, "B");
  assert.deepEqual(replayStops([a, b]), [0, 1, 2]);
  assert.equal(replayFrame(a, 2), null);
  assert.equal(replayFrame(a, -1), null);
  assert.equal(replayFrame(b, 2).sunlit, true);
});
test("unknown gaps do not become false or narrated transitions", () => {
  const sample = scenario([interval(0, 1), interval(2, 3, false)], 4);
  assert.equal(replayFrame(sample, 1.5), null);
  assert.deepEqual(replayEvents([sample]), []);
  const unknown = scenario(
    [interval(0, 1), interval(1, 2, null, null), interval(2, 3, false, false)],
    3,
  );
  assert.deepEqual(replayEvents([unknown]), []);
});
test("an unavailable source remains unknown even if stale points exist", () => {
  const sample = {
    ...scenario([interval(0, 1)]),
    timeline_status: "unavailable",
  };
  assert.equal(replayFrame(sample, 0), null);
  assert.deepEqual(visibilitySegments(sample, "sunlit"), []);
  assert.deepEqual(replayEvents([sample]), []);
});
test("overlapping interval matches are ambiguous instead of choosing an arbitrary sample", () => {
  assert.equal(
    replayFrame(scenario([interval(0, 2), interval(1, 3, false)]), 1),
    null,
  );
});
test("events use only known adjacent target states and retain uncertainty brackets", () => {
  const sample = scenario(
    [interval(0, 1, true, null), interval(1, 2, false, true)],
    2,
  );
  const events = replayEvents([sample]);
  assert.equal(events.length, 1);
  assert.deepEqual(events[0], {
    hour: 1,
    scenarioId: "A",
    body: "sunlit",
    visible: false,
    afterUtc: sample.timeline[0].start_utc,
    byUtc: sample.timeline[1].start_utc,
  });
});
test("track compression preserves gaps, unknown states and visibility changes", () => {
  const sample = scenario(
    [
      interval(0, 1),
      interval(1, 2),
      interval(2, 3, null),
      interval(3, 4, false),
      interval(5, 6, false),
    ],
    6,
  );
  assert.deepEqual(visibilitySegments(sample, "sunlit"), [
    { start: 0, end: 2, state: true },
    { start: 2, end: 3, state: null },
    { start: 3, end: 4, state: false },
    { start: 5, end: 6, state: false },
  ]);
});
test("the committed NASA story reaches the observed 54.5-hour Earthset contrast", () => {
  const files = [
    "ephemeris_3248dc19bccb.json",
    "ephemeris_6c77eefe6ef5.json",
    "ephemeris_705bfa0f0e0f.json",
  ];
  const scenarios = files.map((file, i) => {
    const source = JSON.parse(
      readFileSync(
        new URL(`../../data/processed/${file}`, import.meta.url),
        "utf8",
      ),
    );
    assert.equal(source.source, "JPL Horizons");
    assert.equal(source.apparent, "AIRLESS");
    assert.equal(source.points.length, 289);
    return scenario(
      source.points.slice(0, -1).map((point, index) => ({
        ...interval(
          index / 4,
          (index + 1) / 4,
          point.sun_elevation_deg > 0,
          point.earth_elevation_deg > 0,
          source.start_utc,
        ),
        sun_elevation_deg: point.sun_elevation_deg,
        earth_elevation_deg: point.earth_elevation_deg,
      })),
      72,
      String.fromCharCode(65 + i),
    );
  });
  const first = replayEvents(scenarios)[0];
  assert.equal(first.scenarioId, "B");
  assert.equal(first.hour, 54.5);
  assert.equal(first.body, "earth_visible");
  assert.equal(first.visible, false);
  assert.deepEqual(
    scenarios.map((s) => replayFrame(s, 54.5).earth_visible),
    [true, false, true],
  );
  assert.equal(first.afterUtc, "2026-11-30T06:15:00.000Z");
  assert.equal(first.byUtc, "2026-11-30T06:30:00.000Z");
});
