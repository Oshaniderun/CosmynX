import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Eclipse,
  FileText,
  Globe,
  Layers,
  MapPin,
  Moon,
  Mountain,
  Pause,
  Play,
  PlusCircle,
  Radio,
  RefreshCw,
  Rocket,
  RotateCcw,
  Scale,
  Users,
} from "lucide-react";
import { useMission } from "../../../context/MissionContext";
import type { EphemerisResponse, LandingSite } from "../../../types/helios";
import { fetchCandidateSites, validateCustomSite } from "../services/sitesService";
import { LunarMap } from "./LunarMap";
import {
  fetchEphemeris,
  initialMissionWindow,
  type MissionWindow,
} from "../../sun-earth/services/ephemerisService";
import { eclipseStage, lunarEclipses } from "../../sun-earth/services/lunarEclipses";
import { EclipseGuide, EclipsePurpose } from "../../sun-earth/components/EclipseGuide";
import {
  getTerrainProfile,
  summarizeSolarObstruction,
  terrainClearance,
} from "../../sun-earth/services/terrainSkyline";
import obstructionReplayData from "../../sun-earth/assets/connecting-ridge-obstruction.json";
import {
  APOLLO_DOSSIERS,
  apolloDossierToLandingSite,
  getApolloDossier,
} from "../../sun-earth/services/apolloDossiers";

const SpaceViewport = lazy(() => import("../../sun-earth/components/SpaceViewport"));
const TerrainSurfaceView = lazy(() => import("../../sun-earth/components/TerrainSurfaceView"));

const obstructionReplay: EphemerisResponse = {
  ...obstructionReplayData.ephemeris,
  status: "ok",
};
const replayProfile = getTerrainProfile(obstructionReplay);
const replayObstruction =
  replayProfile &&
  summarizeSolarObstruction(
    replayProfile,
    obstructionReplay.points,
    obstructionReplay.step_minutes
  );
const beforeCrossing = Math.max(0, (replayObstruction?.first ?? 0) - 1);
const behindRidge = obstructionReplay.points.length - 1;

const MAX_3D_ZOOM = 18;
const playDurationMs = 22_000;
const sampleDelayMs = 750;

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const missionTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const angleFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const formatAngle = (value?: number | null) =>
  value == null ? "—" : angleFormat.format(value) + "°";

function horizonStatus(elevation: number | null) {
  if (elevation === null) return "Elevation unavailable";
  if (elevation === 0) return "At horizon";
  return elevation > 0 ? "Above horizon" : "Below horizon";
}

function parseUtcInput(value: string) {
  const time = new Date(value + "Z");
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ||
    value.startsWith("0000") ||
    !Number.isFinite(time.getTime())
  ) {
    return undefined;
  }
  const utc = time.toISOString();
  return utc.slice(0, 16) === value ? utc.replace(".000Z", "Z") : undefined;
}

const controlClass =
  "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-sky-400";
const modeClass =
  controlClass +
  " inline-flex items-center gap-2 aria-pressed:border-sky-400/70 aria-pressed:bg-sky-400/10 aria-pressed:text-sky-200";

