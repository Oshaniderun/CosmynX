"""Google Gemini AI integration for the HELIOS Lunar Landing Advisor.

Uses Google's Gemini REST API (via httpx) to:
1. Extract structured mission parameters from free-form or multi-turn conversational user prompts.
2. Generate a grounded, detailed, natural conversational response from the
   computed NASA ephemeris and LOLA terrain evaluation across all 9 Artemis III sites.
Falls back gracefully to a smart local synthesizer when no API key is configured
or when network access is unavailable.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
import httpx

from app.models.helios_models import HeliosObjective
from app.models.schemas import LandingSite
from app.services.helios_scoring import HeliosEvaluationReport

logger = logging.getLogger("helios.gemini")

_BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_BACKEND_DIR / ".env.example", override=False)

GEMINI_MODELS = ("gemini-flash-lite-latest", "gemini-3-flash-preview", "gemini-2.5-flash")
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def resolve_gemini_api_key(request_api_key: Optional[str] = None) -> Optional[str]:
    """Return the first non-empty Google Gemini API key from request or environment."""
    for candidate in (
        request_api_key,
        os.getenv("GEMINI_API_KEY"),
        os.getenv("GOOGLE_API_KEY"),
        os.getenv("LLM_API_KEY"),
    ):
        if candidate and candidate.strip():
            return candidate.strip()
    return None


def _call_gemini_json(
    api_key: str,
    system_instruction: str,
    user_prompt: str,
    timeout_seconds: float = 16.0,
) -> tuple[Optional[dict[str, Any]], Optional[str]]:
    """Call Google Gemini generateContent endpoint requesting JSON output."""
    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json",
        },
    }
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }
    for model in GEMINI_MODELS:
        url = f"{GEMINI_API_BASE}/{model}:generateContent"
        try:
            with httpx.Client(timeout=timeout_seconds) as client:
                resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 404:
                continue
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates") or []
            if not candidates:
                continue
            parts = candidates[0].get("content", {}).get("parts") or []
            raw_text = "".join(part.get("text", "") for part in parts).strip()
            if not raw_text:
                continue
            return json.loads(raw_text), model
        except Exception as exc:
            logger.warning("Gemini API call (%s) failed: %s", model, exc)
            break
    return None, None


def extract_intent_with_gemini(
    prompt: str,
    api_key: Optional[str] = None,
    chat_history: Optional[list[dict[str, str]]] = None,
) -> Optional[dict[str, Any]]:
    """Use Gemini to parse conversational user prompts (with chat history) into HELIOS parameters."""
    resolved_key = resolve_gemini_api_key(api_key)
    if not resolved_key or not prompt.strip():
        return None

    history_context = ""
    if chat_history:
        recent = chat_history[-6:]
        formatted_turns = [
            f"{turn.get('role', 'user').upper()}: {turn.get('content', '')}"
            for turn in recent
            if turn.get("content")
        ]
        if formatted_turns:
            history_context = "Previous conversation turns:\n" + "\n".join(formatted_turns) + "\n\n"

    system_instruction = (
        "You are HELIOS, NASA's Lunar South Pole Landing Site AI Advisor for Artemis III. "
        "Extract structured mission evaluation parameters from the user's latest message, taking into account "
        "previous conversation turns if this is a follow-up question (such as 'What if we stay 10 days?', "
        "'Tell me more about Malapert Massif', or 'Why was Peak near Cabeus B disqualified?'). "
        "If the user does not change mission parameters in a follow-up, preserve the prior mission parameters or use sensible defaults. "
        "Return strict JSON with keys:\n"
        "- objective: one of 'maximize_sunlight', 'maximize_earth_visibility', or 'balanced'\n"
        "- minimum_sunlight_pct: float between 0 and 100 (use 50.0 if unspecified)\n"
        "- minimum_earth_visibility_pct: float between 0 and 100 (use 70.0 if unspecified)\n"
        "- mission_duration_hours: integer between 1 and 720 (use 120 if unspecified)\n"
        "- summary: concise 1-sentence summary of how HELIOS interpreted the user's request."
    )
    full_prompt = f"{history_context}Latest user message: {prompt}"
    parsed, _ = _call_gemini_json(resolved_key, system_instruction, full_prompt, timeout_seconds=8.0)
    if not isinstance(parsed, dict):
        return None
    return parsed


def build_local_briefing(
    prompt: str,
    evaluation: HeliosEvaluationReport,
    sites: list[LandingSite],
    duration_hours: int,
    objective: HeliosObjective,
) -> tuple[str, list[str]]:
    """Build a friendly, informative local conversational response when no Gemini API key is active."""
    site_lookup = {s.site_id: s for s in sites}
    eligible = evaluation.eligible
    disqualified = evaluation.disqualified
    prompt_lower = prompt.lower()

    # Check if user asked specifically about a candidate site
    mentioned_sites = [
        c for c in (eligible + disqualified) if c.site_name.lower() in prompt_lower
    ]

    if mentioned_sites:
        lines: list[str] = []
        for cand in mentioned_sites:
            s_obj = site_lookup.get(cand.site_id)
            sun_pct = (
                f"{cand.metrics.sunlit_fraction * 100:.1f}% ({cand.metrics.sunlit_hours:.1f} h)"
                if cand.metrics.sunlit_fraction is not None and cand.metrics.sunlit_hours is not None
                else "N/A"
            )
            earth_pct = (
                f"{cand.metrics.earth_visible_fraction * 100:.1f}% ({cand.metrics.earth_visible_hours:.1f} h)"
                if cand.metrics.earth_visible_fraction is not None and cand.metrics.earth_visible_hours is not None
                else "N/A"
            )
            slope_txt = (
                f"{s_obj.terrain.mean_slope_deg:.1f}° mean slope (max {s_obj.terrain.max_slope_deg:.1f}°), "
                f"{s_obj.terrain.roughness_m:.1f} m roughness, {s_obj.terrain.psr_proximity_km:.1f} km to nearest PSR"
                if s_obj and s_obj.terrain and s_obj.terrain.mean_slope_deg is not None
                else "LOLA terrain data nominal"
            )
            status_txt = (
                f"Ranked **#{cand.rank}** (Score **{cand.score:.1f}/100**)"
                if cand.constraints.passed_all and cand.rank is not None and cand.score is not None
                else f"**Disqualified** ({'; '.join(cand.constraints.violations)})"
            )
            lines.append(
                f"- **{cand.site_name}** ({cand.latitude_deg:.2f}°, {cand.longitude_deg:.2f}°): {status_txt}\n"
                f"  - **Illumination & Comms:** {sun_pct} sunlight · {earth_pct} Earth line-of-sight\n"
                f"  - **Terrain (LRO LOLA):** {slope_txt}"
            )
        if eligible:
            top = eligible[0]
            top_s = site_lookup.get(top.site_id)
            top_slope = (
                f" with a gentle **{top_s.terrain.mean_slope_deg:.1f}°** mean slope"
                if top_s and top_s.terrain and top_s.terrain.mean_slope_deg is not None
                else ""
            )
            lines.append(
                f"\nOverall for this {duration_hours}-hour window, **{top.site_name}** is the #1 pick{top_slope}."
            )
        briefing = "\n".join(lines)
    elif eligible:
        top = eligible[0]
        top_site = site_lookup.get(top.site_id)
        sun_pct = (
            f"{top.metrics.sunlit_fraction * 100:.1f}% ({top.metrics.sunlit_hours:.1f} h)"
            if top.metrics.sunlit_fraction is not None and top.metrics.sunlit_hours is not None
            else "N/A"
        )
        earth_pct = (
            f"{top.metrics.earth_visible_fraction * 100:.1f}% ({top.metrics.earth_visible_hours:.1f} h)"
            if top.metrics.earth_visible_fraction is not None and top.metrics.earth_visible_hours is not None
            else "N/A"
        )
        slope_str = (
            f", **{top_site.terrain.mean_slope_deg:.1f}°** mean slope ({top_site.terrain.safety_rating} terrain), "
            f"and **{top_site.terrain.psr_proximity_km:.1f} km** from the nearest permanently shadowed region (PSR)"
            if top_site and top_site.terrain and top_site.terrain.mean_slope_deg is not None
            else ""
        )
        lines = [
            f"For your **{duration_hours}-hour** mission, **#{top.rank} {top.site_name}** ({top.latitude_deg:.2f}°, {top.longitude_deg:.2f}°) is the top recommendation with **{sun_pct}** sunlight, **{earth_pct}** direct-to-Earth visibility{slope_str}."
        ]
        if len(eligible) > 1:
            runner_ups = []
            for other in eligible[1:4]:
                osite = site_lookup.get(other.site_id)
                slope_note = (
                    f"{osite.terrain.mean_slope_deg:.1f}° slope"
                    if osite and osite.terrain and osite.terrain.mean_slope_deg is not None
                    else f"score {other.score:.1f}"
                )
                runner_ups.append(f"**#{other.rank} {other.site_name}** ({slope_note})")
            lines.append(
                "- **Top Alternatives:** "
                + ", ".join(runner_ups)
                + " also meet all illumination and Earth visibility thresholds, ranked behind the top pick based on terrain slope and composite score."
            )
        if disqualified:
            disq_parts = [
                f"**{d.site_name}** ({d.metrics.sunlit_fraction * 100:.1f}% sunlight — {'; '.join(d.constraints.violations)})"
                if d.metrics.sunlit_fraction is not None
                else f"**{d.site_name}** ({'; '.join(d.constraints.violations)})"
                for d in disqualified
            ]
            lines.append("- **Why Disqualified:** " + "; ".join(disq_parts) + ".")
        briefing = "\n\n".join(lines)
    elif disqualified:
        best_disq = sorted(
            disqualified,
            key=lambda c: (c.score if c.score is not None else -1.0),
            reverse=True,
        )[0]
        sun_pct = (
            f"{best_disq.metrics.sunlit_fraction * 100:.1f}%"
            if best_disq.metrics.sunlit_fraction is not None
            else "N/A"
        )
        earth_pct = (
            f"{best_disq.metrics.earth_visible_fraction * 100:.1f}%"
            if best_disq.metrics.earth_visible_fraction is not None
            else "N/A"
        )
        briefing = (
            f"None of the 9 Artemis III regions met every strict threshold simultaneously over the {duration_hours}-hour window, "
            f"but **{best_disq.site_name}** came closest ({sun_pct} sunlight, {earth_pct} Earth line-of-sight). "
            f"Try relaxing your minimum sunlight or Earth visibility threshold by 10–15% to unlock eligible sites."
        )
    else:
        briefing = (
            "HELIOS evaluated the Artemis III south-polar catalog, but scientific ephemeris data was unavailable "
            "for the requested window."
        )

    followups = [
        "Compare the top 3 sites in detail (slope, roughness, and PSR distance)",
        "Why was Peak near Cabeus B disqualified and when would it be suitable?",
        "What if we extend the mission duration to 14 days (336 hours)?",
    ]
    return briefing, followups


def generate_conversational_briefing(
    prompt: str,
    evaluation: HeliosEvaluationReport,
    sites: list[LandingSite],
    duration_hours: int,
    objective: HeliosObjective,
    api_key: Optional[str] = None,
    chat_history: Optional[list[dict[str, str]]] = None,
) -> tuple[str, Optional[str], list[str]]:
    """Return (ai_briefing, ai_model_used, follow_up_suggestions)."""
    fallback_briefing, fallback_followups = build_local_briefing(
        prompt=prompt,
        evaluation=evaluation,
        sites=sites,
        duration_hours=duration_hours,
        objective=objective,
    )
    resolved_key = resolve_gemini_api_key(api_key)
    if not resolved_key:
        return fallback_briefing, None, fallback_followups

    site_lookup = {s.site_id: s for s in sites}
    compact_candidates = []
    for candidate in (evaluation.eligible + evaluation.disqualified)[:9]:
        site_obj = site_lookup.get(candidate.site_id)
        terrain_info = None
        if site_obj and site_obj.terrain:
            terrain_info = {
                "mean_slope_deg": site_obj.terrain.mean_slope_deg,
                "max_slope_deg": site_obj.terrain.max_slope_deg,
                "roughness_m": site_obj.terrain.roughness_m,
                "psr_proximity_km": site_obj.terrain.psr_proximity_km,
                "safety_rating": site_obj.terrain.safety_rating,
                "elevation_m": site_obj.terrain.elevation_m,
            }
        compact_candidates.append(
            {
                "site_name": candidate.site_name,
                "coordinates": f"{candidate.latitude_deg:.2f}°, {candidate.longitude_deg:.2f}°",
                "rank": candidate.rank,
                "score": candidate.score,
                "passed_all_constraints": candidate.constraints.passed_all,
                "sunlit_pct": (
                    round(candidate.metrics.sunlit_fraction * 100, 1)
                    if candidate.metrics.sunlit_fraction is not None
                    else None
                ),
                "sunlit_hours": candidate.metrics.sunlit_hours,
                "earth_visible_pct": (
                    round(candidate.metrics.earth_visible_fraction * 100, 1)
                    if candidate.metrics.earth_visible_fraction is not None
                    else None
                ),
                "earth_visible_hours": candidate.metrics.earth_visible_hours,
                "terrain": terrain_info,
                "violations": candidate.constraints.violations,
            }
        )

    system_instruction = (
        "You are HELIOS, an intelligent, conversational AI Lunar Landing Advisor for NASA's Artemis III South Pole missions. "
        "You are chatting in a multi-turn conversation with the user. "
        "Directly and thoroughly answer the user's latest question using the provided site evaluation data and conversation history:\n"
        "- Provide useful, specific details: include exact sunlight % (and hours), Earth visibility % (and hours), "
        "LOLA terrain slope (mean/max degrees), surface roughness (m), and distance to Permanently Shadowed Regions (PSRs in km) when relevant.\n"
        "- Clearly explain why the top recommended site(s) win, how runner-up sites compare (e.g., steeper slopes or trade-offs), "
        "and why any disqualified sites failed mandatory constraints.\n"
        "- If the user asks a follow-up question about a specific site, comparison, or scenario, focus your answer directly on what they asked "
        "like a natural, helpful AI assistant.\n"
        "- Format cleanly with short paragraphs and bullet points (`- `) and **bold** key site names and metrics. "
        "Do NOT use any emojis. "
        "Keep it around 80–160 words—detailed enough to be genuinely informative, without repetitive raw system metadata.\n"
        "Return strict JSON with keys:\n"
        "- briefing: string (markdown-formatted conversational response)\n"
        "- followups: array of 3 contextual follow-up questions the user might want to ask next."
    )
    user_payload = json.dumps(
        {
            "conversation_history": (chat_history or [])[-6:],
            "latest_user_question": prompt,
            "mission_duration_hours": duration_hours,
            "objective": objective.value,
            "evaluated_sites": compact_candidates,
        },
        ensure_ascii=False,
    )

    parsed, model_used = _call_gemini_json(
        resolved_key, system_instruction, user_payload, timeout_seconds=16.0
    )
    if isinstance(parsed, dict) and isinstance(parsed.get("briefing"), str) and parsed["briefing"].strip():
        raw_followups = parsed.get("followups")
        followups = (
            [str(item).strip() for item in raw_followups if str(item).strip()][:3]
            if isinstance(raw_followups, list)
            else fallback_followups
        )
        return parsed["briefing"].strip(), model_used, (followups or fallback_followups)

    return fallback_briefing, None, fallback_followups
