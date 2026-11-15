import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CircleHelp,
  Earth,
  Pause,
  Play,
  SkipForward,
  Sun,
} from "lucide-react";
import type {
  CompareResponse,
  ScenarioComparison,
  VisibilityInterval,
} from "../services/comparisonService";
import {
  replayEvents,
  replayFrame,
  replayStops,
  visibilitySegments,
  captureReplayInspection,
} from "../services/missionReplay";
import type { ReplayInspection } from "../services/missionReplay";
import "../missionReplay.css";

const elapsed = (hour: number) => `${Number(hour.toFixed(2))} h`;
const utc = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value)) + " UTC";
const angle = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(2)}°`;
const stateLabel = (state: boolean | null | undefined, ended: boolean) =>
  ended
    ? "Ended"
    : state === true
      ? "Above"
      : state === false
        ? "Below"
        : "Unknown";

function referenceLabel(scenario: ScenarioComparison) {
  const {
    site_id,
    latitude_deg: lat,
    longitude_deg: lon,
  } = scenario.conditions;
  if (site_id === "custom" && lat === -89.54 && lon === 0)
    return "Shackleton reference";
  if (site_id === "custom" && lat === -86 && lon === 2)
    return "Malapert reference";
  return scenario.site_name;
}

function ElevationGauge({
  frame,
  moving,
}: {
  frame: VisibilityInterval | null;
  moving: boolean;
}) {
  const y = (elevation: number) =>
    32 - Math.max(-10, Math.min(10, elevation)) * 2.2;
  return (
    <svg
      className={`mr-gauge${moving ? " mr-gauge-moving" : ""}`}
      viewBox="0 0 112 64"
      role="img"
      aria-label={`Elevation only: Sun ${angle(frame?.sun_elevation_deg)}, Earth ${angle(frame?.earth_elevation_deg)}. Display clips at plus or minus ten degrees.`}
    >
      <path d="M3 32H109" stroke="#5c819b" strokeDasharray="3 4" />
      <path d="M3 10H109M3 54H109" stroke="#254254" strokeDasharray="1 7" />
      <text x="3" y="28" fill="#658298" fontSize="5.5">
        0°
      </text>
      {frame?.sun_elevation_deg != null &&
        Number.isFinite(frame.sun_elevation_deg) && (
          <g
            className="mr-body"
            style={{
              transform: `translate(34px,${y(frame.sun_elevation_deg)}px)`,
            }}
          >
            <circle r="11" fill="#edbd4f" opacity=".09" />
            <g className="mr-rays">
              <path
                d="M0-8V-6M0 6V8M-8 0H-6M6 0H8M-6-6L-4-4M4 4L6 6M6-6L4-4M-4 4L-6 6"
                stroke="#edc76c"
                strokeWidth="1"
              />
            </g>
            <circle r="3.5" fill="#f4ce70" />
          </g>
        )}
      {frame?.earth_elevation_deg != null &&
        Number.isFinite(frame.earth_elevation_deg) && (
          <g
            className="mr-body"
            style={{
              transform: `translate(83px,${y(frame.earth_elevation_deg)}px)`,
            }}
          >
            <circle r="10" fill="#7ed5ee" opacity=".08" />
            <circle r="4.5" fill="#69c8e9" />
            <path d="M-3-1L0-3 2-1 0 1 2 3-1 3Z" fill="#90d3ab" />
          </g>
        )}
    </svg>
  );
}

function ReplayRow({
  scenario,
  index,
  hour,
  maximum,
  playing,
  eventHour,
  shift,
}: {
  scenario: ScenarioComparison;
  index: number;
  hour: number;
  maximum: number;
  playing: boolean;
  eventHour: number | null;
  shift: number;
}) {
  const patternId = useId().replace(/:/g, "");
  const frame = replayFrame(scenario, hour);
  const ended = hour >= scenario.duration_hours;
  const segments = useMemo(
    () => ({
      sunlit: visibilitySegments(scenario, "sunlit"),
      earth_visible: visibilitySegments(scenario, "earth_visible"),
    }),
    [scenario],
  );
  const x = (value: number) => (value / maximum) * 548 + 40;
  return (
    <article
      className={`mr-row${eventHour === hour ? " mr-row-event" : ""}`}
      aria-label={`Scenario ${String.fromCharCode(65 + index)}: ${referenceLabel(scenario)}`}
    >
      <div className="mr-site">
        <b>{String.fromCharCode(65 + index)}</b>
        <div>
          <strong title={scenario.site_name}>{referenceLabel(scenario)}</strong>
          <small>
            {index === 0
              ? "Reference"
              : shift === 0
                ? "Alternative"
                : `${shift > 0 ? "+" : ""}${elapsed(shift)} departure`}{" "}
            · {scenario.conditions.latitude_deg}°,{" "}
            {scenario.conditions.longitude_deg}° E
          </small>
          <small>
            {utc(
              new Date(
                Date.parse(scenario.conditions.start_utc) +
                  Math.min(hour, scenario.duration_hours) * 3600000,
              ).toISOString(),
            )}
            {ended ? " · window ended" : ""}
          </small>
        </div>
      </div>
      <svg
        className="mr-tracks"
        viewBox="0 0 600 48"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Sun and Earth sampled visibility over ${scenario.duration_hours} mission hours. Gold is sunlight, cyan is Earth visibility; dim bands are below the horizon; hatching is unknown.`}
      >
        <defs>
          <pattern
            id={patternId}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 5L5 0" stroke="#4b6075" strokeWidth=".5" />
          </pattern>
        </defs>
        {(["sunlit", "earth_visible"] as const).map((body, track) => (
          <g key={body}>
            <text
              x="1"
              y={track * 21 + 17}
              fill={track === 0 ? "#bca776" : "#7fa9ba"}
              fontSize="8"
            >
              {track === 0 ? "SUN" : "EARTH"}
            </text>
            <rect
              x="40"
              y={track * 21 + 9}
              width="548"
              height="8"
              rx="3"
              fill={`url(#${patternId})`}
            />
            {segments[body].map((segment, i) => (
              <rect
                key={i}
                x={x(segment.start)}
                y={track * 21 + 9}
                width={Math.max(0, x(segment.end) - x(segment.start))}
                height="8"
                fill={
                  segment.state === null
                    ? `url(#${patternId})`
                    : segment.state
                      ? track === 0
                        ? "#ddbc6a"
                        : "#71b6d5"
                      : "#182c3e"
                }
              />
            ))}
            {scenario.duration_hours < maximum && (
              <rect
                x={x(scenario.duration_hours)}
                y={track * 21 + 9}
                width={x(maximum) - x(scenario.duration_hours)}
                height="8"
                fill="#0b1520"
              />
            )}
          </g>
        ))}
        <g
          className="mr-playhead"
          style={{ transform: `translateX(${x(hour)}px)` }}
        >
          <path
            className="mr-playhead-glow"
            d="M0 3V45"
            stroke="#a6def5"
            strokeWidth="7"
            opacity=".12"
          />
          <path d="M0 3V45" stroke="#e0f4ff" strokeWidth="1.5" />
          <circle cx="0" cy="4" r="2.5" fill="#e0f4ff" />
        </g>
      </svg>
      <ElevationGauge frame={frame} moving={playing} />
      <div className="mr-readings">
        {(
          [
            ["sunlit", "sun_elevation_deg", Sun],
            ["earth_visible", "earth_elevation_deg", Earth],
          ] as const
        ).map(([state, field, Icon]) => (
          <span
            key={state}
            className={`mr-reading mr-${ended ? "ended" : frame?.[state] === true ? "above" : frame?.[state] === false ? "below" : "unknown"}`}
          >
            <Icon size={12} />
            <span className="mr-sr-only">
              {state === "sunlit" ? "Sun" : "Earth"}{" "}
            </span>
            <span>{stateLabel(frame?.[state], ended)}</span>
            <b>{ended ? "—" : angle(frame?.[field])}</b>
          </span>
        ))}
      </div>
    </article>
  );
}

