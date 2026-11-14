"""HELIOS Mission Requirement Interpreter (Feature 06 — Step 3).

Parses natural-language mission requirements into validated structured requirements
compatible with the Step 1 Pydantic models (helios_models.py) and Step 2 scoring
engine (helios_scoring.py).

Features:
- Deterministic parsing supporting natural wording variations.
- Threshold extraction (sunlight %, Earth visibility %) with explicit zero vs unspecified distinction.
- Objective classification (maximize_sunlight, maximize_earth_visibility, balanced).
- Mission duration extraction (hours, days, weeks).
- Ambiguity detection (contradictory objectives or contradictory thresholds).
- Range and bounds validation.
- Unsupported requirements identification (slope, boulders, water ice, thermal, etc.).
- Structured confidence/status reporting without invented percentage scores.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel, Field

from app.models.helios_models import (
    HeliosInterpretResponse,
    HeliosMissionRequirements,
    HeliosObjective,
)

# Known unsupported lunar requirements that HELIOS does not model
UNSUPPORTED_PATTERNS: list[tuple[str, str]] = [
    (r"\b(?:slope|gradient|steep(?:ness)?|terrain roughness)\b", "Terrain slope / topography"),
    (r"\b(?:boulder|rock|crater wall obstacle|hazard-free)\b", "Surface boulders / obstacle hazards"),
    (r"\b(?:water ice|ice concentration|volatiles|hydrogen|psr)\b", "Water ice / volatile deposits"),
    (r"\b(?:thermal|temperature|cryogenic|heat)\b", "Thermal / temperature conditions"),
    (r"\b(?:landing ellipse|pinpoint|precision landing)\b", "Landing error ellipse / precision navigation"),
    (r"\b(?:rf link|data rate|bandwidth|snr|signal-to-noise|antenna gain)\b", "RF link budget / communications data rate"),
    (r"\b(?:communication|comms?)\s+(?:reliability|quality|availability|blackout probability)\b", "Communications reliability / link quality"),
    (r"\b(?:payload mass|delta[- ]?v|propellant|fuel)\b", "Spacecraft mass / propulsion budget"),
]


class HeliosInterpretationResult(BaseModel):
    """Rich structured output from the natural language requirement interpreter."""

    query: str
    status: Literal["success", "partial", "ambiguous", "invalid", "no_requirements"] = Field(
        ...,
        description="Interpretation state: 'success', 'partial', 'ambiguous', 'invalid', or 'no_requirements'.",
    )
    extracted_objective: Optional[HeliosObjective] = None
    extracted_min_sunlight_pct: Optional[float] = None
    extracted_min_earth_visibility_pct: Optional[float] = None
    extracted_duration_hours: Optional[int] = None
    extracted_start_utc: Optional[str] = None
    summary: str
    clarification_questions: list[str] = Field(default_factory=list)
    unsupported_requirements: list[str] = Field(default_factory=list)
    interpretation_notes: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)

    def to_interpret_response(self) -> HeliosInterpretResponse:
        """Convert to the repository's standard HeliosInterpretResponse model."""
        interpreted = self.status in ("success", "partial")
        return HeliosInterpretResponse(
            query=self.query,
            interpreted=interpreted,
            extracted_objective=self.extracted_objective,
            extracted_duration_hours=self.extracted_duration_hours,
            extracted_min_earth_visibility_pct=self.extracted_min_earth_visibility_pct,
            extracted_min_sunlight_pct=self.extracted_min_sunlight_pct,
            extracted_start_utc=self.extracted_start_utc,
            interpretation_notes=self.interpretation_notes + [self.summary],
            unrecognized_tokens=self.unsupported_requirements,
        )

    def to_mission_requirements(
        self,
        default_start_utc: str = "2026-11-20T00:00:00Z",
    ) -> HeliosMissionRequirements:
        """Convert to validated HeliosMissionRequirements for the Step 2 scoring engine.

        Unspecified fields adopt the official model defaults (objective: maximize_sunlight,
        min_earth: 80.0%, min_sun: 0.0%, duration: 72h).
        """
        obj = self.extracted_objective if self.extracted_objective is not None else HeliosObjective.MAXIMIZE_SUNLIGHT
        earth_pct = (
            self.extracted_min_earth_visibility_pct
            if self.extracted_min_earth_visibility_pct is not None
            else 80.0
        )
        sun_pct = (
            self.extracted_min_sunlight_pct
            if self.extracted_min_sunlight_pct is not None
            else 0.0
        )
        duration = self.extracted_duration_hours if self.extracted_duration_hours is not None else 72
        start_time = self.extracted_start_utc or default_start_utc

        return HeliosMissionRequirements(
            objective=obj,
            minimum_earth_visibility_pct=earth_pct,
            minimum_sunlight_pct=sun_pct,
            mission_duration_hours=duration,
            start_utc=start_time,
            query=self.query,
            data_mode="live",
        )


