import { lazy, Suspense, useEffect, useId, useMemo, useState } from "react";
import { Eclipse, Moon, Pause, Play, RotateCcw } from "lucide-react";
import type { EphemerisResponse, LandingSite } from "../../../types/helios";
import { useMission } from "../../../context/MissionContext";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";
import { fetchEphemeris, initialMissionWindow } from "../services/ephemerisService";
import { eclipseStage, lunarEclipses } from "../services/lunarEclipses";
import { EclipseGuide, EclipsePurpose } from "./EclipseGuide";

const SpaceViewport = lazy(() => import("./SpaceViewport"));
const playDurationMs = 22_000;
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});
const angleFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const formatAngle = (value?: number | null) => value == null ? "—" : angleFormat.format(value) + "°";

function horizonStatus(elevation: number | null) {
  if (elevation === null) return "Elevation unavailable";
  if (elevation === 0) return "At horizon";
  return elevation > 0 ? "Above horizon" : "Below horizon";
}

const controlClass = "rounded-lg border border-white/[0.08] bg-[#0A1424]/80 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-400/50 hover:bg-[#12223B] focus-visible:outline-2 focus-visible:outline-sky-400 transition cursor-pointer";
const modeClass = "inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0A1424]/80 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-sky-400/50 hover:text-white aria-pressed:border-sky-400/80 aria-pressed:bg-sky-950/70 aria-pressed:text-sky-300 transition cursor-pointer shadow-sm";

