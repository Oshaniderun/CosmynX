import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import {
  HeliosServiceError,
  requestRecommendations,
  type HeliosAdvisorResponse,
  type HeliosCandidate,
  type HeliosChatMessage,
} from "../services/heliosService";
import "./heliosMissionControl.css";

const STARTER_PROMPTS = [
  "5-day rover mission needing continuous sunlight for power",
  "Compare Haworth, Malapert Massif, and Mons Mouton in detail",
  "Which landing site has the flattest terrain and best Earth comms?",
  "Why is Peak near Cabeus B disqualified for a 100% solar mission?",
];

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: HeliosAdvisorResponse;
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-amber-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`${keyPrefix}-list`}
          className="my-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-200"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineBold(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`empty-${idx}`);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
      listItems.push(line.slice(2).trim());
    } else {
      flushList(`line-${idx}`);
      elements.push(
        <p key={`p-${idx}`} className="text-base leading-relaxed text-slate-100">
          {renderInlineBold(line)}
        </p>,
      );
    }
  });

  flushList("final");
  return <div className="space-y-2.5">{elements}</div>;
}

function formatFraction(fraction: number | null): string {
  if (fraction === null) return "N/A";
  return `${(fraction * 100).toFixed(1)}%`;
}

function formatHours(hours: number | null): string {
  if (hours === null) return "";
  return `${hours.toFixed(1)} h`;
}

function formatObjective(objective?: string | null): string {
  if (objective === "maximize_sunlight") return "Maximize Sunlight";
  if (objective === "maximize_earth_visibility") return "Maximize Earth Comms";
  return "Balanced";
}

function getRunnerUpSummary(
  site: HeliosCandidate,
  topPick: HeliosCandidate | null,
): string {
  if (site.constraints.violations.length > 0) {
    return site.constraints.violations[0];
  }
  if (
    topPick &&
    site.metrics.sunlit_fraction !== null &&
    topPick.metrics.sunlit_fraction !== null &&
    site.metrics.sunlit_fraction < topPick.metrics.sunlit_fraction
  ) {
    return `${formatFraction(site.metrics.sunlit_fraction)} sun vs ${formatFraction(topPick.metrics.sunlit_fraction)}`;
  }
  if (
    topPick &&
    site.metrics.earth_visible_fraction !== null &&
    topPick.metrics.earth_visible_fraction !== null &&
    site.metrics.earth_visible_fraction < topPick.metrics.earth_visible_fraction
  ) {
    return `${formatFraction(site.metrics.earth_visible_fraction)} Earth LOS`;
  }
  if (site.tradeoffs.length > 0) {
    return site.tradeoffs[0];
  }
  return "Eligible · steeper LOLA terrain slope than #1";
}