def _extract_threshold(
    text: str,
    target_names: list[str],
) -> tuple[Optional[float], list[float], list[str]]:
    """Extract percentage threshold for a specific target (sunlight or Earth visibility).

    Returns:
        tuple of (chosen_value, all_extracted_values, error_messages).
    """
    errors: list[str] = []
    values: list[float] = []

    # Check for explicit zero phrases
    target_pattern = r"(?:" + "|".join(target_names) + r")"
    zero_patterns = [
        rf"\b(?:no|zero|without)\s+(?:minimum\s+)?{target_pattern}\b",
        rf"\b{target_pattern}\s+(?:not\s+required|of\s+0%|is\s+0%|>=?\s*0%?)\b",
    ]
    for zp in zero_patterns:
        if re.search(zp, text, re.IGNORECASE):
            values.append(0.0)

    # Numeric threshold extraction patterns
    # Pattern 1: [qualifier] <number>% [target]
    # e.g., "at least 70% sunlight", "minimum 80% earth visibility", ">= 65% sun"
    p1 = rf"(?:at least|minimum|min|>=?|greater than or equal to|more than|require(?:s|d)?|over)?\s*(-?\d+(?:\.\d+)?)\s*(?:%|percent)?\s*(?:or more)?\s*(?:of)?\s*{target_pattern}\b"
    for m in re.finditer(p1, text, re.IGNORECASE):
        try:
            val = float(m.group(1))
            values.append(val)
        except ValueError:
            continue

    # Pattern 2: [target] [qualifier] <number>%
    # e.g., "sunlight of at least 70%", "earth visibility >= 80%", "sunlight at 65%"
    p2 = rf"\b{target_pattern}\s*(?:availability|visibility|levels?)?\s*(?:of|at|level|availability)?\s*(?:at least|minimum|min|>=?|greater than or equal to|more than|require(?:s|d)?|of)?\s*(-?\d+(?:\.\d+)?)\s*(?:%|percent)?"
    for m in re.finditer(p2, text, re.IGNORECASE):
        try:
            val = float(m.group(1))
            values.append(val)
        except ValueError:
            continue

    unique_values = sorted(list({round(v, 4) for v in values}))

    # Validation: check bounds
    invalid_vals = [v for v in unique_values if v < 0.0 or v > 100.0]
    for iv in invalid_vals:
        errors.append(
            f"Invalid threshold for {target_names[0]}: {iv}%. Percentages must be between 0.0 and 100.0%."
        )

    if not unique_values:
        return None, [], errors

    return unique_values[0], unique_values, errors


def _extract_objective(text: str) -> tuple[Optional[HeliosObjective], list[HeliosObjective], list[str]]:
    """Classify the mission optimization objective from user phrasing."""
    detected: list[HeliosObjective] = []
    notes: list[str] = []

    # Patterns for balanced
    balanced_patterns = [
        r"\b(?:balanced|equal importance|equal priority|equal weight|balance (?:sun|solar) and (?:earth|comm)|equally)\b",
        r"\bboth\s+(?:sunlight|solar)\s+and\s+(?:earth|comm)\s+(?:equally|balanced)\b",
    ]
    for bp in balanced_patterns:
        if re.search(bp, text, re.IGNORECASE):
            detected.append(HeliosObjective.BALANCED)
            break

    # Patterns for maximize_sunlight
    sun_patterns = [
        r"\b(?:prioritize|prioritizing|priority\s+is|focus\s+on|maximize|max)\s+(?:solar\s+power|solar\s+illumination|solar|sunlight|sun|illumination)\b",
        r"\b(?:solar\s+illumination|solar\s+power|solar|sunlight|sun)\s+(?:is\s+(?:my\s+)?(?:main|primary|top)\s+priority|illumination\s+first)\b",
        r"\b(?:prioritize\s+solar\s+over\s+communication|prioritize\s+sunlight\s+over\s+earth)\b",
    ]
    for sp in sun_patterns:
        if re.search(sp, text, re.IGNORECASE):
            detected.append(HeliosObjective.MAXIMIZE_SUNLIGHT)
            break

    # Patterns for maximize_earth_visibility
    earth_patterns = [
        r"\b(?:prioritize|prioritizing|priority\s+is|focus\s+on|maximize|max)\s+(?:earth\s+visibility|earth|communication|comms?|line[- ]of[- ]sight)\b",
        r"\b(?:earth\s+visibility|communication\s+visibility|earth|communication|comms?)\s+(?:is\s+(?:my\s+)?(?:main|primary|top)\s+priority)\b",
        r"\b(?:prioritize\s+earth\s+over\s+sunlight|prioritize\s+communication\s+over\s+solar)\b",
    ]
    for ep in earth_patterns:
        if re.search(ep, text, re.IGNORECASE):
            detected.append(HeliosObjective.MAXIMIZE_EARTH_VISIBILITY)
            break

    unique_detected = list(dict.fromkeys(detected))

    if len(unique_detected) > 1:
        notes.append(
            f"Contradictory objectives detected: {[o.value for o in unique_detected]}."
        )
        return None, unique_detected, notes

    if unique_detected:
        return unique_detected[0], unique_detected, notes

    return None, [], notes


