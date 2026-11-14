import type { ScenarioComparison } from "../services/comparisonService";

const utc = (value: string) =>
  new Date(value)
    .toISOString()
    .replace("T", " ")
    .replace(/:00\.000Z$/, " UTC");
const targets = {
  sunlight: "Sunlight",
  earth: "Earth line of sight",
  both: "Sunlight + Earth together",
};

export function OperationalDetails({
  scenario,
  cursor,
}: {
  scenario: ScenarioComparison;
  cursor: number;
}) {
  const instant = Date.parse(scenario.conditions.start_utc) + cursor * 3600000;
  const point = scenario.timeline.find(
    (p) =>
      Date.parse(p.start_utc) <= instant && instant < Date.parse(p.end_utc),
  );
  const angle = (value: number | null | undefined) =>
    value == null ? "Unknown" : `${value.toFixed(2)}°`;
  return (
    <div className="cmp-operations">
      <p className="cmp-caption">
        Elevation at the selected sample: Sun {angle(point?.sun_elevation_deg)}{" "}
        · Earth {angle(point?.earth_elevation_deg)}
      </p>
      <p className="cmp-caption">
        Known duration: Sun {(scenario.sun_coverage_fraction * 100).toFixed(1)}%
        · Earth {(scenario.earth_coverage_fraction * 100).toFixed(1)}%
      </p>
      {(["sunlight", "earth"] as const).map((target) => {
        const next = scenario.setting_transitions.find(
          (transition) =>
            transition.target === target &&
            transition.by_elapsed_hours > cursor,
        );
        return (
          <p className="cmp-caption" key={target}>
            {target === "sunlight"
              ? "Next sampled sunset"
              : "Next sampled Earthset"}
            :{" "}
            {next
              ? `${Math.max(0, next.after_elapsed_hours - cursor).toFixed(2)}–${(next.by_elapsed_hours - cursor).toFixed(2)} h from cursor (${utc(next.after_utc)} → ${utc(next.by_utc)})`
              : "No setting observed in the remaining samples."}
          </p>
        );
      })}
      <details className="cmp-assumptions">
        <summary>Ephemeris provenance</summary>
        <p>
          {scenario.summary_method === "synthetic"
            ? "Synthetic fixture; not astronomical observations."
            : "NASA/JPL Horizons observer ephemeris · Moon (301) · airless target-center angles · reference-ellipsoid altitude 0 km."}
        </p>
        <p>
          Retrieval:{" "}
          {scenario.retrieved_utc
            ? utc(scenario.retrieved_utc)
            : "Timestamp not recorded in this snapshot"}
        </p>
        {scenario.request_fingerprint && (
          <p>
            Stored request: <code>{scenario.request_fingerprint}</code>
          </p>
        )}
        <p>
          Samples are held across each interval. The horizon is geometric;
          terrain and eclipses are not modeled. No setting prediction is made
          beyond known mission data.
        </p>
      </details>
      <details className="cmp-assumptions">
        <summary>
          Sampled operational windows ({scenario.windows.length})
        </summary>
        <p>
          Known above-horizon intervals only. These are geometric visibility
          estimates; terrain, radio link performance, and power hardware are not
          included.
        </p>
        {scenario.windows.length ? (
          <div className="cmp-window-table">
            <table>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Start (UTC)</th>
                  <th>End (UTC)</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {scenario.windows.map((window, i) => (
                  <tr key={`${window.target}-${i}`}>
                    <td>{targets[window.target]}</td>
                    <td>{utc(window.start_utc)}</td>
                    <td>{utc(window.end_utc)}</td>
                    <td>{window.duration_hours.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No known above-horizon windows in the returned data.</p>
        )}
      </details>
    </div>
  );
}
