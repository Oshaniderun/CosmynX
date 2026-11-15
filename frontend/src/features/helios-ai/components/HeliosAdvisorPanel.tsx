import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Loader2, RotateCcw, Send } from "lucide-react";

import {
  HeliosServiceError,
  requestRecommendations,
  type HeliosAdvisorResponse,
  type HeliosChatMessage,
} from "../services/heliosService";

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
        <strong key={i} className="font-semibold text-white">
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
          className="my-2 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-100"
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
    <div className="helios-light-chat flex flex-col rounded-2xl border border-sky-200/15 bg-[#081224]/50 p-5 text-slate-100 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-sky-200/12 pb-3.5">
        <div>
          <h3 className="text-lg font-semibold text-white">
            HELIOS Mission Advisor
          </h3>
          <p className="text-sm text-slate-300">
            Ask about any of the 9 Artemis III South Pole landing sites or continue with follow-up questions
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200/20 bg-[#0c1b34]/60 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-[#13284c] hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </button>
        )}
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="max-h-[58vh] min-h-[300px] flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-sky-200/12 bg-[#050c1a]/45 p-5 space-y-4">
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-white">
                How can I help plan your lunar landing mission?
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Select a question below or type your own question to compare sunlight, Earth visibility, and terrain slope across the 9 Artemis III candidate sites:
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-xl border border-sky-200/15 bg-[#0c1b34]/55 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-sky-300/40 hover:bg-[#13284c]/75 hover:text-white"
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
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-sky-300/30 bg-[#12284c]/80 px-4 py-3 text-base text-white">
                  <p className="leading-relaxed">{turn.content}</p>
                </div>
              </div>
            ) : (
              <div key={turn.id} className="flex justify-start">
                <div className="w-full rounded-2xl rounded-tl-sm border border-sky-200/15 bg-[#050c1a]/55 p-5">
                  {renderFormattedMarkdown(turn.content)}
                </div>
              </div>
            ),
          )
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-sky-200/15 bg-[#050c1a]/55 px-4 py-3 text-sm font-medium text-slate-200">
              <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              Analyzing lunar landing sites...
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-400/35 bg-rose-950/50 p-4 text-sm text-rose-100"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <p>{error}</p>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Follow-Up Suggestions */}
      {!isLoading && activeFollowUps.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-sky-200/12 pt-3">
          <span className="text-sm font-medium text-slate-300">
            Suggested follow-ups:
          </span>
          {activeFollowUps.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              className="rounded-full border border-sky-200/20 bg-[#0c1b34]/60 px-3.5 py-1.5 text-sm font-medium text-slate-100 transition hover:border-sky-300/45 hover:bg-[#13284c]/80 hover:text-white"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-end gap-2.5 border-t border-sky-200/12 pt-3"
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
              ? "Ask a follow-up question..."
              : "Ask a question about the lunar landing sites..."
          }
          className="flex-1 resize-none rounded-xl border border-sky-200/20 bg-[#050c1a]/65 p-3.5 text-base leading-relaxed text-white placeholder:text-slate-400 focus:border-sky-300/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-300/35 bg-[#12284c] px-5 text-sm font-semibold text-white transition hover:bg-[#183462] disabled:cursor-not-allowed disabled:opacity-40"
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
