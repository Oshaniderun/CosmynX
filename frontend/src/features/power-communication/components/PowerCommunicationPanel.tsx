import { useEffect, useState } from "react";
import { Sun } from "lucide-react";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import type { ConditionsResponse } from "../../../types/helios";
import { fetchConditions } from "../services/conditionsService";
import { demoConditions } from "../services/demoConditions";

interface PowerCommunicationPanelProps {
  conditions?: ConditionsResponse;
}

export function PowerCommunicationPanel({
  conditions: propConditions,
}: PowerCommunicationPanelProps) {
  const [data, setData] = useState<ConditionsResponse>(
    propConditions ?? demoConditions
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(!propConditions);

  useEffect(() => {
    if (propConditions) {
      setData(propConditions);
      setIsDemoData(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetchConditions()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsDemoData(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          // If backend endpoint is offline during development, fall back gracefully to demoConditions
          console.warn("Could not fetch conditions from /api/conditions, using demo data:", err);
          setData(demoConditions);
          setIsDemoData(true);
          setError("The scientific conditions service is unavailable. Local sample values are shown for demonstration only.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propConditions]);

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
      title="Solar Illumination & Earth Line of Sight"
      eyebrow="Measured surface conditions"
      icon={<Sun size={17} />}
    >
      <div className="space-y-4">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Source: <strong className="text-slate-200">{isDemoData ? "Local demo sample · not live NASA data" : data.source}</strong></span>
            <span>•</span>
            <span>Model: <span className="font-mono text-slate-300">{data.horizon_model}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                data.status === "ok"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : data.status === "pending"
                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                  : "bg-rose-950 text-rose-400 border border-rose-800"
              }`}
            >
              {loading ? "Refreshing..." : `Status: ${data.status}`}
            </span>
          </div>
        </div>

        {error && (
          <div role={isDemoData ? "status" : "alert"} className={`rounded border p-2 text-xs ${isDemoData ? "border-amber-800/70 bg-amber-950/30 text-amber-200" : "border-rose-800 bg-rose-950/40 text-rose-300"}`}>
            {isDemoData && <strong className="mr-2 font-bold tracking-wide">DEMO MODE</strong>}
            {error}
          </div>
        )}

        {/* Content based on status */}
        {!isOk ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-center">
            <p className="text-sm text-slate-300">
              {data.status === "pending"
                ? "Calculating solar illumination and Earth visibility metrics..."
                : "No ephemeris condition data is available for this site and time window."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPL Horizons ephemeris data unavailable or site out of range.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Solar Illumination Metric Card */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-400">
                  Solar Illumination
                </span>
                <span className="text-xs text-slate-400">
                  {metrics.sunlit_hours !== null ? `${metrics.sunlit_hours} hrs` : "—"}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-100">
                  {sunlitPct !== null ? `${sunlitPct}%` : "—"}
                </span>
                <span className="text-xs text-slate-400">sunlit</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                  style={{ width: `${Math.min(Math.max((metrics.sunlit_fraction ?? 0) * 100, 0), 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Geometric elevation &gt; 0°
              </div>
            </div>

            {/* Earth Visibility & Communication Card */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/10 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sky-400">
                  Geometric Earth visibility
                </span>
                <span className="text-xs text-slate-400">
                  {metrics.earth_visible_hours !== null
                    ? `${metrics.earth_visible_hours} hrs`
                    : "—"}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-100">
                  {earthVisiblePct !== null ? `${earthVisiblePct}%` : "—"}
                </span>
                <span className="text-xs text-slate-400">visibility</span>
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
              <div className="mt-2 text-xs text-slate-400">
                Geometric elevation &gt; 0°
              </div>
            </div>
          </div>
        )}

        {/* Site & Coordinate Details Footer */}
        <div className="rounded-lg bg-slate-950/40 p-3 text-xs text-slate-400">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <span className="block text-slate-500">Site ID</span>
              <span className="font-mono text-slate-200">{data.site_id}</span>
            </div>
            <div>
              <span className="block text-slate-500">Coordinates</span>
              <span className="font-mono text-slate-200">
                {data.latitude_deg}°, {data.longitude_deg}°
              </span>
            </div>
            <div>
              <span className="block text-slate-500">Start (UTC)</span>
              <span className="font-mono text-slate-200">{data.start_utc}</span>
            </div>
            <div>
              <span className="block text-slate-500">End (UTC)</span>
              <span className="font-mono text-slate-200">{data.end_utc}</span>
            </div>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
}