export function UnifiedLunarExplorer({
  ephemeris,
}: { ephemeris?: EphemerisResponse } = {}) {
  const {
    selectedSite,
    setSelectedSite,
    missionDates,
    customCoordinates,
    setCustomCoordinates,
  } = useMission();

  // Explorer view mode: 3D Space (auto-transitions to Surface Map on zoom), Surface Map, or Eclipse replay
  const [viewMode, setViewMode] = useState<"3d" | "surface" | "eclipse">("3d");
  const [cameraZoom, setCameraZoom] = useState(1);
  const [focusSeq, setFocusSeq] = useState(0);
  const zoomTransitionLock = useRef(false);

  // Site selection & custom coordinate state
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [sitesLoading, setSitesLoading] = useState<boolean>(true);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"candidates" | "apollo" | "custom">("candidates");
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);
  const [customLat, setCustomLat] = useState<string>("-89.45");
  const [customLon, setCustomLon] = useState<string>("42.10");
  const [customName, setCustomName] = useState<string>("Custom Polar Target");

  // Ephemeris, eclipse, and terrain obstruction state
  const [eventIndex, setEventIndex] = useState(0);
  const [replayOffset, setReplayOffset] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [playingSamples, setPlayingSamples] = useState(false);
  const [showObstructionReplay, setShowObstructionReplay] = useState(false);
  const [terrainView, setTerrainView] = useState<"surface" | "orbit">("surface");
  const [showWindowForm, setShowWindowForm] = useState(false);

  const [siteId, setSiteId] = useState(selectedSite?.site_id ?? "");
  const [startTime, setStartTime] = useState(initialMissionWindow.start_utc.slice(0, 16));
  const [endTime, setEndTime] = useState(initialMissionWindow.end_utc.slice(0, 16));
  const [request, setRequest] = useState<{ siteId: string; window: MissionWindow }>({
    siteId: selectedSite?.site_id ?? "",
    window: initialMissionWindow,
  });
  const [dateError, setDateError] = useState("");
  const [result, setResult] = useState<EphemerisResponse>();
  const [ephemLoading, setEphemLoading] = useState(!ephemeris);
  const [ephemError, setEphemError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const scrubberId = useId();
  const dateErrorId = useId();

  // Load Artemis III candidate sites
  const loadSites = async () => {
    setSitesLoading(true);
    setSitesError(null);
    try {
      const data = await fetchCandidateSites();
      setSites(data);
      if (data.length > 0 && !selectedSite) {
        setSelectedSite(data[0]);
      }
    } catch (err: unknown) {
      setSitesError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve candidate landing sites from backend."
      );
    } finally {
      setSitesLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  // Sync ephemeris request when selectedSite changes in MissionContext
  useEffect(() => {
    if (!selectedSite?.site_id || request.siteId === selectedSite.site_id) return;
    setShowObstructionReplay(false);
    clearPositions();
    setSiteId(selectedSite.site_id);
    setRequest((prev) => ({ ...prev, siteId: selectedSite.site_id }));
  }, [selectedSite?.site_id, request.siteId]);

  const selectSites = useMemo(() => {
    if (selectedSite && !sites.some((s) => s.site_id === selectedSite.site_id)) {
      return [selectedSite, ...sites];
    }
    return sites;
  }, [sites, selectedSite]);

  const requestedSite =
    (selectedSite && selectedSite.site_id === request.siteId ? selectedSite : undefined) ??
    sites.find((site) => site.site_id === request.siteId) ??
    selectedSite ??
    sites[0];

  const positions = showObstructionReplay ? obstructionReplay : ephemeris ?? result;
  const missionWindow = positions ?? request.window;
  const isCustomWindow =
    missionWindow.start_utc !== initialMissionWindow.start_utc ||
    missionWindow.end_utc !== initialMissionWindow.end_utc;

  // Fetch ephemeris for active site & mission window
  useEffect(() => {
    if (ephemeris || !requestedSite || showObstructionReplay) return;
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      active = false;
      setEphemError("Timed out waiting for NASA ephemeris from the HELIOS API.");
      setEphemLoading(false);
    }, 15_000);

    fetchEphemeris(requestedSite, request.window)
      .then((response) => {
        if (!active) return;
        window.clearTimeout(timeoutId);
        setResult(response);
        setEphemLoading(false);
      })
      .catch(() => {
        if (!active) return;
        window.clearTimeout(timeoutId);
        setEphemError("Couldn’t load Sun and Earth positions from the HELIOS API.");
        setEphemLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [
    ephemeris,
    requestedSite?.site_id,
    requestedSite?.latitude_deg,
    requestedSite?.longitude_deg,
    request.window.start_utc,
    request.window.end_utc,
    request.window.step_minutes,
    requestVersion,
    showObstructionReplay,
  ]);

  function clearPositions() {
    setResult(undefined);
    setEphemError("");
    setEphemLoading(!ephemeris);
    setSampleIndex(0);
    setPlayingSamples(false);
  }

  function requestPositions(nextSiteId: string, nextWindow: MissionWindow) {
    setShowObstructionReplay(false);
    clearPositions();
    setRequest({ siteId: nextSiteId, window: nextWindow });
    setRequestVersion((version) => version + 1);
  }

  // Handle custom site plot
  const handlePlotCustomSite = async (lat?: number, lon?: number) => {
    const targetLat = lat ?? parseFloat(customLat);
    const targetLon = lon ?? parseFloat(customLon);

    if (isNaN(targetLat) || targetLat < -90.0 || targetLat > -80.0) {
      alert("Latitude must be between -90.0° and -80.0° for the Lunar South Pole.");
      return;
    }
    if (isNaN(targetLon) || targetLon < -180.0 || targetLon > 360.0) {
      alert("Longitude must be between -180.0° and +360.0°.");
      return;
    }

    try {
      const validated = await validateCustomSite({
        name: customName.trim() || "Custom Polar Target",
        latitude_deg: targetLat,
        longitude_deg: targetLon,
        description: `Custom coordinate target placed at ${targetLat.toFixed(3)}°S, ${targetLon.toFixed(3)}°.`,
      });
      setCustomCoordinates({
        latitude_deg: validated.latitude_deg,
        longitude_deg: validated.longitude_deg,
      });
      setSelectedSite(validated);
      setIsPinDropMode(false);
    } catch {
      const fallbackSite: LandingSite = {
        site_id: `custom_${Math.abs(Math.round(targetLat * 100))}`,
        name: customName.trim() || "Custom Polar Target",
        region: "Lunar South Pole (Custom)",
        latitude_deg: targetLat,
        longitude_deg: targetLon > 180 ? targetLon - 360 : targetLon,
        description: `Custom target placed at ${targetLat.toFixed(3)}°S, ${targetLon.toFixed(3)}°.`,
        source: "User Coordinate Input",
        coordinate_type: "custom_user_pin",
      };
      setCustomCoordinates({
        latitude_deg: fallbackSite.latitude_deg,
        longitude_deg: fallbackSite.longitude_deg,
      });
      setSelectedSite(fallbackSite);
      setIsPinDropMode(false);
    }
  };

  const handleMapClickCoordinates = (lat: number, lon: number) => {
    setCustomLat(lat.toFixed(3));
    setCustomLon(lon.toFixed(3));
    handlePlotCustomSite(lat, lon);
  };

  const customSiteObj: LandingSite | null = customCoordinates
    ? {
        site_id: "custom_user_target",
        name: customName || "Custom Polar Target",
        region: "Lunar South Pole (Custom)",
        latitude_deg: customCoordinates.latitude_deg,
        longitude_deg: customCoordinates.longitude_deg,
        description: "User-defined coordinate location on the lunar surface.",
        source: "User Coordinate Input",
      }
    : null;

  // Eclipse & sample playback calculations
  const event = lunarEclipses[eventIndex];
  const duration = event.end - event.start;
  const time = event.start + replayOffset;
  const stage = eclipseStage(event, time);
  const replayFinished = replayOffset >= duration;

  const points = positions?.points ?? [];
  const lastSample = Math.max(0, points.length - 1);
  const currentSample = Math.min(sampleIndex, lastSample);
  const point = points[currentSample];
  const terrain = useMemo(() => getTerrainProfile(positions), [positions]);
  const solarObstruction = useMemo(
    () =>
      terrain && positions
        ? summarizeSolarObstruction(terrain, points, positions.step_minutes)
        : undefined,
    [terrain, positions, points]
  );

  function seekSample(index: number) {
    setPlayingSamples(false);
    setSampleIndex(index);
  }

  function openObstructionReplay() {
    setPlaying(false);
    setPlayingSamples(false);
    setShowObstructionReplay(true);
    setTerrainView("surface");
    setSampleIndex(beforeCrossing);
  }

  useEffect(() => {
    if (viewMode !== "eclipse" || !playing) return;
    let frameId = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;
      setReplayOffset((offset) => {
        const next = offset + (elapsed / playDurationMs) * duration;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [duration, viewMode, playing]);

  useEffect(() => {
    if (viewMode === "eclipse" || !playingSamples || points.length < 2) return;
    const timer = window.setInterval(() => {
      setSampleIndex((index) => {
        if (index >= lastSample) {
          setPlayingSamples(false);
          return index;
        }
        return index + 1;
      });
    }, sampleDelayMs);
    return () => window.clearInterval(timer);
  }, [lastSample, viewMode, playingSamples, points.length]);

  function loadPositions(submit: FormEvent) {
    submit.preventDefault();
    const startUtc = parseUtcInput(startTime);
    const endUtc = parseUtcInput(endTime);
    if (!startUtc || !endUtc) {
      setDateError("Enter valid UTC dates and times.");
      return;
    }
    if (Date.parse(endUtc) <= Date.parse(startUtc)) {
      setDateError("End time must be after start time.");
      return;
    }
    if (!requestedSite) {
      setDateError("Select a landing site.");
      return;
    }
    setDateError("");
    setShowWindowForm(false);
    requestPositions(requestedSite.site_id, {
      start_utc: startUtc,
      end_utc: endUtc,
      step_minutes: 60,
    });
  }

  const switchTo3D = () => {
    setPlaying(false);
    zoomTransitionLock.current = true;
    setViewMode("3d");
  };

  const switchToSurface = () => {
    setPlaying(false);
    setViewMode("surface");
  };

  const terrainMetrics = selectedSite?.terrain;

  return (
    <section
      aria-labelledby="unified-explorer-title"
      className="col-span-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/75 shadow-lg shadow-slate-950/50"
    >
      {/* Top Header & View Mode Controls */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="unified-explorer-title"
                className="text-lg font-semibold tracking-tight text-slate-100"
              >
                3D Lunar Explorer &amp; Site Selection
              </h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                3D → Surface
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Zoom directly onto the 3D South Polar relief (up to {MAX_3D_ZOOM}×) or switch to the 2D Surface Map for coordinate pin-dropping &amp; LOLA terrain metrics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Explorer view mode">
          <button
            type="button"
            aria-pressed={viewMode === "3d"}
            className={modeClass}
            onClick={switchTo3D}
          >
            <Globe size={15} aria-hidden="true" /> 3D Space
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "surface"}
            className={modeClass}
            onClick={switchToSurface}
          >
            <Layers size={15} aria-hidden="true" /> Surface Map
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "eclipse"}
            className={modeClass}
            onClick={() => {
              setPlayingSamples(false);
              setViewMode("eclipse");
            }}
          >
            <Eclipse size={15} aria-hidden="true" /> Eclipse replay
          </button>
        </div>
      </header>

      {/* Top Mission Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-4 py-2.5 text-xs sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
          <span className="text-slate-400">Selected Site:</span>
          <span className="font-semibold text-cyan-300">
            {selectedSite ? selectedSite.name : "None (Select on Globe, Map, or List)"}
          </span>
          {selectedSite && (
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
              {selectedSite.latitude_deg >= 0
                ? `${selectedSite.latitude_deg.toFixed(2)}°N`
                : `${Math.abs(selectedSite.latitude_deg).toFixed(2)}°S`},{" "}
              {selectedSite.longitude_deg >= 0
                ? `${selectedSite.longitude_deg.toFixed(2)}°E`
                : `${Math.abs(selectedSite.longitude_deg).toFixed(2)}°W`}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono text-slate-300">
              {missionDates.startUtc.slice(0, 10)} → {missionDates.endUtc.slice(0, 10)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300">{sites.length} Artemis Candidates</span>
          </div>
        </div>
      </div>

      {viewMode === "eclipse" ? (
        <>
          <EclipsePurpose />
          <Suspense
            fallback={
              <div
                className="grid h-[360px] place-items-center bg-slate-950 text-sm text-slate-400 sm:h-[460px]"
                role="status"
              >
                Loading 3D eclipse view…
              </div>
            }
          >
            <SpaceViewport key="eclipse" frame={{ mode: "eclipse", time }} />
          </Suspense>

          <div className="space-y-3 border-t border-slate-800 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                Total lunar eclipse
                <select
                  className={controlClass}
                  value={eventIndex}
                  onChange={(change) => {
                    const next = Number(change.target.value);
                    setPlaying(false);
                    setEventIndex(next);
                    setReplayOffset(0);
                  }}
                >
                  {lunarEclipses.map(({ label }, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300"
                aria-label="Earth’s shadow legend"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-2.5 rounded-full border border-[#fb9366]" />{" "}
                  Umbra · inner shadow
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-2.5 rounded-full border border-[#c4a1bd]" />{" "}
                  Penumbra · outer shadow
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={playing ? "Pause eclipse" : "Play eclipse"}
                className={controlClass}
                onClick={() => {
                  if (!playing && replayFinished) setReplayOffset(0);
                  setPlaying(!playing);
                }}
              >
                {playing ? (
                  <Pause size={16} aria-hidden="true" />
                ) : (
                  <Play size={16} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                title="Restart eclipse"
                aria-label="Restart eclipse"
                className={controlClass}
                onClick={() => {
                  setPlaying(false);
                  setReplayOffset(0);
                }}
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
              <div className="min-w-32 flex-1">
                <label className="sr-only" htmlFor={scrubberId}>
                  Eclipse time (UTC)
                </label>
                <input
                  id={scrubberId}
                  type="range"
                  min={0}
                  max={duration}
                  step="any"
                  value={replayOffset}
                  aria-valuetext={timeFormat.format(time) + " UTC · " + stage.label}
                  onChange={(change) => {
                    setPlaying(false);
                    setReplayOffset(Number(change.target.value));
                  }}
                  className="block w-full cursor-pointer accent-sky-400"
                />
              </div>
              <time
                className="min-w-[122px] text-right text-xs tabular-nums text-slate-200"
                dateTime={new Date(time).toISOString()}
              >
                {timeFormat.format(time)} UTC
              </time>
            </div>

            <EclipseGuide
              event={event}
              stage={stage}
              onSeek={(stageTime) => {
                setPlaying(false);
                setReplayOffset(stageTime - event.start);
              }}
            />
          </div>
        </>
      ) : (
        /* Main Unified Explorer Grid: Interactive Viewport (8 Cols) + Site Details & Selector (4 Cols) */
        <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-12">
          {/* Left 8 Cols: 3D Space Viewport OR 2D Surface Map */}
          <div className="flex flex-col gap-3 lg:col-span-8">
            {/* Top Viewport Toolbar */}
            {viewMode === "3d" ? (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-medium text-slate-200">
                    3D Lunar South Pole &amp; Sun/Earth Geometry
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                    Zoom {cameraZoom.toFixed(1)}× / {MAX_3D_ZOOM}×
                  </span>
                  <span className="hidden rounded border border-cyan-500/30 bg-cyan-950/50 px-2 py-0.5 text-[10px] text-cyan-300 sm:inline-block">
                    {cameraZoom >= 6
                      ? `Surface Close-Up · ${selectedSite?.name ?? "South Pole"}`
                      : cameraZoom >= 2.5
                      ? `Regional Approach · ${selectedSite?.name ?? "South Pole"}`
                      : "Orbital Overview"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={switchToSurface}
                  className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-200 transition hover:bg-cyan-900/50"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Inspect Surface Map
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-medium text-slate-200">
                    Simulated South Polar Topography — Illustrative Basemap (R = 1,737.4 km)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={switchTo3D}
                    className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                  >
                    <Globe className="h-3.5 w-3.5 text-sky-400" />
                    Back to 3D Globe
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPinDropMode((prev) => !prev)}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      isPinDropMode
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {isPinDropMode ? "Pin Drop Active" : "Click to Drop Pin"}
                  </button>
                </div>
              </div>
            )}

            {/* Layered Continuous Zoom Viewport (3D Globe <-> 2D Surface Map) */}
            {showObstructionReplay &&
            terrainView === "surface" &&
            terrain &&
            point ? (
              <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                <Suspense
                  fallback={
                    <div
                      className="grid h-[520px] place-items-center bg-slate-950 text-sm text-slate-400"
                      role="status"
                    >
                      Loading terrain surface view…
                    </div>
                  }
                >
                  <TerrainSurfaceView profile={terrain} point={point} />
                </Suspense>
              </div>
            ) : (
              <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                {/* 3D Globe Layer */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    viewMode === "3d"
                      ? "pointer-events-auto scale-100 opacity-100"
                      : "pointer-events-none scale-110 opacity-0"
                  }`}
                >
                  <Suspense
                    fallback={
                      <div
                        className="grid h-[520px] place-items-center bg-slate-950 text-sm text-slate-400"
                        role="status"
                      >
                        Loading 3D view…
                      </div>
                    }
                  >
                    <SpaceViewport
                      key="site-3d"
                      frame={{
                        mode: "site",
                        point,
                        latitude:
                          (showObstructionReplay ? positions?.latitude_deg : undefined) ??
                          selectedSite?.latitude_deg ??
                          positions?.latitude_deg ??
                          -89.45,
                        longitude:
                          (showObstructionReplay ? positions?.longitude_deg : undefined) ??
                          selectedSite?.longitude_deg ??
                          positions?.longitude_deg ??
                          0,
                        sites: selectSites,
                        selectedSiteId: selectedSite?.site_id,
                        focusSeq,
                      }}
                      onSelectSite={(site) => {
                        startTransition(() => {
                          setSelectedSite(site);
                          if (site.site_id.startsWith("apollo_")) {
                            setActiveTab("apollo");
                          }
                        });
                      }}
                      onZoomChange={(zoom) => {
                        setCameraZoom(zoom);
                      }}
                    />
                  </Suspense>
                </div>

                {/* 2D Surface Map Layer */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    viewMode === "surface"
                      ? "pointer-events-auto scale-100 opacity-100"
                      : "pointer-events-none scale-95 opacity-0"
                  }`}
                >
                  <LunarMap
                    sites={sites}
                    selectedSite={selectedSite}
                    onSelectSite={(site) => {
                      startTransition(() => {
                        setSelectedSite(site);
                      });
                    }}
                    customSite={customSiteObj}
                    onMapClickCoordinates={handleMapClickCoordinates}
                    isPinDropMode={isPinDropMode}
                    onZoomOutToGlobe={switchTo3D}
                  />
                </div>
              </div>
            )}

            {/* Bottom Legend Bar */}
            {viewMode === "3d" ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800/80 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-400">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span>3D Site Pin (Click to Select)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40" />
                    <span>Active Selection</span>
                  </span>
                </div>
                <span className="font-mono text-slate-400">
                  Scroll/pinch to zoom onto 3D crater relief (up to {MAX_3D_ZOOM}×)
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800/80 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span>Candidate Site</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40" />
                    <span>Active Selection</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                    <span>Custom Target</span>
                  </span>
                </div>
                <span className="font-mono text-slate-500">
                  Scroll out at min zoom to return to 3D Globe
                </span>
              </div>
            )}
          </div>

          {/* Right 4 Cols: Site Selector, Custom Coordinates & LOLA Location Details */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("candidates")}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  activeTab === "candidates"
                    ? "bg-slate-800 text-cyan-300 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Artemis Regions ({sites.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("apollo");
                  if (!selectedSite?.site_id.startsWith("apollo_")) {
                    const defaultApollo = APOLLO_DOSSIERS["apollo_11"];
                    if (defaultApollo) {
                      startTransition(() => {
                        setSelectedSite(apolloDossierToLandingSite(defaultApollo));
                      });
                    }
                  }
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  activeTab === "apollo"
                    ? "bg-slate-800 text-sky-300 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Apollo Sites ({Object.keys(APOLLO_DOSSIERS).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  activeTab === "custom"
                    ? "bg-slate-800 text-purple-300 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Custom Coordinates
              </button>
            </div>

            {sitesLoading && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-6 text-sm text-slate-400">
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Fetching NASA candidate sites...</span>
              </div>
            )}

            {sitesError && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <div className="flex-1">
                  <p className="font-medium">Failed to load sites</p>
                  <p className="mt-0.5 text-slate-400">{sitesError}</p>
                  <button
                    type="button"
                    onClick={loadSites}
                    className="mt-2 flex items-center gap-1 rounded bg-rose-900/60 px-2 py-0.5 text-rose-200 hover:bg-rose-900"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              </div>
            )}

            {activeTab === "candidates" && !sitesLoading && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-400">
                  Select Candidate Landing Region:
                </label>
                <div className="max-h-[210px] space-y-1.5 overflow-y-auto pr-1">
                  {sites.map((site) => {
                    const isSelected = selectedSite?.site_id === site.site_id;
                    return (
                      <button
                        type="button"
                        key={site.site_id}
                        onClick={() => {
                          startTransition(() => {
                            setFocusSeq((n) => n + 1);
                            setSelectedSite(site);
                          });
                        }}
                        className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition ${
                          isSelected
                            ? "border-cyan-500/60 bg-cyan-950/30 text-cyan-100 shadow-sm"
                            : "border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                          ) : (
                            <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-100">{site.name}</p>
                            <p className="font-mono text-[11px] text-slate-400">
                              {site.latitude_deg.toFixed(2)}°S,{" "}
                              {site.longitude_deg >= 0
                                ? `${site.longitude_deg.toFixed(2)}°E`
                                : `${Math.abs(site.longitude_deg).toFixed(2)}°W`}
                            </p>
                          </div>
                        </div>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                          {site.site_id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "apollo" && (
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-medium text-slate-400">
                  Select Apollo Historical Landing Site:
                </label>
                <div className="max-h-[175px] space-y-1.5 overflow-y-auto pr-1">
                  {Object.values(APOLLO_DOSSIERS).map((dossier) => {
                    const isSelected = selectedSite?.site_id === dossier.id;
                    return (
                      <button
                        type="button"
                        key={dossier.id}
                        onClick={() => {
                          startTransition(() => {
                            setFocusSeq((n) => n + 1);
                            setSelectedSite(apolloDossierToLandingSite(dossier));
                          });
                        }}
                        className={`flex w-full items-center justify-between rounded-lg border p-2 text-left text-xs transition ${
                          isSelected
                            ? "border-sky-500/60 bg-sky-950/40 text-sky-100 shadow-sm"
                            : "border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-400" />
                          ) : (
                            <Rocket className="h-4 w-4 shrink-0 text-sky-400/80" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-100">{dossier.mission}</p>
                            <p className="text-[11px] text-slate-400">
                              {dossier.region} · {dossier.date.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-sky-300">
                          {dossier.latitudeDeg >= 0
                            ? `${dossier.latitudeDeg.toFixed(2)}°N`
                            : `${Math.abs(dossier.latitudeDeg).toFixed(2)}°S`},{" "}
                          {dossier.longitudeDeg >= 0
                            ? `${dossier.longitudeDeg.toFixed(2)}°E`
                            : `${Math.abs(dossier.longitudeDeg).toFixed(2)}°W`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Apollo Mission Dossier Card */}
                {selectedSite && selectedSite.site_id.startsWith("apollo_") && (() => {
                  const dossier = getApolloDossier(selectedSite.site_id);
                  if (!dossier) return null;
                  return (
                    <div className="flex flex-col gap-2.5 rounded-lg border border-sky-800/60 bg-gradient-to-b from-sky-950/30 to-slate-950/70 p-3 shadow-inner">
                      <div className="flex items-start justify-between gap-2 border-b border-sky-900/40 pb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-sky-300 border border-sky-400/30">
                              NASA Apollo
                            </span>
                            <span className="text-[10px] text-slate-400">{dossier.date}</span>
                          </div>
                          <h3 className="mt-1 font-bold text-slate-100">{dossier.siteName}</h3>
                        </div>
                        <span className="rounded-full border border-sky-700/60 bg-sky-950/80 px-2 py-0.5 font-mono text-[10px] text-sky-300">
                          {dossier.id}
                        </span>
                      </div>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded bg-slate-900/80 p-2">
                          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-medium">
                            <Users className="h-3 w-3 text-sky-400" /> Crew
                          </span>
                          <p className="mt-0.5 text-slate-200 font-medium leading-tight">
                            {dossier.crew.commander}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {dossier.crew.lunarModulePilot.split(" ")[0]} · {dossier.crew.commandModulePilot.split(" ")[0]}
                          </p>
                        </div>

                        <div className="rounded bg-slate-900/80 p-2">
                          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-medium">
                            <Rocket className="h-3 w-3 text-cyan-400" /> Spacecraft
                          </span>
                          <p className="mt-0.5 text-slate-200 font-medium leading-tight truncate" title={dossier.spacecraft.lunarModule}>
                            {dossier.spacecraft.lunarModule}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate" title={dossier.spacecraft.commandServiceModule}>
                            {dossier.spacecraft.commandServiceModule}
                          </p>
                        </div>

                        <div className="rounded bg-slate-900/80 p-2">
                          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3 text-amber-400" /> Surface EVA
                          </span>
                          <p className="mt-0.5 text-slate-200 font-medium">
                            {dossier.stats.totalEvaDuration}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {dossier.stats.evaCount} moonwalk{dossier.stats.evaCount > 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="rounded bg-slate-900/80 p-2">
                          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-medium">
                            <Scale className="h-3 w-3 text-emerald-400" /> Sample Return
                          </span>
                          <p className="mt-0.5 text-emerald-300 font-medium font-mono">
                            {dossier.stats.sampleMassKg} kg
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {dossier.stats.roverDistanceKm
                              ? `${dossier.stats.roverDistanceKm} km rover`
                              : dossier.stats.maxDistanceTraveledMeters
                              ? `<${dossier.stats.maxDistanceTraveledMeters}m radius`
                              : "surface return"}
                          </p>
                        </div>
                      </div>

                      {/* Official NASA / LRO Narrative */}
                      <div className="rounded border border-sky-500/25 bg-slate-900/90 p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider font-semibold text-sky-400">
                          <FileText className="h-3 w-3" />
                          <span>NASA LRO Surface Reconnaissance Dossier</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-200 max-h-[170px] overflow-y-auto pr-1 whitespace-pre-line">
                          {dossier.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Source: NASA LRO / Apollo Surface Journal</span>
                        <span className="font-mono text-sky-300">
                          {dossier.latitudeDeg >= 0
                            ? `${dossier.latitudeDeg.toFixed(3)}°N`
                            : `${Math.abs(dossier.latitudeDeg).toFixed(3)}°S`},{" "}
                          {dossier.longitudeDeg >= 0
                            ? `${dossier.longitudeDeg.toFixed(3)}°E`
                            : `${Math.abs(dossier.longitudeDeg).toFixed(3)}°W`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "custom" && (
              <div className="flex flex-col gap-2.5 rounded-lg border border-purple-900/40 bg-purple-950/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-200">
                    Target Coordinate Entry
                  </span>
                  <span className="font-mono text-[10px] text-purple-400">
                    South Polar: -90° to -80°
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Target Label</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. South Pole Ridge Point"
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Latitude (°S)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="-90.0"
                      max="-80.0"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Longitude (°)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="-180.0"
                      max="360.0"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handlePlotCustomSite()}
                    className="flex flex-1 items-center justify-center gap-1 rounded bg-purple-600 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-500"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Plot Custom Target
                  </button>
                  {customCoordinates && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCoordinates(null);
                        if (sites.length > 0) setSelectedSite(sites[0]);
                      }}
                      className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Selected Location Details & LOLA Terrain Safety Card */}
            {selectedSite && activeTab !== "apollo" && (
              <div className="flex flex-col gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 p-3 shadow-inner">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-100">{selectedSite.name}</h3>
                    <p className="text-[11px] text-slate-400">{selectedSite.region}</p>
                  </div>
                  <span className="rounded-full border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    {selectedSite.site_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-slate-900/90 p-2">
                    <span className="text-[10px] uppercase text-slate-500">Latitude</span>
                    <p className="font-mono font-medium text-slate-200">
                      {selectedSite.latitude_deg >= 0
                        ? `${selectedSite.latitude_deg.toFixed(3)}°N`
                        : `${Math.abs(selectedSite.latitude_deg).toFixed(3)}°S`}
                    </p>
                  </div>
                  <div className="rounded bg-slate-900/90 p-2">
                    <span className="text-[10px] uppercase text-slate-500">Longitude</span>
                    <p className="font-mono font-medium text-slate-200">
                      {selectedSite.longitude_deg >= 0
                        ? `${selectedSite.longitude_deg.toFixed(3)}°E`
                        : `${Math.abs(selectedSite.longitude_deg).toFixed(3)}°W`}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between rounded bg-slate-900/90 px-2.5 py-1.5 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Mountain className="h-3.5 w-3.5 text-slate-400" />
                      Elevation:
                    </span>
                    {terrainMetrics?.elevation_m != null ? (
                      <span className="font-mono text-amber-300">
                        {terrainMetrics.elevation_m >= 0 ? "+" : ""}
                        {terrainMetrics.elevation_m.toFixed(0)} m (LOLA)
                      </span>
                    ) : selectedSite.elevation_m != null ? (
                      <span className="font-mono text-amber-300">
                        {selectedSite.elevation_m >= 0 ? "+" : ""}
                        {selectedSite.elevation_m.toFixed(0)} m (approx)
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] italic text-slate-500">
                        Varies across 15×15 km zone
                      </span>
                    )}
                  </div>
                </div>

                {/* LOLA Terrain Safety Metrics */}
                {terrainMetrics && (
                  <div className="rounded-md border border-slate-800 bg-slate-900/60 p-2.5 text-[11px]">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">LOLA Terrain Safety</span>
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                        {terrainMetrics.safety_rating} ({terrainMetrics.terrain_safety_score}/100)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                      <span>
                        Mean slope:{" "}
                        <strong className="font-mono text-slate-100">
                          {terrainMetrics.mean_slope_deg != null
                            ? `${terrainMetrics.mean_slope_deg.toFixed(1)}°`
                            : "—"}
                        </strong>
                      </span>
                      <span>
                        Max slope:{" "}
                        <strong className="font-mono text-slate-100">
                          {terrainMetrics.max_slope_deg != null
                            ? `${terrainMetrics.max_slope_deg.toFixed(1)}°`
                            : "—"}
                        </strong>
                      </span>
                      <span>
                        Roughness:{" "}
                        <strong className="font-mono text-slate-100">
                          {terrainMetrics.roughness_m != null
                            ? `${terrainMetrics.roughness_m.toFixed(1)} m`
                            : "—"}
                        </strong>
                      </span>
                      <span>
                        PSR dist:{" "}
                        <strong className="font-mono text-slate-100">
                          {terrainMetrics.psr_proximity_km != null
                            ? `${terrainMetrics.psr_proximity_km.toFixed(1)} km`
                            : "—"}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                {selectedSite.description && (
                  <p className="rounded border border-slate-800/60 bg-slate-900/40 p-2 text-xs leading-relaxed text-slate-300">
                    {selectedSite.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span
                    className="max-w-[220px] truncate"
                    title={selectedSite.source || "NASA Artemis III / LRO"}
                  >
                    Source: {selectedSite.source || "NASA Artemis III / LRO"}
                  </span>
                  <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] uppercase text-slate-400">
                    {selectedSite.coordinate_type?.replace(/_/g, " ") || "centroid"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ephemeris Playback, Terrain Obstruction Case & Sun/Earth Clearance */}
      {viewMode !== "eclipse" && (
        <div className="space-y-3 border-t border-slate-800 px-4 py-4 sm:px-6">
          {/* Connecting Ridge Terrain Case Banner & Mission Window Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-100">
                Connecting Ridge terrain case
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Explore a real terrain obstruction using NASA elevation and ephemeris data.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!showObstructionReplay && (
                <button
                  type="button"
                  className={controlClass}
                  onClick={() => setShowWindowForm((prev) => !prev)}
                >
                  {showWindowForm ? "Hide UTC window" : "Change UTC window"}
                </button>
              )}
              <button
                type="button"
                className={
                  controlClass +
                  (showObstructionReplay
                    ? ""
                    : " border-amber-300/50 bg-amber-400/10 text-amber-100 hover:border-amber-300 hover:bg-amber-400/15")
                }
                onClick={
                  showObstructionReplay
                    ? () => {
                        setPlayingSamples(false);
                        setSampleIndex(0);
                        if (!ephemeris) {
                          clearPositions();
                          setRequest((previous) => ({ ...previous }));
                        }
                        setShowObstructionReplay(false);
                      }
                    : openObstructionReplay
                }
              >
                {showObstructionReplay ? "Return to mission window" : "Open terrain case"}
              </button>
            </div>
          </div>

          {showObstructionReplay && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/30 px-4 py-2.5">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Terrain case shortcuts">
                {[
                  { index: beforeCrossing, label: "Before crossing" },
                  { index: behindRidge, label: "Behind the ridge" },
                ].map(({ index, label }) => (
                  <button
                    type="button"
                    key={label}
                    className={modeClass}
                    aria-pressed={currentSample === index}
                    onClick={() => seekSample(index)}
                  >
                    {label}
                    <span className="font-normal text-slate-400">
                      {timeFormat.format(new Date(obstructionReplay.points[index].timestamp_utc))} UTC
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2" role="group" aria-label="Terrain case view">
                <button
                  type="button"
                  className={modeClass}
                  aria-pressed={terrainView === "surface"}
                  onClick={() => {
                    setViewMode("3d");
                    setTerrainView("surface");
                  }}
                >
                  Surface view
                </button>
                <button
                  type="button"
                  className={modeClass}
                  aria-pressed={terrainView === "orbit"}
                  onClick={() => {
                    setViewMode("3d");
                    setTerrainView("orbit");
                  }}
                >
                  3D orbit
                </button>
              </div>
            </div>
          )}

          {!showObstructionReplay && showWindowForm && (
            <form
              onSubmit={loadPositions}
              className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-xs text-slate-300">
                  Landing site
                  <select
                    className={controlClass}
                    value={requestedSite?.site_id ?? siteId}
                    onChange={(change) => {
                      const nextId = change.target.value;
                      setShowObstructionReplay(false);
                      clearPositions();
                      setSiteId(nextId);
                      setRequest((prev) => ({ ...prev, siteId: nextId }));
                      const matched = selectSites.find((s) => s.site_id === nextId);
                      if (matched) setSelectedSite(matched);
                    }}
                  >
                    {selectSites.map((site) => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-xs text-slate-300">
                  Start time (UTC)
                  <input
                    className={controlClass + " scheme-dark"}
                    type="datetime-local"
                    required
                    value={startTime}
                    aria-invalid={Boolean(dateError)}
                    aria-describedby={dateError ? dateErrorId : undefined}
                    onChange={(change) => {
                      setStartTime(change.target.value);
                      setDateError("");
                    }}
                  />
                </label>
                <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-xs text-slate-300">
                  End time (UTC)
                  <input
                    className={controlClass + " scheme-dark"}
                    type="datetime-local"
                    required
                    value={endTime}
                    aria-invalid={Boolean(dateError)}
                    aria-describedby={dateError ? dateErrorId : undefined}
                    onChange={(change) => {
                      setEndTime(change.target.value);
                      setDateError("");
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-sky-300 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  Load positions
                </button>
              </div>
              {dateError && (
                <p id={dateErrorId} role="alert" className="text-xs text-rose-300">
                  {dateError}
                </p>
              )}
            </form>
          )}

          {positions && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <p className="text-slate-300">
                {showObstructionReplay
                  ? "Connecting Ridge · Offline case · "
                  : !ephemeris && requestedSite && `${requestedSite.name} · `}
                {positions.source} · {positions.latitude_deg}°, {positions.longitude_deg}°
              </p>
              {point && (
                <time className="tabular-nums text-slate-200" dateTime={point.timestamp_utc}>
                  {timeFormat.format(new Date(point.timestamp_utc))} UTC
                </time>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Mission window ·{" "}
            {missionTimeFormat.format(Date.parse(missionWindow.start_utc))}–
            {missionTimeFormat.format(Date.parse(missionWindow.end_utc))} UTC
          </p>

          {solarObstruction && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300/25 bg-amber-300/5 p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">
                  Terrain changes the sunlight result
                </p>
                <p className="text-xs leading-relaxed text-slate-300">
                  In {solarObstruction.obscuredCount} of {solarObstruction.assessedCount} assessed
                  samples, the Sun’s center is above 0° and at or below the modeled terrain.
                </p>
                {solarObstruction.crossing && (
                  <p className="text-xs text-slate-300">
                    First sampled crossing ·{" "}
                    {timeFormat.format(Date.parse(solarObstruction.crossing.from))}–
                    {timeFormat.format(Date.parse(solarObstruction.crossing.to))} UTC
                  </p>
                )}
              </div>
              <button
                type="button"
                className={controlClass}
                onClick={() => seekSample(solarObstruction.first)}
              >
                Jump to first obstruction
              </button>
            </div>
          )}

          {point && points.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={
                  playingSamples ? "Pause landing site playback" : "Play landing site samples"
                }
                className={controlClass + " inline-flex min-w-20 items-center gap-1.5"}
                onClick={() => {
                  if (!playingSamples && currentSample === lastSample) setSampleIndex(0);
                  setPlayingSamples(!playingSamples);
                }}
              >
                {playingSamples ? (
                  <>
                    <Pause size={14} aria-hidden="true" /> Pause
                  </>
                ) : (
                  <>
                    <Play size={14} aria-hidden="true" /> Play
                  </>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor={scrubberId}>
                  Landing site sample time (UTC)
                </label>
                <input
                  id={scrubberId}
                  type="range"
                  min={0}
                  max={lastSample}
                  value={currentSample}
                  aria-valuetext={`${timeFormat.format(
                    new Date(point.timestamp_utc)
                  )} UTC. Sun ${horizonStatus(point.sun_elevation_deg).toLowerCase()}. Earth ${horizonStatus(
                    point.earth_elevation_deg
                  ).toLowerCase()}.`}
                  onChange={(change) => {
                    setPlayingSamples(false);
                    setSampleIndex(Number(change.target.value));
                  }}
                  className="block w-full cursor-pointer accent-sky-400"
                />
              </div>
              <p className="shrink-0 text-xs tabular-nums text-slate-400">
                <span className="sr-only">Sample </span>
                {currentSample + 1} / {points.length}
              </p>
            </div>
          )}

          {point ? (
            <>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                {
                  name: "Sun",
                  textColor: "text-amber-200",
                  azimuth: point.sun_azimuth_deg,
                  elevation: point.sun_elevation_deg,
                },
                {
                  name: "Earth",
                  textColor: "text-sky-200",
                  azimuth: point.earth_azimuth_deg,
                  elevation: point.earth_elevation_deg,
                },
              ].map(({ name, textColor, azimuth, elevation }) => {
                const local = terrain && terrainClearance(terrain, azimuth, elevation);
                return (
                  <div
                    key={name}
                    className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                  >
                    <dt className={`font-medium ${textColor}`}>{name}</dt>
                    <dd className="mt-1 text-xs text-slate-300">
                      Azimuth {formatAngle(azimuth)} · Elevation {formatAngle(elevation)}
                    </dd>
                    <dd className="mt-1 text-xs text-slate-400">
                      Geometric · {horizonStatus(elevation)}
                    </dd>
                    {terrain && (
                      <dd className="mt-2 border-t border-slate-800 pt-2 text-xs">
                        {local ? (
                          <>
                            <p
                              className={
                                local.clearance > 0
                                  ? "font-medium text-emerald-300"
                                  : "font-medium text-amber-200"
                              }
                            >
                              {local.clearance > 0
                                ? "Clears modeled terrain"
                                : "At or below the modeled skyline"}
                            </p>
                            <p className="mt-1 text-slate-300">
                              Skyline {formatAngle(local.skyline)} · Clearance{" "}
                              {formatAngle(local.clearance)}
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400">Terrain clearance unavailable</p>
                        )}
                      </dd>
                    )}
                  </div>
                );
              })}
            </dl>

            {(point.moon_illumination_pct != null || point.earth_distance_km != null) && (
              <div className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Moon Illumination</p>
                  <p className="mt-0.5 font-mono font-medium text-amber-200">
                    {point.moon_illumination_pct != null
                      ? `${point.moon_illumination_pct.toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Earth–Moon Range</p>
                  <p className="mt-0.5 font-mono font-medium text-sky-200">
                    {point.earth_distance_km != null
                      ? `${Math.round(point.earth_distance_km).toLocaleString()} km (${(
                          point.earth_distance_km / 299792.458
                        ).toFixed(2)}s)`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Solar Flux (1/r²)</p>
                  <p className="mt-0.5 font-mono font-medium text-emerald-200">
                    {point.sun_distance_au != null
                      ? `${Math.round(1361 / (point.sun_distance_au * point.sun_distance_au))} W/m² (${point.sun_distance_au.toFixed(4)} AU)`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Sub-Earth Libration</p>
                  <p className="mt-0.5 font-mono font-medium text-slate-200">
                    {point.sub_earth_lat_deg != null && point.sub_earth_lon_deg != null
                      ? `${point.sub_earth_lat_deg.toFixed(2)}°, ${point.sub_earth_lon_deg.toFixed(2)}°`
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-300" role="status">
                {ephemLoading && !ephemeris
                  ? "Loading NASA ephemeris…"
                  : ephemError ||
                    (positions?.status === "pending"
                      ? "Ephemeris data is pending."
                      : "No JPL Horizons positions are available for this site and time range.")}
              </p>
              {!ephemeris && !ephemLoading && (ephemError || !positions) && (
                <button
                  type="button"
                  className={controlClass}
                  onClick={() => {
                    clearPositions();
                    setRequestVersion((version) => version + 1);
                  }}
                >
                  Retry
                </button>
              )}
              {!ephemeris &&
                !ephemLoading &&
                positions?.status === "unavailable" &&
                isCustomWindow &&
                requestedSite && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">
                      You can load the cached JPL Horizons samples for this site on 20 Nov 2026,
                      00:00–06:00 UTC.
                    </p>
                    <button
                      type="button"
                      className={controlClass}
                      onClick={() => {
                        setSiteId(requestedSite.site_id);
                        setStartTime(initialMissionWindow.start_utc.slice(0, 16));
                        setEndTime(initialMissionWindow.end_utc.slice(0, 16));
                        requestPositions(requestedSite.site_id, initialMissionWindow);
                      }}
                    >
                      Load cached window
                    </button>
                  </div>
                )}
            </div>
          )}

          {point && terrain && showObstructionReplay && (
            <details className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs leading-relaxed text-slate-300">
              <summary className="cursor-pointer font-medium text-slate-200">
                How we calculated this
              </summary>
              <p className="mt-2">
                The angles come from hourly{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://naif.jpl.nasa.gov/pub/naif/generic_kernels/"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA/JPL SPICE samples (DE440)
                </a>
                . The skyline uses the{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://pgda.gsfc.nasa.gov/products/78"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA LOLA Site01 elevation grid
                </a>{" "}
                at {terrain.pixel_size_m} m per pixel.
              </p>
              <p className="mt-2">
                We subtract the highest terrain angle within {terrain.max_distance_m / 1_000} km in
                the Sun’s direction from the Sun’s elevation, for an observer{" "}
                {terrain.observer_height_m} m above the surface. The results describe the center of
                the Sun. Part of its disk may still be visible near the crossing.
              </p>
            </details>
          )}

          {point && terrain && !showObstructionReplay && (
            <p className="text-xs leading-relaxed text-slate-300">
              <a
                className="underline decoration-slate-500 underline-offset-2 hover:text-white"
                href={terrain.source_url}
                target="_blank"
                rel="noreferrer"
              >
                NASA LRO LOLA Site01
              </a>
              {" · "}
              {terrain.pixel_size_m} m grid · Terrain within {terrain.max_distance_m / 1_000} km ·
              Observer {terrain.observer_height_m} m above the surface. Clearance compares each
              body’s center with the terrain in its direction.
            </p>
          )}

          {point && (!showObstructionReplay || terrainView === "orbit") && (
            <p className="text-xs leading-relaxed text-slate-400">
              The cyan ring marks the geometric horizon.{" "}
              {terrain
                ? "Terrain farther away can still affect the view."
                : "Select Connecting Ridge for a terrain comparison using NASA LOLA data."}{" "}
              Body sizes and distances are illustrative.
            </p>
          )}
        </div>
      )}

      <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800 px-4 py-3 text-[11px] text-slate-400 sm:px-6">
        <a
          className="underline decoration-slate-600 underline-offset-2 hover:text-white"
          href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/"
          target="_blank"
          rel="noreferrer"
        >
          Earth imagery · NASA Blue Marble
        </a>
        <span>
          Sun and Moon textures ·{" "}
          <a
            className="underline decoration-slate-600 underline-offset-2 hover:text-white"
            href="https://www.solarsystemscope.com/textures/"
            target="_blank"
            rel="noreferrer"
          >
            Solar System Scope
          </a>{" "}
          (
          <a
            className="underline decoration-slate-600 underline-offset-2 hover:text-white"
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
          , resized)
        </span>
        <a
          className="underline decoration-slate-600 underline-offset-2 hover:text-white"
          href="https://github.com/cosinekitty/astronomy"
          target="_blank"
          rel="noreferrer"
        >
          Eclipse calculations · Astronomy Engine
        </a>
        <a
          className="underline decoration-slate-600 underline-offset-2 hover:text-white"
          href="https://eclipse.gsfc.nasa.gov/OH/OH2025.html"
          target="_blank"
          rel="noreferrer"
        >
          2025 eclipse catalog · NASA
        </a>
      </footer>
    </section>
  );
}
