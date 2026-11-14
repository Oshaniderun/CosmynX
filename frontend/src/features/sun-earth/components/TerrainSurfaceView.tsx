import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowRight, Compass, Minus, Mountain, Plus, Sun } from "lucide-react";
import moonTexture from "../assets/moon.webp";
import type { EphemerisPoint } from "../../../types/helios";
import { skylineAt, terrainClearance, type TerrainProfile } from "../services/terrainSkyline";
import "./terrainSurfaceView.css";

const fieldOfView = { bearing: 34, elevation: 3.5 };
const zoomStep = 1.25;
// Approximate apparent solar radius for the January replay, in degrees.
const solarRadius = 0.27;
const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const wrapBearing = (bearing: number) => ((bearing % 360) + 360) % 360;
const bearingOffset = (bearing: number, heading: number) => wrapBearing(bearing - heading + 180) - 180;
const clampPitch = (pitch: number) => Math.min(8, Math.max(-8, pitch));
const formatAngle = (angle: number) => `${angle.toFixed(2)}°`;
const formatTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

function skylinePolygon(profile: TerrainProfile, minBearing: number, bearingSpan: number, elevationPosition: (angle: number) => number) {
  const maxBearing = minBearing + bearingSpan;
  const step = profile.azimuth_step_deg;
  // Include the grid's original bearings so the silhouette stays steady while panning.
  const points = [minBearing];
  for (let index = Math.ceil(minBearing / step); index * step < maxBearing; index++) {
    points.push(index * step);
  }
  points.push(maxBearing);
  return `polygon(${points.map((bearing) => {
    const x = 100 * (bearing - minBearing) / bearingSpan;
    const y = Math.min(100, Math.max(0, elevationPosition(skylineAt(profile, bearing))));
    return `${x.toFixed(3)}% ${y.toFixed(3)}%`;
  }).join(", ")}, 100% 100%, 0 100%)`;
}

function solarDiskVisibility(profile: TerrainProfile, azimuth: number, elevation: number) {
  let upperClearance = -Infinity;
  let lowerClearance = Infinity;
  // Classify visibility in angular space using the skyline at each bearing
  // across the disk. The illustration keeps the projected disk round.
  for (let index = 0; index <= 54; index++) {
    const offset = solarRadius * (index / 27 - 1);
    const limb = Math.sqrt(Math.max(0, solarRadius ** 2 - offset ** 2));
    const clearance = elevation - skylineAt(profile, azimuth + offset);
    upperClearance = Math.max(upperClearance, clearance + limb);
    lowerClearance = Math.min(lowerClearance, clearance - limb);
  }
  if (upperClearance <= 0) return "hidden";
  if (lowerClearance >= 0) return "visible";
  return "partial";
}

