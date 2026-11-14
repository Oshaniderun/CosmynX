import { lazy, Suspense, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { Eclipse, Moon, Pause, Play, RotateCcw } from "lucide-react";
import type { EphemerisResponse, LandingSite } from "../../../types/helios";
import { useMission } from "../../../context/MissionContext";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";
import { fetchEphemeris, initialMissionWindow, type MissionWindow } from "../services/ephemerisService";
import { eclipseStage, lunarEclipses } from "../services/lunarEclipses";
import { EclipseGuide, EclipsePurpose } from "./EclipseGuide";
import { getTerrainProfile, summarizeSolarObstruction, terrainClearance } from "../services/terrainSkyline";
import obstructionReplayData from "../assets/connecting-ridge-obstruction.json";

const obstructionReplay: EphemerisResponse = { ...obstructionReplayData.ephemeris, status: "ok" };
const replayProfile = getTerrainProfile(obstructionReplay);
const replayObstruction = replayProfile &&
  summarizeSolarObstruction(replayProfile, obstructionReplay.points, obstructionReplay.step_minutes);
const beforeCrossing = Math.max(0, (replayObstruction?.first ?? 0) - 1);
const behindRidge = obstructionReplay.points.length - 1;

const SpaceViewport = lazy(() => import("./SpaceViewport"));
const TerrainSurfaceView = lazy(() => import("./TerrainSurfaceView"));
const playDurationMs = 22_000;
const sampleDelayMs = 750;
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});
const missionTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const angleFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const formatAngle = (value?: number | null) => value == null ? "—" : angleFormat.format(value) + "°";

function horizonStatus(elevation: number | null) {
  if (elevation === null) return "Elevation unavailable";
  if (elevation === 0) return "At horizon";
  return elevation > 0 ? "Above horizon" : "Below horizon";
}

function parseUtcInput(value: string) {
  // datetime-local has no timezone. The form labels these wall-clock values as UTC.
  const time = new Date(value + "Z");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || value.startsWith("0000") || !Number.isFinite(time.getTime())) {
    return undefined;
  }
  const utc = time.toISOString();
  return utc.slice(0, 16) === value ? utc.replace(".000Z", "Z") : undefined;
}

const controlClass = "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-sky-400";
const modeClass = controlClass + " inline-flex items-center gap-2 aria-pressed:border-sky-400/70 aria-pressed:bg-sky-400/10 aria-pressed:text-sky-200";

