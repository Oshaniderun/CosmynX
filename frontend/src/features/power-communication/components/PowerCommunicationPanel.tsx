import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BatteryCharging,
  Clock,
  Radio,
  RefreshCw,
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

  // Load available landing sites
  useEffect(() => {
    fetchCandidateSites()
      .then((loadedSites) => {
        if (loadedSites && loadedSites.length > 0) {
          setSites(loadedSites);
        }
      })
      .catch(() => {
        // Fall back to predefined sites
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

  // Chart data formatting
  const chartPoints = (data.timeline ?? []).map((pt) => ({
    time: formatUtc(pt.timestamp_utc),
    rawTime: pt.timestamp_utc,
    sunElevation: pt.sun_elevation_deg,
    earthElevation: pt.earth_elevation_deg,
    sunlit: pt.is_sunlit ? 1 : 0,
    earthVisible: pt.is_earth_visible ? 1 : 0,
  }));

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

        {/* Status Check Message */}
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
                  <span className="text-amber-300/80">Solar Array Active</span>
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

            {/* Recharts Timeline Visualization */}
            {chartPoints.length > 0 && (
              <figure className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
                <figcaption className="flex items-center justify-between px-1 pb-2">
                  <span className="text-xs font-medium text-slate-200">
                    Solar & Earth Horizon Elevation Profile
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Dashed line: 0° Geometric Horizon
                  </span>
                </figcaption>

                <div className="h-48 w-full min-w-0" aria-label="Elevation timeline chart">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                        name="Sun Elevation"
                        stroke="#fbbf24"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="earthElevation"
                        name="Earth Elevation"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
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
                Calculations use a <strong>geometric horizon model</strong> ({data.horizon_model}). At the lunar south pole, actual sunlight and radio line-of-sight are heavily influenced by local topography, crater rims, and ridge shadowing not captured in spherical body models.
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
