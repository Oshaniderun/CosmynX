import { useEffect, useState } from "react";
import { Sun, Radio, Activity } from "lucide-react";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";
import type { ConditionsResponse } from "../../../types/helios";
import { fetchConditions, type ConditionsQueryParams } from "../services/conditionsService";
import { demoConditions } from "../services/demoConditions";

interface PowerCommunicationPanelProps {
  conditions?: ConditionsResponse;
}

export function PowerCommunicationPanel({
  conditions: propConditions,
}: PowerCommunicationPanelProps) {
  const { selectedSite, missionDates, stepMinutes } = useMission();
  const [data, setData] = useState<ConditionsResponse>(
    propConditions ?? demoConditions
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propConditions) {
      setData(propConditions);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const queryParams: ConditionsQueryParams = selectedSite
      ? {
          site_id: selectedSite.site_id,
          latitude_deg: selectedSite.latitude_deg,
          longitude_deg: selectedSite.longitude_deg,
          start_utc: missionDates.startUtc,
          end_utc: missionDates.endUtc,
          step_minutes: stepMinutes,
        }
      : {
          start_utc: missionDates.startUtc,
          end_utc: missionDates.endUtc,
          step_minutes: stepMinutes,
        };

    fetchConditions(queryParams)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          console.warn("Could not fetch conditions from /api/conditions, using demo data:", err);
          setData(demoConditions);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propConditions, selectedSite, missionDates, stepMinutes]);

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

  return (
    <ModuleCard
      title="Solar Power & Communication Analysis"
      owner="Member 4"
      branch="feature/power-communication"
    >
      <div className="space-y-4">
        {/* Active Target Banner */}
        {selectedSite && (
          <div className="flex items-center gap-2.5 rounded-lg border border-sky-500/30 bg-[#0D1728] px-3 py-1.5 text-xs font-mono text-sky-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-sky-400 ring-2 ring-sky-400/30 animate-pulse" />
            <span>Target: <strong className="text-white">{selectedSite.name}</strong> ({selectedSite.site_id})</span>
          </div>
        )}

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#A7B4C7]">
          <div className="flex items-center gap-2">
            <span>Source: <strong className="text-slate-200 font-mono">{data.source}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Model: <span className="font-mono text-sky-300">{data.horizon_model}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium ${
                data.status === "ok"
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/60"
                  : data.status === "pending"
                  ? "bg-amber-950/40 text-amber-400 border border-amber-800/60"
                  : "bg-rose-950/40 text-rose-400 border border-rose-800/60"
              }`}
            >
              <Activity className="h-3 w-3" />
              {loading ? "Refreshing..." : `Status: ${data.status}`}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-800/60 bg-rose-950/30 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Content based on status */}
        {!isOk ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#0A1324]/70 backdrop-blur-md p-6 text-center shadow-inner">
            <p className="text-sm font-medium text-slate-200">
              {data.status === "pending"
                ? "Calculating solar illumination and Earth visibility metrics..."
                : "No ephemeris condition data is available for this site and time window."}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              JPL Horizons ephemeris data unavailable or site out of range.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Solar Illumination Metric Card */}
            <div className="rounded-xl border border-amber-500/30 bg-[#0A1424]/75 backdrop-blur-md p-4 shadow-sm hover:border-amber-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Sun className="h-3.5 w-3.5" /> Solar Illumination
                </span>
                <span className="font-mono text-xs text-amber-400/90 font-medium">
                  {metrics.sunlit_hours !== null ? `${metrics.sunlit_hours} hrs` : "—"}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-bold tracking-tight text-white">
                  {sunlitPct !== null ? `${sunlitPct}%` : "—"}
                </span>
                <span className="text-xs text-slate-300 font-medium">sunlit</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#040814]/80 border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                  style={{ width: `${Math.min(Math.max((metrics.sunlit_fraction ?? 0) * 100, 0), 100)}%` }}
                />
              </div>
              <div className="mt-2.5 text-[11px] text-slate-400">
                Geometric elevation &gt; 0°
              </div>
            </div>

            {/* Earth Visibility & Communication Card */}
            <div className="rounded-xl border border-sky-500/30 bg-[#0A1424]/75 backdrop-blur-md p-4 shadow-sm hover:border-sky-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                  <Radio className="h-3.5 w-3.5" /> Direct-to-Earth Contact
                </span>
                <span className="font-mono text-xs text-sky-400/90 font-medium">
                  {metrics.earth_visible_hours !== null
                    ? `${metrics.earth_visible_hours} hrs`
                    : "—"}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-bold tracking-tight text-white">
                  {earthVisiblePct !== null ? `${earthVisiblePct}%` : "—"}
                </span>
                <span className="text-xs text-slate-300 font-medium">visibility</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#040814]/80 border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                  style={{
                    width: `${Math.min(
                      Math.max((metrics.earth_visible_fraction ?? 0) * 100, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-2.5 text-[11px] text-slate-400">
                Direct Line-of-Sight &gt; 0°
              </div>
            </div>
          </div>
        )}

        {/* Site & Coordinate Details Footer */}
        <div className="rounded-xl border border-white/[0.08] bg-[#070F1E]/75 backdrop-blur-md p-3.5 text-xs text-slate-300">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-[#718096]">Site ID</span>
              <span className="font-mono text-sm text-slate-100">{data.site_id}</span>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-[#718096]">Coordinates</span>
              <span className="font-mono text-sm text-slate-100">
                {data.latitude_deg}°, {data.longitude_deg}°
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-[#718096]">Start (UTC)</span>
              <span className="font-mono text-sm text-slate-100">{data.start_utc.replace("T", " ").replace("Z", "")}</span>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-[#718096]">End (UTC)</span>
              <span className="font-mono text-sm text-slate-100">{data.end_utc.replace("T", " ").replace("Z", "")}</span>
            </div>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
}