export function SunEarthPanel({ ephemeris }: { ephemeris?: EphemerisResponse } = {}) {
  const { selectedSite, setSelectedSite } = useMission();
  const [mode, setMode] = useState<"eclipse" | "site">("site");
  const [eventIndex, setEventIndex] = useState(0);
  const [replayOffset, setReplayOffset] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [playingSamples, setPlayingSamples] = useState(false);
  const [showObstructionReplay, setShowObstructionReplay] = useState(false);
  const [terrainView, setTerrainView] = useState<"surface" | "orbit">("surface");
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteId, setSiteId] = useState(selectedSite?.site_id ?? "");
  const [startTime, setStartTime] = useState(initialMissionWindow.start_utc.slice(0, 16));
  const [endTime, setEndTime] = useState(initialMissionWindow.end_utc.slice(0, 16));
  const [request, setRequest] = useState<{ siteId: string; window: MissionWindow }>({
    siteId: selectedSite?.site_id ?? "",
    window: initialMissionWindow,
  });
  const [dateError, setDateError] = useState("");
  const [result, setResult] = useState<EphemerisResponse>();
  const [loading, setLoading] = useState(!ephemeris);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const scrubberId = useId();
  const dateErrorId = useId();

  // Sync siteId and request when selectedSite changes in MissionContext
  useEffect(() => {
    if (!selectedSite?.site_id) return;
    setSiteId(selectedSite.site_id);
    setRequest((prev) =>
      prev.siteId === selectedSite.site_id
        ? prev
        : { ...prev, siteId: selectedSite.site_id }
    );
  }, [selectedSite?.site_id]);

  const requestedSite = sites.find((site) => site.site_id === request.siteId) ?? (selectedSite ?? sites[0]);
  const positions = showObstructionReplay ? obstructionReplay : ephemeris ?? result;
  const missionWindow = positions ?? request.window;
  const isCustomWindow = missionWindow.start_utc !== initialMissionWindow.start_utc ||
    missionWindow.end_utc !== initialMissionWindow.end_utc;

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
    if (ephemeris || !requestedSite || showObstructionReplay) return;
    let active = true;
    fetchEphemeris(requestedSite, request.window).then((response) => {
      if (!active) return;
      setResult(response);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError("Couldn’t load Sun and Earth positions from the HELIOS API.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [ephemeris, requestedSite, request.window, requestVersion, showObstructionReplay]);

  function clearPositions() {
    setLoading(true);
    setError("");
    setPlayingSamples(false);
    setSampleIndex(0);
    setResult(undefined);
  }

  function requestPositions(selectedSite: string, window: MissionWindow) {
    setShowObstructionReplay(false);
    setDateError("");
    clearPositions();
    setRequest({ siteId: selectedSite, window: { ...window } });
  }

  function loadPositions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedSite = siteId || sites[0]?.site_id;
    if (!selectedSite) return;

    const startUtc = parseUtcInput(startTime);
    const endUtc = parseUtcInput(endTime);
    if (!startUtc || !endUtc || endUtc <= startUtc) {
      setDateError(startUtc && endUtc
        ? "End time must be after the start time."
        : "Enter a valid UTC start and end time.");
      return;
    }

    requestPositions(selectedSite, {
      start_utc: startUtc,
      end_utc: endUtc,
      step_minutes: initialMissionWindow.step_minutes,
    });
  }

  const event = lunarEclipses[eventIndex];
  const duration = event.end - event.start;
  const time = Math.min(event.start + replayOffset, event.end);
  const stage = eclipseStage(event, time);
  const points = useMemo(() => positions?.status === "ok"
    ? positions.points.filter((point) => Number.isFinite(Date.parse(point.timestamp_utc)))
        .sort((a, b) => Date.parse(a.timestamp_utc) - Date.parse(b.timestamp_utc))
    : [], [positions]);
  const lastSample = Math.max(points.length - 1, 0);
  const currentSample = Math.min(sampleIndex, lastSample);
  const point = points[currentSample];
  const terrain = getTerrainProfile(positions);
  const solarObstruction = useMemo(() => terrain && positions
    ? summarizeSolarObstruction(terrain, points, positions.step_minutes)
    : undefined, [terrain, positions, points]);

  function openObstructionReplay() {
    setTerrainView("surface");
    seekSample(beforeCrossing);
    setShowObstructionReplay(true);
  }

  function seekSample(index: number) {
    setPlayingSamples(false);
    setSampleIndex(index);
  }

  useEffect(() => {
    if (!playingSamples || mode !== "site") return;
    if (currentSample >= lastSample) {
      setPlayingSamples(false);
      return;
    }
    const timer = window.setTimeout(() => setSampleIndex(currentSample + 1), sampleDelayMs);
    return () => window.clearTimeout(timer);
  }, [playingSamples, mode, currentSample, lastSample]);

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
    <section aria-labelledby="space-explorer-title" className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#0a101b] shadow-lg md:col-span-2">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="space-explorer-title" className="text-lg font-semibold tracking-tight text-slate-100">Sun, Earth & Moon</h2>
          {selectedSite && (
            <div className="flex items-center gap-2 rounded bg-slate-950/80 px-2.5 py-1 text-xs text-cyan-300 font-mono border border-cyan-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Target: {selectedSite.name} ({selectedSite.site_id})</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="View mode">
          <button type="button" aria-pressed={mode === "eclipse"} className={modeClass} onClick={() => { setPlayingSamples(false); setMode("eclipse"); }}>
            <Eclipse size={15} aria-hidden="true" /> Eclipse replay
          </button>
          <button type="button" aria-pressed={mode === "site"} className={modeClass} onClick={() => { setPlaying(false); setMode("site"); }}>
            <Moon size={15} aria-hidden="true" /> Landing site
          </button>
        </div>
      </header>

      {mode === "eclipse" && <EclipsePurpose />}

      {mode === "site" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/45 px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-medium text-slate-100">Connecting Ridge terrain case</p>
            <p className="mt-1 text-xs text-slate-400">Explore a real terrain obstruction using NASA elevation and ephemeris data.</p>
          </div>
          <button type="button" className={controlClass + (showObstructionReplay ? "" : " border-amber-300/50 bg-amber-400/10 text-amber-100 hover:border-amber-300 hover:bg-amber-400/15")} onClick={showObstructionReplay ? () => {
            setPlayingSamples(false);
            setSampleIndex(0);
            if (!ephemeris) {
              clearPositions();
              setRequest((previous) => ({ ...previous }));
            }
            setShowObstructionReplay(false);
          } : openObstructionReplay}>
            {showObstructionReplay ? "Return to mission window" : "Open terrain case"}
          </button>
        </div>
      )}

      {mode === "site" && showObstructionReplay && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Terrain case shortcuts">
            {[
              { index: beforeCrossing, label: "Before crossing" },
              { index: behindRidge, label: "Behind the ridge" },
            ].map(({ index, label }) => (
              <button type="button" key={label} className={modeClass}
                aria-pressed={currentSample === index} onClick={() => seekSample(index)}>
                {label}
                <span className="font-normal text-slate-400">{timeFormat.format(new Date(obstructionReplay.points[index].timestamp_utc))} UTC</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2" role="group" aria-label="Terrain case view">
            <button type="button" className={modeClass} aria-pressed={terrainView === "surface"} onClick={() => setTerrainView("surface")}>Surface view</button>
            <button type="button" className={modeClass} aria-pressed={terrainView === "orbit"} onClick={() => setTerrainView("orbit")}>3D orbit</button>
          </div>
        </div>
      )}

      {mode === "site" && !showObstructionReplay && !ephemeris && sites.length > 0 && (
        <form onSubmit={loadPositions} className="space-y-2 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-xs text-slate-300">
              Landing site
              <select className={controlClass} value={siteId || sites[0].site_id} onChange={(change) => setSiteId(change.target.value)}>
                {sites.map((site) => <option key={site.site_id} value={site.site_id}>{site.name}</option>)}
              </select>
            </label>
            <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-xs text-slate-300">
              Start time (UTC)
              <input
                className={controlClass + " scheme-dark"}
                type="datetime-local" required value={startTime}
                aria-invalid={Boolean(dateError)} aria-describedby={dateError ? dateErrorId : undefined}
                onChange={(change) => { setStartTime(change.target.value); setDateError(""); }}
              />
            </label>
            <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-xs text-slate-300">
              End time (UTC)
              <input
                className={controlClass + " scheme-dark"}
                type="datetime-local" required value={endTime}
                aria-invalid={Boolean(dateError)} aria-describedby={dateError ? dateErrorId : undefined}
                onChange={(change) => { setEndTime(change.target.value); setDateError(""); }}
              />
            </label>
            <button type="submit" className="rounded-md bg-sky-300 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
              Load positions
            </button>
          </div>
          {dateError && <p id={dateErrorId} role="alert" className="text-xs text-rose-300">{dateError}</p>}
        </form>
      )}

      {(mode === "eclipse" || (positions?.status === "ok" && points.length > 0)) && (
        <Suspense fallback={<div className="grid h-[360px] place-items-center bg-slate-950 text-sm text-slate-400 sm:h-[460px]" role="status">Loading view…</div>}>
          {mode === "eclipse" ? (
            <SpaceViewport key="eclipse" frame={{ mode, time }} />
          ) : showObstructionReplay && terrainView === "surface" && terrain && point ? (
            <TerrainSurfaceView profile={terrain} point={point} />
          ) : positions && (
            <SpaceViewport key={positions.site_id} frame={{
              mode, point, latitude: positions.latitude_deg, longitude: positions.longitude_deg,
            }} />
          )}
        </Suspense>
      )}

      {mode === "eclipse" ? (
        <div className="space-y-3 border-t border-slate-800 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300" aria-label="Earth’s shadow legend">
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
            <time className="min-w-[122px] text-right text-xs tabular-nums text-slate-200" dateTime={new Date(time).toISOString()}>
              {timeFormat.format(time)} UTC
            </time>
          </div>
          <EclipseGuide event={event} stage={stage} onSeek={(stageTime) => {
            setPlaying(false);
            setReplayOffset(stageTime - event.start);
          }} />
        </div>
      ) : (
        <div className="space-y-3 border-t border-slate-800 px-4 py-4 sm:px-6">
          {!ephemeris && sites.length > 0 && (
            <label className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              Landing site
              <select className={controlClass} value={requestedSite?.site_id ?? siteId} onChange={(change) => {
                clearPositions();
                const nextId = change.target.value;
                setSiteId(nextId);
                setRequest((prev) => ({ ...prev, siteId: nextId }));
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
              <p className="text-slate-300">
                {showObstructionReplay ? "Connecting Ridge · Offline case · " : !ephemeris && requestedSite && `${requestedSite.name} · `}
                {positions.source} · {positions.latitude_deg}°, {positions.longitude_deg}°
              </p>
              {point && <time className="tabular-nums text-slate-200" dateTime={point.timestamp_utc}>{timeFormat.format(new Date(point.timestamp_utc))} UTC</time>}
            </div>
          )}
          <p className="text-xs text-slate-400">
            Mission window · {missionTimeFormat.format(Date.parse(missionWindow.start_utc))}–{missionTimeFormat.format(Date.parse(missionWindow.end_utc))} UTC
          </p>
          {solarObstruction && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300/25 bg-amber-300/5 p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">Terrain changes the sunlight result</p>
                <p className="text-xs leading-relaxed text-slate-300">
                  In {solarObstruction.obscuredCount} of {solarObstruction.assessedCount} assessed samples, the Sun’s center is above 0° and at or below the modeled terrain.
                </p>
                {solarObstruction.crossing && (
                  <p className="text-xs text-slate-300">
                    First sampled crossing · {timeFormat.format(Date.parse(solarObstruction.crossing.from))}–{timeFormat.format(Date.parse(solarObstruction.crossing.to))} UTC
                  </p>
                )}
              </div>
              <button type="button" className={controlClass} onClick={() => seekSample(solarObstruction.first)}>Jump to first obstruction</button>
            </div>
          )}
          {point && points.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={playingSamples ? "Pause landing site playback" : "Play landing site samples"}
                className={controlClass + " inline-flex min-w-20 items-center gap-1.5"}
                onClick={() => {
                  if (!playingSamples && currentSample === lastSample) setSampleIndex(0);
                  setPlayingSamples(!playingSamples);
                }}
              >
                {playingSamples ? <><Pause size={14} aria-hidden="true" /> Pause</> : <><Play size={14} aria-hidden="true" /> Play</>}
              </button>
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor={scrubberId}>Landing site sample time (UTC)</label>
                <input
                  id={scrubberId} type="range" min={0} max={lastSample} value={currentSample}
                  aria-valuetext={`${timeFormat.format(new Date(point.timestamp_utc))} UTC. Sun ${horizonStatus(point.sun_elevation_deg).toLowerCase()}. Earth ${horizonStatus(point.earth_elevation_deg).toLowerCase()}.`}
                  onChange={(change) => {
                    setPlayingSamples(false);
                    setSampleIndex(Number(change.target.value));
                  }}
                  className="block w-full cursor-pointer accent-sky-400"
                />
              </div>
              <p className="shrink-0 text-xs tabular-nums text-slate-400">
                <span className="sr-only">Sample </span>{currentSample + 1} / {points.length}
              </p>
            </div>
          )}
          {point ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                { name: "Sun", textColor: "text-amber-200", azimuth: point.sun_azimuth_deg, elevation: point.sun_elevation_deg },
                { name: "Earth", textColor: "text-sky-200", azimuth: point.earth_azimuth_deg, elevation: point.earth_elevation_deg },
              ].map(({ name, textColor, azimuth, elevation }) => {
                const local = terrain && terrainClearance(terrain, azimuth, elevation);
                return (
                  <div key={name} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <dt className={`font-medium ${textColor}`}>{name}</dt>
                    <dd className="mt-1 text-xs text-slate-300">Azimuth {formatAngle(azimuth)} · Elevation {formatAngle(elevation)}</dd>
                    <dd className="mt-1 text-xs text-slate-400">Geometric · {horizonStatus(elevation)}</dd>
                    {terrain && (
                      <dd className="mt-2 border-t border-slate-800 pt-2 text-xs">
                        {local ? (
                          <>
                            <p className={local.clearance > 0 ? "font-medium text-emerald-300" : "font-medium text-amber-200"}>
                              {local.clearance > 0 ? "Clears modeled terrain" : "At or below the modeled skyline"}
                            </p>
                            <p className="mt-1 text-slate-300">Skyline {formatAngle(local.skyline)} · Clearance {formatAngle(local.clearance)}</p>
                          </>
                        ) : <p className="text-slate-400">Terrain clearance unavailable</p>}
                      </dd>
                    )}
                  </div>
                );
              })}
            </dl>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-300" role="status">
                {loading && !ephemeris ? "Loading NASA ephemeris…" : error || (positions?.status === "pending"
                  ? "Ephemeris data is pending."
                  : "No JPL Horizons positions are available for this site and time range.")}
              </p>
              {!ephemeris && !loading && (error || !positions) && (
                <button type="button" className={controlClass} onClick={() => {
                  clearPositions();
                  setRequestVersion((version) => version + 1);
                }}>Retry</button>
              )}
              {!ephemeris && !loading && positions?.status === "unavailable" && isCustomWindow && requestedSite && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    You can load the cached JPL Horizons samples for this site on 20 Nov 2026, 00:00–06:00 UTC.
                  </p>
                  <button type="button" className={controlClass} onClick={() => {
                    setSiteId(requestedSite.site_id);
                    setStartTime(initialMissionWindow.start_utc.slice(0, 16));
                    setEndTime(initialMissionWindow.end_utc.slice(0, 16));
                    requestPositions(requestedSite.site_id, initialMissionWindow);
                  }}>Load cached window</button>
                </div>
              )}
            </div>
          )}
          {point && terrain && showObstructionReplay && (
            <details className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs leading-relaxed text-slate-300">
              <summary className="cursor-pointer font-medium text-slate-200">How we calculated this</summary>
              <p className="mt-2">
                The angles come from hourly <a className="underline underline-offset-2" href="https://naif.jpl.nasa.gov/pub/naif/generic_kernels/" target="_blank" rel="noreferrer">NASA/JPL SPICE samples (DE440)</a>.
                The skyline uses the <a className="underline underline-offset-2" href="https://pgda.gsfc.nasa.gov/products/78" target="_blank" rel="noreferrer">NASA LOLA Site01 elevation grid</a> at {terrain.pixel_size_m} m per pixel.
              </p>
              <p className="mt-2">
                We subtract the highest terrain angle within {terrain.max_distance_m / 1_000} km in the Sun’s direction from the Sun’s elevation, for an observer {terrain.observer_height_m} m above the surface.
                The results describe the center of the Sun. Part of its disk may still be visible near the crossing.
              </p>
            </details>
          )}
          {point && terrain && !showObstructionReplay && (
            <p className="text-xs leading-relaxed text-slate-300">
              <a className="underline decoration-slate-500 underline-offset-2 hover:text-white" href={terrain.source_url} target="_blank" rel="noreferrer">NASA LRO LOLA Site01</a>
              {" · "}{terrain.pixel_size_m} m grid · Terrain within {terrain.max_distance_m / 1_000} km · Observer {terrain.observer_height_m} m above the surface.
              Clearance compares each body’s center with the terrain in its direction.
            </p>
          )}
          {point && (!showObstructionReplay || terrainView === "orbit") && <p className="text-xs leading-relaxed text-slate-400">
            The cyan ring marks the geometric horizon. {terrain ? "Terrain farther away can still affect the view." : "Select Connecting Ridge for a terrain comparison using NASA LOLA data."} Body sizes and distances are illustrative.
          </p>}
        </div>
      )}

      <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800 px-4 py-3 text-[11px] text-slate-400 sm:px-6">
        <a className="underline decoration-slate-600 underline-offset-2 hover:text-white" href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">Earth imagery · NASA Blue Marble</a>
        <span>Sun and Moon textures · <a className="underline decoration-slate-600 underline-offset-2 hover:text-white" href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a> (<a className="underline decoration-slate-600 underline-offset-2 hover:text-white" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>, resized)</span>
        <a className="underline decoration-slate-600 underline-offset-2 hover:text-white" href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Eclipse calculations · Astronomy Engine</a>
        <a className="underline decoration-slate-600 underline-offset-2 hover:text-white" href="https://eclipse.gsfc.nasa.gov/OH/OH2025.html" target="_blank" rel="noreferrer">2025 eclipse catalog · NASA</a>
      </footer>
    </section>
  );
}
