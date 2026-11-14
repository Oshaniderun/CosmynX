import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, ArrowRightLeft, ChartNoAxesColumnIncreasing, Clock3, LoaderCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import type { ConditionsResponse, LandingSite } from "../../../types/helios";
import { compareScenarios } from "../services/comparisonService";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";

const DEFAULT_START_A = "2026-11-20T00:00:00Z";
const DEFAULT_START_B = "2026-11-21T00:00:00Z";
const DEFAULT_DURATION_HOURS = 6;

function toLocalInput(iso: string) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function toUtcIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function percent(value: number | null) {
  return value == null ? "N/A" : `${(value * 100).toFixed(1)}%`;
}

export function ComparisonPanel() {
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteA, setSiteA] = useState("");
  const [siteB, setSiteB] = useState("");
  const [startA, setStartA] = useState(toLocalInput(DEFAULT_START_A));
  const [startB, setStartB] = useState(toLocalInput(DEFAULT_START_B));
  const [durationHours, setDurationHours] = useState(DEFAULT_DURATION_HOURS);
  const [results, setResults] = useState<ConditionsResponse[] | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchCandidateSites()
      .then((availableSites) => {
        if (!active) return;
        setSites(availableSites);
        setSiteA(availableSites[0]?.site_id ?? "");
        setSiteB(availableSites[1]?.site_id ?? availableSites[0]?.site_id ?? "");
        if (availableSites.length < 2) setError("Two candidate sites are needed for a comparison.");
      })
      .catch(() => { if (active) setError("The candidate site catalog could not be reached."); })
      .finally(() => { if (active) setLoadingSites(false); });
    return () => { active = false; };
  }, []);

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.map((result, index) => ({
      scenario: index === 0 ? "Scenario A" : "Scenario B",
      sunlight: result.metrics.sunlit_fraction == null ? null : result.metrics.sunlit_fraction * 100,
      earthLineOfSight: result.metrics.earth_visible_fraction == null ? null : result.metrics.earth_visible_fraction * 100,
    }));
  }, [results]);

  async function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const startUtcA = toUtcIso(startA);
    const startUtcB = toUtcIso(startB);
    if (!siteA || !siteB || !startUtcA || !startUtcB || !Number.isFinite(durationHours) || durationHours < 1) {
      setError("Select two sites, valid mission start times, and a duration of at least one hour.");
      setResults(null);
      return;
    }

    const endUtcA = new Date(Date.parse(startUtcA) + durationHours * 3_600_000).toISOString();
    const endUtcB = new Date(Date.parse(startUtcB) + durationHours * 3_600_000).toISOString();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const response = await compareScenarios([
        { site_id: siteA, start_utc: startUtcA, end_utc: endUtcA, step_minutes: 60 },
        { site_id: siteB, start_utc: startUtcB, end_utc: endUtcB, step_minutes: 60 },
      ]);
      setResults(response.results);
    } catch {
      setError("Scenario comparison could not be completed. Check the service and try again.");
    } finally {
      setLoading(false);
    }
  }

  const startOffsetHours = Math.round((Date.parse(startB) - Date.parse(startA)) / 3_600_000);
  const siteName = (id: string) => sites.find((site) => site.site_id === id)?.name ?? id;

  return (
    <ModuleCard title="Scenario comparison" eyebrow="Mission windows & surface conditions" icon={<ArrowRightLeft size={17} />}>
      <div className="comparison-workspace">
        <form className="comparison-form" onSubmit={handleCompare}>
          <p className="comparison-form__intro">Compare geometric visibility for two candidate and mission-window combinations. Start times are entered in your local time and sent to the service as UTC.</p>
          <div className="comparison-form__scenarios">
            {[
              { label: "Scenario A", site: siteA, setSite: setSiteA, start: startA, setStart: setStartA },
              { label: "Scenario B", site: siteB, setSite: setSiteB, start: startB, setStart: setStartB },
            ].map((scenario, index) => (
              <fieldset className="comparison-scenario" key={scenario.label}>
                <legend><span>0{index + 1}</span>{scenario.label}</legend>
                <label>
                  Candidate site
                  <select value={scenario.site} onChange={(event) => scenario.setSite(event.target.value)} disabled={loadingSites || sites.length === 0}>
                    {sites.map((site) => <option value={site.site_id} key={site.site_id}>{site.name}</option>)}
                  </select>
                </label>
                <label>
                  Mission start · local time
                  <input type="datetime-local" value={scenario.start} onChange={(event) => scenario.setStart(event.target.value)} />
                </label>
              </fieldset>
            ))}
          </div>
          <div className="comparison-form__footer">
            <label className="comparison-duration">Window duration
              <span><input type="number" min={1} max={720} value={durationHours} onChange={(event) => setDurationHours(Number(event.target.value))} /> hours</span>
            </label>
            <span className="comparison-offset"><Clock3 size={14} aria-hidden="true" /> Start offset <strong>{startOffsetHours > 0 ? "+" : ""}{startOffsetHours} h</strong></span>
            <button type="submit" disabled={loading || loadingSites || sites.length < 2}>
              {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Activity size={15} aria-hidden="true" />}
              {loading ? "Comparing…" : "Compare windows"}
            </button>
          </div>
        </form>

        {error && <div className="comparison-message" role="alert">{error}</div>}
        {loading && <div className="comparison-message" role="status">Retrieving the selected scientific measurements…</div>}

        {results && (
          <div className="comparison-results" aria-live="polite">
            {results.length === 0 ? (
              <div className="comparison-message" role="status">The service returned no scenario results.</div>
            ) : (
              <>
                <div className="comparison-results__heading">
                  <div><p className="panel-eyebrow">Comparison output</p><h3>Measured visibility by scenario</h3></div>
                  <span><ChartNoAxesColumnIncreasing size={15} aria-hidden="true" /> Sampled scientific data</span>
                </div>
                <div className="comparison-results__grid">
                  <div className="comparison-chart" role="img" aria-label="Bar chart comparing sunlight and geometric Earth visibility percentages for the two scenarios">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(180,200,216,.1)" vertical={false} />
                        <XAxis dataKey="scenario" tick={{ fill: "#9aabb8", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#80909d", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value}%`} />
                        <Tooltip contentStyle={{ background: "#0e1722", border: "1px solid rgba(180,200,216,.2)", borderRadius: 10, color: "#eef2f7", fontSize: 11 }} formatter={(value) => value == null ? "N/A" : `${Number(value).toFixed(1)}%`} />
                        <Legend wrapperStyle={{ color: "#9aabb8", fontSize: 10 }} />
                        <Bar dataKey="sunlight" name="Sunlight" fill="#d8ad68" radius={[4, 4, 0, 0]} maxBarSize={34} />
                        <Bar dataKey="earthLineOfSight" name="Earth line of sight" fill="#81b9d1" radius={[4, 4, 0, 0]} maxBarSize={34} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="comparison-result-list">
                    {results.map((result, index) => (
                      <article className="comparison-result" key={`${result.site_id}-${result.start_utc}`}>
                        <div className="comparison-result__top"><span>{index === 0 ? "Scenario A" : "Scenario B"}</span><span className={`comparison-status comparison-status--${result.status}`}>{result.status}</span></div>
                        <h4>{siteName(result.site_id)}</h4>
                        <p>{result.latitude_deg.toFixed(2)}°, {result.longitude_deg.toFixed(2)}° · {result.source}</p>
                        <div className="comparison-result__metrics">
                          <span>Sunlight <strong>{percent(result.metrics.sunlit_fraction)}</strong></span>
                          <span>Earth line of sight <strong>{percent(result.metrics.earth_visible_fraction)}</strong></span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <p className="comparison-results__note">Earth visibility is geometric line of sight, not communications reliability. Measurements are sampled estimates.</p>
              </>
            )}
          </div>
        )}

        {!results && !error && !loading && (
          <div className="comparison-empty"><span><ChartNoAxesColumnIncreasing size={16} aria-hidden="true" /></span><p>Choose two candidate windows to view a data-backed comparison.</p></div>
        )}
      </div>
    </ModuleCard>
  );
}
