import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRightLeft,
  Clock3,
  Download,
  Globe2,
  Plus,
  Sun,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Trash2,
} from "lucide-react";
import type { LandingSite } from "../../../types/helios";
import { useMission } from "../../../context/MissionContext";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";
import { compareScenarios } from "../services/comparisonService";
import type {
  CompareResponse,
  ScenarioInput,
} from "../services/comparisonService";
import { ComparisonOverview } from "./ComparisonOverview";
import { OperationalDetails } from "./OperationalDetails";
import { VisibilityTimeline } from "./VisibilityTimeline";
import "../comparison.css";

interface Draft {
  id: string;
  siteId: string;
  start: string;
  end: string;
  step: number;
  latitude?: string;
  longitude?: string;
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
    const coordinates =
      draft.siteId === "custom"
        ? {
            latitude_deg: Number(draft.latitude),
            longitude_deg: Number(draft.longitude),
          }
        : {};
    if (
      draft.siteId === "custom" &&
      (!draft.latitude?.trim() ||
        !draft.longitude?.trim() ||
        !Number.isFinite(coordinates.latitude_deg) ||
        !Number.isFinite(coordinates.longitude_deg) ||
        Math.abs(coordinates.latitude_deg!) > 90 ||
        Math.abs(coordinates.longitude_deg!) > 180)
    )
      throw new Error(
        "Custom sites require latitude from -90 to 90 and east-positive longitude from -180 to 180.",
      );
    return {
      ...coordinates,
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
  const { selectedSite, setSelectedSite } = useMission();
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [siteStatus, setSiteStatus] = useState("Loading candidate sites…");
  const [siteAttempt, setSiteAttempt] = useState(0);
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [resultView, setResultView] = useState<
    "overview" | "summary" | "timelines"
  >("overview");
  const [setupOpen, setSetupOpen] = useState(true);
  const [linkedDates, setLinkedDates] = useState(true);
  const [delay, setDelay] = useState(24);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState({ from: 0, to: 72, cursor: 0 });
  const sequence = useRef(1);
  const activeRequest = useRef(0);
  const requestController = useRef<AbortController | null>(null);

  // Synchronize baseline draft when user selects a site from the Lunar Map
  useEffect(() => {
    if (!selectedSite) return;
    setResult(null);
    setSetupOpen(true);
    setDrafts((current) => {
      if (current.length === 0) return current;
      const baseline = current[0];
      if (baseline.siteId === selectedSite.site_id) return current;
      const updatedBaseline: Draft = {
        ...baseline,
        siteId: selectedSite.site_id,
        latitude:
          selectedSite.latitude_deg !== undefined
            ? String(selectedSite.latitude_deg)
            : baseline.latitude,
        longitude:
          selectedSite.longitude_deg !== undefined
            ? String(selectedSite.longitude_deg)
            : baseline.longitude,
      };
      return [updatedBaseline, ...current.slice(1)];
    });
  }, [selectedSite]);

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
            siteId:
              draft.siteId === "custom" ||
              data.some((s) => s.site_id === draft.siteId)
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
      requestController.current?.abort();
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
  function duplicateScenario(draft: Draft) {
    clearResults();
    sequence.current += 1;
    setDrafts((current) => [
      ...current,
      { ...draft, id: `alternative-${sequence.current}` },
    ]);
  }
  function promoteBaseline(id: string) {
    clearResults();
    const match = drafts.find((draft) => draft.id === id);
    const siteMatch = sites.find((site) => site.site_id === match?.siteId);
    if (siteMatch) setSelectedSite(siteMatch);
    setDrafts((current) => {
      return [
        current.find((draft) => draft.id === id)!,
        ...current.filter((draft) => draft.id !== id),
      ];
    });
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
        latitude: base.latitude,
        longitude: base.longitude,
        start: shift(base.start),
        end: shift(base.end),
        step: base.step,
      });
      setLinkedDates(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Enter valid mission dates first.",
      );
    }
  }
  async function runComparison(event: FormEvent) {
    event.preventDefault();
    await compare();
  }
  async function compare(inputDrafts = drafts, dataMode = mode) {
    setError("");
    setResult(null);
    let inputs: ScenarioInput[];
    try {
      inputs = toInputs(inputDrafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enter valid UTC dates.");
      return;
    }
    setBusy(true);
    const request = ++activeRequest.current;
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 240000);
    try {
      const data = await compareScenarios(inputs, dataMode, controller.signal);
      if (request !== activeRequest.current) return;
      if (!Array.isArray(data.scenarios) || !Array.isArray(data.deltas))
        throw new Error(
          "The comparison service returned an incomplete response. Update and restart the backend, then retry.",
        );
      setResult(data);
      setResultView("overview");
      setSetupOpen(false);
      const max = Math.max(...data.scenarios.map((s) => s.duration_hours));
      setView({ from: 0, to: max, cursor: 0 });
      onComparison?.(data);
    } catch (err) {
      if (request === activeRequest.current)
        setError(
          controller.signal.aborted
            ? "Comparison stopped or timed out. Try the cached NASA example or a smaller mission window."
            : err instanceof Error
              ? err.message
              : "Comparison failed. Check your backend connection and retry.",
        );
    } finally {
      window.clearTimeout(timeout);
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
  const exportWindows = () => {
    if (!result) return;
    const quote = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '\"\"')}"`;
    const rows: unknown[][] = [
      [
        "data_mode",
        "scenario_id",
        "site",
        "window",
        "start_utc",
        "end_utc",
        "sampled_hours",
        "step_minutes",
        "source",
      ],
    ];
    result.scenarios.forEach((scenario) =>
      scenario.windows.forEach((window) =>
        rows.push([
          result.data_mode,
          scenario.scenario_id,
          scenario.site_name,
          window.target,
          window.start_utc,
          window.end_utc,
          window.duration_hours,
          scenario.conditions.step_minutes,
          scenario.conditions.source,
        ]),
      ),
    );
    const url = URL.createObjectURL(
      new Blob([rows.map((row) => row.map(quote).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `helios-windows-${result.data_mode}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const maxHours = result
    ? Math.max(...result.scenarios.map((s) => s.duration_hours))
    : 72;

  return (
    <section
      className="comparison-panel cw-comparison md:col-span-2"
      aria-labelledby="comparison-title"
      aria-busy={busy}
    >
      <header className="cmp-header cw-comparison-header">
        <div>
          <p className="cmp-eyebrow">SCENARIO COMPARISON</p>
          <h2 id="comparison-title">Compare landing scenarios</h2>
          <p>Compare sites, dates and mission visibility in one view.</p>
        </div>
        <div className="cw-header-actions">
          <button
            type="button"
            className="cmp-secondary"
            disabled={busy}
            onClick={() => {
              const example: Draft[] = [
                {
                  id: "baseline",
                  siteId: "custom",
                  latitude: "-89.54",
                  longitude: "0",
                  start: "2026-11-20T00:00",
                  end: "2026-11-20T06:00",
                  step: 60,
                },
                {
                  id: "alternative-1",
                  siteId: "custom",
                  latitude: "-86",
                  longitude: "2",
                  start: "2026-11-20T00:00",
                  end: "2026-11-20T06:00",
                  step: 60,
                },
              ];
              setMode("live");
              setLinkedDates(true);
              setDrafts(example);
              void compare(example, "live");
            }}
          >
            <Sparkles size={14} />
            Run NASA example
          </button>
          {setupOpen ? (
            <button
              key="compare"
              type="submit"
              form="scenario-comparison-form"
              className="cmp-primary"
              disabled={busy || !sites.length}
            >
              {busy ? "Comparing…" : "Compare scenarios"}
              <ArrowRightLeft size={15} />
            </button>
          ) : (
            <button
              key="edit"
              type="button"
              className="cmp-primary"
              onClick={(event) => {
                event.preventDefault();
                setSetupOpen(true);
              }}
              disabled={busy}
            >
              <SlidersHorizontal size={15} />
              Edit scenarios
            </button>
          )}
        </div>
      </header>
      {!setupOpen && result && (
        <div className="cw-study-summary">
          {result.scenarios.map((scenario, index) => (
            <span key={scenario.scenario_id}>
              <b>{String.fromCharCode(65 + index)}</b>
              <strong>{scenario.site_name}</strong>
              <small>
                {scenario.duration_hours} h ·{" "}
                {dateLabel(scenario.conditions.start_utc)}
              </small>
            </span>
          ))}
        </div>
      )}
      <div hidden={!setupOpen}>
        <form id="scenario-comparison-form" onSubmit={runComparison}>
          <fieldset disabled={busy}>
            {siteStatus && (
              <div className="cmp-notice" role="status">
                {siteStatus}
                <button
                  type="button"
                  className="cmp-link"
                  onClick={() => setSiteAttempt((n) => n + 1)}
                >
                  Retry sites
                </button>
              </div>
            )}
            {mode === "demo" && (
              <p className="cmp-notice" role="status">
                <strong>Synthetic preview — not NASA measurements.</strong>{" "}
                Coverage: 20 Nov–4 Dec 2026 UTC.
              </p>
            )}
            <div className="cw-shared-dates">
              <label className="cw-link-dates">
                <input
                  type="checkbox"
                  checked={linkedDates}
                  onChange={(event) => {
                    setLinkedDates(event.target.checked);
                    if (event.target.checked) {
                      clearResults();
                      setDrafts((current) =>
                        current.map((draft) => ({
                          ...draft,
                          start: current[0].start,
                          end: current[0].end,
                        })),
                      );
                    }
                  }}
                />
                <span>
                  Same mission dates
                  <small>Use a shared window to compare sites</small>
                </span>
              </label>
              {linkedDates && (
                <div className="cmp-date-grid">
                  <label>
                    Start (UTC)
                    <input
                      required
                      type="datetime-local"
                      value={drafts[0].start}
                      onChange={(event) => {
                        clearResults();
                        const start = event.target.value;
                        setDrafts((current) =>
                          current.map((draft) => ({ ...draft, start })),
                        );
                      }}
                    />
                  </label>
                  <label>
                    End (UTC)
                    <input
                      required
                      type="datetime-local"
                      value={drafts[0].end}
                      onChange={(event) => {
                        clearResults();
                        const end = event.target.value;
                        setDrafts((current) =>
                          current.map((draft) => ({ ...draft, end })),
                        );
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="cmp-draft-grid">
              {drafts.map((draft, index) => (
                <article
                  key={draft.id}
                  className="cmp-draft"
                  aria-label={`Scenario ${String.fromCharCode(65 + index)}`}
                >
                  <div className="cmp-draft-title">
                    <span>
                      <b className="cw-scenario-letter">
                        {String.fromCharCode(65 + index)}
                      </b>
                      {index === 0 ? "REFERENCE SCENARIO" : "COMPARE WITH"}
                    </span>
                    {index >= 2 && (
                      <button
                        type="button"
                        className="cmp-icon"
                        aria-label={`Remove scenario ${index + 1}`}
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
                      onChange={(event) => {
                        update(draft.id, { siteId: event.target.value });
                        if (index === 0) {
                          const match = sites.find(
                            (site) => site.site_id === event.target.value,
                          );
                          if (match) setSelectedSite(match);
                        }
                      }}
                    >
                      {!sites.length && (
                        <option value={draft.siteId}>
                          Loading landing sites…
                        </option>
                      )}
                      {mode === "live" && (
                        <option value="custom">Custom lunar coordinates</option>
                      )}
                      {sites.map((site) => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {draft.siteId === "custom" ? (
                    <div className="cmp-date-grid">
                      <label>
                        Latitude (°)
                        <input
                          required
                          type="number"
                          step="0.000001"
                          min="-90"
                          max="90"
                          value={draft.latitude ?? ""}
                          onChange={(event) =>
                            update(draft.id, { latitude: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Longitude (° east)
                        <input
                          required
                          type="number"
                          step="0.000001"
                          min="-180"
                          max="180"
                          value={draft.longitude ?? ""}
                          onChange={(event) =>
                            update(draft.id, { longitude: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="cmp-caption cw-coordinate">
                      {
                        sites.find((site) => site.site_id === draft.siteId)
                          ?.latitude_deg
                      }
                      ° latitude ·{" "}
                      {
                        sites.find((site) => site.site_id === draft.siteId)
                          ?.longitude_deg
                      }
                      ° east longitude
                    </p>
                  )}
                  {!linkedDates && (
                    <div className="cmp-date-grid">
                      <label>
                        Start (UTC)
                        <input
                          required
                          type="datetime-local"
                          value={draft.start}
                          onChange={(event) =>
                            update(draft.id, { start: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        End (UTC)
                        <input
                          required
                          type="datetime-local"
                          value={draft.end}
                          onChange={(event) =>
                            update(draft.id, { end: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  )}
                  <details className="cw-scenario-options">
                    <summary>
                      Scenario options
                      <ChevronDown size={12} />
                    </summary>
                    <div className="cw-options-body">
                      <label>
                        Sample every
                        <select
                          value={draft.step}
                          onChange={(event) =>
                            update(draft.id, {
                              step: Number(event.target.value),
                            })
                          }
                        >
                          {[5, 15, 30, 60, 180, 360, 1440].map((step) => (
                            <option key={step} value={step}>
                              {step < 60
                                ? `${step} minutes`
                                : `${step / 60} hour${step === 60 ? "" : "s"}`}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div>
                        {index > 0 && (
                          <button
                            type="button"
                            className="cmp-secondary"
                            onClick={() => promoteBaseline(draft.id)}
                          >
                            Make reference
                          </button>
                        )}
                        <button
                          type="button"
                          className="cmp-secondary"
                          disabled={drafts.length >= 4}
                          onClick={() => duplicateScenario(draft)}
                        >
                          Duplicate
                        </button>
                      </div>
                    </div>
                  </details>
                </article>
              ))}
            </div>
            <div className="cw-setup-footer">
              <button
                type="button"
                className="cmp-link"
                disabled={drafts.length >= 4}
                onClick={addScenario}
              >
                <Plus size={14} />
                Add scenario
              </button>
              <span>
                Keep dates equal to compare sites. Keep a site equal to compare
                dates.
              </span>
            </div>
            <details className="cw-advanced">
              <summary>
                <SlidersHorizontal size={13} />
                Schedule shift & data settings
                <ChevronDown size={12} />
              </summary>
              <div className="cw-advanced-body">
                <label>
                  Data source
                  <select
                    aria-label="Comparison data source"
                    value={mode}
                    onChange={(event) => {
                      clearResults();
                      const next = event.target.value as "live" | "demo";
                      setMode(next);
                      if (next === "demo")
                        setDrafts((current) =>
                          current.map((draft) =>
                            draft.siteId === "custom"
                              ? {
                                  ...draft,
                                  siteId: sites[0]?.site_id ?? "candidate_001",
                                }
                              : draft,
                          ),
                        );
                    }}
                  >
                    <option value="live">Scientific services</option>
                    <option value="demo">Synthetic demo preview</option>
                  </select>
                </label>
                <div className="cmp-delay">
                  <Clock3 size={16} />
                  <label>
                    Shift reference by
                    <input
                      aria-label="Mission delay in hours"
                      type="number"
                      min="0"
                      max="336"
                      step="1"
                      value={Number.isNaN(delay) ? "" : delay}
                      onChange={(event) =>
                        setDelay(
                          event.target.value === ""
                            ? NaN
                            : Number(event.target.value),
                        )
                      }
                    />
                    hours
                  </label>
                  <button
                    type="button"
                    className="cmp-secondary"
                    onClick={applyDelay}
                  >
                    Apply to B
                  </button>
                  <small>
                    Copies the reference site, duration and sampling step.
                  </small>
                </div>
              </div>
            </details>
          </fieldset>
        </form>
      </div>
      {busy && (
        <div className="cmp-empty" role="status">
          Loading conditions and visibility timelines…
          <button
            type="button"
            className="cmp-secondary"
            onClick={() => requestController.current?.abort()}
          >
            Cancel request
          </button>
        </div>
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
            Your scenarios are ready to compare.
            <br />
            <span>
              Choose Compare scenarios, or run the cached NASA example in one
              click.
            </span>
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
            <div className="cmp-export-actions">
              <button
                type="button"
                className="cmp-secondary"
                onClick={exportWindows}
              >
                <Download size={15} /> Windows CSV
              </button>
              <button
                type="button"
                className="cmp-secondary"
                onClick={exportResult}
              >
                <Download size={15} /> Full JSON
              </button>
            </div>
          </div>
          {result.status !== "ok" && (
            <p className="cmp-notice">
              Some scientific outputs are pending or unavailable. Unknown values
              are excluded from differences. You can select the synthetic
              preview to explore the interface.
            </p>
          )}
          <div
            className="cmp-result-tabs"
            role="group"
            aria-label="Comparison result view"
          >
            <button
              type="button"
              aria-pressed={resultView === "overview"}
              onClick={() => setResultView("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              aria-pressed={resultView === "summary"}
              onClick={() => setResultView("summary")}
            >
              Scenario details
            </button>
            <button
              type="button"
              aria-pressed={resultView === "timelines"}
              onClick={() => setResultView("timelines")}
            >
              Timelines & operational windows
            </button>
          </div>
          {resultView === "overview" && <ComparisonOverview result={result} />}
          <div className="cmp-summary-grid" hidden={resultView !== "summary"}>
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
                    Summary method:{" "}
                    {scenario.summary_method.split("_").join(" ")}
                  </p>
                  <p className="cmp-caption">
                    Source: {conditions.source} · Model:{" "}
                    {conditions.horizon_model}
                  </p>
                  <details className="cmp-quality-details">
                    <summary>Data quality & assumptions</summary>
                    {scenario.warnings.map((warning) => (
                      <p className="cmp-warning" key={warning}>
                        {warning}
                      </p>
                    ))}
                  </details>
                </article>
              );
            })}
          </div>
          {resultView === "timelines" && (
            <div>
              <div className="cmp-timeline-header">
                <h3>Visibility over the mission</h3>
                <p>
                  Aligned by elapsed hours so different mission dates can be
                  compared.
                </p>
              </div>
              <div className="cmp-range-controls">
                <label>
                  View from: {view.from.toFixed(2)} h
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
                  View to: {view.to.toFixed(2)} h
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
                      setView({
                        ...view,
                        to,
                        cursor: Math.min(to, view.cursor),
                      });
                    }}
                  />
                </label>
                <label>
                  Inspect: {view.cursor.toFixed(2)} h
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
                      <OperationalDetails
                        scenario={scenario}
                        cursor={view.cursor}
                      />
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
            </div>
          )}
          <details className="cmp-assumptions">
            <summary>Sources, assumptions & integration notes</summary>
            <p>
              <a
                href="https://quickmap.lroc.im-ldi.com/"
                target="_blank"
                rel="noreferrer"
              >
                LROC QuickMap: inspect terrain
              </a>{" "}
              ·{" "}
              <a
                href="https://trek.nasa.gov/moon/"
                target="_blank"
                rel="noreferrer"
              >
                Moon Trek: imagery and elevation
              </a>{" "}
              ·{" "}
              <a
                href="https://ssd.jpl.nasa.gov/horizons/"
                target="_blank"
                rel="noreferrer"
              >
                JPL Horizons: Sun/Earth positions
              </a>{" "}
              ·{" "}
              <a
                href="https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/"
                target="_blank"
                rel="noreferrer"
              >
                CSA: lunar exploration background
              </a>
            </p>
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