def _extract_duration(text: str) -> tuple[Optional[int], list[int], list[str]]:
    """Extract mission duration in hours from natural language phrasing."""
    errors: list[str] = []
    durations: list[int] = []

    # Hours pattern (e.g. "72-hour", "72 hours", "48h", "24 hrs")
    hour_matches = re.finditer(r"(-?\d+(?:\.\d+)?)\s*[-]?\s*(?:hours?|hrs?|h)\b", text, re.IGNORECASE)
    for m in hour_matches:
        try:
            val = float(m.group(1))
            if val <= 0:
                errors.append(f"Mission duration must be positive (> 0 hours), got {val}.")
            else:
                durations.append(int(round(val)))
        except ValueError:
            continue

    # Days pattern (e.g. "3-day", "3 days", "3d")
    day_matches = re.finditer(r"(-?\d+(?:\.\d+)?)\s*[-]?\s*(?:days?|d)\b", text, re.IGNORECASE)
    for m in day_matches:
        try:
            val = float(m.group(1))
            if val <= 0:
                errors.append(f"Mission duration must be positive (> 0 days), got {val}.")
            else:
                durations.append(int(round(val * 24.0)))
        except ValueError:
            continue

    # Weeks pattern (e.g. "1-week", "1 week", "2w")
    week_matches = re.finditer(r"(-?\d+(?:\.\d+)?)\s*[-]?\s*(?:weeks?|w)\b", text, re.IGNORECASE)
    for m in week_matches:
        try:
            val = float(m.group(1))
            if val <= 0:
                errors.append(f"Mission duration must be positive (> 0 weeks), got {val}.")
            else:
                durations.append(int(round(val * 168.0)))
        except ValueError:
            continue

    unique_durations = sorted(list(set(durations)))

    if not unique_durations:
        return None, [], errors

    return unique_durations[0], unique_durations, errors


def _extract_start_utc(text: str) -> tuple[Optional[str], list[str]]:
    """Extract ISO 8601 start timestamp from text if present."""
    errors: list[str] = []
    iso_match = re.search(r"\b(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2}))?)\b", text)
    if iso_match:
        raw_date = iso_match.group(1)
        # Append default midnight UTC if date only
        if "T" not in raw_date:
            raw_date = f"{raw_date}T00:00:00Z"
        elif not raw_date.endswith("Z") and "+" not in raw_date and "-" not in raw_date[10:]:
            raw_date = f"{raw_date}Z"
        try:
            dt = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
            return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), errors
        except ValueError:
            errors.append(f"Invalid timestamp format: '{raw_date}'.")

    return None, errors


