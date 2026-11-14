import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRightLeft,
  Clock3,
  Download,
  Globe2,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";
import type { LandingSite } from "../../../types/helios";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";
import { compareScenarios } from "../services/comparisonService";
import type {
  CompareResponse,
  ScenarioInput,
} from "../services/comparisonService";
import { VisibilityTimeline } from "./VisibilityTimeline";
import "../comparison.css";

interface Draft {
  id: string;
  siteId: string;
  start: string;
  end: string;
  step: number;
}

const initialDrafts: Draft[] = [
  {
    id: "baseline",
    siteId: "candidate_001",
    start: "2026-11-20T00:00",
    end: "2026-11-23T00:00",
    step: 60,
  },
  {
    id: "alternative-1",
    siteId: "candidate_002",
    start: "2026-11-20T00:00",
    end: "2026-11-23T00:00",
    step: 60,
  },
];
const percent = (value: number | null) =>
  value === null ? "Unknown" : `${(value * 100).toFixed(1)}%`;
const hours = (value: number | null) =>
  value === null ? "Unknown" : `${value.toFixed(1)} h`;
const signed = (value: number | null, unit: string) =>
  value === null
    ? "Unknown"
    : `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
const utc = (value: string) => new Date(`${value}Z`).toISOString();
const dateLabel = (value: string) =>
  new Date(value)
    .toISOString()
    .replace("T", " ")
    .replace(/:00\.000Z$/, " UTC");

function toInputs(drafts: Draft[]): ScenarioInput[] {
  return drafts.map((draft) => {
    const start = utc(draft.start);
    const end = utc(draft.end);
    const duration = (Date.parse(end) - Date.parse(start)) / 60000;
    if (duration <= 0)
      throw new Error("Each mission end must be after its start.");
    if (duration > 31 * 24 * 60)
      throw new Error("Mission windows must be 31 days or shorter.");
    if (duration / draft.step > 2000)
      throw new Error(
        "Choose a larger sample step: each mission supports at most 2,000 intervals.",
      );
    return {
      scenario_id: draft.id,
      site_id: draft.siteId,
      start_utc: start,
      end_utc: end,
      step_minutes: draft.step,
    };
  });
}

export function ComparisonPanel({
  onComparison,
}: {
  onComparison?: (result: CompareResponse) => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteStatus, setSiteStatus] = useState("Loading candidate sites…");
  const [siteAttempt, setSiteAttempt] = useState(0);
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [delay, setDelay] = useState(24);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState({ from: 0, to: 72, cursor: 0 });
  const sequence = useRef(1);
  const activeRequest = useRef(0);

  useEffect(() => {
    let active = true;
    setSites([]);
    setSiteStatus("Loading candidate sites…");
    fetchCandidateSites()
      .then((data) => {
        if (!active) return;
        if (!data.length) {
          setSiteStatus("No candidate sites are available yet.");
          return;
        }
        setSites(data);
        setSiteStatus("");
        setDrafts((current) =>
          current.map((draft, i) => ({
            ...draft,
            siteId: data.some((s) => s.site_id === draft.siteId)
              ? draft.siteId
              : data[i % data.length].site_id,
          })),
        );
      })
      .catch(() => {
        if (active)
          setSiteStatus(
            "Could not load sites. Start the backend and check the API URL.",
          );
      });
    return () => {
      active = false;
    };
  }, [siteAttempt]);

  useEffect(
    () => () => {
      activeRequest.current += 1;
    },
    [],
  );

  function clearResults() {
    setResult(null);
    setError("");
  }
  function update(id: string, patch: Partial<Draft>) {
    clearResults();
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, ...patch } : draft,
      ),
    );
  }
  function addScenario() {
    clearResults();
    sequence.current += 1;
    setDrafts((current) => [
      ...current,
      { ...current[0], id: `alternative-${sequence.current}` },
    ]);
  }
  function applyDelay() {
    try {
      const base = drafts[0];
      if (!Number.isFinite(delay) || delay < 0 || delay > 336)
        throw new Error("Set a delay between 0 and 336 hours.");
      const shift = (value: string) =>
        new Date(Date.parse(utc(value)) + delay * 3600000)
          .toISOString()
          .slice(0, 16);
      update(drafts[1].id, {
        siteId: base.siteId,
        start: shift(base.start),
        end: shift(base.end),
        step: base.step,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Enter valid mission dates first.",
      );
    }
  }
  async function runComparison(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    let inputs: ScenarioInput[];
    try {
      inputs = toInputs(drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enter valid UTC dates.");
      return;
    }
    setBusy(true);
    const request = ++activeRequest.current;
    try {
      const data = await compareScenarios(inputs, mode);
      if (request !== activeRequest.current) return;
      if (!Array.isArray(data.scenarios) || !Array.isArray(data.deltas))
        throw new Error(
          "The backend comparison module needs updating. Restart it with the Ravindu branch.",
        );
      setResult(data);
      const max = Math.max(...data.scenarios.map((s) => s.duration_hours));
      setView({ from: 0, to: max, cursor: 0 });
      onComparison?.(data);
    } catch (err) {
      if (request === activeRequest.current)
        setError(
          err instanceof Error
            ? err.message
            : "Comparison failed. Check your backend connection and retry.",
        );
    } finally {
      if (request === activeRequest.current) setBusy(false);
    }
  }
  function exportResult() {
    if (!result) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `helios-comparison-${result.data_mode}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const maxHours = result
    ? Math.max(...result.scenarios.map((s) => s.duration_hours))
    : 72;

  return (
    <section
      className="comparison-panel md:col-span-2"
      aria-labelledby="comparison-title"
    >
      <header className="cmp-header">
        <div>
          <p className="cmp-eyebrow">MISSION PLANNING / 05</p>
          <h2 id="comparison-title">
            <ArrowRightLeft size={22} aria-hidden="true" /> Compare your next
            move
          </h2>
          <p>Explore landing sites, mission dates, and the cost of a delay.</p>
        </div>
        <span className="cmp-badge">Scenario comparison</span>
      </header>
      <form onSubmit={runComparison}>
        <fieldset disabled={busy}>
          <div className="cmp-toolbar">
            <label className="cmp-mode">
              Data source
              <select
                aria-label="Comparison data source"
                value={mode}
                onChange={(e) => {
                  clearResults();
                  setMode(e.target.value as "live" | "demo");
                }}
              >
                <option value="live">Scientific services</option>
                <option value="demo">Synthetic demo preview</option>
              </select>
            </label>
            <p>
              All dates and times are UTC. The first scenario is your baseline.
            </p>
          </div>
          {mode === "demo" && (
            <p className="cmp-notice" role="status">
              <strong>DEMO — synthetic data, not NASA measurements.</strong>{" "}
              Preview coverage: 20 Nov–4 Dec 2026 UTC. Values are for interface
              testing only.
            </p>
          )}
          {siteStatus && (
            <div className="cmp-notice" role="status">
              {siteStatus}{" "}
              <button
                type="button"
                className="cmp-link"
                onClick={() => setSiteAttempt((n) => n + 1)}
              >
                Retry sites
              </button>
            </div>
          )}
          <div className="cmp-draft-grid">
            {drafts.map((draft, index) => (
              <div key={draft.id} className="cmp-draft">
                <div className="cmp-draft-title">
                  <span>
                    {index === 0
                      ? "A · BASELINE"
                      : `${String.fromCharCode(65 + index)} · ALTERNATIVE`}
                  </span>
                  {index >= 2 && (
                    <button
                      type="button"
                      aria-label={`Remove scenario ${index + 1}`}
                      className="cmp-icon"
                      onClick={() => {
                        clearResults();
                        setDrafts((current) =>
                          current.filter((d) => d.id !== draft.id),
                        );
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <label>
                  Landing site
                  <select
                    required
                    disabled={!sites.length}
                    value={draft.siteId}
                    onChange={(e) =>
                      update(draft.id, { siteId: e.target.value })
                    }
                  >
                    {!sites.length && (
                      <option value={draft.siteId}>
                        Waiting for candidate sites
                      </option>
                    )}
                    {sites.map((site) => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="cmp-date-grid">
                  <label>
                    Mission start (UTC)
                    <input
                      required
                      type="datetime-local"
                      value={draft.start}
                      onChange={(e) =>
                        update(draft.id, { start: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Mission end (UTC)
                    <input
                      required
                      type="datetime-local"
                      value={draft.end}
                      onChange={(e) =>
                        update(draft.id, { end: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Sample every
                  <select
                    value={draft.step}
                    onChange={(e) =>
                      update(draft.id, { step: Number(e.target.value) })
                    }
                  >
                    {[15, 30, 60, 180, 360, 1440].map((step) => (
                      <option key={step} value={step}>
                        {step < 60
                          ? `${step} minutes`
                          : `${step / 60} hour${step === 60 ? "" : "s"}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
          <div className="cmp-actions">
            <button
              type="button"
              className="cmp-secondary"
              disabled={drafts.length >= 4}
              onClick={addScenario}
            >
              <Plus size={15} /> Add scenario
            </button>
            <div className="cmp-delay">
              <Clock3 size={16} aria-hidden="true" />
              <label>
                Delay baseline by{" "}
                <input
                  aria-label="Mission delay in hours"
                  type="number"
                  min="0"
                  max="336"
                  step="1"
                  value={Number.isNaN(delay) ? "" : delay}
                  onChange={(e) =>
                    setDelay(
                      e.target.value === "" ? NaN : Number(e.target.value),
                    )
                  }
                />{" "}
                hours
              </label>
              <button
                type="button"
                className="cmp-secondary"
                onClick={applyDelay}
              >
                Apply to B
              </button>
            </div>
          </div>
          <div className="cmp-submit-row">
            <p>Delay analysis keeps the baseline site and mission duration.</p>
            <button
              type="submit"
              className="cmp-primary"
              disabled={!sites.length}
            >
              {busy ? "Analyzing scenarios…" : "Compare scenarios"}
              <ArrowRightLeft size={16} />
            </button>
          </div>
        </fieldset>
      </form>
      {busy && (
        <p className="cmp-empty" role="status">
          Loading conditions and visibility timelines…
        </p>
      )}
      {error && (
        <p className="cmp-error" role="alert">
          {error} Check the backend and your mission window, then retry.
        </p>
      )}
      {!result && !busy && !error && (
        <div className="cmp-empty">
          <Globe2 size={20} aria-hidden="true" />
          <p>
            Set up at least two scenarios, then compare.
            <br />
            <span>Missing scientific data will always appear as unknown.</span>
          </p>
        </div>
      )}
      {result && (
        <div className="cmp-results" aria-live="polite">
          <div className="cmp-result-heading">
            <h3>
              {result.data_mode === "demo"
                ? "Synthetic preview results"
                : "Comparison results"}{" "}
              <span className="cmp-badge">{result.status}</span>
            </h3>
            <button
              type="button"
              className="cmp-secondary"
              onClick={exportResult}
            >
              <Download size={15} /> Export JSON
            </button>
          </div>
          {result.status !== "ok" && (
            <p className="cmp-notice">
              Some scientific outputs are pending or unavailable. Unknown values
              are excluded from differences. You can select the synthetic
              preview to explore the interface.
            </p>
          )}
          <div className="cmp-summary-grid">
            {result.scenarios.map((scenario, index) => {
              const conditions = scenario.conditions;
              const metrics = conditions.metrics;
              const available = conditions.status === "ok";
              const delta = result.deltas.find(
                (d) => d.scenario_id === scenario.scenario_id,
              );
              return (
                <article className="cmp-summary" key={scenario.scenario_id}>
                  <p className="cmp-eyebrow">
                    {index === 0
                      ? "A · BASELINE"
                      : `${String.fromCharCode(65 + index)} · ALTERNATIVE`}
                  </p>
                  <h4>{scenario.site_name}</h4>
                  <p className="cmp-caption">
                    {dateLabel(conditions.start_utc)} →{" "}
                    {dateLabel(conditions.end_utc)}
                  </p>
                  <p className="cmp-caption">
                    {scenario.duration_hours} h mission ·{" "}
                    {conditions.step_minutes} min samples · {conditions.status}
                  </p>
                  <div className="cmp-metrics">
                    <div>
                      <Sun size={17} className="cmp-sun" aria-hidden="true" />
                      <span>Sunlight</span>
                      <strong>
                        {percent(available ? metrics.sunlit_fraction : null)}
                      </strong>
                      <small>
                        {hours(available ? metrics.sunlit_hours : null)}
                      </small>
                    </div>
                    <div>
                      <Globe2
                        size={17}
                        className="cmp-earth"
                        aria-hidden="true"
                      />
                      <span>Earth visibility</span>
                      <strong>
                        {percent(
                          available ? metrics.earth_visible_fraction : null,
                        )}
                      </strong>
                      <small>
                        {hours(available ? metrics.earth_visible_hours : null)}
                      </small>
                    </div>
                  </div>
                  {delta && (
                    <div className="cmp-delta">
                      <p>
                        Change from A · start{" "}
                        {signed(delta.start_delay_hours, "h")}
                      </p>
                      <p>
                        Sunlight:{" "}
                        <strong>
                          {signed(delta.sunlit_percentage_points, "pp")}
                        </strong>{" "}
                        / {signed(delta.sunlit_hours, "h")}
                      </p>
                      <p>
                        Earth visibility:{" "}
                        <strong>
                          {signed(delta.earth_visible_percentage_points, "pp")}
                        </strong>{" "}
                        / {signed(delta.earth_visible_hours, "h")}
                      </p>
                      {delta.warnings.map((w) => (
                        <p className="cmp-caption" key={w}>
                          {w}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="cmp-caption">
                    Source: {conditions.source} · Model:{" "}
                    {conditions.horizon_model}
                  </p>
                  {scenario.warnings.map((warning) => (
                    <p className="cmp-warning" key={warning}>
                      {warning}
                    </p>
                  ))}
                </article>
              );
            })}
          </div>
          <div className="cmp-timeline-header">
            <h3>Visibility over the mission</h3>
            <p>
              Aligned by elapsed hours so different mission dates can be
              compared.
            </p>
          </div>
          <div className="cmp-range-controls">
            <label>
              View from: {view.from.toFixed(1)} h
              <input
                type="range"
                min="0"
                max={maxHours}
                step="0.25"
                value={view.from}
                onChange={(e) => {
                  const from = Math.min(
                    Number(e.target.value),
                    view.to - Math.min(0.25, maxHours),
                  );
                  setView({
                    ...view,
                    from,
                    cursor: Math.max(from, view.cursor),
                  });
                }}
              />
            </label>
            <label>
              View to: {view.to.toFixed(1)} h
              <input
                type="range"
                min="0"
                max={maxHours}
                step="0.25"
                value={view.to}
                onChange={(e) => {
                  const to = Math.max(
                    Number(e.target.value),
                    view.from + Math.min(0.25, maxHours),
                  );
                  setView({ ...view, to, cursor: Math.min(to, view.cursor) });
                }}
              />
            </label>
            <label>
              Inspect: {view.cursor.toFixed(1)} h
              <input
                type="range"
                min={view.from}
                max={view.to}
                step="0.25"
                value={view.cursor}
                onChange={(e) =>
                  setView({ ...view, cursor: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="cmp-summary-grid">
            {result.scenarios.map((scenario) => {
              const instant =
                Date.parse(scenario.conditions.start_utc) +
                view.cursor * 3600000;
              const point = scenario.timeline.find(
                (p) =>
                  Date.parse(p.start_utc) <= instant &&
                  Date.parse(p.end_utc) > instant,
              );
              const state = (value: boolean | null | undefined) =>
                value === true
                  ? "Visible"
                  : value === false
                    ? "Below horizon"
                    : "Unknown";
              return (
                <article className="cmp-summary" key={scenario.scenario_id}>
                  <h4>{scenario.site_name}</h4>
                  <p className="cmp-caption">
                    {dateLabel(new Date(instant).toISOString())}
                  </p>
                  <p className="cmp-inspect">
                    Sun: {state(point?.sunlit)} · Earth:{" "}
                    {state(point?.earth_visible)}
                  </p>
                  <VisibilityTimeline
                    scenario={scenario}
                    from={view.from}
                    to={view.to}
                    cursor={view.cursor}
                  />
                  <p className="cmp-caption">
                    Timeline: {scenario.timeline_source} ·{" "}
                    {scenario.timeline_status}
                  </p>
                </article>
              );
            })}
          </div>
          <details className="cmp-assumptions">
            <summary>Sources, assumptions & integration notes</summary>
            <ul>
              {result.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
            <p>
              Export includes scenario identifiers, conditions, intervals, and
              baseline differences for HELIOS. Demo results must be excluded
              from scientific recommendations.
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
