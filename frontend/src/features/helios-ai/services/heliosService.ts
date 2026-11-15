import { apiPost } from "../../../services/api";

export type HeliosObjective =
  | "maximize_sunlight"
  | "maximize_earth_visibility"
  | "balanced";

export interface HeliosChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HeliosAdvisorRequest {
  mission_description: string;
  api_key?: string;
  chat_history?: HeliosChatMessage[];
}

export interface VisibilityMetrics {
  sunlit_fraction: number | null;
  earth_visible_fraction: number | null;
  sunlit_hours: number | null;
  earth_visible_hours: number | null;
}

export interface ScientificProvenance {
  site_id: string;
  source: string;
  horizon_model: string;
  status: "ok" | "pending" | "unavailable" | "insufficient_data";
  start_utc: string;
  end_utc: string;
  duration_hours: number;
  is_synthetic: boolean;
  warnings: string[];
}

export interface ConstraintEvaluation {
  passed_earth_visibility: boolean;
  passed_sunlight: boolean;
  has_complete_data: boolean;
  passed_all: boolean;
  violations: string[];
}

export interface HeliosCandidate {
  rank: number | null;
  site_id: string;
  site_name: string;
  latitude_deg: number;
  longitude_deg: number;
  score: number | null;
  metrics: VisibilityMetrics;
  provenance: ScientificProvenance;
  constraints: ConstraintEvaluation;
  score_breakdown: {
    sunlight_weight: number;
    earth_visibility_weight: number;
    weighted_sunlight_score: number | null;
    weighted_earth_score: number | null;
    composite_score: number | null;
    formula_description: string;
  } | null;
  explanation: string;
  tradeoffs: string[];
}

export interface HeliosInterpretation {
  query: string;
  status: "success" | "partial" | "ambiguous" | "invalid" | "no_requirements";
  extracted_objective: HeliosObjective | null;
  extracted_min_sunlight_pct: number | null;
  extracted_min_earth_visibility_pct: number | null;
  extracted_duration_hours: number | null;
  extracted_start_utc: string | null;
  summary: string;
  clarification_questions: string[];
  unsupported_requirements: string[];
  interpretation_notes: string[];
  errors: string[];
}

export interface HeliosMissionRequirements {
  objective: HeliosObjective;
  minimum_earth_visibility_pct: number;
  minimum_sunlight_pct: number;
  mission_duration_hours: number;
  start_utc: string;
  query: string | null;
  data_mode: "live" | "demo";
}

export interface HeliosEvaluation {
  status: "ok" | "no_match" | "insufficient_data";
  eligible: HeliosCandidate[];
  disqualified: HeliosCandidate[];
  insufficient_data: HeliosCandidate[];
  assumptions: string[];
}

export interface HeliosAdvisorResponse {
  status:
    | "ok"
    | "no_match"
    | "insufficient_data"
    | "needs_clarification"
    | "ambiguous"
    | "invalid";
  summary: string;
  interpretation: HeliosInterpretation;
  requirements: HeliosMissionRequirements | null;
  evaluation: HeliosEvaluation | null;
  clarification_questions: string[];
  unsupported_requirements: string[];
  mission_window: { start_utc: string; end_utc: string } | null;
  limitations: string[];
  ai_briefing?: string | null;
  ai_model?: string | null;
  ai_followups?: string[];
}