export function MissionReplay({
  result,
  onInspect,
  initialHour = 0,
}: {
  result: CompareResponse;
  onInspect?: (snapshot: ReplayInspection) => void;
  initialHour?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(() =>
    Math.max(0, replayStops(result.scenarios).indexOf(initialHour)),
  );
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const stops = useMemo(() => replayStops(result.scenarios), [result]);
  const events = useMemo(() => replayEvents(result.scenarios), [result]);
  const maximum = Math.max(
    1e-6,
    ...result.scenarios.map((s) => s.duration_hours),
  );
  const safeIndex = Math.min(index, stops.length - 1),
    hour = stops[safeIndex];
  const currentEvents = events.filter(
    (event) => Math.abs(event.hour - hour) < 1e-8,
  );
  const nextEvent = events.find((event) => event.hour > hour + 1e-8);
  const known = result.scenarios.filter((scenario) => {
    const frame = replayFrame(scenario, hour);
    return frame?.sunlit != null && frame.earth_visible != null;
  });
  const joint = known.filter((scenario) => {
    const frame = replayFrame(scenario, hour)!;
    return frame.sunlit && frame.earth_visible;
  }).length;
  const playable =
    result.scenarios.some(
      (s) => s.timeline_status !== "unavailable" && s.timeline.length > 0,
    ) && stops.length > 1;

  useEffect(() => {
    setIndex(Math.max(0, replayStops(result.scenarios).indexOf(initialHour)));
    setPlaying(false);
  }, [result]);
  useEffect(() => {
    onInspect?.(captureReplayInspection(result.scenarios, hour));
  }, [result, hour, onInspect]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(query.matches);
      if (query.matches) setPlaying(false);
    };
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pause);
    const observer = new IntersectionObserver((entries) => {
      if (entries[0] && !entries[0].isIntersecting) setPlaying(false);
    });
    if (root.current) observer.observe(root.current);
    return () => {
      document.removeEventListener("visibilitychange", pause);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!playing || reduced) return;
    if (safeIndex >= stops.length - 1) {
      setPlaying(false);
      return;
    }
    const increment = Math.max(1, Math.ceil(stops.length / 150));
    const proposed = Math.min(stops.length - 1, safeIndex + increment);
    const crossing = events.find(
      (event) => event.hour > hour + 1e-8 && event.hour <= stops[proposed],
    );
    const target = crossing ? stops.indexOf(crossing.hour) : proposed;
    const hold = currentEvents.length ? 1800 : 120;
    const timer = window.setTimeout(() => setIndex(target), hold);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, safeIndex, stops, events, hour, currentEvents.length]);

  return (
    <div className={`mission-replay${reduced ? " mr-reduced" : ""}`} ref={root}>
      <div className="mr-transport">
        <div className="mr-transport-title">
          <span className="mr-eyebrow">MISSION REPLAY</span>
          <strong>Same mission hour. Different outcomes.</strong>
        </div>
        <div className="mr-controls">
          <span className="mr-clock">
            +{elapsed(hour)} <small>/ {elapsed(maximum)}</small>
          </span>
          <button
            type="button"
            className="mr-play"
            disabled={!playable || reduced}
            onClick={() => {
              if (safeIndex >= stops.length - 1) setIndex(0);
              setPlaying((current) => !current);
            }}
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}{" "}
            {playing ? "Pause" : "Play mission"}
          </button>
          <button
            type="button"
            className="mr-next"
            disabled={!nextEvent}
            onClick={() => {
              setPlaying(false);
              setIndex(stops.indexOf(nextEvent!.hour));
            }}
            title="Jump to the next recorded Sun or Earth visibility change"
          >
            <SkipForward size={13} />
            Next event
          </button>
        </div>
      </div>
      <label className="mr-scrubber">
        <span className="mr-sr-only">Mission replay sample</span>
        <input
          aria-label="Mission replay time"
          type="range"
          min="0"
          max={Math.max(0, stops.length - 1)}
          step="1"
          value={safeIndex}
          disabled={!playable}
          aria-valuetext={`${elapsed(hour)} elapsed mission time`}
          onChange={(event) => {
            setPlaying(false);
            setIndex(Number(event.target.value));
          }}
        />
        <span>0 h</span>
        <span>{elapsed(maximum)} mission window</span>
      </label>
      <div className="mr-rows">
        {result.scenarios.map((scenario, i) => (
          <ReplayRow
            key={scenario.scenario_id}
            scenario={scenario}
            index={i}
            hour={hour}
            maximum={maximum}
            playing={playing}
            shift={
              (Date.parse(scenario.conditions.start_utc) -
                Date.parse(result.scenarios[0].conditions.start_utc)) /
              3600000
            }
            eventHour={
              currentEvents.some(
                (event) => event.scenarioId === scenario.scenario_id,
              )
                ? hour
                : null
            }
          />
        ))}
      </div>
      <div className="mr-insight" aria-live={playing ? "off" : "polite"}>
        <span className="mr-insight-icon">
          {currentEvents.length ? (
            <ArrowRight size={14} />
          ) : (
            <CircleHelp size={14} />
          )}
        </span>
        <p>
          {currentEvents.length
            ? currentEvents
                .map(
                  (event) =>
                    `${String.fromCharCode(65 + result.scenarios.findIndex((s) => s.scenario_id === event.scenarioId))}: ${event.body === "sunlit" ? "Sun" : "Earth"} first sampled ${event.visible ? "above" : "below"} the horizon · transition bracket ${utc(event.afterUtc)}–${utc(event.byUtc)}`,
                )
                .join(" · ")
            : known.length
              ? `${joint}/${result.scenarios.length} scenarios have joint Sun/Earth visibility at this mission hour.${known.length < result.scenarios.length ? " Some scenarios have unknown data or ended windows." : ""}`
              : "Required samples are unavailable here; no visibility state has been assumed."}
        </p>
      </div>
      <div className="mr-footnote">
        <span>
          {result.data_mode === "demo" ? "SYNTHETIC PREVIEW" : "JPL HORIZONS"} ·
          Sampled geometric visibility
        </span>
        <span>
          Separate UTC times per row · elevation gauge ±10°
          {reduced
            ? " · Reduced motion: use the slider or Next event"
            : " · Motion between samples is illustrative"}
        </span>
      </div>
    </div>
  );
}
