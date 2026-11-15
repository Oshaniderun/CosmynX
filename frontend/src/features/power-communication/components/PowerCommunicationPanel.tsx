import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  Clock,
  Download,
  Gauge,
  Maximize2,
  Minimize2,
  Radio,
  RefreshCw,
  Sliders,
  Sun,
  Timer,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";
import type { ConditionsResponse, LandingSite } from "../../../types/helios";
import { fetchConditions, type ConditionsQueryParams } from "../services/conditionsService";
import { demoConditions } from "../services/demoConditions";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";

interface PowerCommunicationPanelProps {
  conditions?: ConditionsResponse;
}

const PREDEFINED_SITES: LandingSite[] = [
  {
    site_id: "candidate_001",
    name: "Haworth",
    region: "Lunar South Pole",
    latitude_deg: -87.50,
    longitude_deg: -5.00,
  },
  {
    site_id: "candidate_002",
    name: "Malapert Massif",
    region: "Lunar South Pole",
    latitude_deg: -86.00,
    longitude_deg: 0.30,
  },
  {
    site_id: "candidate_003",
    name: "Nobile Rim 1",
    region: "Lunar South Pole",
    latitude_deg: -85.30,
    longitude_deg: 31.50,
  },
  {
    site_id: "candidate_004",
    name: "Nobile Rim 2",
    region: "Lunar South Pole",
    latitude_deg: -84.20,
    longitude_deg: 60.70,
  },
  {
    site_id: "candidate_005",
    name: "de Gerlache Rim 2",
    region: "Lunar South Pole",
    latitude_deg: -88.70,
    longitude_deg: -64.00,
  },
  {
    site_id: "candidate_006",
    name: "Slater Plain",
    region: "Lunar South Pole",
    latitude_deg: -88.08,
    longitude_deg: 111.29,
  },
  {
    site_id: "candidate_007",
    name: "Peak near Cabeus B",
    region: "Lunar South Pole",
    latitude_deg: -83.60,
    longitude_deg: -68.80,
  },
  {
    site_id: "candidate_008",
    name: "Mons Mouton Plateau",
    region: "Lunar South Pole",
    latitude_deg: -84.30,
    longitude_deg: 30.60,
  },
  {
    site_id: "candidate_009",
    name: "Mons Mouton",
    region: "Lunar South Pole",
    latitude_deg: -85.42,
    longitude_deg: 31.85,
  },
];

type ArrayArchitecture = "vertical_polar" | "tracking" | "horizontal";
type ChartViewMode = "elevation" | "power";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatUtc(utcString: string): string {
  try {
    return timeFormat.format(new Date(utcString));
  } catch {
    return utcString;
  }
}