export class HeliosServiceError extends Error {
  constructor(
    message: string,
    readonly kind: "http" | "network" | "unexpected",
    readonly status?: number
  ) {
    super(message);
    this.name = "HeliosServiceError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCandidate(value: unknown): value is HeliosCandidate {
  if (
    !isRecord(value) ||
    !isRecord(value.metrics) ||
    !isRecord(value.provenance) ||
    !isRecord(value.constraints)
  ) {
    return false;
  }
  const metrics = value.metrics;
  const provenance = value.provenance;
  const constraints = value.constraints;
  return (
    typeof value.site_id === "string" &&
    typeof value.site_name === "string" &&
    typeof value.latitude_deg === "number" &&
    typeof value.longitude_deg === "number" &&
    (typeof value.rank === "number" || value.rank === null) &&
    (typeof value.score === "number" || value.score === null) &&
    typeof value.explanation === "string" &&
    typeof provenance.source === "string" &&
    typeof provenance.horizon_model === "string" &&
    typeof provenance.status === "string" &&
    typeof provenance.is_synthetic === "boolean" &&
    isStringArray(provenance.warnings) &&
    ["sunlit_fraction", "earth_visible_fraction", "sunlit_hours", "earth_visible_hours"].every(
      (key) => typeof metrics[key] === "number" || metrics[key] === null
    ) &&
    typeof constraints.has_complete_data === "boolean" &&
    typeof constraints.passed_all === "boolean" &&
    isStringArray(constraints.violations) &&
    isStringArray(value.tradeoffs)
  );
}

function isAdvisorResponse(value: unknown): value is HeliosAdvisorResponse {
  if (!isRecord(value) || !isRecord(value.interpretation)) return false;
  const interpretation = value.interpretation;
  const validStatuses = [
    "ok",
    "no_match",
    "insufficient_data",
    "needs_clarification",
    "ambiguous",
    "invalid",
  ];
  if (
    typeof value.status !== "string" ||
    !validStatuses.includes(value.status) ||
    typeof value.summary !== "string" ||
    typeof interpretation.query !== "string" ||
    typeof interpretation.status !== "string" ||
    !isStringArray(value.clarification_questions) ||
    !isStringArray(value.unsupported_requirements) ||
    !isStringArray(value.limitations) ||
    typeof interpretation.summary !== "string" ||
    !isStringArray(interpretation.clarification_questions) ||
    !isStringArray(interpretation.unsupported_requirements) ||
    !isStringArray(interpretation.interpretation_notes) ||
    !isStringArray(interpretation.errors)
  ) {
    return false;
  }
  if (value.requirements !== null && !isRecord(value.requirements)) return false;
  if (value.mission_window !== null) {
    if (
      !isRecord(value.mission_window) ||
      typeof value.mission_window.start_utc !== "string" ||
      typeof value.mission_window.end_utc !== "string"
    ) {
      return false;
    }
  }
  if (value.evaluation === null) {
    return ["needs_clarification", "ambiguous", "invalid"].includes(value.status);
  }
  if (value.requirements === null || value.mission_window === null) return false;
  if (!isRecord(value.evaluation)) return false;
  const evaluation = value.evaluation;
  const evaluationStatuses = ["ok", "no_match", "insufficient_data"];
  return (
    typeof evaluation.status === "string" &&
    evaluationStatuses.includes(evaluation.status) &&
    isStringArray(evaluation.assumptions) &&
    ["eligible", "disqualified", "insufficient_data"].every(
      (key) => Array.isArray(evaluation[key]) && evaluation[key].every(isCandidate)
    )
  );
}

export async function requestRecommendations(
  payload: HeliosAdvisorRequest
): Promise<HeliosAdvisorResponse> {
  let response: unknown;
  try {
    response = await apiPost<HeliosAdvisorRequest, unknown>(
      "/api/helios/recommend",
      payload
    );
  } catch (error) {
    if (error instanceof Error) {
      const statusMatch = error.message.match(/failed with (\d{3})/);
      if (statusMatch) {
        const status = Number(statusMatch[1]);
        throw new HeliosServiceError(
          status === 422
            ? "HELIOS could not validate this request. Review the mission requirements and try again."
            : `HELIOS returned an HTTP ${status} error. Please try again.`,
          "http",
          status
        );
      }
      if (error instanceof TypeError) {
        throw new HeliosServiceError(
          "Could not reach the HELIOS service. Check that the backend is available and try again.",
          "network"
        );
      }
    }
    throw new HeliosServiceError(
      "HELIOS returned an unexpected response. Please try again.",
      "unexpected"
    );
  }

  if (!isAdvisorResponse(response)) {
    throw new HeliosServiceError(
      "HELIOS returned a response the dashboard could not read.",
      "unexpected"
    );
  }
  return response;
}
