import { CheckCircle2, Layers3, ShieldAlert, Signal, Sun } from "lucide-react";
import type { CompareResponse } from "../services/comparisonService";

const hours = (value: number | null) =>
  value === null ? "Unknown" : `${value.toFixed(1)} h`;
const percentage = (value: number | null) =>
  value === null ? "Unknown" : `${(value * 100).toFixed(1)}%`;

export function ComparisonOverview({ result }: { result: CompareResponse }) {
  const complete = result.scenarios.filter(
    (s) => s.conditions.status === "ok" && s.timeline_status === "ok",
  ).length;
  return (
    <div className="cmp-overview">
      <div className="cmp-evidence-strip">
        <span>
          <Layers3 size={15} /> {result.scenarios.length} scenarios
        </span>
        <span>
          <CheckCircle2 size={15} /> {complete}/{result.scenarios.length}{" "}
          complete timelines
        </span>
        <span>
          <ShieldAlert size={15} />{" "}
          {result.data_mode === "demo"
            ? "Synthetic preview"
            : "Geometric screening · not flight validated"}
        </span>
      </div>
      <div className="cmp-overview-heading">
        <div>
          <p className="cmp-eyebrow">TRADE-OFFS AT A GLANCE</p>
          <h3>What changes across your scenarios?</h3>
        </div>
        <p>
          Compare the hours available and the longest sampled interruptions.
        </p>
      </div>
      <div className="cmp-comparison-table">
        <table>
          <caption>
            Sampled mission comparison. Joint visibility means Sun and Earth are
            both above the geometric horizon. Unknown values are not zero.
          </caption>
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col">
                <Sun size={14} /> Sunlight
              </th>
              <th scope="col">
                <Signal size={14} /> Earth view
              </th>
              <th scope="col">Joint visibility</th>
              <th scope="col">Longest darkness</th>
              <th scope="col">Longest Earth outage</th>
            </tr>
          </thead>
          <tbody>
            {result.scenarios.map((scenario, i) => (
              <tr key={scenario.scenario_id}>
                <th scope="row">
                  <span className="cmp-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>
                    {scenario.site_name}
                    <small>
                      {i === 0 ? "Baseline" : "Alternative"} ·{" "}
                      {scenario.duration_hours} h mission
                    </small>
                  </span>
                </th>
                <td>
                  {hours(
                    scenario.conditions.status === "ok"
                      ? scenario.conditions.metrics.sunlit_hours
                      : null,
                  )}
                  <small>
                    {percentage(
                      scenario.conditions.status === "ok"
                        ? scenario.conditions.metrics.sunlit_fraction
                        : null,
                    )}
                  </small>
                </td>
                <td>
                  {hours(
                    scenario.conditions.status === "ok"
                      ? scenario.conditions.metrics.earth_visible_hours
                      : null,
                  )}
                  <small>
                    {percentage(
                      scenario.conditions.status === "ok"
                        ? scenario.conditions.metrics.earth_visible_fraction
                        : null,
                    )}
                  </small>
                </td>
                <td>{hours(scenario.simultaneous_visibility_hours)}</td>
                <td>{hours(scenario.longest_darkness_hours)}</td>
                <td>{hours(scenario.longest_earth_outage_hours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cmp-caption">
        All durations are sampled estimates. Unknown coverage withholds
        interruption and joint-duration totals; coarse steps can miss short
        events.
      </p>
    </div>
  );
}
