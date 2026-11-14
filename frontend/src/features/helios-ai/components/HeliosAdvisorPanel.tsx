import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Crosshair,
  Globe2,
  Loader2,
  MapPin,
  Orbit,
  Radio,
  Sun,
} from "lucide-react";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";
import type { LandingSite } from "../../../types/helios";
import {
  HeliosServiceError,
  requestRecommendations,
  type HeliosAdvisorResponse,
  type HeliosCandidate,
} from "../services/heliosService";
import type { SiteAssessment } from "./HeliosLunarScene";
import "./heliosMissionControl.css";

const HeliosLunarScene = lazy(() => import("./HeliosLunarScene"));

const EXAMPLE_MISSION =
  "Find a balanced lunar landing site for a 72-hour mission with at least 65% sunlight and 70% Earth visibility.";

function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "N/A"
    : `${(value * 100).toFixed(1)}%`;
}

function formatUtc(value: string | undefined): string {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : `${date.toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

function isDemoResponse(result: HeliosAdvisorResponse): boolean {
  const candidates = [
    ...(result.evaluation?.eligible ?? []),
    ...(result.evaluation?.disqualified ?? []),
    ...(result.evaluation?.insufficient_data ?? []),
  ];
  return candidates.some(
    ({ provenance }) =>
      provenance.is_synthetic ||
      provenance.horizon_model.toLowerCase() === "synthetic" ||
      provenance.source.toLowerCase().includes("synthetic")
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function Provenance({ candidate }: { candidate: HeliosCandidate }) {
  const { provenance } = candidate;
  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
        <span className="font-semibold text-slate-200">Scientific provenance</span>
        <span>{provenance.source}</span>
        <span className="text-slate-500">·</span>
        <span>{provenance.horizon_model} horizon model</span>
        <span className="rounded border border-slate-700 px-1.5 py-0.5 uppercase tracking-wide text-slate-400">
          {provenance.status}
        </span>
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {formatUtc(provenance.start_utc)} — {formatUtc(provenance.end_utc)}
      </div>
      {provenance.warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-400">
          {provenance.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CandidateMetrics({ candidate }: { candidate: HeliosCandidate }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Metric label="Sunlight" value={formatPercent(candidate.metrics.sunlit_fraction)} />
      <Metric label="Geometric Earth visibility" value={formatPercent(candidate.metrics.earth_visible_fraction)} />
      <Metric
        label="Sunlit time"
        value={candidate.metrics.sunlit_hours == null ? "N/A" : `${candidate.metrics.sunlit_hours.toFixed(1)} h`}
      />
      <Metric
        label="Earth line-of-sight time"
        value={candidate.metrics.earth_visible_hours == null ? "N/A" : `${candidate.metrics.earth_visible_hours.toFixed(1)} h`}
      />
    </div>
  );
}

function CandidateLocation({ candidate }: { candidate: HeliosCandidate }) {
  return (
    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
      <span>
        {candidate.latitude_deg.toFixed(3)}°, {candidate.longitude_deg.toFixed(3)}°
      </span>
    </div>
  );
}

function RecommendedCard({ candidate }: { candidate: HeliosCandidate }) {
  return (
    <article className="rounded-xl border border-cyan-900/70 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-300">
              RANK #{candidate.rank}
            </span>
            <h4 className="text-base font-semibold text-slate-100">{candidate.site_name}</h4>
          </div>
          <CandidateLocation candidate={candidate} />
        </div>
        <div className="min-w-24 rounded-lg border border-cyan-900/70 bg-cyan-950/30 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-200/70">
            Heuristic score
          </div>
          <div className="mt-0.5 text-xl font-bold tabular-nums text-cyan-200">
            {candidate.score == null ? "N/A" : `${candidate.score.toFixed(1)}/100`}
          </div>
        </div>
      </div>
      <CandidateMetrics candidate={candidate} />
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{candidate.explanation}</p>
      {candidate.tradeoffs.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-400">
          {candidate.tradeoffs.map((tradeoff) => <li key={tradeoff}>• {tradeoff}</li>)}
        </ul>
      )}
      <Provenance candidate={candidate} />
    </article>
  );
}

function OtherCandidateCard({
  candidate,
  kind,
}: {
  candidate: HeliosCandidate;
  kind: "disqualified" | "insufficient";
}) {
  const isDisqualified = kind === "disqualified";
  const missing: string[] = [];
  if (candidate.metrics.sunlit_fraction == null) missing.push("sunlight");
  if (candidate.metrics.earth_visible_fraction == null) missing.push("geometric Earth visibility");

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/55 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-100">{candidate.site_name}</h4>
          <CandidateLocation candidate={candidate} />
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
            isDisqualified
              ? "border-rose-900/80 bg-rose-950/40 text-rose-300"
              : "border-amber-900/80 bg-amber-950/40 text-amber-300"
          }`}
        >
          {isDisqualified ? "Disqualified" : `Insufficient · ${candidate.provenance.status}`}
        </span>
      </div>
      <CandidateMetrics candidate={candidate} />
      {isDisqualified ? (
        <div className="mt-3 rounded-lg border border-rose-950/80 bg-rose-950/20 p-3">
          <div className="text-xs font-semibold text-rose-200">Failed mandatory constraints</div>
          <ul className="mt-1 space-y-1 text-xs leading-relaxed text-rose-100/80">
            {candidate.constraints.violations.map((violation) => <li key={violation}>• {violation}</li>)}
          </ul>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-amber-950/80 bg-amber-950/20 p-3 text-xs leading-relaxed text-amber-100/80">
          {missing.length > 0
            ? `Unavailable measurements: ${missing.join(", ")}.`
            : `Scientific data status is ${candidate.provenance.status}; measurements are not used for ranking.`}
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{candidate.explanation}</p>
      <Provenance candidate={candidate} />
    </article>
  );
}

