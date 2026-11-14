import { Pause, Play, Radio, Sun } from "lucide-react";
import { VisibilityTimeline } from "../components/VisibilityTimeline";
import { OperationalDetails } from "../components/OperationalDetails";
import { hour, statusLabel, utcLabel } from "./stressTestService";
import type { CellDetail, StressCell, StudyRun } from "./stressTestService";

export function ScenarioInspector({
  run,
  cell,
  detail,
  loading,
  error,
  cursor,
  setCursor,
  playing,
  onPlay,
  reduced,
  onSync,
}: {
  run: StudyRun;
  cell: StressCell;
  detail: CellDetail | null;
  loading: boolean;
  error: string;
  cursor: number;
  setCursor: (value: number) => void;
  playing: boolean;
  onPlay: () => void;
  reduced: boolean;
  onSync: () => void;
}) {
  const site = run.sites.find((item) => item.key === cell.site_key)!;
  const point = detail?.scenario.timeline.find(
    (entry) =>
      cursor >= entry.elapsed_hours &&
      Date.parse(cell.start_utc) + cursor * 3600000 < Date.parse(entry.end_utc),
  );
  const marker = (angle: number) => -Math.max(-10, Math.min(10, angle)) * 4.5;
  const formatAngle = (angle: number | null | undefined) =>
    angle == null ? "Unknown" : `${angle.toFixed(2)}°`;
  const maxCursor = Math.max(
    0,
    run.profile.mission_duration_hours - run.profile.sample_step_minutes / 60,
  );
  return (
    <article
      className="dl-inspector comparison-panel"
      aria-labelledby="delay-inspector-title"
    >
      <div className="dl-inspector-top">
        <div>
          <p className="dl-eyebrow">
            SELECTED EVIDENCE · +{cell.delay_hours} H
          </p>
          <h3 id="delay-inspector-title">{site.name}</h3>
        </div>
        <span className={`dl-status dl-${cell.status}`}>
          {statusLabel[cell.status]}
        </span>
      </div>
      <p className="dl-caption">
        {utcLabel(cell.start_utc)} → {utcLabel(cell.end_utc)}
      </p>
      <div className="dl-constraint-list" key={cell.cell_id}>
        {cell.constraints.map((check) => {
          const scale =
            Math.max(check.limit_hours, check.measured_hours ?? 0, 1) * 1.15;
          return (
            <div className={`dl-constraint dl-${check.status}`} key={check.key}>
              <div>
                <strong>{check.label}</strong>
                <span>
                  {check.key.startsWith("minimum") ? "≥" : "≤"}{" "}
                  {hour(check.limit_hours)}
                </span>
              </div>
              <div className="dl-meter" aria-hidden="true">
                <i
                  style={{
                    width: `${Math.min(100, ((check.measured_hours ?? 0) / scale) * 100)}%`,
                  }}
                />
                <b style={{ left: `${(check.limit_hours / scale) * 100}%` }} />
              </div>
              <div>
                <span>{hour(check.measured_hours)} measured</span>
                <small>
                  {check.margin_hours === null
                    ? "Required data unknown"
                    : `${check.margin_hours >= 0 ? "+" : ""}${hour(check.margin_hours)} margin`}
                </small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dl-coverage">
        <span>
          Sun data <b>{(cell.sun_coverage_fraction * 100).toFixed(0)}%</b>
        </span>
        <span>
          Earth data <b>{(cell.earth_coverage_fraction * 100).toFixed(0)}%</b>
        </span>
        <span>
          Joint view <b>{hour(cell.metrics.simultaneous_visibility_hours)}</b>
        </span>
      </div>
      <div className="dl-playback-heading">
        <h4>Watch the sampled horizon</h4>
        <button
          type="button"
          className="dl-button dl-small"
          disabled={!detail || reduced}
          onClick={onPlay}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? "Pause" : "Play time"}
        </button>
      </div>
      <div
        className="dl-sky"
        aria-label={`Sampled Sun elevation ${formatAngle(point?.sun_elevation_deg)}, Earth elevation ${formatAngle(point?.earth_elevation_deg)}`}
        role="img"
      >
        <svg viewBox="0 0 320 140" aria-hidden="true">
          <defs>
            <linearGradient id="dl-sky-fill" x2="0" y2="1">
              <stop stopColor="#112f50" />
              <stop offset="1" stopColor="#091726" />
            </linearGradient>
            <filter id="dl-sun-glow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <rect width="320" height="140" rx="12" fill="url(#dl-sky-fill)" />
          <path d="M0 70H320V140H0Z" fill="#101d2c" />
          {[25, 47.5, 92.5, 115].map((y) => (
            <path
              key={y}
              d={`M0 ${y}H320`}
              stroke="#31526e"
              strokeDasharray="2 7"
              opacity=".4"
            />
          ))}
          <path d="M0 70H320" stroke="#6b98b3" strokeDasharray="5 4" />
          <text x="12" y="65" fill="#89a9bf" fontSize="8">
            GEOMETRIC HORIZON
          </text>
          <text x="288" y="23" fill="#89a9bf" fontSize="8">
            +10°
          </text>
          <text x="288" y="126" fill="#89a9bf" fontSize="8">
            −10°
          </text>
          {point?.sun_elevation_deg != null && (
            <g
              className="dl-sky-marker"
              style={{
                transform: `translate(88px, ${70 + marker(point.sun_elevation_deg)}px)`,
              }}
            >
              <circle r="17" fill="#fbbf2466" filter="url(#dl-sun-glow)" />
              <circle r="7" fill="#fcd34d" />
              <path d="M-13 0H-10M10 0H13M0-13V-10M0 10V13" stroke="#fbbf24" />
            </g>
          )}
          {point?.earth_elevation_deg != null && (
            <g
              className="dl-sky-marker"
              style={{
                transform: `translate(228px, ${70 + marker(point.earth_elevation_deg)}px)`,
              }}
            >
              <circle r="8" fill="#38bdf8" />
              <path d="M-6-3L0-6 3-2 1 1 5 4 0 7-2 2-6 1Z" fill="#73cfa5" />
            </g>
          )}
        </svg>
        <div>
          <span>
            <Sun size={13} />
            {formatAngle(point?.sun_elevation_deg)}
          </span>
          <span>
            <Radio size={13} />
            {formatAngle(point?.earth_elevation_deg)}
          </span>
        </div>
      </div>
      <label className="dl-time-label">
        Inspect{" "}
        {utcLabel(
          new Date(Date.parse(cell.start_utc) + cursor * 3600000).toISOString(),
        )}
        <input
          aria-label="Mission sample time"
          type="range"
          min="0"
          max={maxCursor}
          step={run.profile.sample_step_minutes / 60}
          value={cursor}
          disabled={!detail}
          onChange={(event) => setCursor(Number(event.target.value))}
        />
      </label>
      <p className="dl-caption">
        ±10° display scale; markers clip outside it. Movement between samples is
        illustrative. Playback is accelerated; unknown states have no marker.
        {reduced && " Reduced motion: use the time slider and scene buttons."}
      </p>
      {loading && (
        <div className="dl-skeleton" role="status">
          Loading saved timeline…
        </div>
      )}
      {error && (
        <p className="dl-error" role="alert">
          {error}
        </p>
      )}
      {detail && (
        <>
          <VisibilityTimeline
            scenario={detail.scenario}
            from={0}
            to={run.profile.mission_duration_hours}
            cursor={cursor}
          />
          <OperationalDetails scenario={detail.scenario} cursor={cursor} />
        </>
      )}
      <button className="dl-button" type="button" onClick={onSync}>
        Use this site & window in dashboard
      </button>
    </article>
  );
}
