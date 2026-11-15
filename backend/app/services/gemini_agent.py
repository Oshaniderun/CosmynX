"""Google Gemini AI integration and intelligent local conversational engine for HELIOS.

Uses Google's Gemini REST API (via httpx) to:
1. Extract structured mission parameters from free-form or multi-turn conversational user prompts.
2. Answer both general/normal conversational questions and grounded NASA Artemis III landing-site
   evaluation questions naturally.
Falls back gracefully to a comprehensive local conversational responder when no API key is
configured or when network access is unavailable.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
import re
from typing import Any, Optional

from dotenv import load_dotenv
import httpx

from app.models.helios_models import EnrichedHeliosRecommendation, HeliosObjective
from app.models.schemas import LandingSite
from app.services.helios_scoring import HeliosEvaluationReport

logger = logging.getLogger("helios.gemini")

_BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_BACKEND_DIR / ".env.example", override=False)

GEMINI_MODELS = ("gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-lite-latest")
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

SITE_ALIASES: list[tuple[str, str]] = [
    ("mons mouton plateau", "Mons Mouton Plateau"),
    ("mouton plateau", "Mons Mouton Plateau"),
    ("mons mouton", "Mons Mouton"),
    ("malapert massif", "Malapert Massif"),
    ("malapert", "Malapert Massif"),
    ("haworth", "Haworth"),
    ("nobile rim 1", "Nobile Rim 1"),
    ("nobile 1", "Nobile Rim 1"),
    ("nobile rim 2", "Nobile Rim 2"),
    ("nobile 2", "Nobile Rim 2"),
    ("de gerlache rim 2", "de Gerlache Rim 2"),
    ("de gerlache", "de Gerlache Rim 2"),
    ("gerlache", "de Gerlache Rim 2"),
    ("slater plain", "Slater Plain"),
    ("slater", "Slater Plain"),
    ("peak near cabeus b", "Peak near Cabeus B"),
    ("cabeus b", "Peak near Cabeus B"),
    ("cabeus", "Peak near Cabeus B"),
]


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


def _strip_json_fences(raw_text: str) -> str:
    """Remove optional markdown code fences around JSON output."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


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
            "temperature": 0.35,
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
            return json.loads(_strip_json_fences(raw_text)), model
        except Exception as exc:
            logger.warning("Gemini API call (%s) failed: %s", model, exc)
            continue
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
        "If the user is asking a general question or does not change mission parameters, preserve prior mission parameters or use sensible defaults. "
        "Return strict JSON with keys:\n"
        "- objective: one of 'maximize_sunlight', 'maximize_earth_visibility', or 'balanced'\n"
        "- minimum_sunlight_pct: float between 0 and 100 (use 50.0 if unspecified)\n"
        "- minimum_earth_visibility_pct: float between 0 and 100 (use 70.0 if unspecified)\n"
        "- mission_duration_hours: integer between 1 and 720 (use 72 if unspecified)\n"
        "- summary: concise 1-sentence summary of how HELIOS interpreted the user's request."
    )
    full_prompt = f"{history_context}Latest user message: {prompt}"
    parsed, _ = _call_gemini_json(resolved_key, system_instruction, full_prompt, timeout_seconds=8.0)
    if not isinstance(parsed, dict):
        return None
    return parsed


def _find_mentioned_candidates(
    text: str,
    all_candidates: list[EnrichedHeliosRecommendation],
) -> list[EnrichedHeliosRecommendation]:
    """Find candidate sites referenced by full name or common alias in text."""
    text_lower = text.lower()
    by_name = {c.site_name.lower(): c for c in all_candidates}
    matched: list[EnrichedHeliosRecommendation] = []
    seen_ids: set[str] = set()

    # Handle generic "nobile" mentioning both Nobile Rim 1 and Nobile Rim 2
    if re.search(r"\bnobile\b", text_lower) and not re.search(r"\bnobile\s*(?:rim\s*)?[12]\b", text_lower):
        for name in ("nobile rim 1", "nobile rim 2"):
            cand = by_name.get(name)
            if cand and cand.site_id not in seen_ids:
                matched.append(cand)
                seen_ids.add(cand.site_id)

    work_text = text_lower
    for alias, canonical in SITE_ALIASES:
        if alias in work_text:
            cand = by_name.get(canonical.lower())
            if cand and cand.site_id not in seen_ids:
                matched.append(cand)
                seen_ids.add(cand.site_id)
            work_text = work_text.replace(alias, " ")

    return matched


