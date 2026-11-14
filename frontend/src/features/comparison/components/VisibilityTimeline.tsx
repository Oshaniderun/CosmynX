import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScenarioComparison } from "../services/comparisonService";

interface Props {
  scenario: ScenarioComparison;
  from: number;
  to: number;
  cursor: number;
}

export function VisibilityTimeline({ scenario, from, to, cursor }: Props) {
  if (scenario.timeline_status === "unavailable") {
    return (
      <p className="cmp-empty">
        Timeline unavailable. No visibility states have been assumed.
      </p>
    );
  }
  const start = Date.parse(scenario.conditions.start_utc);
  const data = scenario.timeline.flatMap((point) => {
    const end = (Date.parse(point.end_utc) - start) / 3600000;
    return [point.elapsed_hours, end].map((hour) => ({
      hour,
      sun: point.sunlit === null ? null : Number(point.sunlit),
      earth: point.earth_visible === null ? null : Number(point.earth_visible),
    }));
  });
  return (
    <div className="cmp-timelines">
      {(
        [
          ["sun", "Sunlight", "#fbbf24"],
          ["earth", "Earth line of sight", "#38bdf8"],
        ] as const
      ).map(([key, label, color]) => (
        <div key={key}>
          <p className="cmp-chart-label" style={{ color }}>
            {label}
          </p>
          <div
            role="img"
            aria-label={`${label} timeline for ${scenario.site_name}. Visible is 1, hidden is 0; gaps are unknown.`}
            style={{ height: 116, minWidth: 0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 6, right: 12, bottom: 4, left: 0 }}
                accessibilityLayer
              >
                <CartesianGrid stroke="#243244" strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  type="number"
                  domain={[from, to]}
                  allowDataOverflow
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(value: number) => `${value}h`}
                />
                <YAxis
                  type="number"
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  width={46}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value ? "Visible" : "Hidden"
                  }
                />
                <Tooltip
                  filterNull={false}
                  contentStyle={{
                    background: "#0f172a",
                    borderColor: "#334155",
                    fontSize: 12,
                  }}
                  labelFormatter={(value) =>
                    `${Number(value).toFixed(1)}h · ${new Date(start + Number(value) * 3600000).toISOString().replace("T", " ").replace(".000Z", " UTC")}`
                  }
                  formatter={(value) => [
                    value == null
                      ? "Unknown"
                      : Number(value) === 1
                        ? "Visible"
                        : "Below horizon",
                    label,
                  ]}
                />
                <ReferenceLine
                  x={cursor}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <Area
                  type="stepAfter"
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.16}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
      <p className="cmp-caption">
        Elapsed mission hours · gaps = unknown · geometric visibility does not
        include terrain.
      </p>
    </div>
  );
}
