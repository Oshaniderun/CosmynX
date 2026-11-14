import { useId, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import type { EphemerisResponse } from "../../../types/helios";
import { demoEphemeris } from "../services/demoEphemeris";

const sunColor = "#fbbf24";
const earthColor = "#38bdf8";
const axisStyle = { fill: "#94a3b8", fontSize: 11 };
const directions: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W", 360: "N" };
const angleFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatAngle(value: number | null) {
  return value === null ? "—" : `${angleFormat.format(value)}°`;
}

export function SunEarthPanel({ ephemeris = demoEphemeris }: { ephemeris?: EphemerisResponse }) {
  return (
    <ModuleCard title="Sun & Earth positions" owner="Member 3" branch="feature/sun-earth">
      {ephemeris.status === "ok" && ephemeris.points.length > 0 ? (
        <PositionCharts ephemeris={ephemeris} />
      ) : (
        <p role="status">
          {ephemeris.status === "pending"
            ? "Ephemeris data is pending."
            : "No ephemeris data is available for this site and time range."}
        </p>
      )}
    </ModuleCard>
  );
}

function PositionCharts({ ephemeris }: { ephemeris: EphemerisResponse }) {
  const timeId = useId();
  const [selectedTime, setSelectedTime] = useState("");
  const points = ephemeris.points
    .map((point) => ({ ...point, time: Date.parse(point.timestamp_utc) }))
    .sort((a, b) => a.time - b.time);
  const selected = points.find((point) => point.timestamp_utc === selectedTime) ?? points[0];
  const bodies = [
    { name: "Sun", color: sunColor, azimuth: selected.sun_azimuth_deg, elevation: selected.sun_elevation_deg },
    { name: "Earth", color: earthColor, azimuth: selected.earth_azimuth_deg, elevation: selected.earth_elevation_deg },
  ];
  const elevations = points
    .flatMap((point) => [point.sun_elevation_deg, point.earth_elevation_deg])
    .filter((value): value is number => value !== null);
  const elevationDomain: [number, number] = [
    Math.floor(elevations.reduce((min, value) => Math.min(min, value), -5) / 5) * 5,
    Math.ceil(elevations.reduce((max, value) => Math.max(max, value), 5) / 5) * 5,
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-300">{ephemeris.source}</p>
        <div className="flex items-center gap-2">
          <label htmlFor={timeId} className="text-xs font-medium text-slate-300">
            Sample time (UTC)
          </label>
          <select
            id={timeId}
            value={selected.timestamp_utc}
            onChange={(event) => setSelectedTime(event.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            {points.map(({ timestamp_utc, time }) => (
              <option key={timestamp_utc} value={timestamp_utc}>
                {timeFormat.format(time)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" aria-live="polite">
        {bodies.map(({ name, color, azimuth, elevation }) => (
          <div key={name} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="font-semibold" style={{ color }}>{name}</h3>
            <dl className="mt-2 grid gap-1 text-xs tabular-nums">
              <div className="flex flex-wrap justify-between gap-x-2">
                <dt>Azimuth</dt>
                <dd className="text-slate-100">{formatAngle(azimuth)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-2">
                <dt>Elevation</dt>
                <dd className="text-slate-100">{formatAngle(elevation)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <figure className="rounded-lg border border-slate-800 bg-slate-950/70 px-2 py-3">
        <figcaption className="px-2 font-medium text-slate-200">Local horizon</figcaption>
        <div className="h-44 min-w-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ScatterChart margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis type="number" dataKey="azimuth" domain={[0, 360]} ticks={[0, 90, 180, 270, 360]} tickFormatter={(angle) => directions[angle]} tick={axisStyle} />
              <YAxis type="number" dataKey="elevation" domain={elevationDomain} tickFormatter={formatAngle} tick={axisStyle} width={42} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 3" />
              {bodies.map(({ name, color, azimuth, elevation }) => (
                <Scatter
                  key={name}
                  name={name}
                  fill={color}
                  data={azimuth === null || elevation === null ? [] : [{ azimuth, elevation }]}
                  isAnimationActive={false}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="px-2 text-xs">Dashed line marks the 0° geometric horizon. Terrain can obstruct the view.</p>
      </figure>

      {points.length > 1 && elevations.length > 0 && (
        <figure className="rounded-lg border border-slate-800 bg-slate-950/70 px-2 py-3">
          <figcaption className="px-2 font-medium text-slate-200">Elevation over time (UTC)</figcaption>
          <div className="h-36 min-w-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={points} margin={{ top: 12, right: 22, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis type="number" dataKey="time" domain={["dataMin", "dataMax"]} tickFormatter={(time) => timeFormat.format(time)} tick={axisStyle} tickCount={4} minTickGap={14} />
                <YAxis type="number" domain={elevationDomain} tickFormatter={formatAngle} tick={axisStyle} width={42} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 3" />
                <ReferenceLine x={selected.time} stroke="#cbd5e1" />
                <Line dataKey="sun_elevation_deg" name="Sun" stroke={sunColor} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                <Line dataKey="earth_elevation_deg" name="Earth" stroke={earthColor} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </figure>
      )}
    </div>
  );
}