def interpret_mission_requirements(
    user_input: str,
    current_start_utc: Optional[str] = None,
) -> HeliosInterpretationResult:
    """Interpret natural-language lunar mission requirements into structured constraints.

    Args:
        user_input: Free-form user request text.
        current_start_utc: Active mission start timestamp from UI form, if available.

    Returns:
        HeliosInterpretationResult containing structured parameters, validation
        status, clarification questions, and unsupported requirement warnings.
    """
    cleaned = user_input.strip() if user_input else ""

    # Case 1: Empty or whitespace-only input
    if not cleaned:
        return HeliosInterpretationResult(
            query=user_input,
            status="no_requirements",
            summary="No requirements provided in prompt. Active manual form settings will be used.",
            clarification_questions=[
                "Please describe your mission constraints (e.g. 'I need at least 70% sunlight and 80% Earth visibility for 72 hours')."
            ],
            interpretation_notes=["Prompt is empty or contains only whitespace."],
        )

    errors: list[str] = []
    notes: list[str] = []
    clarifications: list[str] = []
    unsupported: list[str] = []

    # 1. Check for unsupported requirements
    for pattern, description in UNSUPPORTED_PATTERNS:
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            matched_term = match.group(0)
            unsupported.append(
                f"Unsupported requirement: {description} (matched '{matched_term}'). HELIOS evaluates geometric solar illumination and direct Earth line-of-sight only."
            )

    # 2. Extract thresholds
    sun_val, sun_vals, sun_errs = _extract_threshold(
        cleaned, ["sunlight", "solar illumination", "solar", "illumination", "sun"]
    )
    earth_val, earth_vals, earth_errs = _extract_threshold(
        cleaned, ["earth visibility", "communication visibility", "earth comms?", "earth line[- ]of[- ]sight", "earth"]
    )
    errors.extend(sun_errs)
    errors.extend(earth_errs)

    # Contradictory threshold check
    if len(sun_vals) > 1:
        errors.append(
            f"Contradictory sunlight thresholds detected: {[f'{v}%' for v in sun_vals]}."
        )
    if len(earth_vals) > 1:
        errors.append(
            f"Contradictory Earth visibility thresholds detected: {[f'{v}%' for v in earth_vals]}."
        )

    # 3. Extract objective
    obj_val, obj_vals, obj_errs = _extract_objective(cleaned)
    errors.extend(obj_errs)

    # 4. Extract duration
    dur_val, dur_vals, dur_errs = _extract_duration(cleaned)
    errors.extend(dur_errs)
    if len(dur_vals) > 1:
        errors.append(f"Contradictory mission durations detected: {[f'{v}h' for v in dur_vals]}.")

    # 5. Extract start timestamp
    start_val, start_errs = _extract_start_utc(cleaned)
    errors.extend(start_errs)

    # Status Determination
    has_contradiction = any("Contradictory" in e for e in errors)
    has_invalid_bounds = any("must be between" in e or "must be positive" in e for e in errors)

    any_extracted = (
        sun_val is not None
        or earth_val is not None
        or obj_val is not None
        or dur_val is not None
        or start_val is not None
    )

    if has_contradiction:
        status: Literal["success", "partial", "ambiguous", "invalid", "no_requirements"] = "ambiguous"
        clarifications.append("Please resolve conflicting priorities or multiple conflicting threshold values.")
    elif has_invalid_bounds:
        status = "invalid"
    elif not any_extracted:
        if unsupported:
            status = "partial"
            clarifications.append(
                "HELIOS cannot evaluate the specified parameters. Please specify sunlight %, Earth visibility %, or mission duration."
            )
        else:
            status = "no_requirements"
            clarifications.append(
                "Could not identify specific lunar mission requirements. Specify sunlight %, Earth visibility %, or duration."
            )
    elif unsupported:
        status = "partial"
    else:
        status = "success"

    if unsupported:
        clarifications.append(
            "HELIOS cannot evaluate the unsupported requirement(s) listed below. Remove or clarify them before scientific evaluation."
        )

    # Assemble summary
    summary_parts = []
    if obj_val is not None:
        summary_parts.append(f"Objective: {obj_val.value}")
    else:
        notes.append("Objective unspecified; defaulting to 'maximize_sunlight' if evaluated.")

    if sun_val is not None:
        summary_parts.append(f"Min sunlight: {sun_val:.1f}%")
    else:
        notes.append("Minimum sunlight unspecified (default: 0.0%).")

    if earth_val is not None:
        summary_parts.append(f"Min Earth visibility: {earth_val:.1f}%")
    else:
        notes.append("Minimum Earth visibility unspecified (default: 80.0%).")

    if dur_val is not None:
        summary_parts.append(f"Duration: {dur_val}h")
    else:
        notes.append("Mission duration unspecified (default: 72 hours).")

    if start_val is not None:
        summary_parts.append(f"Start: {start_val}")
    elif current_start_utc:
        notes.append(f"Start date not in text; adopting active form date: {current_start_utc}.")

    if summary_parts:
        summary = "Understood requirements: " + "; ".join(summary_parts) + "."
    else:
        summary = "No recognized mission requirements found in text."

    if re.search(r"\b(?:comms?|communication)\b", cleaned, re.IGNORECASE):
        notes.append(
            "HELIOS interprets Earth visibility as geometric Earth line-of-sight only; it does not evaluate RF link quality or communications reliability."
        )
    if re.search(r"\bsolar\s+power\b", cleaned, re.IGNORECASE):
        notes.append(
            "Solar power wording is treated as a request to prioritize geometric solar illumination; electrical power generation is not modeled."
        )

    return HeliosInterpretationResult(
        query=user_input,
        status=status,
        extracted_objective=obj_val,
        extracted_min_sunlight_pct=sun_val,
        extracted_min_earth_visibility_pct=earth_val,
        extracted_duration_hours=dur_val,
        extracted_start_utc=start_val,
        summary=summary,
        clarification_questions=clarifications,
        unsupported_requirements=unsupported,
        interpretation_notes=notes,
        errors=errors,
    )