export default function TerrainSurfaceView({ profile, point }: { profile: TerrainProfile; point: EphemerisPoint }) {
  const [view, setView] = useState<{ bearing: number; elevation: number }>();
  const [zoom, setZoom] = useState(1);
  const scene = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; x: number; y: number; bearing: number; elevation: number }>();
  const helpId = useId();
  const { sun_azimuth_deg: azimuth, sun_elevation_deg: elevation, timestamp_utc: time } = point;
  const bearing = view?.bearing ?? azimuth ?? 240;
  const pitch = view?.elevation ?? elevation ?? 0;
  const bearingSpan = fieldOfView.bearing / zoom;
  const elevationSpan = fieldOfView.elevation / zoom;
  const yPercent = (angle: number) => 50 - 100 * (angle - pitch) / elevationSpan;
  const heading = Math.round(bearing) % 360;

  function adjustZoom(factor: number) {
    setZoom((current) => Math.min(3, Math.max(0.65, current * factor)));
  }

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    function wheel(event: WheelEvent) {
      if (document.activeElement !== element || event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault();
      adjustZoom(event.deltaY < 0 ? zoomStep : 1 / zoomStep);
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);

  function look(nextBearing: number, nextPitch: number) {
    setView({ bearing: wrapBearing(nextBearing), elevation: clampPitch(nextPitch) });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const target = event.currentTarget;
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, bearing, elevation: pitch };
    target.focus({ preventScroll: true });
    target.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    const { clientWidth, clientHeight } = event.currentTarget;
    if (start?.pointer !== event.pointerId || !clientWidth || !clientHeight) return;
    const horizontal = (event.clientX - start.x) / clientWidth * bearingSpan;
    const vertical = (event.clientY - start.y) / clientHeight * elevationSpan;
    const nextBearing = start.bearing - horizontal;
    const nextPitch = start.elevation + vertical;
    if (nextBearing !== bearing || nextPitch !== pitch) look(nextBearing, nextPitch);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointer === event.pointerId) drag.current = undefined;
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowLeft": look(bearing - bearingSpan / 8, pitch); break;
      case "ArrowRight": look(bearing + bearingSpan / 8, pitch); break;
      case "ArrowUp": look(bearing, pitch + elevationSpan / 8); break;
      case "ArrowDown": look(bearing, pitch - elevationSpan / 8); break;
      case "+":
      case "=": adjustZoom(zoomStep); break;
      case "-": adjustZoom(1 / zoomStep); break;
      case "Home": setView(undefined); setZoom(1); break;
      default: return;
    }
    event.preventDefault();
  }

  const local = terrainClearance(profile, azimuth, elevation);
  if (!local || azimuth === null || elevation === null) return null;

  const visibility = solarDiskVisibility(profile, azimuth, elevation);
  const centerClear = local.clearance > 0;
  const offset = bearingOffset(azimuth, bearing);
  const sunInView = Math.abs(offset) <= bearingSpan / 2 && Math.abs(elevation - pitch) <= elevationSpan / 2;
  const horizonY = yPercent(0);
  const sun = {
    left: `${50 + 100 * offset / bearingSpan}%`,
    top: `${yPercent(elevation)}%`,
    height: `${100 * 2 * solarRadius / elevationSpan}%`,
  };
  const skyline = skylinePolygon(profile, bearing - bearingSpan / 2, bearingSpan, yPercent);
  const title = {
    visible: "The solar disk clears the ridge",
    partial: "The ridge covers part of the Sun",
    hidden: "The ridge hides the entire solar disk",
  }[visibility];

  return (
    <figure className="border-t border-slate-700/80 bg-[#080e18]">
      <div className="terrain-scene isolate relative h-[370px] overflow-hidden sm:h-[470px] lg:h-[550px]" data-visibility={visibility}>
        <div aria-hidden="true" className="absolute inset-0">
          <div className="terrain-stars absolute inset-0" style={{ backgroundPosition: `${-bearing * 15}px ${pitch * 30}px` }} />
          <div className="terrain-sun-position terrain-sun-disk absolute z-10" style={sun} />
          <div className="terrain-ridge absolute inset-0 z-20" style={{ clipPath: skyline }}>
            <img src={moonTexture} alt="" className="terrain-ground-texture absolute" />
          </div>
          {sunInView && visibility === "hidden" && (
            <span className="terrain-sun-position absolute z-30 rounded-full border border-dashed border-amber-950" style={sun} />
          )}
          {horizonY >= 5 && horizonY <= 94 && (
            <div className="absolute inset-x-0 z-30 border-t border-dashed border-cyan-300 drop-shadow-[0_1px_0_#081624]" style={{ top: `${horizonY}%` }}>
              <span className="absolute right-[8%] top-2 rounded bg-[#07111e]/90 px-2 py-1 text-[10px] font-semibold text-cyan-200 sm:text-xs">0° level horizon</span>
            </div>
          )}
        </div>
        <div className="terrain-visor absolute inset-0 z-40" aria-hidden="true" />
        <div
          ref={scene}
          tabIndex={0}
          role="group"
          aria-label="Helmet look-around view"
          aria-describedby={helpId}
          className="terrain-pan-area absolute inset-0 z-40 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-cyan-300"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onKeyDown={handleKey}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex flex-wrap items-start justify-between gap-2 px-4 pt-4 sm:px-[7%] sm:pt-6">
          <div className="rounded-md bg-slate-950/80 px-2.5 py-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
              <Compass size={15} aria-hidden="true" /> Helmet POV
            </div>
            <p className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-2xl">Connecting Ridge</p>
            <p className="mt-0.5 text-xs text-slate-300">Lunar south pole · 89.45° S, 137° W</p>
          </div>
          <div className="rounded-md border border-slate-600/70 bg-slate-950/75 px-2.5 py-1.5 text-xs text-slate-200">
            <p className="text-[10px] text-slate-400">Predicted sample</p>
            <time dateTime={time} className="font-medium tabular-nums">
              {formatTime.format(new Date(time))} UTC
            </time>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex flex-wrap items-end justify-between gap-2 px-4 pb-3 text-xs sm:px-[7%] sm:pb-5">
          <div className="rounded-lg border border-slate-500/55 bg-slate-950/85 px-3 py-2 text-slate-200">
            <span className="font-semibold tabular-nums text-cyan-200">{String(heading).padStart(3, "0")}° {directions[Math.round(heading / 45) % directions.length]}</span>
            {" · "}<span>{sunInView ? (visibility === "hidden" ? "Sun behind terrain" : "Sun in view") : "Sun out of frame"}</span>
          </div>
          <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-slate-500/55 bg-slate-950/85 p-1 text-slate-100">
            <button type="button" className="terrain-view-control inline-flex items-center gap-1.5 px-2" onClick={() => { setView(undefined); setZoom(1); }}>
              <Sun size={15} aria-hidden="true" /> Find Sun
            </button>
            <button type="button" className="terrain-view-control" aria-label="Zoom out" disabled={zoom <= 0.65} onClick={() => adjustZoom(1 / zoomStep)}>
              <Minus size={17} aria-hidden="true" />
            </button>
            <button type="button" className="terrain-view-control" aria-label="Zoom in" disabled={zoom >= 3} onClick={() => adjustZoom(zoomStep)}>
              <Plus size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <figcaption className="grid gap-4 border-t border-slate-700/80 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center">
        <div>
          <h3 className={`text-lg font-semibold tracking-tight sm:text-xl ${visibility === "visible" ? "text-emerald-200" : "text-amber-100"}`}>{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-300">
            At a bearing of {formatAngle(azimuth)} clockwise from north, the Sun’s center is {formatAngle(elevation)} above the level horizon.
            {" "}{centerClear ? "Its center clears the local skyline." : "The ridge in that direction rises above its center."}
            {" "}{visibility === "partial" && "Only the part of the disk above the ridge can provide direct sunlight."}
            {visibility === "hidden" && "The modeled terrain in that direction blocks direct sunlight at this sample."}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            The cyan line marks level at the fixed observer. The LOLA skyline uses exaggerated elevation. The ground texture, visor, and round solar disk are illustrative.
          </p>
          <p id={helpId} className="mt-2 text-xs leading-relaxed text-cyan-100/85">
            Drag the visor to look around or focus it and use the arrow keys. Use + and − to zoom. Find Sun follows it as time advances.
          </p>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-slate-700/70 rounded-lg border border-slate-700/70 bg-slate-950/55">
          <div className="px-2 py-3 sm:px-3">
            <dt className="flex items-center gap-1 text-[11px] text-slate-300"><Sun size={13} aria-hidden="true" className="shrink-0 text-amber-300" /> Sun elevation</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-amber-100 sm:text-xl">{formatAngle(elevation)}</dd>
          </div>
          <div className="px-2 py-3 sm:px-3">
            <dt className="flex items-center gap-1 text-[11px] text-slate-300"><Mountain size={13} aria-hidden="true" className="shrink-0 text-cyan-300" /> Ridge elevation</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-slate-100 sm:text-xl">{formatAngle(local.skyline)}</dd>
          </div>
          <div className="px-2 py-3 sm:px-3">
            <dt className="flex items-center gap-1 text-[11px] text-slate-300"><ArrowRight size={13} aria-hidden="true" className="shrink-0" /> Center clearance</dt>
            <dd className={`mt-1 text-base font-semibold tabular-nums sm:text-xl ${centerClear ? "text-emerald-200" : "text-amber-200"}`}>
              {centerClear ? "+" : ""}{formatAngle(local.clearance)}
            </dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