def _format_candidate_bullet(
    cand: EnrichedHeliosRecommendation,
    site_lookup: dict[str, LandingSite],
) -> str:
    """Format a single candidate site with illumination, Earth visibility, and LOLA terrain."""
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
    terrain_txt = (
        f"{s_obj.terrain.mean_slope_deg:.1f}° mean slope (max {s_obj.terrain.max_slope_deg:.1f}°), "
        f"{s_obj.terrain.roughness_m:.1f} m roughness, {s_obj.terrain.psr_proximity_km:.1f} km to nearest PSR ({s_obj.terrain.safety_rating})"
        if s_obj and s_obj.terrain and s_obj.terrain.mean_slope_deg is not None
        else "LOLA terrain data nominal"
    )
    status_txt = (
        f"Ranked **#{cand.rank}** (Score **{cand.score:.1f}/100**)"
        if cand.constraints.passed_all and cand.rank is not None and cand.score is not None
        else f"**Disqualified** ({'; '.join(cand.constraints.violations)})"
    )
    return (
        f"- **{cand.site_name}** ({cand.latitude_deg:.2f}°, {cand.longitude_deg:.2f}°): {status_txt}\n"
        f"  - **Illumination & Comms:** {sun_pct} sunlight · {earth_pct} Earth line-of-sight\n"
        f"  - **Terrain (LRO LOLA):** {terrain_txt}"
    )