export function SunEarthPanel({ ephemeris }: { ephemeris?: EphemerisResponse } = {}) {
  const { selectedSite, setSelectedSite } = useMission();
  const [mode, setMode] = useState<"eclipse" | "site">("site");
  const [eventIndex, setEventIndex] = useState(0);
  const [replayOffset, setReplayOffset] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteId, setSiteId] = useState(selectedSite?.site_id ?? "");
  const [result, setResult] = useState<EphemerisResponse>();
  const [loading, setLoading] = useState(!ephemeris);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const scrubberId = useId();

  // Sync siteId when selectedSite changes in MissionContext
  useEffect(() => {
    if (selectedSite?.site_id) {
      setSiteId(selectedSite.site_id);
    }
  }, [selectedSite?.site_id]);

  const landingSite = sites.find((site) => site.site_id === siteId) ?? (selectedSite ?? sites[0]);
  const positions = ephemeris ?? (result?.site_id === landingSite?.site_id ? result : undefined);
  const missionWindow = positions ?? initialMissionWindow;

  useEffect(() => {
    if (ephemeris || sites.length) return;
    let active = true;
    fetchCandidateSites().then((availableSites) => {
      if (!active) return;
      setSites(availableSites);
      if (!availableSites.length) {
        setError("No candidate landing sites are available.");
        setLoading(false);
      } else if (!siteId && selectedSite?.site_id) {
        setSiteId(selectedSite.site_id);
      }
    }).catch(() => {
      if (!active) return;
      setError("Couldn’t load landing sites from the HELIOS API.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [ephemeris, sites.length, requestVersion, siteId, selectedSite?.site_id]);

  useEffect(() => {
    if (ephemeris || !landingSite) return;
    let active = true;
    fetchEphemeris(landingSite).then((response) => {
      if (!active) return;
      setResult(response);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError("Couldn’t load Sun and Earth positions from the HELIOS API.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [ephemeris, landingSite, requestVersion]);

  function clearPositions() {
    setLoading(true);
    setError("");
    setSampleIndex(0);
    setResult(undefined);
  }

  const event = lunarEclipses[eventIndex];
  const duration = event.end - event.start;
  const time = Math.min(event.start + replayOffset, event.end);
  const stage = eclipseStage(event, time);
  const points = useMemo(() => positions?.status === "ok"
    ? positions.points.filter((point) => Number.isFinite(Date.parse(point.timestamp_utc)))
        .sort((a, b) => Date.parse(a.timestamp_utc) - Date.parse(b.timestamp_utc))
    : [], [positions]);
  const currentSample = Math.min(sampleIndex, Math.max(points.length - 1, 0));
  const point = points[currentSample];

  useEffect(() => {
    if (!playing || mode !== "eclipse") return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const increment = (now - previous) / playDurationMs * duration;
      previous = now;
      setReplayOffset((offset) => Math.min(duration, offset + increment));
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, mode, duration]);

  const replayFinished = time >= event.end;
  useEffect(() => { if (replayFinished) setPlaying(false); }, [replayFinished]);

  return (
    <section aria-labelledby="space-explorer-title" className="min-w-0 overflow-hidden rounded-2xl glass-panel md:col-span-2">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="space-explorer-title" className="font-heading text-lg font-semibold tracking-tight text-slate-100">
            Sun, Earth & Moon
          </h2>
          {selectedSite && (
            <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-[#060D19]/80 backdrop-blur-md px-2.5 py-1 text-xs font-mono text-sky-300 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Target: <strong className="text-white">{selectedSite.name}</strong> ({selectedSite.site_id})</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="View mode">
          <button type="button" aria-pressed={mode === "eclipse"} className={modeClass} onClick={() => setMode("eclipse")}>
            <Eclipse size={15} aria-hidden="true" /> Eclipse replay
          </button>
          <button type="button" aria-pressed={mode === "site"} className={modeClass} onClick={() => { setPlaying(false); setMode("site"); }}>
            <Moon size={15} aria-hidden="true" /> Landing site
          </button>
        </div>
      </header>

      {mode === "eclipse" && <EclipsePurpose />}

      {(mode === "eclipse" || (positions?.status === "ok" && points.length > 0)) && (
        <Suspense fallback={<div className="grid h-[280px] place-items-center bg-[#080E1B] text-sm text-[#A7B4C7] sm:h-[380px]" role="status">Loading 3D view…</div>}>
          {mode === "eclipse" ? (
            <SpaceViewport key="eclipse" frame={{ mode, time }} />
          ) : positions && (
            <SpaceViewport key={positions.site_id} frame={{
              mode, point, latitude: positions.latitude_deg, longitude: positions.longitude_deg,
            }} />
          )}
        </Suspense>
      )}

      {mode === "eclipse" ? (
        <div className="space-y-3 border-t border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
              Total lunar eclipse
              <select className={controlClass} value={eventIndex} onChange={(change) => {
                const next = Number(change.target.value);
                setPlaying(false);
                setEventIndex(next);
                setReplayOffset(0);
              }}>
                {lunarEclipses.map(({ label }, index) => <option key={label} value={index}>{label}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#A7B4C7]" aria-label="Earth’s shadow legend">
              <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full border border-[#fb9366]" /> Umbra · inner shadow</span>
              <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full border border-[#c4a1bd]" /> Penumbra · outer shadow</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label={playing ? "Pause eclipse" : "Play eclipse"} className={controlClass} onClick={() => {
              if (!playing && replayFinished) setReplayOffset(0);
              setPlaying(!playing);
            }}>
              {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>
            <button type="button" title="Restart eclipse" aria-label="Restart eclipse" className={controlClass} onClick={() => { setPlaying(false); setReplayOffset(0); }}>
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <div className="min-w-32 flex-1">
              <label className="sr-only" htmlFor={scrubberId}>Eclipse time (UTC)</label>
              <input id={scrubberId} type="range" min={0} max={duration} step="any"
                value={replayOffset} aria-valuetext={timeFormat.format(time) + " UTC · " + stage.label}
                onChange={(change) => { setPlaying(false); setReplayOffset(Number(change.target.value)); }}
                className="block w-full cursor-pointer accent-sky-400" />
            </div>
            <time className="min-w-[122px] text-right font-mono text-xs tabular-nums text-slate-200" dateTime={new Date(time).toISOString()}>
              {timeFormat.format(time)} UTC
            </time>
          </div>
          <EclipseGuide event={event} stage={stage} onSeek={(stageTime) => {
            setPlaying(false);
            setReplayOffset(stageTime - event.start);
          }} />
        </div>
      ) : (
        <div className="space-y-3.5 border-t border-white/[0.07] px-5 py-4 sm:px-6">
          {!ephemeris && sites.length > 0 && (
            <label className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
              Landing site
              <select className={controlClass} value={landingSite?.site_id} onChange={(change) => {
                clearPositions();
                const nextId = change.target.value;
                setSiteId(nextId);
                const matched = sites.find((s) => s.site_id === nextId);
                if (matched) {
                  setSelectedSite(matched);
                }
              }}>
                {sites.map((site) => <option key={site.site_id} value={site.site_id}>{site.name}</option>)}
              </select>
            </label>
          )}
          {positions && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <p className="font-mono text-xs text-[#A7B4C7]">{positions.source} · {positions.latitude_deg}°, {positions.longitude_deg}°</p>
              {point && <time className="font-mono text-xs tabular-nums text-slate-200" dateTime={point.timestamp_utc}>{timeFormat.format(new Date(point.timestamp_utc))} UTC</time>}
            </div>
          )}
          <p className="font-mono text-xs text-[#718096]">
            Mission window · {timeFormat.format(Date.parse(missionWindow.start_utc))}–{timeFormat.format(Date.parse(missionWindow.end_utc))} UTC
          </p>
          {points.length > 1 && (
            <>
              <label className="sr-only" htmlFor={scrubberId}>Landing site sample time (UTC)</label>
              <input id={scrubberId} type="range" min={0} max={points.length - 1} value={currentSample}
                aria-valuetext={point ? timeFormat.format(new Date(point.timestamp_utc)) + " UTC" : undefined}
                onChange={(change) => setSampleIndex(Number(change.target.value))} className="block w-full cursor-pointer accent-sky-400" />
            </>
          )}
          {point ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "Sun", textColor: "text-amber-300", azimuth: point.sun_azimuth_deg, elevation: point.sun_elevation_deg, accentBorder: "border-amber-500/25" },
                { name: "Earth", textColor: "text-sky-300", azimuth: point.earth_azimuth_deg, elevation: point.earth_elevation_deg, accentBorder: "border-sky-500/25" },
              ].map(({ name, textColor, azimuth, elevation, accentBorder }) => (
                <div key={name} className={`rounded-xl border ${accentBorder} bg-[#0A1424]/75 backdrop-blur-md p-3.5 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <dt className={`font-heading text-base font-semibold ${textColor}`}>{name}</dt>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-medium ${
                      elevation && elevation > 0 
                        ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50" 
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>
                      {horizonStatus(elevation)}
                    </span>
                  </div>
                  <dd className="mt-2 text-sm font-mono text-slate-200">
                    Azimuth <span className="font-bold text-white">{formatAngle(azimuth)}</span> · Elevation <span className="font-bold text-white">{formatAngle(elevation)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="flex flex-wrap items-center gap-3" role="status">
              <p className="text-sm text-[#A7B4C7]">
                {loading && !ephemeris ? "Loading NASA ephemeris…" : error || (positions?.status === "pending"
                  ? "Ephemeris data is pending."
                  : "No JPL Horizons positions are available for this site and time range.")}
              </p>
              {!ephemeris && !loading && (
                <button type="button" className={controlClass} onClick={() => {
                  clearPositions();
                  setRequestVersion((version) => version + 1);
                }}>Retry</button>
              )}
            </div>
          )}
          {point && <p className="text-xs leading-relaxed text-[#718096]">The cyan ring marks the geometric horizon at the site. Terrain can obstruct the view. Body sizes and distances are illustrative.</p>}
        </div>
      )}

      <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/[0.07] bg-[#040812]/75 px-5 py-3 text-xs text-slate-400 sm:px-6 backdrop-blur-md">
        <a className="underline decoration-slate-700 underline-offset-2 hover:text-sky-300 transition" href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">Earth imagery · NASA Blue Marble</a>
        <span>Sun and Moon textures · <a className="underline decoration-slate-700 underline-offset-2 hover:text-sky-300 transition" href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a> (<a className="underline decoration-slate-700 underline-offset-2 hover:text-sky-300 transition" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>, resized)</span>
        <a className="underline decoration-slate-700 underline-offset-2 hover:text-sky-300 transition" href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Eclipse calculations · Astronomy Engine</a>
        <a className="underline decoration-slate-700 underline-offset-2 hover:text-sky-300 transition" href="https://eclipse.gsfc.nasa.gov/OH/OH2025.html" target="_blank" rel="noreferrer">2025 eclipse catalog · NASA</a>
      </footer>
    </section>
  );
}
