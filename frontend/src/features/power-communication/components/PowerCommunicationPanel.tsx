import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  Clock,
  Gauge,
  Radio,
  RefreshCw,
  Sliders,
  Sun,
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
import type { ConditionsResponse, LandingSite } from "../../../types/helios";
import { fetchConditions } from "../services/conditionsService";
import { demoConditions } from "../services/demoConditions";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";

interface PowerCommunicationPanelProps {
  conditions?: ConditionsResponse;
}

const PREDEFINED_SITES: LandingSite[] = [
  {
    site_id: "candidate_001",
    name: "Shackleton Crater Rim",
    region: "Lunar South Pole",
    latitude_deg: -89.54,
    longitude_deg: 0.0,
  },
  {
    site_id: "candidate_002",
    name: "Connecting Ridge",
    region: "Lunar South Pole",
    latitude_deg: -89.45,
    longitude_deg: -137.0,
  },
  {
    site_id: "candidate_003",
    name: "Malapert Massif",
    region: "Lunar South Pole",
    latitude_deg: -86.0,
    longitude_deg: 2.0,
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
  const [sites, setSites] = useState<LandingSite[]>(PREDEFINED_SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("candidate_001");
  const [data, setData] = useState<ConditionsResponse>(
    propConditions ?? demoConditions
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Power & Battery Calculator States
  const [ratedArrayKw, setRatedArrayKw] = useState<number>(1.0);
  const [arrayArch, setArrayArch] = useState<ArrayArchitecture>("vertical_polar");
  const [hotelLoadWatts, setHotelLoadWatts] = useState<number>(100);
  const [chartView, setChartView] = useState<ChartViewMode>("power");

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
      return;
    }

    const currentSite = sites.find((s) => s.site_id === selectedSiteId) ?? sites[0];
    let isMounted = true;
    setLoading(true);

    fetchConditions({
      site_id: currentSite.site_id,
      latitude_deg: currentSite.latitude_deg,
      longitude_deg: currentSite.longitude_deg,
    })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.warn("Could not fetch conditions, falling back to demo:", err);
          setData(demoConditions);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propConditions, selectedSiteId, sites]);

  const metrics = data.metrics;
  const isOk = data.status === "ok";

  const sunlitPct =
    metrics.sunlit_fraction !== null
      ? (metrics.sunlit_fraction * 100).toFixed(1)
      : null;
  const earthVisiblePct =
    metrics.earth_visible_fraction !== null
      ? (metrics.earth_visible_fraction * 100).toFixed(1)
      : null;

  // Feasibility status badge calculation
  const sunPctNum = metrics.sunlit_fraction ?? 0;
  const earthPctNum = metrics.earth_visible_fraction ?? 0;

  let feasibilityBadge = {
    label: "Optimal Power & Comms",
    style: "bg-emerald-950 text-emerald-400 border-emerald-800",
    icon: Zap,
  };

  if (sunPctNum < 0.3 || earthPctNum < 0.3) {
    feasibilityBadge = {
      label: "Critical Battery / Blackout Risk",
      style: "bg-rose-950 text-rose-400 border-rose-800",
      icon: AlertTriangle,
    };
  } else if (sunPctNum < 0.7 || earthPctNum < 0.7) {
    feasibilityBadge = {
      label: "Intermittent Operational Conditions",
      style: "bg-amber-950 text-amber-400 border-amber-800",
      icon: BatteryCharging,
    };
  }

  const FeasIcon = feasibilityBadge.icon;

  // Battery sizing calculation based on user hotel load
  const powerModeling = data.power_modeling;
  const longestDarknessHrs =
    powerModeling?.battery_sizing?.longest_darkness_hours ?? 0;

  const usableStorageKwh = (longestDarknessHrs * hotelLoadWatts) / 1000.0;
  const nominalCapacityKwh = usableStorageKwh > 0 ? usableStorageKwh / 0.7 : 0; // 70% Max DoD
  const estimatedBatteryMassKg = (nominalCapacityKwh * 1000.0) / 150.0; // 150 Wh/kg space Li-ion

  // Cumulative energy calculation based on user selected array rating and architecture
  const baseCumulativeKwh =
    powerModeling?.cumulative_energy_kwh?.[arrayArch] ??
    (metrics.sunlit_hours ?? 0) * (arrayArch === "horizontal" ? 0.05 : arrayArch === "vertical_polar" ? 0.32 : 1.0);
  const totalGeneratedKwh = baseCumulativeKwh * ratedArrayKw;

  // Chart data formatting
  const chartPoints = (data.timeline ?? []).map((pt) => {
    const rawPwr =
      arrayArch === "vertical_polar"
        ? pt.power_watts_vertical ?? (pt.is_sunlit ? 318 : 0)
        : arrayArch === "horizontal"
        ? pt.power_watts_horizontal ?? (pt.is_sunlit ? 32 : 0)
        : pt.power_watts_tracking ?? (pt.is_sunlit ? 1000 : 0);

    const scaledPwrWatts = rawPwr * ratedArrayKw;

    return {
      time: formatUtc(pt.timestamp_utc),
      rawTime: pt.timestamp_utc,
      sunElevation: pt.sun_elevation_deg,
      earthElevation: pt.earth_elevation_deg,
      powerWatts: Math.round(scaledPwrWatts),
      sunlit: pt.is_sunlit ? 1 : 0,
      earthVisible: pt.is_earth_visible ? 1 : 0,
    };
  });

  const earthWindows = (data.windows ?? []).filter(
    (w) => w.target === "earth" || w.target === "both"
  );

  return (
    <ModuleCard
      title="Solar Power & Communication Analysis"
      owner="Member 4"
      branch="feature/power-communication"
    >
      <div className="space-y-5">
        {/* Site Selector & Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="site-select" className="text-xs font-medium text-slate-300">
              Candidate Site:
            </label>
            <select
              id="site-select"
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 shadow-sm focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              {sites.map((site) => (
                <option key={site.site_id} value={site.site_id}>
                  {site.name} ({site.latitude_deg}°, {site.longitude_deg}°)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${feasibilityBadge.style}`}
            >
              <FeasIcon className="h-3 w-3" />
              {feasibilityBadge.label}
            </span>

            {loading && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
            )}
          </div>
        </div>

        {error && (
          <div className="rounded border border-rose-800 bg-rose-950/40 p-2.5 text-xs text-rose-300">
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
                    {totalGeneratedKwh.toFixed(1)} kWh est.
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
                  <span className="text-xs text-slate-400">contact coverage</span>
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
                  <span className="text-sky-300/80">DTE Comms Link</span>
                </div>
              </div>
            </div>

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
                        className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition ${
                          ratedArrayKw === kw
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
                    {totalGeneratedKwh.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">kWh</span>
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
                    {longestDarknessHrs.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">hrs</span>
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
                    {nominalCapacityKwh.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">kWh</span>
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
                    {estimatedBatteryMassKg.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">kg</span>
                  </div>
                  <div className="text-[10px] text-indigo-400/80">@ 150 Wh/kg space cells</div>
                </div>
              </div>
            </div>

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
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                        chartView === "power"
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Power Output (Watts)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView("elevation")}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                        chartView === "elevation"
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
                <span>Continuous DTE Communication Windows</span>
              </div>

              {earthWindows.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  No continuous communication window detected within this observation interval.
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
                Calculations use a <strong>geometric horizon model</strong> ({data.horizon_model}). At the lunar south pole, solar power generation and radio line-of-sight are heavily governed by low sun grazing angles and local crater rim/ridge topography not captured by ideal spherical body approximations.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2 text-[11px] text-slate-500">
          <span>Source: <span className="text-slate-400">{data.source}</span></span>
          <span>Observation: <span className="font-mono text-slate-400">{formatUtc(data.start_utc)} – {formatUtc(data.end_utc)}</span></span>
        </div>
      </div>
    </ModuleCard>
  );
}