function EvaluationDetailsCard({
  response,
}: {
  response: HeliosAdvisorResponse;
}) {
  const [showAllTable, setShowAllTable] = useState(false);

  const eligible = response.evaluation?.eligible ?? [];
  const disqualified = response.evaluation?.disqualified ?? [];
  const topPick = eligible[0] ?? null;
  const allSites = [...eligible, ...disqualified];

  if (allSites.length === 0) return null;

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-slate-950/75 p-4">
      {/* #1 Recommended Site Detail Header */}
      {topPick && (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-amber-300/20 px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider text-amber-300">
                #1 Top Pick
              </span>
              <span className="font-mono text-sm text-slate-400">
                {topPick.latitude_deg.toFixed(2)}°, {topPick.longitude_deg.toFixed(2)}°
              </span>
              {topPick.score !== null && (
                <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-sm font-semibold text-emerald-200">
                  Score {topPick.score.toFixed(1)}/100
                </span>
              )}
            </div>
            <h4 className="mt-1.5 text-lg font-semibold text-white">
              {topPick.site_name}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              {topPick.explanation}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 text-sm">
            <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3.5 py-2 text-amber-100">
              <span className="block text-sm font-medium uppercase tracking-wider text-amber-300/90">
                Sunlight
              </span>
              <span className="text-base font-semibold">
                {formatFraction(topPick.metrics.sunlit_fraction)}
              </span>{" "}
              <span className="text-sm text-amber-200/80">
                ({formatHours(topPick.metrics.sunlit_hours)})
              </span>
            </div>
            <div className="rounded-lg border border-sky-300/30 bg-sky-300/10 px-3.5 py-2 text-sky-100">
              <span className="block text-sm font-medium uppercase tracking-wider text-sky-300/90">
                Earth Comms
              </span>
              <span className="text-base font-semibold">
                {formatFraction(topPick.metrics.earth_visible_fraction)}
              </span>{" "}
              <span className="text-sm text-sky-200/80">
                ({formatHours(topPick.metrics.earth_visible_hours)})
              </span>
            </div>
            {response.requirements && (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-slate-200">
                <span className="block text-sm font-medium uppercase tracking-wider text-slate-400">
                  Mission Profile
                </span>
                <span className="text-base font-semibold">
                  {response.requirements.mission_duration_hours}h
                </span>{" "}
                <span className="text-sm text-slate-400">
                  · {formatObjective(response.requirements.objective)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact Runner-Ups & Disqualified Breakdown */}
      {(eligible.length > 1 || disqualified.length > 0) && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              How other candidate sites compare ({eligible.length} eligible ·{" "}
              {disqualified.length} disqualified)
            </span>
            <button
              type="button"
              onClick={() => setShowAllTable((prev) => !prev)}
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200"
            >
              {showAllTable ? (
                <>
                  Hide full table <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  View all 9 site metrics <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {!showAllTable ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {disqualified.map((site) => (
                <div
                  key={site.site_id}
                  className="flex flex-col justify-between rounded-lg border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-rose-200">
                      Disqualified: {site.site_name}
                    </span>
                    <span className="font-mono text-sm text-rose-300">
                      Sun {formatFraction(site.metrics.sunlit_fraction)} · Earth{" "}
                      {formatFraction(site.metrics.earth_visible_fraction)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-rose-200/80">
                    {site.constraints.violations.join("; ") || "Disqualified"}
                  </p>
                </div>
              ))}
              {eligible.slice(1, 5).map((site) => (
                <div
                  key={site.site_id}
                  className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100">
                      #{site.rank} {site.site_name}
                    </span>
                    <span className="font-mono text-sm text-slate-300">
                      Sun {formatFraction(site.metrics.sunlit_fraction)} · Earth{" "}
                      {formatFraction(site.metrics.earth_visible_fraction)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {getRunnerUpSummary(site, topPick)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-white/[0.05] text-sm uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5">Rank / Site</th>
                    <th className="px-3.5 py-2.5">Coordinates</th>
                    <th className="px-3.5 py-2.5">Score</th>
                    <th className="px-3.5 py-2.5">Sunlight</th>
                    <th className="px-3.5 py-2.5">Earth Comms</th>
                    <th className="px-3.5 py-2.5">Status / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {allSites.map((site) => {
                    const isDisq = !site.constraints.passed_all;
                    return (
                      <tr
                        key={site.site_id}
                        className={
                          isDisq ? "bg-rose-500/[0.06]" : "hover:bg-white/[0.02]"
                        }
                      >
                        <td className="px-3.5 py-2.5 font-medium text-white">
                          {isDisq ? "Disqualified —" : `#${site.rank}`}{" "}
                          {site.site_name}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-sm text-slate-400">
                          {site.latitude_deg.toFixed(2)}°,{" "}
                          {site.longitude_deg.toFixed(2)}°
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-sm">
                          {site.score !== null ? `${site.score.toFixed(1)}` : "—"}
                        </td>
                        <td className="px-3.5 py-2.5 text-amber-200">
                          {formatFraction(site.metrics.sunlit_fraction)}{" "}
                          <span className="text-slate-400">
                            ({formatHours(site.metrics.sunlit_hours)})
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-sky-200">
                          {formatFraction(site.metrics.earth_visible_fraction)}{" "}
                          <span className="text-slate-400">
                            ({formatHours(site.metrics.earth_visible_hours)})
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-sm text-slate-300">
                          {isDisq
                            ? site.constraints.violations.join("; ")
                            : site.rank === 1
                              ? "Top recommendation (flattest LOLA slope)"
                              : getRunnerUpSummary(site, topPick)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HeliosAdvisorPanel() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geminiApiKey] = useState<string>(
    () => window.localStorage.getItem("helios_gemini_api_key") ?? "",
  );
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const historyForApi: HeliosChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userTurn]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await requestRecommendations({
        mission_description: trimmed,
        api_key: geminiApiKey.trim() || undefined,
        chat_history: historyForApi,
      });

      const assistantText = response.ai_briefing || response.summary;
      const assistantTurn: ChatTurn = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantText,
        response,
      };
      setMessages((prev) => [...prev, assistantTurn]);
    } catch (err) {
      if (err instanceof HeliosServiceError) {
        setError(err.message);
      } else {
        setError("Unable to reach HELIOS advisor backend.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(input);
  }

  const lastAssistantTurn = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const activeFollowUps =
    lastAssistantTurn?.response?.ai_followups &&
    lastAssistantTurn.response.ai_followups.length > 0
      ? lastAssistantTurn.response.ai_followups
      : lastAssistantTurn?.response?.clarification_questions ?? [];

  return (
    <div className="helios-room flex flex-col rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5">
      {/* Top Chat Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/40 bg-amber-300/15 text-amber-300">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              HELIOS Mission AI Chat
            </h3>
            <p className="text-sm text-slate-400">
              Ask about any of the 9 Artemis III South Pole sites or continue with follow-up questions
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </button>
        )}
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="max-h-[58vh] min-h-[300px] flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/40 bg-amber-300/15 text-amber-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-medium text-white">
                  Hello! I'm HELIOS, your Artemis III Lunar South Pole AI Advisor.
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  I evaluate all 9 candidate landing sites using JPL Horizons solar/Earth geometry and LRO LOLA terrain data (slope, roughness, and PSR distance). Pick a starter question below or type anything to start chatting:
                </p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-amber-300/50 hover:bg-amber-300/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((turn) =>
            turn.role === "user" ? (
              <div key={turn.id} className="flex justify-end">
                <div className="flex max-w-[85%] items-start gap-2.5 rounded-2xl rounded-tr-sm border border-amber-300/35 bg-amber-300/15 px-4 py-3 text-base text-amber-50">
                  <p className="leading-relaxed">{turn.content}</p>
                  <User className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
                </div>
              </div>
            ) : (
              <div key={turn.id} className="flex justify-start">
                <div className="w-full rounded-2xl rounded-tl-sm border border-white/10 bg-slate-900/90 p-5 shadow-md">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-amber-300">
                      <Bot className="h-4 w-4" />
                      HELIOS Advisor
                    </span>
                    {turn.response?.ai_model && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-sm text-slate-400">
                        {turn.response.ai_model}
                      </span>
                    )}
                  </div>

                  {/* Detailed Conversational Answer */}
                  {renderFormattedMarkdown(turn.content)}

                  {/* Structured Site Evaluation Details */}
                  {turn.response && (
                    <EvaluationDetailsCard response={turn.response} />
                  )}
                </div>
              </div>
            ),
          )
        )}

        {/* Loading Indicator inside Thread */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
              HELIOS is analyzing lunar ephemeris & terrain data...
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-400/35 bg-rose-500/10 p-4 text-sm text-rose-100"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <p>{error}</p>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Contextual Follow-Up Chips */}
      {!isLoading && activeFollowUps.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
            Continue chat:
          </span>
          {activeFollowUps.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-1.5 text-sm text-amber-100 transition hover:border-amber-300/60 hover:bg-amber-300/20"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Continuous Chat Input Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-end gap-2.5 border-t border-white/10 pt-3"
        aria-label="HELIOS mission advisor chat form"
      >
        <textarea
          id="helios-mission"
          rows={2}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage(input);
            }
          }}
          placeholder={
            messages.length > 0
              ? "Ask a follow-up question (e.g., 'Tell me more about Malapert Massif' or 'What if we stay 10 days?')..."
              : "Ask anything about the lunar landing sites or describe your mission..."
          }
          className="helios-directive-input flex-1 resize-none rounded-xl p-3.5 text-base leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="helios-cta inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold uppercase tracking-wider text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