export function HeliosAdvisorPanel() {
  const [missionDescription, setMissionDescription] = useState("");
  const [result, setResult] = useState<HeliosAdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [hoveredSite, setHoveredSite] = useState<LandingSite | null>(null);
  const [agentState, setAgentState] = useState<"idle" | "processing" | "analysing" | "ready">("idle");

  useEffect(() => {
    let active = true;
    fetchCandidateSites()
      .then((loadedSites) => {
        if (!active) return;
        setSites(loadedSites);
        setSelectedSiteId((current) => current ?? loadedSites[0]?.site_id ?? null);
        setSitesError(null);
      })
      .catch(() => {
        if (active) setSitesError("Candidate locations could not be loaded. The advisor can still evaluate a mission request.");
      });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError(null);
    setAgentState("idle");
    if (!missionDescription.trim()) {
      setError("Enter a mission description before requesting an evaluation.");
      return;
    }

    setLoading(true);
    setAgentState("processing");
    const phaseTimer = window.setTimeout(() => setAgentState("analysing"), 520);
    try {
      const response = await requestRecommendations({
        mission_description: missionDescription,
      });
      setResult(response);
      setAgentState("ready");
    } catch (caught) {
      setError(
        caught instanceof HeliosServiceError
          ? caught.message
          : "The advisor could not complete this request. Please try again."
      );
      setAgentState("idle");
    } finally {
      window.clearTimeout(phaseTimer);
      setLoading(false);
    }
  }

  const evaluation = result?.evaluation;
  const hasRecommendations = (evaluation?.eligible.length ?? 0) > 0;
  const demoMode = result ? isDemoResponse(result) : false;
  const allEvaluatedCandidates = [
    ...(evaluation?.eligible ?? []),
    ...(evaluation?.disqualified ?? []),
    ...(evaluation?.insufficient_data ?? []),
  ];
  const candidateById = new Map(allEvaluatedCandidates.map((candidate) => [candidate.site_id, candidate]));
  const selectedSite = sites.find((site) => site.site_id === selectedSiteId) ?? null;
  const selectedCandidate = candidateById.get(selectedSiteId ?? "") ?? null;
  const assessments = useMemo(() => {
    const map = new Map<string, SiteAssessment>();
    evaluation?.eligible.forEach((candidate) => map.set(candidate.site_id, {
      category: "eligible", rank: candidate.rank, score: candidate.score,
    }));
    evaluation?.disqualified.forEach((candidate) => map.set(candidate.site_id, {
      category: "disqualified", rank: null, score: candidate.score,
    }));
    evaluation?.insufficient_data.forEach((candidate) => map.set(candidate.site_id, {
      category: "insufficient_data", rank: null, score: null,
    }));
    return map;
  }, [evaluation]);

  const agentStateLabel = error
    ? "ACTION REQUIRED"
    : agentState === "processing" ? "PROCESSING DIRECTIVE"
    : agentState === "analysing" ? "ANALYSING CONDITIONS"
    : agentState === "ready" ? "RESPONSE READY"
    : "STANDBY · AWAITING DIRECTIVE";

  const selectedCategory = selectedCandidate
    ? selectedCandidate.rank != null ? `Eligible · Rank ${selectedCandidate.rank}`
      : evaluation?.disqualified.some((candidate) => candidate.site_id === selectedCandidate.site_id) ? "Disqualified"
      : "Insufficient scientific data"
    : "Awaiting HELIOS assessment";

  return (
    <ModuleCard
      title="HELIOS AI Lunar Landing Advisor"
      eyebrow="Lunar mission operations · decision support"
      icon={<Orbit size={17} />}
    >
      <div className="helios-control-room">
        <div className="helios-room-statusbar">
          <div><span className="helios-room-statusbar__mark"><Orbit size={15} /></span><span>HELIOS <b>MISSION SYSTEM</b></span></div>
          <span className={`helios-agent-state helios-agent-state--${loading ? "active" : error ? "attention" : agentState}`}>
            <i />{agentStateLabel}
          </span>
          <span className="helios-room-statusbar__mode">GEOMETRIC DATA · DECISION SUPPORT</span>
        </div>

        <div className="helios-operations-grid">
          <section className="helios-lunar-column" aria-label="Lunar landing-site reconnaissance">
            <div className="helios-scene-heading">
              <div><span className="helios-eyebrow">01 / SURFACE RECONNAISSANCE</span><h3>South polar operations</h3></div>
              <span className="helios-scene-heading__coordinates"><Crosshair size={14} /> {sites.length} catalog sites</span>
            </div>
            <Suspense fallback={<div className="helios-scene-loading" role="status"><Loader2 size={18} /> Preparing lunar surface renderer…</div>}>
              <HeliosLunarScene
                sites={sites}
                selectedSiteId={selectedSiteId}
                assessments={assessments}
                onSelectSite={setSelectedSiteId}
                onHoverSite={setHoveredSite}
              />
            </Suspense>
            <div className="helios-site-ribbon" aria-label="Select landing site">
              {sitesError ? (
                <p className="helios-inline-note" role="status">{sitesError}</p>
              ) : sites.length === 0 ? (
                <p className="helios-inline-note">{loading ? "Loading candidate catalog…" : "No candidate locations are available."}</p>
              ) : sites.map((site) => {
                const assessment = assessments.get(site.site_id);
                return (
                  <button
                    type="button"
                    key={site.site_id}
                    className={`helios-site-chip${selectedSiteId === site.site_id ? " is-selected" : ""}${assessment ? ` is-${assessment.category.replace("_", "-")}` : ""}`}
                    aria-pressed={selectedSiteId === site.site_id}
                    onMouseEnter={() => setHoveredSite(site)}
                    onMouseLeave={() => setHoveredSite(null)}
                    onFocus={() => setHoveredSite(site)}
                    onBlur={() => setHoveredSite(null)}
                    onClick={() => setSelectedSiteId(site.site_id)}
                  >
                    <span>{site.name}</span><small>{site.latitude_deg.toFixed(2)}° / {site.longitude_deg.toFixed(2)}°</small>
                  </button>
                );
              })}
            </div>
            {hoveredSite && <p className="helios-hover-readout" aria-live="polite"><MapPin size={13} /> Preview · {hoveredSite.name} · {hoveredSite.latitude_deg.toFixed(3)}°, {hoveredSite.longitude_deg.toFixed(3)}°</p>}
          </section>

          <aside className="helios-command-column" aria-label="HELIOS agent and selected site">
            <div className="helios-agent-panel">
              <div className="helios-agent-panel__identity">
                <div className={`helios-radar helios-radar--${loading ? "working" : agentState}`} aria-hidden="true">
                  <span className="helios-radar__sweep" /><span className="helios-radar__core"><Orbit size={19} /></span><i /><b />
                </div>
                <div><span className="helios-eyebrow">AUTONOMOUS ADVISOR</span><h3>HELIOS</h3><p>Landing-site decision support</p></div>
              </div>
              <div className="helios-agent-panel__telemetry" role="status" aria-live="polite">
                {loading ? <Loader2 size={14} className="animate-spin" /> : agentState === "ready" ? <CheckCircle2 size={14} /> : error ? <AlertCircle size={14} /> : <Activity size={14} />}
                <span>{loading ? agentState === "processing" ? "Interpreting mission directive" : "Retrieving conditions · evaluating candidates" : error ? "Request needs attention" : agentState === "ready" ? "Assessment response available" : "Ready for mission criteria"}</span>
              </div>
            </div>

            <div className="helios-selected-panel">
              <div className="helios-panel-kicker"><span>SELECTED SITE</span><span className="helios-panel-kicker__line" /></div>
              <div className="helios-selected-panel__title">
                <div><h3>{selectedCandidate?.site_name ?? selectedSite?.name ?? "Select a catalog site"}</h3><p>{selectedCategory}</p></div>
                <MapPin size={17} />
              </div>
              {(selectedCandidate || selectedSite) && (
                <p className="helios-selected-panel__coords">{(selectedCandidate?.latitude_deg ?? selectedSite?.latitude_deg)?.toFixed(3)}° LAT <span>/</span> {(selectedCandidate?.longitude_deg ?? selectedSite?.longitude_deg)?.toFixed(3)}° LON</p>
              )}
              <div className="helios-selected-metrics">
                <div><span><Sun size={12} /> SUNLIGHT</span><strong>{formatPercent(selectedCandidate?.metrics.sunlit_fraction)}</strong></div>
                <div><span><Globe2 size={12} /> EARTH LINE OF SIGHT</span><strong>{formatPercent(selectedCandidate?.metrics.earth_visible_fraction)}</strong></div>
                <div><span><Clock3 size={12} /> MISSION WINDOW</span><strong>{result?.mission_window ? `${result.requirements?.mission_duration_hours ?? "—"} h` : "—"}</strong></div>
                <div><span><Activity size={12} /> HEURISTIC SCORE</span><strong>{selectedCandidate?.score == null ? "—" : `${selectedCandidate.score.toFixed(1)} / 100`}</strong></div>
              </div>
              <p className="helios-selected-panel__caveat">Earth visibility is geometric line of sight; it does not indicate RF link reliability. Suitability is a ranking, not a mission-success probability.</p>
              {selectedCandidate && <p className="helios-selected-panel__explanation">{selectedCandidate.explanation}</p>}
              {selectedCandidate && <Provenance candidate={selectedCandidate} />}
              {result?.mission_window && (
                <div className="helios-window-readout"><Clock3 size={13} /><span>{formatUtc(result.mission_window.start_utc)} — {formatUtc(result.mission_window.end_utc)}</span></div>
              )}
            </div>
          </aside>
        </div>

        <form onSubmit={handleSubmit} className="helios-directive-console">
          <div className="helios-directive-console__head">
            <div><span className="helios-eyebrow">02 / MISSION DIRECTIVE</span><label htmlFor="helios-mission">Describe the landing objective</label></div>
            <span className="helios-directive-console__hint"><Radio size={13} /> Plain-language mission input</span>
          </div>
          <textarea
            id="helios-mission"
            value={missionDescription}
            onChange={(event) => setMissionDescription(event.target.value)}
            placeholder={EXAMPLE_MISSION}
            rows={3}
            maxLength={4000}
            disabled={loading}
            aria-describedby="helios-input-help"
          />
          <div className="helios-directive-console__footer">
            <p id="helios-input-help">Your wording is sent unchanged for interpretation. Unsupported requirements trigger clarification before evaluation.</p>
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpRight size={15} />}
              {loading ? "Analysing mission" : "Run site assessment"}
            </button>
          </div>
        </form>

        {loading && <div role="status" className="helios-request-state"><Loader2 size={16} className="animate-spin" /><span>{agentState === "processing" ? "Parsing mission requirements…" : "Retrieving scientific measurements and evaluating candidate sites…"}</span></div>}
        {error && <div role="alert" className="helios-request-error"><AlertCircle size={16} /><div><strong>Advisor request needs attention</strong><p>{error}</p></div></div>}
        {!result && !loading && !error && <div className="helios-ready-note"><Activity size={15} /><span>HELIOS is standing by. Enter a mission directive to begin the assessment.</span></div>}

        {result && (
          <div className="helios-results" aria-live="polite">
            {demoMode && <div role="alert" className="helios-demo-alert"><strong>DEMO MODE — SYNTHETIC DATA</strong><p>These candidate measurements are synthetic fixtures, not live NASA results. Do not use them for mission planning.</p></div>}
            <div className="helios-result-summary">
              <div><span className="helios-eyebrow">03 / ADVISOR RESPONSE</span><h3>{result.status === "ok" ? <CheckCircle2 size={16} /> : <CircleHelp size={16} />}{result.summary}</h3><p>{result.interpretation.summary}</p></div>
              {result.mission_window && <div className="helios-window-badge"><Clock3 size={14} /><span>{formatUtc(result.mission_window.start_utc)} — {formatUtc(result.mission_window.end_utc)}</span></div>}
            </div>

            {(result.status === "needs_clarification" || result.status === "ambiguous" || result.status === "invalid") && (
              <div className="helios-clarification" role="status">
                <h3>Clarification required before site evaluation</h3>
                {result.clarification_questions.length > 0 && <ul>{result.clarification_questions.map((question) => <li key={question}>{question}</li>)}</ul>}
                {result.unsupported_requirements.length > 0 && <div><strong>Unsupported requirements</strong>{result.unsupported_requirements.map((item) => <p key={item}>{item}</p>)}</div>}
                {result.interpretation.errors.length > 0 && <ul>{result.interpretation.errors.map((item) => <li key={item}>{item}</li>)}</ul>}
                <p>Revise the mission directive and submit again. No site evaluation was run.</p>
              </div>
            )}

            {evaluation && (
              <>
                {!hasRecommendations && <div className="helios-no-recommendations"><h3>{evaluation.status === "no_match" ? "No eligible candidates" : "Candidate evaluation is incomplete"}</h3><p>{result.summary} Candidates remain in their actual disqualified or insufficient-data categories.</p></div>}
                {hasRecommendations && <section className="helios-result-group" aria-labelledby="helios-recommended-heading"><div className="helios-result-group__heading"><span className="helios-result-group__index">01</span><h3 id="helios-recommended-heading">Eligible landing sites</h3><small>{evaluation.eligible.length} candidates</small></div>{evaluation.eligible.map((candidate) => <RecommendedCard key={candidate.site_id} candidate={candidate} />)}</section>}
                {evaluation.disqualified.length > 0 && <section className="helios-result-group" aria-labelledby="helios-disqualified-heading"><div className="helios-result-group__heading"><span className="helios-result-group__index is-danger">02</span><h3 id="helios-disqualified-heading">Disqualified</h3><small>{evaluation.disqualified.length} candidates</small></div>{evaluation.disqualified.map((candidate) => <OtherCandidateCard key={candidate.site_id} candidate={candidate} kind="disqualified" />)}</section>}
                {evaluation.insufficient_data.length > 0 && <section className="helios-result-group" aria-labelledby="helios-insufficient-heading"><div className="helios-result-group__heading"><span className="helios-result-group__index is-caution">03</span><h3 id="helios-insufficient-heading">Insufficient scientific data</h3><small>{evaluation.insufficient_data.length} candidates</small></div>{evaluation.insufficient_data.map((candidate) => <OtherCandidateCard key={candidate.site_id} candidate={candidate} kind="insufficient" />)}</section>}
                <section className="helios-limitations"><h3>Scientific interpretation limits</h3><ul>{result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}<li>Sunlight is geometric illumination availability, not generated electrical power.</li><li>Earth visibility is geometric line of sight, not communication reliability.</li><li>Suitability scores are heuristic rankings, not mission-success probabilities.</li></ul></section>
              </>
            )}
          </div>
        )}
      </div>
    </ModuleCard>
  );
}