export function PowerCommunicationPanel({
  conditions: propConditions,
}: PowerCommunicationPanelProps) {
  const { selectedSite, setSelectedSite, missionDates, stepMinutes } = useMission();
  const [sites, setSites] = useState<LandingSite[]>(PREDEFINED_SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    selectedSite?.site_id ?? "candidate_001"
  );

  useEffect(() => {
    if (selectedSite?.site_id) {
      setSelectedSiteId(selectedSite.site_id);
    }
  }, [selectedSite]);
  const [data, setData] = useState<ConditionsResponse>(
    propConditions ?? demoConditions
  );
  const [isDemoData, setIsDemoData] = useState(!propConditions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Power & Battery Calculator States
  const [ratedArrayKw, setRatedArrayKw] = useState<number>(1.0);
  const [arrayArch, setArrayArch] = useState<ArrayArchitecture>("vertical_polar");
  const [hotelLoadWatts, setHotelLoadWatts] = useState<number>(100);
  const [chartView, setChartView] = useState<ChartViewMode>("power");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Load available landing sites
  useEffect(() => {
    fetchCandidateSites()
      .then((loadedSites) => {
        if (loadedSites && loadedSites.length > 0) {
          setSites(loadedSites);
        }
      })
      .catch(() => {
        setSites(PREDEFINED_SITES);
      });
  }, []);

  // Fetch conditions when site changes or prop changes
  useEffect(() => {
    if (propConditions) {
      setData(propConditions);
      setIsDemoData(false);
      setError(null);
      return;
    }

    const activeSite =
      (selectedSite && selectedSite.site_id === selectedSiteId ? selectedSite : undefined) ??
      sites.find((s) => s.site_id === selectedSiteId) ??
      sites[0];
    let isMounted = true;
    setLoading(true);

    const queryParams: ConditionsQueryParams = {
      site_id: activeSite.site_id,
      latitude_deg: activeSite.latitude_deg,
      longitude_deg: activeSite.longitude_deg,
      start_utc: missionDates.startUtc,
      end_utc: missionDates.endUtc,
      step_minutes: stepMinutes,
    };

    fetchConditions(queryParams)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsDemoData(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.warn("Could not fetch conditions, falling back to demo:", err);
          setData(demoConditions);
          setIsDemoData(true);
          setError("The conditions service is unavailable. A fixed synthetic example is shown; it is unrelated to the selected site and mission window.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propConditions, selectedSiteId, selectedSite, sites, missionDates, stepMinutes]);

  const metrics = data.metrics;
  const isOk = data.status === "ok";
  const earthWindows = isOk ? (data.windows ?? []).filter((window) => window.target === "earth") : [];
  const simultaneousWindows = isOk ? (data.windows ?? []).filter((window) => window.target === "both") : [];
  const hasMeasuredMetrics = isOk && !isDemoData &&
    metrics.sunlit_fraction !== null && metrics.earth_visible_fraction !== null;

  const sunlitPct =
    isOk && metrics.sunlit_fraction !== null
      ? (metrics.sunlit_fraction * 100).toFixed(1)
      : null;
  const earthVisiblePct =
    isOk && metrics.earth_visible_fraction !== null
      ? (metrics.earth_visible_fraction * 100).toFixed(1)
      : null;

  // Feasibility status badge calculation
  let feasibilityBadge = hasMeasuredMetrics ? {
    label: "Conditions available",
    style: "bg-emerald-950 text-emerald-400 border-emerald-800",
    icon: Zap,
  } : {
    label: isDemoData ? "Demo values · not assessed" : "Insufficient scientific data",
    style: "bg-slate-900 text-slate-400 border-slate-700",
    icon: AlertTriangle,
  };

  if (hasMeasuredMetrics && (metrics.sunlit_fraction! < 0.3 || metrics.earth_visible_fraction! < 0.3)) {
    feasibilityBadge = {
      label: "Critical Battery / Blackout Risk",
      style: "bg-rose-950 text-rose-400 border-rose-800",
      icon: AlertTriangle,
    };
  } else if (hasMeasuredMetrics && (metrics.sunlit_fraction! < 0.7 || metrics.earth_visible_fraction! < 0.7)) {
    feasibilityBadge = {
      label: "Intermittent Operational Conditions",
      style: "bg-amber-950 text-amber-400 border-amber-800",
      icon: BatteryCharging,
    };
  }

  const FeasIcon = feasibilityBadge.icon;

  // Battery sizing calculation based on user hotel load
  const powerModeling = isOk ? data.power_modeling : undefined;
  const longestDarknessHrs = powerModeling?.battery_sizing?.longest_darkness_hours ?? null;

  const usableStorageKwh = longestDarknessHrs === null ? null : (longestDarknessHrs * hotelLoadWatts) / 1000.0;
  const nominalCapacityKwh = usableStorageKwh === null ? null : usableStorageKwh > 0 ? usableStorageKwh / 0.7 : 0; // 70% Max DoD
  const estimatedBatteryMassKg = nominalCapacityKwh === null ? null : (nominalCapacityKwh * 1000.0) / 150.0; // 150 Wh/kg space Li-ion

  // Cumulative energy calculation based on user selected array rating and architecture
  const baseCumulativeKwh = powerModeling?.cumulative_energy_kwh?.[arrayArch] ?? null;
  const totalGeneratedKwh = baseCumulativeKwh === null ? null : baseCumulativeKwh * ratedArrayKw;

  // Chart data formatting
  const chartPoints = (data.timeline ?? []).map((pt) => {
    const rawPwr =
      arrayArch === "vertical_polar"
        ? pt.power_watts_vertical ?? null
        : arrayArch === "horizontal"
          ? pt.power_watts_horizontal ?? null
          : pt.power_watts_tracking ?? null;

    const scaledPwrWatts = rawPwr === null ? null : rawPwr * ratedArrayKw;

    return {
      time: formatUtc(pt.timestamp_utc),
      rawTime: pt.timestamp_utc,
      sunElevation: pt.sun_elevation_deg,
      earthElevation: pt.earth_elevation_deg,
      powerWatts: scaledPwrWatts === null ? null : Math.round(scaledPwrWatts),
      sunlit: pt.is_sunlit === null ? null : Number(pt.is_sunlit),
      earthVisible: pt.is_earth_visible === null ? null : Number(pt.is_earth_visible),
    };
  });

   const derivedTransitions = data.transitions ?? (() => {
    if (
      !isOk ||
      !data.timeline ||
      data.timeline.length === 0 ||
      data.timeline.some(
        (point) =>
          point.is_sunlit == null ||
          point.is_earth_visible == null
      )
    ) {
      return null;
    }

    const s0 = data.timeline[0].is_sunlit;
    const e0 = data.timeline[0].is_earth_visible;
    let solarNext: "sunset" | "sunrise" | "none" = "none";
    let solarUtc: string | null = null;
    let solarHours: number | null = null;
    for (let i = 1; i < data.timeline.length; i++) {
      if (data.timeline[i].is_sunlit !== s0) {
        solarNext = s0 ? "sunset" : "sunrise";
        solarUtc = data.timeline[i].timestamp_utc;
        solarHours = Math.round(((Date.parse(data.timeline[i].timestamp_utc) - Date.parse(data.start_utc)) / 3_600_000) * 10) / 10;
        break;
      }
    }

    let earthNext: "earthset" | "earthrise" | "none" = "none";
    let earthUtc: string | null = null;
    let earthHours: number | null = null;
    for (let i = 1; i < data.timeline.length; i++) {
      if (data.timeline[i].is_earth_visible !== e0) {
        earthNext = e0 ? "earthset" : "earthrise";
        earthUtc = data.timeline[i].timestamp_utc;
        earthHours = Math.round(((Date.parse(data.timeline[i].timestamp_utc) - Date.parse(data.start_utc)) / 3_600_000) * 10) / 10;
        break;
      }
    }

    return {
      solar: {
        current_state: s0 ? ("sunlit" as const) : ("shadow" as const),
        next_event: solarNext,
        transition_utc: solarUtc,
        hours_until: solarHours,
        description:
          solarNext !== "none"
            ? `${s0 ? "Sunset" : "Sunrise"} in ${solarHours}h`
            : s0
              ? "Continuous daylight throughout window"
              : "Continuous shadow throughout window",
      },
      earth: {
        current_state: e0 ? ("contact_active" as const) : ("blackout" as const),
        next_event: earthNext,
        transition_utc: earthUtc,
        hours_until: earthHours,
        description:
          earthNext !== "none"
            ? `${e0 ? "Earthset (LOS)" : "Earthrise (AOS)"} in ${earthHours}h`
            : e0
              ? "Continuous direct contact throughout window"
              : "Continuous blackout throughout window",
      },
    };
  })();

  const handleExportCsv = () => {
    if (!data.timeline || data.timeline.length === 0) return;

    const siteName =
      sites.find((s) => s.site_id === selectedSiteId)?.name ?? data.site_id;
    const headers = [
      "Timestamp (UTC)",
      "Sun Elevation (deg)",
      "Sunlit Status",
      "Earth Elevation (deg)",
      "Earth DTE Status",
      "Power Vertical (Watts)",
      "Power Tracking (Watts)",
      "Power Horizontal (Watts)",
    ];

    const rows = data.timeline.map((pt) => [
      pt.timestamp_utc,
      pt.sun_elevation_deg !== null && pt.sun_elevation_deg !== undefined
        ? pt.sun_elevation_deg.toFixed(2)
        : "N/A",
      pt.is_sunlit === null ? "N/A" : pt.is_sunlit ? "SUNLIT" : "SHADOW",
      pt.earth_elevation_deg !== null && pt.earth_elevation_deg !== undefined
        ? pt.earth_elevation_deg.toFixed(2)
        : "N/A",
      pt.is_earth_visible === null ? "N/A" : pt.is_earth_visible ? "GEOMETRIC_LOS" : "NO_GEOMETRIC_LOS",
      pt.power_watts_vertical != null
        ? (pt.power_watts_vertical * ratedArrayKw).toFixed(1)
        : "N/A",
      pt.power_watts_tracking != null
        ? (pt.power_watts_tracking * ratedArrayKw).toFixed(1)
        : "N/A",
      pt.power_watts_horizontal != null
        ? (pt.power_watts_horizontal * ratedArrayKw).toFixed(1)
        : "N/A",
    ]);

    const csvLines = [
      `# HELIOS Lunar Mission Telemetry — CosmynX (NASA SpaceApps 2026)`,
      `# Target Site: ${siteName} (${data.site_id})`,
      `# Coordinates: Lat ${data.latitude_deg} deg, Lon ${data.longitude_deg} deg`,
      `# Mission Interval: ${data.start_utc} to ${data.end_utc} (Step: ${data.step_minutes} min)`,
      `# Rated Solar Array: ${ratedArrayKw} kW (${arrayArch})`,
      `# Daylight Availability: ${sunlitPct ?? "N/A"}% (${isOk ? metrics.sunlit_hours ?? "N/A" : "N/A"} hrs)`,
      `# Geometric Earth LOS: ${earthVisiblePct ?? "N/A"}% (${isOk ? metrics.earth_visible_hours ?? "N/A" : "N/A"} hrs; not RF reliability)`,
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ];

    const blob = new Blob([csvLines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HELIOS_Telemetry_${data.site_id}_${data.start_utc.slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const panelContent = (
    <ModuleCard
      title="Solar Power & Communication Analysis"
    >
      <div className="space-y-5">
        {isDemoData && (
          <div className="rounded border border-amber-700/70 bg-amber-950/40 p-2.5 text-xs text-amber-200" role="status">
            <strong>DEMO MODE — SYNTHETIC DATA.</strong> Fixed illustrative values for Haworth from {formatUtc(demoConditions.start_utc)} to {formatUtc(demoConditions.end_utc)}; unrelated to the selected site and mission window and not live NASA measurements.
          </div>
        )}
        {/* Active Target Banner */}
        {selectedSite && (
          <div className="flex items-center gap-2 rounded bg-slate-950/60 px-2.5 py-1 text-xs text-cyan-300 font-mono border border-cyan-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Target: {selectedSite.name} ({selectedSite.site_id})</span>
          </div>
        )}

        {/* Site Selector & Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="site-select" className="text-xs font-medium text-slate-300">
              Candidate Site:
            </label>
            <select
              id="site-select"
              value={selectedSiteId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedSiteId(nextId);
                const nextSite = sites.find((site) => site.site_id === nextId);
                if (nextSite) setSelectedSite(nextSite);
              }}
              className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 shadow-sm focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              {sites.map((site) => (
                <option key={site.site_id} value={site.site_id}>
                  {site.name} ({site.latitude_deg}°, {site.longitude_deg}°)
                </option>
              ))}
              {selectedSite && !sites.some((site) => site.site_id === selectedSite.site_id) && (
                <option value={selectedSite.site_id}>{selectedSite.name} (custom)</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${feasibilityBadge.style}`}
            >
              <FeasIcon className="h-3 w-3" />
              {feasibilityBadge.label}
            </span>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition shadow-sm hover:border-slate-500"
              title="Export complete timeline and power telemetry to CSV"
            >
              <Download className="h-3 w-3 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition shadow-sm hover:border-slate-500"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3 w-3 text-cyan-400" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3 text-cyan-400" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>

            {loading && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
            )}
          </div>
        </div>

        {error && (
          <div className={`rounded border p-2.5 text-xs ${isDemoData ? "border-amber-800/70 bg-amber-950/30 text-amber-200" : "border-rose-800 bg-rose-950/40 text-rose-300"}`}>
            {error}
          </div>
        )}

        {!isOk ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-center">
            <p className="text-sm text-slate-300">
              {data.status === "pending"
                ? "Calculating solar illumination and Earth visibility metrics..."
                : "No ephemeris condition data is available for this site and time window."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPL Horizons ephemeris data unavailable or site out of coverage.
            </p>
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Solar Illumination Card */}
              <div className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <Sun className="h-4 w-4" />
                    <span>Solar Illumination</span>
                  </div>
                  <span className="text-xs tabular-nums text-slate-300">
                    {metrics.sunlit_hours !== null ? `${metrics.sunlit_hours} hrs` : "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-100">
                    {sunlitPct !== null ? `${sunlitPct}%` : "—"}
                  </span>
                  <span className="text-xs text-slate-400">daylight availability</span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max((metrics.sunlit_fraction ?? 0) * 100, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Geometric sun elevation &gt; 0°</span>
                  <span className="font-mono text-amber-300/90 font-medium">
                    {totalGeneratedKwh === null ? "N/A" : `${totalGeneratedKwh.toFixed(1)} kWh est.`}
                  </span>
                </div>
              </div>

              {/* Direct-To-Earth Communication Card */}
              <div className="relative overflow-hidden rounded-lg border border-sky-500/20 bg-sky-950/10 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                    <Radio className="h-4 w-4" />
                    <span>Direct-To-Earth (DTE)</span>
                  </div>
                  <span className="text-xs tabular-nums text-slate-300">
                    {metrics.earth_visible_hours !== null
                      ? `${metrics.earth_visible_hours} hrs`
                      : "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-100">
                    {earthVisiblePct !== null ? `${earthVisiblePct}%` : "—"}
                  </span>
                  <span className="text-xs text-slate-400">geometric line-of-sight visibility</span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max((metrics.earth_visible_fraction ?? 0) * 100, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Direct line-of-sight &gt; 0°</span>
                  <span className="text-sky-300/80">Not RF reliability</span>
                </div>
              </div>
            </div>

            {/* Next Visibility & Contact Transitions (README Section 7 Requirement) */}
            {derivedTransitions && (
              <div className="rounded-lg border border-slate-800/90 bg-slate-900/40 p-3.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-xs font-semibold text-slate-200">
                      Sampled Visibility Transition Estimates
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Based on the available ephemeris samples
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {/* Solar Transition Card */}
                  <div className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-950/60 p-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${derivedTransitions.solar.current_state === "sunlit"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-indigo-950/40 text-indigo-400 border border-indigo-500/30"
                        }`}
                    >
                      <Sun className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          Solar Illumination
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${derivedTransitions.solar.current_state === "sunlit"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                        >
                          {derivedTransitions.solar.current_state === "sunlit" ? "Sunlit (Day)" : "In Shadow (Night)"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-100">
                        {derivedTransitions.solar.next_event === "sunset" && (
                          <span className="text-amber-400">
                            Sunset in {derivedTransitions.solar.hours_until} hrs
                          </span>
                        )}
                        {derivedTransitions.solar.next_event === "sunrise" && (
                          <span className="text-emerald-400">
                            Sunrise in {derivedTransitions.solar.hours_until} hrs
                          </span>
                        )}
                        {derivedTransitions.solar.next_event === "none" && (
                          <span className="text-slate-300">
                            {derivedTransitions.solar.description}
                          </span>
                        )}
                      </div>
                      {derivedTransitions.solar.transition_utc && (
                        <div className="mt-0.5 text-[11px] text-slate-400 font-mono">
                          Target: {formatUtc(derivedTransitions.solar.transition_utc)} UTC
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Earth Direct-to-Earth Transition Card */}
                  <div className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-950/60 p-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${derivedTransitions.earth.current_state === "contact_active"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        : "bg-rose-950/40 text-rose-400 border border-rose-500/30"
                        }`}
                    >
                      <Radio className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          Earth geometric line of sight
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${derivedTransitions.earth.current_state === "contact_active"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-rose-900/30 text-rose-300 border border-rose-700/40"
                            }`}
                        >
                          {derivedTransitions.earth.current_state === "contact_active" ? "Earth geometrically visible" : "Earth below geometric horizon"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-100">
                        {derivedTransitions.earth.next_event === "earthset" && (
                          <span className="text-rose-400">
                            Earthset (LOS) in {derivedTransitions.earth.hours_until} hrs
                          </span>
                        )}
                        {derivedTransitions.earth.next_event === "earthrise" && (
                          <span className="text-cyan-400">
                            Earthrise (AOS) in {derivedTransitions.earth.hours_until} hrs
                          </span>
                        )}
                        {derivedTransitions.earth.next_event === "none" && (
                          <span className="text-slate-300">
                            {derivedTransitions.earth.description}
                          </span>
                        )}
                      </div>
                      {derivedTransitions.earth.transition_utc && (
                        <div className="mt-0.5 text-[11px] text-slate-400 font-mono">
                          Target: {formatUtc(derivedTransitions.earth.transition_utc)} UTC
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Solar Array Power Modeling & Battery Sizing Calculator Section */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-slate-200">
                    Solar Array Output & Battery Sizing Model
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Physics: Low-elevation horizon flux incidence
                </span>
              </div>

              {/* Interactive Inputs */}
              <div className="mt-3.5 grid gap-4 sm:grid-cols-3">
                {/* Array Capacity */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300">
                    Array Rating: <span className="text-amber-400 font-bold">{ratedArrayKw} kW</span>
                  </label>
                  <div className="mt-1.5 flex gap-1.5">
                    {[0.5, 1.0, 2.5].map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => setRatedArrayKw(kw)}
                        className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition ${ratedArrayKw === kw
                          ? "bg-amber-500 text-slate-950 font-semibold"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                      >
                        {kw} kW
                      </button>
                    ))}
                  </div>
                </div>

                {/* Array Architecture */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300">
                    Array Mounting Type:
                  </label>
                  <select
                    value={arrayArch}
                    onChange={(e) => setArrayArch(e.target.value as ArrayArchitecture)}
                    className="mt-1.5 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-200 focus-visible:outline-amber-400"
                  >
                    <option value="vertical_polar">Vertical Polar Mast (Optimal for Moon South Pole)</option>
                    <option value="tracking">Sun-Tracking Gimbal (100% Normal)</option>
                    <option value="horizontal">Horizontal Flat Deck (Low Polar Output)</option>
                  </select>
                </div>

                {/* Hotel Load Slider */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-300">
                      Night Hotel Load:
                    </label>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      {hotelLoadWatts} W
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="250"
                    step="25"
                    value={hotelLoadWatts}
                    onChange={(e) => setHotelLoadWatts(Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>25W (Beacon)</span>
                    <span>100W (Avionics)</span>
                    <span>250W (Active)</span>
                  </div>
                </div>
              </div>

              {/* Output Sizing Badges */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-800/80 pt-3 text-xs">
                {/* Total Energy */}
                <div className="rounded-md bg-slate-950/60 p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>Total Energy Yield</span>
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-100 tabular-nums">
                    {totalGeneratedKwh === null ? "N/A" : totalGeneratedKwh.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">{totalGeneratedKwh === null ? "" : "kWh est."}</span>
                  </div>
                  <div className="text-[10px] text-amber-400/80">Over mission window</div>
                </div>

                {/* Longest Darkness Stretch */}
                <div className="rounded-md bg-slate-950/60 p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Max Shadow Stretch</span>
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-100 tabular-nums">
                    {longestDarknessHrs === null ? "N/A" : longestDarknessHrs.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">{longestDarknessHrs === null ? "" : "hrs"}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Battery duration needed</div>
                </div>

                {/* Battery Pack Sizing */}
                <div className="rounded-md bg-slate-950/60 p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Battery className="h-3 w-3 text-cyan-400" />
                    <span>Required Battery Pack</span>
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-100 tabular-nums">
                    {nominalCapacityKwh === null ? "N/A" : nominalCapacityKwh.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">{nominalCapacityKwh === null ? "" : "kWh est."}</span>
                  </div>
                  <div className="text-[10px] text-cyan-400/80">At 70% Max DoD (Li-ion)</div>
                </div>

                {/* Flight Battery Mass */}
                <div className="rounded-md bg-slate-950/60 p-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Sliders className="h-3 w-3 text-indigo-400" />
                    <span>Est. Battery Mass</span>
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-100 tabular-nums">
                    {estimatedBatteryMassKg === null ? "N/A" : estimatedBatteryMassKg.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">{estimatedBatteryMassKg === null ? "" : "kg est."}</span>
                  </div>
                  <div className="text-[10px] text-indigo-400/80">@ 150 Wh/kg space cells</div>
                </div>
              </div>
            </div>

            {powerModeling?.model_assumptions && powerModeling.model_assumptions.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-[11px] text-slate-400" aria-label="Power model assumptions">
                {powerModeling.model_assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
              </ul>
            )}

            {/* Recharts Timeline Visualization (Togglable: Elevation Angles vs Power Watts) */}
            {chartPoints.length > 0 && (
              <figure className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
                <figcaption className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {chartView === "power"
                        ? `Instantaneous Solar Power Generation (${ratedArrayKw} kW ${arrayArch.replace("_", " ")})`
                        : "Solar & Earth Horizon Elevation Profile"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setChartView("power")}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${chartView === "power"
                        ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      Power Output (Watts)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView("elevation")}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${chartView === "elevation"
                        ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30"
                        : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      Elevation Angles (°)
                    </button>
                  </div>
                </figcaption>

                <div className="h-48 w-full min-w-0" aria-label="Elevation and power timeline chart">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    {chartView === "power" ? (
                      <LineChart data={chartPoints} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          minTickGap={24}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          tickFormatter={(val) => `${val}W`}
                        />
                        <ReferenceLine
                          y={hotelLoadWatts}
                          stroke="#38bdf8"
                          strokeDasharray="3 3"
                          label={{
                            value: `Hotel Load: ${hotelLoadWatts}W`,
                            fill: "#38bdf8",
                            fontSize: 10,
                            position: "insideTopRight",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#020617",
                            borderColor: "#334155",
                            borderRadius: "0.375rem",
                            fontSize: "11px",
                            color: "#f8fafc",
                          }}
                          formatter={(val: any, name: any) => [
                            typeof val === "number" ? `${val} Watts` : `${val}`,
                            name ?? "",
                          ]}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          height={24}
                          wrapperStyle={{ fontSize: "11px", paddingBottom: "4px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="powerWatts"
                          name="Solar Power Output (W)"
                          stroke="#fbbf24"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    ) : (
                      <LineChart data={chartPoints} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          minTickGap={24}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          tickFormatter={(val) => `${val}°`}
                          domain={[-2, 6]}
                        />
                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 3" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#020617",
                            borderColor: "#334155",
                            borderRadius: "0.375rem",
                            fontSize: "11px",
                            color: "#f8fafc",
                          }}
                          formatter={(val: any, name: any) => [
                            typeof val === "number" ? `${val.toFixed(2)}°` : `${val}`,
                            name ?? "",
                          ]}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          height={24}
                          wrapperStyle={{ fontSize: "11px", paddingBottom: "4px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sunElevation"
                          name="Sun Elevation (°)"
                          stroke="#fbbf24"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="earthElevation"
                          name="Earth Elevation (°)"
                          stroke="#38bdf8"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </figure>
            )}

            {/* DTE Communication Windows Breakdown */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>Geometric Earth Line-of-Sight Windows</span>
              </div>

              {earthWindows.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  No known geometric Earth line-of-sight window was detected within this observation interval.
                </p>
              ) : (
                <div className="mt-2.5 overflow-x-auto">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="pb-1.5 font-medium">Window</th>
                        <th className="pb-1.5 font-medium">Start (UTC)</th>
                        <th className="pb-1.5 font-medium">End (UTC)</th>
                        <th className="pb-1.5 font-medium text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {earthWindows.map((win, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-1.5 font-mono text-sky-400">
                            Pass #{idx + 1}
                          </td>
                          <td className="py-1.5">{formatUtc(win.start_utc)}</td>
                          <td className="py-1.5">{formatUtc(win.end_utc)}</td>
                          <td className="py-1.5 text-right font-medium text-slate-100">
                            {win.duration_hours.toFixed(1)} hrs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {simultaneousWindows.length > 0 && (
                <div className="mt-4 border-t border-slate-800 pt-3">
                  <p className="text-xs font-medium text-slate-200">Simultaneous sunlight and Earth line of sight</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    {simultaneousWindows.map((win, idx) => (
                      <li key={`${win.start_utc}-${idx}`}>
                        {formatUtc(win.start_utc)} – {formatUtc(win.end_utc)} UTC · {win.duration_hours.toFixed(1)} h
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {/* Scientific Limitations & Reality Note */}
        <div className="rounded-lg border border-amber-900/20 bg-amber-950/15 p-3 text-xs text-amber-200/80">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
            <div className="space-y-1">
              <p className="font-medium text-amber-300">
                NASA SpaceApps Scientific Reality Note
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sunlight and Earth visibility use a <strong>geometric horizon model</strong> ({data.horizon_model}); Earth line of sight does not guarantee RF communication. Power and battery outputs are estimates from the displayed array, load, depth-of-discharge, and cell-specific-energy assumptions.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2 text-[11px] text-slate-500">
          <span>Source: <span className="text-slate-400">{isDemoData ? "Synthetic fixed demonstration data (not NASA/JPL)" : data.source}</span></span>
          <span>Observation: <span className="font-mono text-slate-400">{formatUtc(data.start_utc)} – {formatUtc(data.end_utc)}</span></span>
        </div>
      </div>
    </ModuleCard>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200">
        <div className="mx-auto max-w-7xl">
          {panelContent}
        </div>
      </div>
    );
  }

  return panelContent;
}