def build_local_briefing(
    prompt: str,
    evaluation: HeliosEvaluationReport,
    sites: list[LandingSite],
    duration_hours: int,
    objective: HeliosObjective,
    chat_history: Optional[list[dict[str, str]]] = None,
) -> tuple[str, list[str]]:
    """Build a natural, question-aware conversational response when no Gemini API key is active."""
    site_lookup = {s.site_id: s for s in sites}
    eligible = evaluation.eligible
    disqualified = evaluation.disqualified
    all_candidates = eligible + disqualified
    cleaned = prompt.strip()
    prompt_lower = cleaned.lower()

    # 1. Greetings, courtesies, and small talk
    if re.match(
        r"^(?:hi+|hello+|hey+|good\s+(?:morning|afternoon|evening)|greetings|yo|sup|howdy|how\s+are\s+you(?:\s+doing)?|what'?s\s+up)\b[\s!.,?]*$",
        prompt_lower,
    ):
        briefing = (
            "Hello! I am **HELIOS**, your Lunar South Pole Mission and Landing Site Advisor for NASA's Artemis III campaign.\n\n"
            "You can ask me general questions about the Moon, Artemis III, lunar day/night cycles, permanently shadowed regions (water ice), "
            "or ask me to evaluate and compare the **9 Artemis III candidate landing sites** using NASA JPL Horizons ephemeris and LRO LOLA terrain data:\n"
            "- **Solar illumination & power** across any mission duration (1 to 720 hours)\n"
            "- **Direct-to-Earth (DTE) line-of-sight** communication windows\n"
            "- **LRO LOLA topography**, including terrain slope, surface roughness, elevation, and distance to Permanently Shadowed Regions (PSRs)"
        )
        followups = [
            "What are the 9 Artemis III candidate landing sites?",
            "Which landing site has the flattest terrain and best Earth comms?",
            "Why is NASA landing at the Lunar South Pole for Artemis III?",
        ]
        return briefing, followups

    if re.match(r"^(?:thanks|thank\s+you|thx|ty|awesome|great|cool|nice|got\s+it|ok|okay)\b[\s!.,?]*$", prompt_lower):
        briefing = (
            "You're welcome! Let me know if you want to explore another lunar topic, test a different mission duration, "
            "or inspect terrain and illumination trade-offs for any of the 9 Artemis III South Pole regions."
        )
        followups = [
            "Compare the top 3 sites in detail (slope, roughness, and PSR distance)",
            "What is a Permanently Shadowed Region (PSR) and why does water ice matter?",
            "What if we extend the mission duration to 14 days (336 hours)?",
        ]
        return briefing, followups

    # 2. Identity / capabilities / "who are you" / "what can you do" / "help"
    if re.search(
        r"\b(?:who\s+are\s+you|what\s+are\s+you|what\s+is\s+helios|what\s+can\s+you\s+do|how\s+do\s+you\s+work|help\s+me|^help$)\b",
        prompt_lower,
    ):
        briefing = (
            "I am **HELIOS** (High-Elevation Lunar Illumination & Orbital Site Advisor), an interactive mission assistant built on official NASA datasets.\n\n"
            "Here is what I can help you with:\n"
            "- **Answer Lunar & Artemis Questions:** Ask about the Moon's environment, Artemis III, Apollo history, lunar temperatures, gravity, communications delay, or water ice in Permanently Shadowed Regions (PSRs).\n"
            "- **Rank & Filter the 9 Artemis III Sites:** Specify your mission duration (hours/days) and minimum sunlight or Earth visibility thresholds to see which sites pass or fail.\n"
            "- **Compare Terrain & Safety:** Inspect **NASA LRO LOLA DEM** slope, surface roughness, elevation, and PSR distance alongside **NASA JPL Horizons** solar and Earth line-of-sight metrics."
        )
        followups = [
            "What are the 9 Artemis III candidate landing sites?",
            "Which landing site has the flattest terrain and best Earth comms?",
            "How do you calculate site suitability scores and where does the data come from?",
        ]
        return briefing, followups

    # 3. Data sources / methodology / scoring formula questions
    if re.search(
        r"\b(?:data\s+source|where\s+did\s+(?:we|you)\s+get|how\s+do\s+you\s+(?:score|calculate|rank|evaluate)|jpl\s+horizons|moon\s+trek|scoring\s+formula)\b",
        prompt_lower,
    ):
        briefing = (
            "HELIOS combines three official NASA scientific datasets to evaluate lunar south-pole missions without fabricating measurements:\n\n"
            "- **Candidate Regions:** The **9 NASA Artemis III South Pole candidate regions** (updated October 28, 2024 in NASA Press Release 24-144), each representing an approximate 15 km x 15 km exploration zone.\n"
            "- **Solar & Earth Ephemeris:** Computed from **NASA JPL Horizons** (`coord@301` Moon surface observer) for apparent Sun (`COMMAND='10'`) and Earth (`COMMAND='399'`) elevation angles over your UTC mission window.\n"
            "- **Topography & Safety:** Derived from the **NASA LRO Lunar Orbiter Laser Altimeter (LOLA) South Pole DEM** (`LDEM_80S_20M / 5M`), providing mean/max slope, RMS roughness, elevation, and distance to the nearest Permanently Shadowed Region (PSR).\n"
            "- **Suitability Scoring:** Sites must first pass mandatory minimum sunlight % and Earth visibility % thresholds; eligible sites are then ranked by a weighted composite of solar availability and direct-to-Earth visibility (`80/20` for solar priority, `20/80` for Earth comms priority, or `50/50` for balanced)."
        )
        followups = [
            "What are the 9 Artemis III candidate landing sites?",
            "Compare the top 3 sites in detail (slope, roughness, and PSR distance)",
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
        ]
        return briefing, followups

    # 4. General questions about Water Ice / Permanently Shadowed Regions (PSRs)
    if re.search(
        r"\b(?:water\s+ice|permanently\s+shadowed|psr|psrs|cold\s+trap|volatiles?|closest\s+to\s+ice|isru|rocket\s+fuel)\b",
        prompt_lower,
    ) and not re.search(r"\bcompare\s+the\s+top\s+3\b", prompt_lower):
        psr_sorted = sorted(
            [c for c in all_candidates if site_lookup.get(c.site_id) and site_lookup[c.site_id].terrain],
            key=lambda c: site_lookup[c.site_id].terrain.psr_proximity_km,
        )
        top_psr_lines = []
        for c in psr_sorted[:4]:
            t = site_lookup[c.site_id].terrain
            sun_str = f"{c.metrics.sunlit_fraction * 100:.1f}%" if c.metrics.sunlit_fraction is not None else "N/A"
            top_psr_lines.append(
                f"- **{c.site_name}**: **{t.psr_proximity_km:.1f} km** to nearest PSR · {t.mean_slope_deg:.1f}° mean slope ({t.safety_rating}) · {sun_str} sunlight"
            )
        briefing = (
            "**Permanently Shadowed Regions (PSRs)** are deep crater floors near the Lunar South Pole that never receive direct sunlight because the Moon's axial tilt is only **1.54°**. "
            "Temperatures inside PSRs stay below **-200°C (~40–100 K)**, acting as ancient cold traps that preserve **water ice** and other volatiles for billions of years. "
            "Harvesting this water ice (In-Situ Resource Utilization, or ISRU) provides drinking water, breathable oxygen, and liquid hydrogen/oxygen propellant.\n\n"
            "**Closest Artemis III Candidate Sites to PSRs (LRO LOLA DEM):**\n"
            + "\n".join(top_psr_lines)
        )
        followups = [
            "Compare Haworth and de Gerlache Rim 2 for a volatile-sampling mission",
            "Which site balances close PSR access with the flattest terrain?",
            "Why is NASA landing at the Lunar South Pole for Artemis III?",
        ]
        return briefing, followups

    # 5. General questions about Artemis III / Why the Lunar South Pole
    if re.search(
        r"\b(?:what\s+is\s+artemis|why\s+(?:is\s+nasa\s+(?:landing|going)\s+(?:at|to)\s+|do\s+we\s+(?:go|land)\s+(?:at|to)\s+|land\s+(?:at|on)\s+)?(?:the\s+)?(?:lunar\s+)?south\s+pole|tell\s+me\s+about\s+artemis|artemis\s+(?:3|iii|program|mission|campaign))\b",
        prompt_lower,
    ) and not re.search(r"\b(?:list|all\s+9|what\s+are\s+the\s+9|which\s+(?:of\s+the\s+9\s+)?(?:artemis\s+(?:iii\s+|3\s+)?)?sites?)\b", prompt_lower):
        briefing = (
            "**NASA's Artemis III** is planned to be humanity's first crewed landing at the **Lunar South Pole** (below 83°S latitude), contrasting with the Apollo missions (1969–1972) which landed near the Moon's equator.\n\n"
            "**Why the Lunar South Pole matters:**\n"
            "- **Peaks of Near-Eternal Light:** Because the Sun skims the horizon at a grazing angle (~1.5° tilt), elevated massifs and crater rims (such as **Malapert Massif**, **Mons Mouton**, and **Slater Plain**) stay sunlit for **85% to 100%** of multi-day missions, enabling continuous solar power and moderate surface temperatures.\n"
            "- **Adjacent Cold Traps & Water Ice:** Just 1–6 km away from sunlit ridges lie **Permanently Shadowed Regions (PSRs)** containing trapped water ice and ancient solar-system volatiles.\n"
            "- **Direct-to-Earth (DTE) Communications:** High-elevation south-polar ridges maintain continuous line-of-sight with Earth ground stations (with a ~1.28-second one-way light delay)."
        )
        followups = [
            "What are the 9 Artemis III candidate landing sites?",
            "How do Apollo equatorial landing sites compare to the Lunar South Pole?",
            "Which South Pole site has the flattest terrain and best Earth comms?",
        ]
        return briefing, followups

    # 6. General questions about Apollo missions
    if re.search(r"\b(?:apollo|neil\s+armstrong|buzz\s+aldrin|1969|tranquility)\b", prompt_lower):
        briefing = (
            "Between 1969 and 1972, NASA's **Apollo 11, 12, 14, 15, 16, and 17** missions landed 12 astronauts at near-equatorial and mid-latitude lunar sites (between 26°N and 9°S):\n\n"
            "- **Equatorial vs. South Pole Lighting:** Apollo missions had to land during the local lunar morning because the equator experiences ~14.75 Earth days of scorching sunlight (up to **+120°C**) followed by ~14.75 days of freezing darkness (**-130°C**).\n"
            "- **Artemis III Advantage:** By targeting high-elevation ridges at the **Lunar South Pole** (83.6°S to 88.7°S), Artemis III crews can operate in grazing horizon sunlight for weeks at a time while exploring Permanently Shadowed Regions just a few kilometers away.\n"
            "- You can also inspect the historic **Apollo 11–17 landing sites** directly in the 3D globe explorer above using the **Apollo Sites** toggle."
        )
        followups = [
            "What are the 9 Artemis III candidate landing sites?",
            "Why is NASA landing at the Lunar South Pole for Artemis III?",
            "Which Artemis III site has the flattest terrain?",
        ]
        return briefing, followups

    # 7. General questions about the Moon (distance, gravity, temperature, lunar day/night, size, regolith)
    if re.search(
        r"\b(?:how\s+far\s+is\s+the\s+moon|distance\s+to\s+(?:the\s+)?moon|lunar\s+gravity|gravity\s+on\s+the\s+moon|how\s+cold|how\s+hot|temperature\s+on\s+the\s+moon|lunar\s+(?:day|night)|how\s+long\s+is\s+a\s+day|what\s+is\s+the\s+moon|tell\s+me\s+about\s+the\s+moon|lunar\s+dust|regolith|lro\b|lola\b)\b",
        prompt_lower,
    ):
        briefing = (
            "Here are the key physical and environmental parameters of the **Moon** relevant to lunar surface missions:\n\n"
            "- **Distance & Signal Delay:** Mean Earth–Moon distance is **384,400 km** (perigee ~363,300 km, apogee ~405,500 km), resulting in a **~1.28-second one-way** (~2.56-second round-trip) radio communication delay.\n"
            "- **Size & Gravity:** Mean radius is **1,737.4 km** (~27% of Earth's radius) with surface gravity of **1.62 m/s²** (about **1/6th of Earth's gravity**).\n"
            "- **Lunar Day & Night:** A lunar synodic day lasts **29.53 Earth days** (~354 hours of sunlight followed by ~354 hours of darkness at the equator). At the **Lunar South Pole**, however, high peaks remain illuminated for over **85–100%** of multi-day windows.\n"
            "- **Temperatures:** Equatorial surface temperatures swing from **+120°C (+250°F)** at lunar noon to **-130°C (-200°F)** at night, while south-polar Permanently Shadowed Regions drop below **-200°C (~40 K)**.\n"
            "- **Surface Regolith & Mapping:** Covered by fine, electrostatically charged silicate dust and mapped in 3D by NASA's **Lunar Reconnaissance Orbiter (LRO)** Laser Altimeter (**LOLA**)."
        )
        followups = [
            "Why is NASA landing at the Lunar South Pole for Artemis III?",
            "What is a Permanently Shadowed Region (PSR) and why does water ice matter?",
            "Which of the 9 Artemis III sites has the most sunlight?",
        ]
        return briefing, followups

    # 7b. Challenges, risks, hazards, astronauts, rovers, or survival questions
    if re.search(
        r"\b(?:challenge|challenges|risk|risks|danger|dangers|survive|survival|astronaut|astronauts|spacesuit|eva\b|radiation|battery|solar\s+panels?)\b",
        prompt_lower,
    ) and not re.search(r"\b\d+\s*[- ]?(?:day|hour|week)\b", prompt_lower):
        briefing = (
            "Operating astronauts and rovers at the **Lunar South Pole** involves five major engineering challenges:\n\n"
            "- **Low Grazing Sunlight & Long Shadows:** The Sun never rises more than a few degrees above the south-polar horizon, casting kilometers-long shadows across craters and requiring vertical solar arrays on tall masts.\n"
            "- **Extreme Thermal Gradients:** Sunlit ridges sit around **-50°C to 0°C**, while shadowed craters just meters away plunge below **-200°C (~40 K)**, requiring robust thermal insulation and isotope/battery heaters.\n"
            "- **Rugged Highland Topography:** Unlike flat equatorial mare plains, the South Pole features steep massifs (up to **15°–22°** slopes). Flat plateaus like **Mons Mouton Plateau (4.2° slope)** and **Slater Plain (5.1° slope)** minimize lander tip-over risk.\n"
            "- **Abrasive Lunar Dust (Regolith):** Sharp, electrostatically levitated dust clings to visors, seals, and radiators during EVAs.\n"
            "- **Low Earth Elevation Angle:** Earth hovers low near the northern horizon, so landing behind a ridge can block direct-to-Earth (DTE) radio links unless a high massif like **Malapert Massif** or a relay satellite is used."
        )
        followups = [
            "Which landing site has the flattest terrain and best Earth comms?",
            "Compare Mons Mouton Plateau, Slater Plain, and Malapert Massif",
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
        ]
        return briefing, followups

    # 7c. Conversational follow-ups ("tell me more", "why is it #1", "what about the second one")
    if re.search(
        r"\b(?:tell\s+me\s+more|more\s+detail|why\s+is\s+(?:it|that)|what\s+about\s+the\s+(?:second|2nd|runner|next|other)|explain\s+why)\b",
        prompt_lower,
    ) and eligible:
        top = eligible[0]
        second = eligible[1] if len(eligible) > 1 else None
        lines = [
            f"Looking closer at the top-ranked sites for this **{duration_hours}-hour** window:",
            _format_candidate_bullet(top, site_lookup),
        ]
        if second:
            lines.append(_format_candidate_bullet(second, site_lookup))
            lines.append(
                f"\n**Why #{top.rank} {top.site_name} edges out #{second.rank} {second.site_name}:** Both achieve top illumination and Earth line-of-sight scores, so they are separated by local horizon visibility fractions and LRO LOLA terrain characteristics."
            )
        briefing = "\n".join(lines)
        followups = [
            "Compare all 9 Artemis III candidate landing sites",
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
            "What if we extend the mission duration to 14 days (336 hours)?",
        ]
        return briefing, followups

    # 8. List / overview of all 9 candidate landing sites
    if re.search(
        r"\b(?:what\s+are\s+the\s+(?:9\s+|nine\s+|artemis\s+(?:iii\s+|3\s+)?|possible\s+|candidate\s+|official\s+|lunar\s+|south[- ]pole\s+)*(?:landing\s+)?(?:sites|regions)|list\s+(?:all\s+|the\s+)?(?:9\s+|nine\s+|artemis\s+(?:iii\s+|3\s+)?|candidate\s+|possible\s+)*(?:landing\s+)?(?:sites|regions)|all\s+9\s+(?:artemis\s+(?:iii\s+|3\s+)?|candidate\s+|landing\s+)*(?:sites|regions)|possible\s+landing\s+sites|where\s+can\s+we\s+land)\b",
        prompt_lower,
    ):
        lines = [
            f"NASA's **9 official Artemis III Lunar South Pole candidate regions** (evaluated over the current **{duration_hours}-hour** mission window) are:"
        ]
        for idx, cand in enumerate(all_candidates, start=1):
            s_obj = site_lookup.get(cand.site_id)
            sun_str = f"{cand.metrics.sunlit_fraction * 100:.1f}%" if cand.metrics.sunlit_fraction is not None else "N/A"
            earth_str = f"{cand.metrics.earth_visible_fraction * 100:.1f}%" if cand.metrics.earth_visible_fraction is not None else "N/A"
            slope_str = (
                f"{s_obj.terrain.mean_slope_deg:.1f}° slope ({s_obj.terrain.safety_rating}), {s_obj.terrain.psr_proximity_km:.1f} km to PSR"
                if s_obj and s_obj.terrain
                else "LOLA DEM"
            )
            status_tag = f"Rank #{cand.rank} (Score {cand.score:.1f})" if cand.constraints.passed_all and cand.rank else "Disqualified"
            lines.append(
                f"- **{idx}. {cand.site_name}** ({cand.latitude_deg:.2f}°, {cand.longitude_deg:.2f}°) — **{status_tag}**: {sun_str} sunlight · {earth_str} Earth LOS · {slope_str}"
            )
        briefing = "\n".join(lines)
        followups = [
            "Compare the top 3 sites in detail (slope, roughness, and PSR distance)",
            "Which landing site has the flattest terrain and best Earth comms?",
            "Why was Peak near Cabeus B disqualified for a 100% solar mission?",
        ]
        return briefing, followups

    # 9. Specific candidate site(s) mentioned by name or alias
    mentioned_sites = _find_mentioned_candidates(cleaned, all_candidates)
    if mentioned_sites:
        is_disq_question = bool(
            re.search(r"\b(?:why|disqualif|fail|reject|when\s+would\s+it\s+be\s+suitable)\b", prompt_lower)
        )
        lines = []
        if len(mentioned_sites) > 1:
            lines.append(
                f"Here is the side-by-side comparison of **{', '.join(c.site_name for c in mentioned_sites)}** over the **{duration_hours}-hour** mission window:"
            )
        for cand in mentioned_sites:
            lines.append(_format_candidate_bullet(cand, site_lookup))
            if is_disq_question:
                sun_val = cand.metrics.sunlit_fraction * 100 if cand.metrics.sunlit_fraction is not None else 0.0
                earth_val = cand.metrics.earth_visible_fraction * 100 if cand.metrics.earth_visible_fraction is not None else 0.0
                if not cand.constraints.passed_all:
                    lines.append(
                        f"  - **Why It Failed:** {cand.site_name} provides **{sun_val:.1f}%** sunlight and **{earth_val:.1f}%** Earth visibility during this window, which fell short of your active threshold ({'; '.join(cand.constraints.violations)}). Lowering your minimum sunlight requirement below **{int(sun_val)}%** makes {cand.site_name} eligible."
                    )
                else:
                    lines.append(
                        f"  - **Threshold Sensitivity:** {cand.site_name} passes standard thresholds with **{sun_val:.1f}%** sunlight and **{earth_val:.1f}%** Earth visibility, but would be **disqualified** on any mission requiring more than **{sun_val:.1f}%** continuous sunlight (such as a strict 100% solar mission)."
                    )
        if len(mentioned_sites) > 1:
            best_mentioned = sorted(
                mentioned_sites,
                key=lambda c: (
                    1 if c.constraints.passed_all else 0,
                    c.score if c.score is not None else -1.0,
                    -(site_lookup[c.site_id].terrain.mean_slope_deg if site_lookup.get(c.site_id) and site_lookup[c.site_id].terrain else 99.0),
                ),
                reverse=True,
            )[0]
            lines.append(
                f"\nAmong the compared regions, **{best_mentioned.site_name}** leads on overall mission suitability and terrain safety."
            )
        briefing = "\n".join(lines)
        followups = [
            "Which landing site has the flattest terrain and best Earth comms?",
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
            "What if we extend the mission duration to 14 days (336 hours)?",
        ]
        return briefing, followups

    # 10. Terrain / flattest / slope / roughness / safest landing questions
    if re.search(r"\b(?:flattest|flat|slope|steep|roughness|safest|safety|terrain|elevation|touchdown)\b", prompt_lower) and not re.search(
        r"\bcompare\s+the\s+top\s+3\b", prompt_lower
    ):
        terrain_sorted = sorted(
            [c for c in all_candidates if site_lookup.get(c.site_id) and site_lookup[c.site_id].terrain],
            key=lambda c: (
                site_lookup[c.site_id].terrain.mean_slope_deg,
                site_lookup[c.site_id].terrain.roughness_m,
            ),
        )
        lines = [
            f"Based on **NASA LRO LOLA DEM** topography and **{duration_hours}-hour** JPL Horizons visibility, here are the **flattest and safest landing sites**:"
        ]
        for c in terrain_sorted[:4]:
            t = site_lookup[c.site_id].terrain
            sun_str = f"{c.metrics.sunlit_fraction * 100:.1f}%" if c.metrics.sunlit_fraction is not None else "N/A"
            earth_str = f"{c.metrics.earth_visible_fraction * 100:.1f}%" if c.metrics.earth_visible_fraction is not None else "N/A"
            lines.append(
                f"- **{c.site_name}** ({c.latitude_deg:.2f}°, {c.longitude_deg:.2f}°): **{t.mean_slope_deg:.1f}° mean slope** (max {t.max_slope_deg:.1f}°), "
                f"**{t.roughness_m:.1f} m** roughness (**{t.safety_rating}** rating) · **{sun_str}** sunlight · **{earth_str}** Earth line-of-sight"
            )
        if terrain_sorted:
            flattest = terrain_sorted[0]
            ft = site_lookup[flattest.site_id].terrain
            lines.append(
                f"\n**Recommendation:** **{flattest.site_name}** offers the gentlest touchdown terrain (**{ft.mean_slope_deg:.1f}°** mean slope, **{ft.roughness_m:.1f} m** roughness) while maintaining continuous Earth communications and solar illumination."
            )
        briefing = "\n".join(lines)
        followups = [
            "Compare Mons Mouton Plateau, Slater Plain, and Malapert Massif",
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
            "5-day rover mission needing continuous sunlight for power",
        ]
        return briefing, followups

    # 11. Compare top sites / general comparison request
    if re.search(r"\b(?:compare|comparison|top\s+3|top\s+three|runner[- ]?ups?|versus|vs\.?|difference\s+between)\b", prompt_lower):
        pool = eligible[:3] if len(eligible) >= 3 else all_candidates[:3]
        lines = [
            f"Here is a detailed comparison of the **top {len(pool)} Artemis III candidate sites** for a **{duration_hours}-hour** mission window:"
        ]
        for cand in pool:
            lines.append(_format_candidate_bullet(cand, site_lookup))
        if len(pool) >= 2:
            lines.append(
                f"\n**Key Trade-Off:** **{pool[0].site_name}** and **{pool[1].site_name}** both deliver top-tier solar and Earth visibility, so final selection comes down to **landing slope safety** (Mons Mouton Plateau at 4.2° and Slater Plain at 5.1° are the flattest) versus **proximity to Permanently Shadowed Regions** (Haworth at 1.2 km and de Gerlache Rim 2 at 1.5 km are closest to water-ice cold traps)."
            )
        briefing = "\n".join(lines)
        followups = [
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
            "Why was Peak near Cabeus B disqualified for a 100% solar mission?",
            "What if we extend the mission duration to 14 days (336 hours)?",
        ]
        return briefing, followups

    # 12. Disqualification / "why did X fail" / "which sites failed"
    if re.search(r"\b(?:disqualif|failed|fail|rejected|didn'?t\s+pass|violat)\b", prompt_lower):
        if disqualified:
            lines = [
                f"For the current **{duration_hours}-hour** window, **{len(disqualified)}** site(s) failed mandatory thresholds:"
            ]
            for d in disqualified:
                lines.append(_format_candidate_bullet(d, site_lookup))
            briefing = "\n".join(lines)
        else:
            lowest_sun = sorted(
                all_candidates,
                key=lambda c: (c.metrics.sunlit_fraction if c.metrics.sunlit_fraction is not None else 1.0),
            )[0]
            low_pct = (lowest_sun.metrics.sunlit_fraction or 0.0) * 100
            briefing = (
                f"Under the current thresholds, all **{len(eligible)}** candidate sites passed. "
                f"However, **{lowest_sun.site_name}** has the lowest solar illumination during this **{duration_hours}-hour** window at **{low_pct:.1f}%** "
                f"({lowest_sun.metrics.sunlit_hours:.1f} h sunlit), so any mission requiring more than **{low_pct:.1f}%** sunlight (such as a 70% or 100% solar mission) will disqualify **{lowest_sun.site_name}**."
            )
        followups = [
            "5-day rover mission needing 100% sunlight and 80% Earth visibility",
            "Compare the top 3 sites in detail (slope, roughness, and PSR distance)",
            "Which landing site has the flattest terrain and best Earth comms?",
        ]
        return briefing, followups

    # 13. Earth communication / line-of-sight specific questions
    if re.search(r"\b(?:earth\s+visibility|earth\s+comms?|communication|line[- ]of[- ]sight|direct[- ]to[- ]earth|dte)\b", prompt_lower) and not re.search(
        r"\bsunlight|solar\b", prompt_lower
    ):
        earth_sorted = sorted(
            all_candidates,
            key=lambda c: (
                c.metrics.earth_visible_fraction if c.metrics.earth_visible_fraction is not None else -1.0,
                -(site_lookup[c.site_id].terrain.mean_slope_deg if site_lookup.get(c.site_id) and site_lookup[c.site_id].terrain else 99.0),
            ),
            reverse=True,
        )
        lines = [
            f"For **direct-to-Earth (DTE) line-of-sight communication** over the **{duration_hours}-hour** window (computed via NASA JPL Horizons):"
        ]
        for c in earth_sorted[:4]:
            t = site_lookup.get(c.site_id)
            earth_str = (
                f"{c.metrics.earth_visible_fraction * 100:.1f}% ({c.metrics.earth_visible_hours:.1f} h)"
                if c.metrics.earth_visible_fraction is not None and c.metrics.earth_visible_hours is not None
                else "N/A"
            )
            sun_str = f"{c.metrics.sunlit_fraction * 100:.1f}%" if c.metrics.sunlit_fraction is not None else "N/A"
            slope_str = f"{t.terrain.mean_slope_deg:.1f}° mean slope" if t and t.terrain else "nominal slope"
            lines.append(
                f"- **{c.site_name}**: **{earth_str}** Earth line-of-sight · **{sun_str}** sunlight · {slope_str}"
            )
        lines.append(
            "\nElevated south-polar massifs and plateaus (**Mons Mouton Plateau**, **Malapert Massif**, **Slater Plain**) keep Earth above the local geometric horizon continuously, avoiding communication blackouts."
        )
        briefing = "\n".join(lines)
        followups = [
            "Compare Mons Mouton Plateau and Malapert Massif",
            "Which site has the most sunlight over a 14-day mission?",
            "Which site is closest to Permanently Shadowed Regions (water ice)?",
        ]
        return briefing, followups

    # 13b. Most sunlight / best solar illumination specific questions
    if re.search(r"\b(?:most\s+sunlight|best\s+solar|sunniest|highest\s+(?:sunlight|solar|illumination))\b", prompt_lower):
        sun_sorted = sorted(
            all_candidates,
            key=lambda c: (
                c.metrics.sunlit_fraction if c.metrics.sunlit_fraction is not None else -1.0,
                -(site_lookup[c.site_id].terrain.mean_slope_deg if site_lookup.get(c.site_id) and site_lookup[c.site_id].terrain else 99.0),
            ),
            reverse=True,
        )
        lines = [
            f"Based on **NASA JPL Horizons** solar ephemeris over the **{duration_hours}-hour** window, the candidate sites with the **highest solar illumination** are:"
        ]
        for c in sun_sorted[:5]:
            t = site_lookup.get(c.site_id)
            sun_str = (
                f"{c.metrics.sunlit_fraction * 100:.1f}% ({c.metrics.sunlit_hours:.1f} h)"
                if c.metrics.sunlit_fraction is not None and c.metrics.sunlit_hours is not None
                else "N/A"
            )
            earth_str = f"{c.metrics.earth_visible_fraction * 100:.1f}%" if c.metrics.earth_visible_fraction is not None else "N/A"
            slope_str = f"{t.terrain.mean_slope_deg:.1f}° mean slope ({t.terrain.safety_rating})" if t and t.terrain else "nominal slope"
            lines.append(
                f"- **{c.site_name}**: **{sun_str}** sunlight · **{earth_str}** Earth line-of-sight · {slope_str}"
            )
        briefing = "\n".join(lines)
        followups = [
            "Which landing site has the flattest terrain and best Earth comms?",
            "Why was Peak near Cabeus B disqualified for a 100% solar mission?",
            "What if we extend the mission duration to 14 days (336 hours)?",
        ]
        return briefing, followups

    # 14. Default mission recommendation summary (for mission planning prompts)
    if eligible:
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
            f"For your **{duration_hours}-hour** mission ({objective.value.replace('_', ' ')}), **#{top.rank} {top.site_name}** ({top.latitude_deg:.2f}°, {top.longitude_deg:.2f}°) is the top recommendation with **{sun_pct}** sunlight, **{earth_pct}** direct-to-Earth visibility{slope_str}."
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
                + " also meet all illumination and Earth visibility thresholds."
            )
        if disqualified:
            disq_parts = [
                f"**{d.site_name}** ({d.metrics.sunlit_fraction * 100:.1f}% sunlight — {'; '.join(d.constraints.violations)})"
                if d.metrics.sunlit_fraction is not None
                else f"**{d.site_name}** ({'; '.join(d.constraints.violations)})"
                for d in disqualified
            ]
            lines.append("- **Disqualified Sites:** " + "; ".join(disq_parts) + ".")
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
        chat_history=chat_history,
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
        "You are HELIOS, an intelligent, conversational AI Lunar Landing & Space Mission Advisor for NASA's Artemis III South Pole campaign. "
        "You are chatting in a multi-turn conversation with the user. "
        "Follow these rules:\n"
        "1. If the user asks a normal/general question (greetings like 'Hello', questions about who you are, general questions about the Moon, "
        "Artemis III, Apollo history, space science, lunar day/night, temperatures, gravity, communications delay, or water ice/PSRs), "
        "answer their question directly, naturally, and conversationally like a helpful AI assistant—do NOT dump an unrequested site-ranking table.\n"
        "2. If the user asks to recommend, filter, or compare landing sites, or asks about specific Artemis III sites, sunlight, Earth communication, or terrain slopes, "
        "use the provided NASA JPL Horizons and LRO LOLA site evaluation data to give a clear, grounded answer with exact numbers (sunlight %, Earth visibility %, mean/max slope in degrees, roughness in m, and PSR distance in km).\n"
        "3. Format cleanly with short paragraphs and bullet points (`- `) and **bold** key terms and metrics. Do NOT use any emojis. "
        "Keep responses around 70–160 words.\n"
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
