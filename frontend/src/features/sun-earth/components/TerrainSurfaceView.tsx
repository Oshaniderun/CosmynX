import { ArrowRight, Compass, Mountain, Sun } from "lucide-react";
import astronaut from "../assets/surface-astronaut.webp";
import moonTexture from "../assets/moon.webp";
import type { EphemerisPoint } from "../../../types/helios";
import { skylineAt, terrainClearance, type TerrainProfile } from "../services/terrainSkyline";
import "./terrainSurfaceView.css";

const azimuthMin = 225;
const azimuthMax = 258;
const elevationMin = -1.45;
const elevationMax = 1.35;
const bearingStep = 0.1;
const xPercent = (azimuth: number) => 100 * (azimuth - azimuthMin) / (azimuthMax - azimuthMin);
const yPercent = (elevation: number) => 100 * (elevationMax - elevation) / (elevationMax - elevationMin);
const formatAngle = (angle: number) => `${angle.toFixed(2)}°`;
const formatTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});

function skylinePolygon(profile: TerrainProfile) {
  const count = Math.round((azimuthMax - azimuthMin) / bearingStep);
  const points = Array.from({ length: count + 1 }, (_, index) => {
    const bearing = azimuthMin + index * bearingStep;
    return `${xPercent(bearing).toFixed(3)}% ${yPercent(skylineAt(profile, bearing)).toFixed(3)}%`;
  });
  return `polygon(${points.join(", ")}, 100% 100%, 0 100%)`;
}

export default function TerrainSurfaceView({ profile, point }: { profile: TerrainProfile; point: EphemerisPoint }) {
  const { sun_azimuth_deg: azimuth, sun_elevation_deg: elevation, timestamp_utc: time } = point;
  const local = terrainClearance(profile, azimuth, elevation);
  if (!local || azimuth === null || elevation === null) return null;

  const clear = local.clearance > 0;
  const sun = { left: `${xPercent(azimuth)}%`, top: `${yPercent(elevation)}%` };
  const skyline = skylinePolygon(profile);
  const title = clear ? "The Sun’s center clears the ridge" : "The ridge hides the Sun’s center";

  return (
    <figure className="border-t border-slate-700/80 bg-[#080e18]">
      <div className="terrain-scene isolate relative h-[360px] overflow-hidden sm:h-[460px] lg:h-[550px]" data-clear={clear}>
        <div aria-hidden="true" className="absolute inset-0">
          <div className="terrain-stars absolute inset-0" />
          <div className="terrain-sun-position terrain-sun-glow absolute z-10" style={sun} />
          <div className="terrain-ridge absolute inset-0 z-20" style={{ clipPath: skyline }}>
            <img src={moonTexture} alt="" className="terrain-ground-texture absolute inset-x-0 bottom-0 h-3/4 w-full object-cover" />
          </div>
          <div className="terrain-sun-position absolute z-30" style={sun}>
            <span className="terrain-sun-disk" />
            <span className="terrain-hidden-marker absolute inset-0 rounded-full border border-dashed border-amber-200/90 bg-amber-300/10" />
          </div>
          <div className="absolute inset-x-0 z-30 border-t border-dashed border-cyan-300/65" style={{ top: `${yPercent(0)}%` }}>
            <span className="absolute right-3 top-2 rounded bg-[#07111e]/90 px-2 py-1 text-[10px] font-semibold text-cyan-200 sm:right-5 sm:text-xs">0° level horizon</span>
          </div>
          <div className="terrain-astronaut absolute bottom-[3%] left-[5%] z-40 h-[43%] max-w-[28%] sm:left-[7%] sm:h-[51%]">
            <img src={astronaut} alt="" className="h-full w-auto object-contain object-left-bottom" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 z-50 flex flex-wrap items-start justify-between gap-2 bg-gradient-to-b from-[#060b14] to-transparent px-4 pb-9 pt-4 sm:px-6 sm:pt-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
              <Compass size={15} aria-hidden="true" /> View toward the southwest
            </div>
            <p className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-2xl">Connecting Ridge</p>
          </div>
          <time dateTime={time} className="rounded-md border border-slate-600/70 bg-slate-950/75 px-2.5 py-1.5 text-xs font-medium tabular-nums text-slate-200">
            {formatTime.format(new Date(time))} UTC
          </time>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-50 flex flex-col items-end gap-1 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-9 text-[10px] text-slate-300 sm:px-6 sm:text-xs">
          <span>Ridge silhouette · NASA LOLA</span>
          <span>{clear ? "Solid marker · visible Sun center" : "Dashed marker · hidden Sun center"}</span>
        </div>
      </div>

      <figcaption className="grid gap-4 border-t border-slate-700/80 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center">
        <div>
          <h3 className={`text-lg font-semibold tracking-tight sm:text-xl ${clear ? "text-emerald-200" : "text-amber-100"}`}>{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-300">
            {clear ? "At this sample, the center of the Sun is higher than the LOLA skyline in its direction."
              : "The Sun is above 0°, but terrain in the same direction rises higher. A level-horizon check misses this obstruction."}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">Angles are vertically exaggerated. The marker represents the Sun’s center. The astronaut and ground texture are illustrative.</p>
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
            <dt className="flex items-center gap-1 text-[11px] text-slate-300"><ArrowRight size={13} aria-hidden="true" className="shrink-0" /> Clearance</dt>
            <dd className={`mt-1 text-base font-semibold tabular-nums sm:text-xl ${clear ? "text-emerald-200" : "text-amber-200"}`}>
              {clear ? "+" : ""}{formatAngle(local.clearance)}
            </dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
