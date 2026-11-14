import { useState, type FormEvent } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Globe2,
  Loader2,
  MapPin,
  Sun,
} from "lucide-react";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import {
  HeliosServiceError,
  requestRecommendations,
  type HeliosAdvisorResponse,
  type HeliosCandidate,
} from "../services/heliosService";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError(null);
    if (!missionDescription.trim()) {
      setError("Enter a mission description before requesting an evaluation.");
      return;
    }

    setLoading(true);
    try {
      const response = await requestRecommendations({
        mission_description: missionDescription,
      });
      setResult(response);
    } catch (caught) {
      setError(
        caught instanceof HeliosServiceError
          ? caught.message
          : "The advisor could not complete this request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const evaluation = result?.evaluation;
  const hasRecommendations = (evaluation?.eligible.length ?? 0) > 0;
  const demoMode = result ? isDemoResponse(result) : false;

  return (
    <ModuleCard
      title="HELIOS AI Lunar Landing Advisor"
      eyebrow="Evidence-based mission planning"
      icon={<Activity size={17} />}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-slate-700/70 bg-slate-900/65 p-3">
          <Activity className="mt-0.5 h-4 w-4 shrink-0 text-sky-200" />
          <p className="text-xs leading-relaxed text-slate-300">
            Describe your mission constraints in plain language. HELIOS compares candidate sites using geometric sunlight and Earth line-of-sight measurements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="helios-mission" className="block text-sm font-semibold text-slate-200">
            Mission requirements
          </label>
          <textarea
            id="helios-mission"
            value={missionDescription}
            onChange={(event) => setMissionDescription(event.target.value)}
            placeholder={EXAMPLE_MISSION}
            rows={4}
            maxLength={4000}
            disabled={loading}
            aria-describedby="helios-input-help"
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-60"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id="helios-input-help" className="max-w-xl text-xs leading-relaxed text-slate-500">
              Example: “{EXAMPLE_MISSION}” Your wording is sent unchanged for interpretation.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a9cede] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#c2dfeb] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              {loading ? "Evaluating sites…" : "Evaluate mission"}
            </button>
          </div>
        </form>

        {loading && (
          <div role="status" className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            Retrieving scientific measurements and evaluating candidate sites…
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-900/80 bg-rose-950/30 p-4 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Advisor request failed</div>
              <p className="mt-1 leading-relaxed text-rose-100/80">{error}</p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 px-5 py-8 text-center">
            <CircleHelp className="mx-auto h-6 w-6 text-slate-500" />
            <h3 className="mt-3 text-sm font-semibold text-slate-300">Ready for mission criteria</h3>
            <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-slate-500">
              Enter requirements above to receive a ranked assessment with measurements, constraints, and source information.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-4" aria-live="polite">
            {demoMode && (
              <div role="alert" className="rounded-lg border-2 border-amber-500 bg-amber-950/60 p-4 text-amber-100">
                <div className="text-sm font-extrabold tracking-wide">DEMO MODE — SYNTHETIC DATA</div>
                <p className="mt-1 text-xs leading-relaxed">
                  These candidate measurements are synthetic test fixtures, not live NASA results. Do not use them for mission planning.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  {result.status === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <CircleHelp className="h-4 w-4 text-amber-300" />}
                  {result.summary}
                </div>
                <p className="mt-1 text-xs text-slate-500">{result.interpretation.summary}</p>
              </div>
              {result.mission_window && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-300">
                  <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{formatUtc(result.mission_window.start_utc)} — {formatUtc(result.mission_window.end_utc)}</span>
                </div>
              )}
            </div>

            {(result.status === "needs_clarification" || result.status === "ambiguous" || result.status === "invalid") && (
              <div className="rounded-xl border border-amber-800/80 bg-amber-950/25 p-4">
                <h3 className="text-sm font-semibold text-amber-200">Clarification required</h3>
                {result.clarification_questions.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-amber-100/90">
                    {result.clarification_questions.map((question) => <li key={question}>• {question}</li>)}
                  </ul>
                )}
                {result.unsupported_requirements.length > 0 && (
                  <div className="mt-3 space-y-1 text-xs leading-relaxed text-amber-100/75">
                    <div className="font-semibold">Unsupported requirements</div>
                    {result.unsupported_requirements.map((item) => <p key={item}>• {item}</p>)}
                  </div>
                )}
                {result.interpretation.errors.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-rose-200">
                    {result.interpretation.errors.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                )}
                <p className="mt-3 text-xs text-slate-400">Revise the mission description above and submit it again. No site evaluation was run.</p>
              </div>
            )}

            {evaluation && (
              <>
                {!hasRecommendations && (
                  <div className="rounded-xl border border-amber-900/70 bg-amber-950/20 p-4">
                    <h3 className="text-sm font-semibold text-amber-100">
                      {evaluation.status === "no_match" ? "No eligible candidates" : "Candidate evaluation is incomplete"}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                      {result.summary} Candidates below are shown in their actual disqualified or insufficient-data categories.
                    </p>
                  </div>
                )}

                {hasRecommendations && (
                  <section aria-labelledby="helios-recommended-heading" className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <h3 id="helios-recommended-heading" className="text-sm font-bold uppercase tracking-wide text-emerald-200">
                        Recommended landing sites ({evaluation.eligible.length})
                      </h3>
                    </div>
                    {evaluation.eligible.map((candidate) => <RecommendedCard key={candidate.site_id} candidate={candidate} />)}
                  </section>
                )}

                {evaluation.disqualified.length > 0 && (
                  <section aria-labelledby="helios-disqualified-heading" className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-300" />
                      <h3 id="helios-disqualified-heading" className="text-sm font-bold uppercase tracking-wide text-rose-200">
                        Disqualified candidates ({evaluation.disqualified.length})
                      </h3>
                    </div>
                    {evaluation.disqualified.map((candidate) => <OtherCandidateCard key={candidate.site_id} candidate={candidate} kind="disqualified" />)}
                  </section>
                )}

                {evaluation.insufficient_data.length > 0 && (
                  <section aria-labelledby="helios-insufficient-heading" className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CircleHelp className="h-4 w-4 text-amber-300" />
                      <h3 id="helios-insufficient-heading" className="text-sm font-bold uppercase tracking-wide text-amber-200">
                        Insufficient scientific data ({evaluation.insufficient_data.length})
                      </h3>
                    </div>
                    {evaluation.insufficient_data.map((candidate) => <OtherCandidateCard key={candidate.site_id} candidate={candidate} kind="insufficient" />)}
                  </section>
                )}

                <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Scientific interpretation limits</h3>
                  <ul className="mt-2 grid gap-2 text-xs leading-relaxed text-slate-400 sm:grid-cols-2">
                    {result.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}
                    <li><Sun className="mr-1 inline h-3.5 w-3.5 text-amber-300" />Sunlight is illumination availability, not generated electrical power.</li>
                    <li><Globe2 className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />Earth visibility is geometric line of sight, not communication reliability.</li>
                    <li>Suitability scores are heuristic rankings, not mission-success probabilities.</li>
                  </ul>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </ModuleCard>
  );
}
