import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  FlaskConical,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMission } from "../../../context/MissionContext";
import type { LandingSite } from "../../../types/helios";
import { fetchCandidateSites } from "../../lunar-map/services/sitesService";
import { DecisionBrief } from "./DecisionBrief";
import { DelayMatrix } from "./DelayMatrix";
import { ScenarioInspector } from "./ScenarioInspector";
import {
  createStudy,
  DEFAULT_PROFILE,
  downloadJSON,
  eligibleAlternatives,
  exportStudy,
  findCell,
  getCell,
  hour,
  statusLabel,
  TRAINING_PROFILE,
  utcLabel,
} from "./stressTestService";
import type {
  CellDetail,
  StressProfile,
  StudyConstraints,
  StudyRun,
  StudySite,
} from "./stressTestService";
import { useReducedMotion } from "./useReducedMotion";
import "./delayLab.css";

const requirementLabels: Record<keyof StudyConstraints, string> = {
  maximum_darkness_hours: "Maximum continuous darkness",
  maximum_earth_outage_hours: "Maximum Earth outage",
  minimum_joint_visibility_hours: "Minimum joint visibility",
};
const sceneLabels = [
  "Original plan",
  "Departure slips",
  "Inspect consequence",
  "Compare an alternative",
];

export function DelayLabPanel({ visible = true }: { visible?: boolean }) {
  const mission = useMission();
  const prefersReduced = useReducedMotion();
  const [manualReduced, setManualReduced] = useState(false);
  const reduced = prefersReduced || manualReduced;
  const [catalog, setCatalog] = useState<LandingSite[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [profile, setProfile] = useState<StressProfile>(() =>
    structuredClone(DEFAULT_PROFILE),
  );
  const [run, setRun] = useState<StudyRun | null>(null);
  const [activeId, setActiveId] = useState("");
  const [earliest, setEarliest] = useState(24);
  const [detail, setDetail] = useState<CellDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [busy, setBusy] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cursor, setCursor] = useState(0);
  const [timePlaying, setTimePlaying] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [scene, setScene] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [brief, setBrief] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [addCatalog, setAddCatalog] = useState("");
  const [custom, setCustom] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });
  const controller = useRef<AbortController | null>(null);
  const requestVersion = useRef(0);
  const details = useRef(new Map<string, CellDetail>());
  const customSequence = useRef(0);

  useEffect(() => {
    let live = true;
    fetchCandidateSites()
      .then((sites) => {
        if (!live) return;
        setCatalog(sites);
        setProfile((current) => {
          if (current.sites.length) return current;
          const references = sites
            .slice(0, 3)
            .map((site) => ({ key: site.site_id, site_id: site.site_id }));
          return {
            ...current,
            sites: references,
            baseline_site_key: references[0]?.key ?? "",
          };
        });
      })
      .catch(() => {
        if (live)
          setCatalogError(
            "Catalog unavailable. You can still use the reference story or add explicit coordinates.",
          );
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(
    () => () => {
      requestVersion.current++;
      controller.current?.abort();
    },
    [],
  );

  const active = run?.cells.find((cell) => cell.cell_id === activeId) ?? null;
  const impacted = run
    ? findCell(run, run.profile.baseline_site_key, earliest)!
    : null;
  const alternatives = useMemo(
    () =>
      run && impacted ? eligibleAlternatives(run, earliest, impacted) : [],
    [run, impacted, earliest],
  );
  const selectedSite =
    run && active
      ? run.sites.find((site) => site.key === active.site_key)!
      : null;

  const resetResults = useCallback(() => {
    requestVersion.current++;
    controller.current?.abort();
    setRun(null);
    setDetail(null);
    setError("");
    setNotice("");
    setBusy(false);
    setTimePlaying(false);
    setSweeping(false);
    setReplayPlaying(false);
    setBrief(false);
    details.current.clear();
  }, []);
  function update(patch: Partial<StressProfile>) {
    resetResults();
    setProfile((current) => ({ ...current, ...patch }));
  }
  function addReference(site: StudySite) {
    if (profile.sites.length >= 3) {
      setError("A study supports at most three sites.");
      return;
    }
    if (profile.sites.some((entry) => entry.key === site.key)) {
      setError("This site is already selected.");
      return;
    }
    update({
      sites: [...profile.sites, site],
      baseline_site_key: profile.baseline_site_key || site.key,
    });
  }
  function removeReference(key: string) {
    const sites = profile.sites.filter((site) => site.key !== key);
    update({
      sites,
      baseline_site_key:
        profile.baseline_site_key === key
          ? (sites[0]?.key ?? "")
          : profile.baseline_site_key,
    });
  }
  function addCustom() {
    const latitude = Number(custom.latitude),
      longitude = Number(custom.longitude);
    if (
      !custom.name.trim() ||
      !custom.latitude.trim() ||
      !custom.longitude.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      latitude !== Number(latitude.toFixed(6)) ||
      longitude !== Number(longitude.toFixed(6))
    ) {
      setError(
        "Enter a name and valid coordinates with up to six decimal places (latitude ±90°, east longitude ±180°).",
      );
      return;
    }
    customSequence.current++;
    addReference({
      key: `point_${customSequence.current}`,
      name: custom.name.trim(),
      latitude_deg: latitude,
      longitude_deg: longitude,
    });
    setCustom({ name: "", latitude: "", longitude: "" });
  }
  function useMapPoint() {
    const site = mission.selectedSite;
    if (!site) return;
    if (catalog.some((entry) => entry.site_id === site.site_id))
      addReference({ key: site.site_id, site_id: site.site_id });
    else {
      customSequence.current++;
      addReference({
        key: `map_${customSequence.current}`,
        name: site.name,
        latitude_deg: Number(site.latitude_deg.toFixed(6)),
        longitude_deg: Number(
          (((site.longitude_deg + 180) % 360) - 180).toFixed(6),
        ),
      });
    }
  }
  async function analyze(event?: FormEvent, input = profile) {
    event?.preventDefault();
    resetResults();
    setBusy(true);
    const version = ++requestVersion.current;
    const request = new AbortController();
    controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 240000);
    try {
      const result = await createStudy(input, request.signal);
      if (version !== requestVersion.current) return;
      setRun(result);
      setActiveId(
        findCell(result, result.profile.baseline_site_key, 0)!.cell_id,
      );
      setEarliest(
        result.departure_offsets_hours.reduce(
          (best, offset) =>
            Math.abs(offset - 24) < Math.abs(best - 24) ? offset : best,
          0,
        ),
      );
      setCursor(0);
      setScene(0);
      setSetupOpen(false);
    } catch (reason) {
      if (version === requestVersion.current)
        setError(
          request.signal.aborted
            ? "Request stopped or timed out. Your profile is preserved. The server may still finish caching source data."
            : reason instanceof Error
              ? reason.message
              : "Could not evaluate the profile. Check the backend and retry.",
        );
    } finally {
      window.clearTimeout(timeout);
      if (version === requestVersion.current) setBusy(false);
    }
  }

  useEffect(() => {
    setTimePlaying(false);
    setCursor(0);
    setDetail(null);
    setDetailError("");
    if (!run || !activeId) {
      setDetailLoading(false);
      return;
    }
    const key = `${run.run_id}/${activeId}`;
    const cached = details.current.get(key);
    if (cached) {
      setDetail(cached);
      setDetailLoading(false);
      return;
    }
    const request = new AbortController();
    let live = true;
    setDetailLoading(true);
    getCell(run.run_id, activeId, request.signal)
      .then((result) => {
        if (live) {
          details.current.set(key, result);
          setDetail(result);
        }
      })
      .catch((reason) => {
        if (live && !request.signal.aborted)
          setDetailError(
            reason instanceof Error
              ? reason.message
              : "Could not load the saved cell.",
          );
      })
      .finally(() => {
        if (live) setDetailLoading(false);
      });
    return () => {
      live = false;
      request.abort();
    };
  }, [run, activeId]);

  useEffect(() => {
    if (!timePlaying || reduced || !run || !detail) return;
    const step = run.profile.sample_step_minutes / 60;
    const last = run.profile.mission_duration_hours - step;
    const increment =
      Math.max(1, Math.ceil(detail.scenario.timeline.length / 100)) * step;
    const timer = window.setInterval(
      () =>
        setCursor((current) => {
          const next = Math.min(last, current + increment);
          if (next >= last) setTimePlaying(false);
          return next;
        }),
      120,
    );
    return () => window.clearInterval(timer);
  }, [timePlaying, reduced, run, detail]);
  useEffect(() => {
    if (!sweeping || reduced || !run || !active) return;
    const rowKey = active.site_key;
    const timer = window.setInterval(
      () =>
        setActiveId((id) => {
          const current = run.cells.find((cell) => cell.cell_id === id)!;
          const index = run.departure_offsets_hours.indexOf(
            current.delay_hours,
          );
          if (index >= run.departure_offsets_hours.length - 1) {
            setSweeping(false);
            return id;
          }
          return findCell(run, rowKey, run.departure_offsets_hours[index + 1])!
            .cell_id;
        }),
      900,
    );
    return () => window.clearInterval(timer);
  }, [sweeping, reduced, run, active?.site_key]);
  useEffect(() => {
    if (reduced || !visible) {
      setTimePlaying(false);
      setSweeping(false);
      setReplayPlaying(false);
    }
  }, [reduced, visible]);

  function selectCell(id: string) {
    setActiveId(id);
    setSweeping(false);
    setReplayPlaying(false);
    setTimePlaying(false);
  }
  const applyScene = useCallback(
    (index: number) => {
      if (!run) return;
      setScene(index);
      setSweeping(false);
      setTimePlaying(false);
      const changed = findCell(run, run.profile.baseline_site_key, earliest)!;
      const target =
        index === 0
          ? findCell(run, run.profile.baseline_site_key, 0)!
          : index === 3
            ? (eligibleAlternatives(run, earliest, changed)[0] ?? changed)
            : changed;
      setActiveId(target.cell_id);
    },
    [run, earliest],
  );
  useEffect(() => {
    if (!replayPlaying || reduced) return;
    if (scene >= 3) {
      setReplayPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => applyScene(scene + 1), 4400);
    return () => window.clearTimeout(timer);
  }, [replayPlaying, reduced, scene, applyScene]);

  async function exportEvidence() {
    if (!run) return;
    setExporting(true);
    setError("");
    try {
      const evidence = await exportStudy(run.run_id);
      downloadJSON(
        {
          ...evidence,
          selection: {
            selected_cell_id: activeId,
            earliest_available_delay_hours: earliest,
          },
        },
        `helios-delay-study-${run.run_id.slice(0, 8)}.json`,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not export saved evidence.",
      );
    } finally {
      setExporting(false);
    }
  }
  const closeBrief = useCallback(() => setBrief(false), []);
  function openBrief() {
    setTimePlaying(false);
    setSweeping(false);
    setReplayPlaying(false);
    setBrief(true);
  }
  function syncDashboard() {
    if (!active || !selectedSite || !run) return;
    const source = catalog.find(
      (site) =>
        site.site_id === selectedSite.site_id &&
        site.latitude_deg === selectedSite.latitude_deg &&
        site.longitude_deg === selectedSite.longitude_deg,
    );
    mission.setSelectedSite(
      source ?? {
        site_id: selectedSite.site_id,
        name: selectedSite.name,
        region: "Delay Lab reference",
        latitude_deg: selectedSite.latitude_deg,
        longitude_deg: selectedSite.longitude_deg,
        source: selectedSite.source,
        coordinate_type: selectedSite.coordinate_type,
      },
    );
    mission.setMissionDates({
      startUtc: active.start_utc,
      endUtc: active.end_utc,
    });
    mission.setStepMinutes(run.profile.sample_step_minutes);
    mission.setCustomCoordinates(
      source
        ? null
        : {
            latitude_deg: selectedSite.latitude_deg,
            longitude_deg: selectedSite.longitude_deg,
          },
    );
    setNotice(
      "Site, mission window and sampling step copied to the shared dashboard. The study itself is unchanged.",
    );
  }
  function nameOf(site: StudySite) {
    return (
      site.name ??
      catalog.find((item) => item.site_id === site.site_id)?.name ??
      site.site_id ??
      site.key
    );
  }
  const sceneText =
    !run || !impacted
      ? ""
      : scene === 0
        ? "Start with the recorded original plan and the declared visibility requirements. Inspect its actual result before making a change."
        : scene === 1
          ? `Earliest departure moves to +${earliest} hours. The site and mission duration remain fixed; the environmental window changes.`
          : scene === 2
            ? impacted.status === "exceeds"
              ? `At least one declared requirement is exceeded: ${impacted.constraints
                  .filter((check) => check.status === "exceeds")
                  .map((check) => check.label.toLowerCase())
                  .join(", ")}. Inspect the measured duration and margin below.`
              : impacted.status === "unknown"
                ? "Required source data is incomplete. This run cannot establish whether all enabled constraints are met."
                : "The delayed original site still meets the enabled requirements at this sampling resolution. A recovery is not necessary under this profile."
            : alternatives.length
              ? "Compare an eligible tested alternative at or after availability. This is a screening option, not a certified landing recommendation."
              : "No eligible alternative was found in the tested domain. Keep the requirements visible rather than silently weakening them.";

  return (
    <div className="delay-lab-shell md:col-span-2">
      <section
        className={`delay-lab${reduced ? " dl-reduced" : ""}`}
        aria-labelledby="delay-lab-title"
      >
        <header className="dl-compact-header">
          <div>
            <p className="dl-eyebrow">DEPARTURE STRESS TEST</p>
            <h2 id="delay-lab-title">What changes if departure slips?</h2>
            <p>
              Compare sites across a range of delays using the same
              requirements.
            </p>
          </div>
          <div className="dl-compact-actions">
            <button
              className="dl-button"
              type="button"
              disabled={busy}
              onClick={() => {
                const preset = structuredClone(TRAINING_PROFILE);
                setProfile(preset);
                void analyze(undefined, preset);
              }}
            >
              <Sparkles size={14} />
              Run delay example
            </button>
            <button
              className="dl-primary"
              type="submit"
              form="delay-study-form"
              disabled={busy || !profile.sites.length}
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (form && !form.checkValidity()) {
                  event.preventDefault();
                  setSetupOpen(true);
                  requestAnimationFrame(() => form.reportValidity());
                }
              }}
            >
              {busy ? "Comparing…" : "Compare delays"}
              <ArrowRight size={15} />
            </button>
          </div>
        </header>
        <div className="dl-quick-profile">
          <div>
            <strong>
              {profile.sites.map((site) => nameOf(site)).join(" / ") ||
                "Loading sites…"}
            </strong>
            <span>
              {profile.mission_duration_hours} h mission ·{" "}
              {profile.nominal_start_utc.slice(0, 10)} UTC · delays +0–
              {profile.max_delay_hours} h
            </span>
            <small className="dl-requirement-summary">
              {(Object.keys(requirementLabels) as (keyof StudyConstraints)[])
                .filter((key) => profile.constraints[key] !== null)
                .map(
                  (key) =>
                    `${key === "maximum_darkness_hours" ? "Darkness ≤" : key === "maximum_earth_outage_hours" ? "Earth outage ≤" : "Joint view ≥"}${hour(profile.constraints[key])}`,
                )
                .join(" · ") || "No requirements enabled"}
            </small>
          </div>
          <button
            type="button"
            className="dl-button dl-small"
            aria-expanded={setupOpen}
            aria-controls="delay-study-settings"
            disabled={busy}
            onClick={() => setSetupOpen((current) => !current)}
          >
            <SlidersHorizontal size={14} />
            {setupOpen ? "Close settings" : "Edit study"}
          </button>
        </div>
        <div id="delay-study-settings" hidden={!setupOpen}>
          <form id="delay-study-form" className="dl-profile" onSubmit={analyze}>
            <fieldset disabled={busy}>
              <div className="dl-section-heading">
                <div>
                  <h3>Study settings</h3>
                </div>
              </div>
              <p className="dl-caption">
                Define sites, mission windows and visibility requirements.
                Default limits are illustrative training assumptions.
              </p>
              {catalogError && <p className="dl-note">{catalogError}</p>}
              <div className="dl-profile-grid">
                <label>
                  Study title
                  <input
                    required
                    maxLength={100}
                    value={profile.title}
                    onChange={(event) => update({ title: event.target.value })}
                  />
                </label>
                <label>
                  Nominal departure (UTC)
                  <input
                    required
                    type="datetime-local"
                    value={profile.nominal_start_utc.slice(0, 16)}
                    onChange={(event) =>
                      update({
                        nominal_start_utc: event.target.value
                          ? `${event.target.value}:00Z`
                          : "",
                      })
                    }
                  />
                </label>
              </div>
              <div className="dl-site-list">
                {profile.sites.map((site) => (
                  <div className="dl-site-chip" key={site.key}>
                    <div>
                      <span>
                        {site.key === profile.baseline_site_key
                          ? "REFERENCE"
                          : "ALLOWED ALTERNATIVE"}
                      </span>
                      <strong>{nameOf(site)}</strong>
                      {site.latitude_deg != null && (
                        <small>
                          {site.latitude_deg}°, {site.longitude_deg}° E · custom
                          reference
                        </small>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${nameOf(site)}`}
                      onClick={() => removeReference(site.key)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="dl-add-sites">
                <select
                  aria-label="Catalog site to add"
                  value={addCatalog}
                  disabled={profile.sites.length >= 3}
                  onChange={(event) => setAddCatalog(event.target.value)}
                >
                  <option value="">Choose a catalog region…</option>
                  {catalog
                    .filter(
                      (site) =>
                        !profile.sites.some(
                          (entry) => entry.site_id === site.site_id,
                        ),
                    )
                    .map((site) => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="dl-button"
                  disabled={!addCatalog || profile.sites.length >= 3}
                  onClick={() => {
                    addReference({ key: addCatalog, site_id: addCatalog });
                    setAddCatalog("");
                  }}
                >
                  <Plus size={14} /> Add site
                </button>
                <button
                  type="button"
                  className="dl-button"
                  disabled={!mission.selectedSite || profile.sites.length >= 3}
                  onClick={useMapPoint}
                >
                  Use map selection
                </button>
              </div>
              <details className="dl-custom">
                <summary>Add an explicit reference point</summary>
                <div className="dl-custom-grid">
                  <label>
                    Name
                    <input
                      maxLength={80}
                      value={custom.name}
                      onChange={(event) =>
                        setCustom({ ...custom, name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Latitude (°)
                    <input
                      type="number"
                      step="0.000001"
                      min="-90"
                      max="90"
                      value={custom.latitude}
                      onChange={(event) =>
                        setCustom({ ...custom, latitude: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    East longitude (°)
                    <input
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={custom.longitude}
                      onChange={(event) =>
                        setCustom({ ...custom, longitude: event.target.value })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="dl-button"
                    disabled={profile.sites.length >= 3}
                    onClick={addCustom}
                  >
                    Add point
                  </button>
                </div>
              </details>
              <div className="dl-settings-grid">
                <label>
                  Original reference site
                  <select
                    required
                    value={profile.baseline_site_key}
                    onChange={(event) =>
                      update({ baseline_site_key: event.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select a site
                    </option>
                    {profile.sites.map((site) => (
                      <option key={site.key} value={site.key}>
                        {nameOf(site)}
                      </option>
                    ))}
                  </select>
                </label>
                {(
                  [
                    ["mission_duration_hours", "Mission duration (h)", 1, 168],
                    ["max_delay_hours", "Test delays through (h)", 0, 168],
                    ["departure_step_hours", "Departure spacing (h)", 1, 24],
                  ] as const
                ).map(([key, label, min, max]) => (
                  <label key={key}>
                    {label}
                    <input
                      required
                      type="number"
                      min={min}
                      max={max}
                      step="1"
                      value={Number.isFinite(profile[key]) ? profile[key] : ""}
                      onChange={(event) =>
                        update({
                          [key]:
                            event.target.value === ""
                              ? NaN
                              : Number(event.target.value),
                        })
                      }
                    />
                  </label>
                ))}
                <label>
                  Scientific sample step
                  <select
                    value={profile.sample_step_minutes}
                    onChange={(event) =>
                      update({
                        sample_step_minutes: Number(event.target.value),
                      })
                    }
                  >
                    {[5, 15, 30, 60].map((step) => (
                      <option key={step} value={step}>
                        {step} minutes
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="dl-thresholds">
                {(
                  Object.keys(requirementLabels) as (keyof StudyConstraints)[]
                ).map((key) => (
                  <div key={key}>
                    <label className="dl-toggle">
                      <input
                        type="checkbox"
                        checked={profile.constraints[key] !== null}
                        onChange={(event) =>
                          update({
                            constraints: {
                              ...profile.constraints,
                              [key]: event.target.checked
                                ? DEFAULT_PROFILE.constraints[key]
                                : null,
                            },
                          })
                        }
                      />
                      {requirementLabels[key]}
                    </label>
                    <label className="dl-threshold-number">
                      <input
                        aria-label={`${requirementLabels[key]} hours`}
                        type="number"
                        min="0"
                        max="168"
                        step="0.25"
                        disabled={profile.constraints[key] === null}
                        value={profile.constraints[key] ?? ""}
                        onChange={(event) =>
                          update({
                            constraints: {
                              ...profile.constraints,
                              [key]:
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                            },
                          })
                        }
                      />
                      <span>hours</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="dl-submit">
                <p>
                  Up to 3 sites · 25 departure columns · 2,000 source intervals
                  per site.
                  <br />
                  Disabled requirements are not evaluated; zero is a real limit.
                </p>
                <button
                  className="dl-primary"
                  type="submit"
                  disabled={!profile.sites.length || !profile.nominal_start_utc}
                >
                  {busy ? "Evaluating NASA data…" : "Run delay stress test"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </fieldset>
          </form>
        </div>
        {busy && (
          <div className="dl-loading" role="status">
            <div className="dl-scanner" aria-hidden="true" />
            <div>
              <strong>Building one extended dataset per site</strong>
              <p>
                Departure windows are evaluated locally. No synthetic fallback
                is used.
              </p>
            </div>
            <button
              type="button"
              className="dl-button"
              onClick={() => controller.current?.abort()}
            >
              Cancel request
            </button>
          </div>
        )}
        {error && (
          <p className="dl-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="dl-note" role="status">
            {notice}
          </p>
        )}
        {!run && !busy && !error && (
          <div className="dl-welcome">
            <Radio size={25} />
            <div>
              <h3>Your delay comparison is ready.</h3>
              <p>
                Choose Compare delays, or run the cached delay example in one
                click.
              </p>
            </div>
            <ChevronRight size={20} />
          </div>
        )}
        {run && active && impacted && (
          <div className="dl-results">
            <div className="dl-run-bar">
              <span>
                <Check size={14} /> {run.cells.length} tested windows ·{" "}
                {run.datasets.length} source datasets ·{" "}
                {run.profile.sample_step_minutes}-minute samples
              </span>
              <div>
                <button
                  type="button"
                  className="dl-button dl-small"
                  disabled={exporting}
                  onClick={exportEvidence}
                >
                  <Download size={14} />
                  {exporting ? "Preparing…" : "Evidence JSON"}
                </button>
                <button
                  type="button"
                  className="dl-button dl-small"
                  onClick={openBrief}
                >
                  Decision brief
                </button>
              </div>
            </div>
            <div className="dl-departure-controls">
              <label>
                Earliest available departure: +{earliest} h
                <select
                  aria-label="Earliest available departure delay"
                  value={earliest}
                  onChange={(event) => {
                    setEarliest(Number(event.target.value));
                    setReplayPlaying(false);
                  }}
                >
                  {run.departure_offsets_hours.map((delay) => (
                    <option key={delay} value={delay}>
                      +{delay} h ·{" "}
                      {utcLabel(
                        findCell(run, run.profile.baseline_site_key, delay)!
                          .start_utc,
                      )}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="dl-button"
                disabled={reduced}
                onClick={() => {
                  setReplayPlaying(false);
                  setTimePlaying(false);
                  if (sweeping) setSweeping(false);
                  else {
                    if (
                      active.delay_hours ===
                      run.departure_offsets_hours[
                        run.departure_offsets_hours.length - 1
                      ]
                    )
                      setActiveId(findCell(run, active.site_key, 0)!.cell_id);
                    setSweeping(true);
                  }
                }}
              >
                {sweeping ? <Pause size={14} /> : <Play size={14} />}{" "}
                {sweeping ? "Pause sweep" : "Animate delay sweep"}
              </button>
            </div>
            <DelayMatrix
              run={run}
              selected={activeId}
              earliest={earliest}
              onSelect={selectCell}
            />
            <div className="dl-analysis-grid">
              <div className="dl-options">
                <p className="dl-eyebrow">03 / COMPARE ELIGIBLE OPTIONS</p>
                <h3>What remains available?</h3>
                <p className="dl-muted">
                  Starts at or after +{earliest} h and meets every enabled
                  requirement. Ordered by departure, retaining the original site
                  on a tie; these are screened options for the advisor handoff.
                </p>
                <div className={`dl-impact dl-${impacted.status}`}>
                  <span>Original site at availability</span>
                  <strong>{statusLabel[impacted.status]}</strong>
                  <p>
                    {
                      impacted.constraints.find(
                        (check) => check.key === impacted.binding_constraint,
                      )?.label
                    }
                    :{" "}
                    {hour(
                      impacted.constraints.find(
                        (check) => check.key === impacted.binding_constraint,
                      )?.measured_hours,
                    )}
                  </p>
                </div>
                {alternatives.length ? (
                  alternatives.slice(0, 3).map((cell, index) => (
                    <button
                      type="button"
                      className="dl-option"
                      aria-pressed={activeId === cell.cell_id}
                      key={cell.cell_id}
                      onClick={() => selectCell(cell.cell_id)}
                    >
                      <span>0{index + 1}</span>
                      <div>
                        <strong>
                          {
                            run.sites.find(
                              (site) => site.key === cell.site_key,
                            )!.name
                          }
                        </strong>
                        <p>
                          +{cell.delay_hours} h departure ·{" "}
                          {cell.delay_hours - earliest} h additional waiting
                        </p>
                        <small>
                          Earth outage{" "}
                          {hour(cell.metrics.longest_earth_outage_hours)} ·
                          darkness {hour(cell.metrics.longest_darkness_hours)}
                        </small>
                      </div>
                      <ChevronRight size={17} />
                    </button>
                  ))
                ) : (
                  <div className="dl-no-options">
                    <ShieldCheck size={23} />
                    <strong>No eligible tested alternative</strong>
                    <p>
                      Requirements were not relaxed. Unknown cells are excluded.
                      Expand the study or explicitly revise the requirements
                      before running again.
                    </p>
                  </div>
                )}
                <div className="dl-domain">
                  <h4>The search has boundaries.</h4>
                  <p>
                    {run.sites.length} sites ·{" "}
                    {run.departure_offsets_hours.length} departures · +0–
                    {run.profile.max_delay_hours} h. The earliest qualifying
                    tested option is not a continuous-time optimum, and coverage
                    is not confidence in mission success.
                  </p>
                </div>
                <button
                  type="button"
                  className="dl-primary"
                  onClick={openBrief}
                >
                  Explain this inspected option
                  <ArrowRight size={16} />
                </button>
              </div>
              <ScenarioInspector
                run={run}
                cell={active}
                detail={detail}
                loading={detailLoading}
                error={detailError}
                cursor={cursor}
                setCursor={(value) => {
                  setCursor(value);
                  setTimePlaying(false);
                }}
                playing={timePlaying}
                onPlay={() => {
                  setSweeping(false);
                  setReplayPlaying(false);
                  if (
                    cursor >=
                    run.profile.mission_duration_hours -
                      run.profile.sample_step_minutes / 60
                  )
                    setCursor(0);
                  setTimePlaying((value) => !value);
                }}
                reduced={reduced}
                onSync={syncDashboard}
              />
            </div>
            <details
              className="dl-story-details"
              onToggle={(event) => {
                if (!event.currentTarget.open) setReplayPlaying(false);
              }}
            >
              <summary>
                <Play size={13} />
                Decision replay
              </summary>{" "}
              <div className="dl-replay">
                <div className="dl-section-heading">
                  <div>
                    <p className="dl-eyebrow">02 / REHEARSE THE CHANGE</p>
                    <h3>One plan. Four moments.</h3>
                  </div>
                  <button
                    type="button"
                    className="dl-button"
                    disabled={reduced}
                    onClick={() => {
                      setSweeping(false);
                      if (replayPlaying) setReplayPlaying(false);
                      else {
                        applyScene(0);
                        setReplayPlaying(true);
                      }
                    }}
                  >
                    {replayPlaying ? <Pause size={14} /> : <Play size={14} />}{" "}
                    {replayPlaying ? "Pause replay" : "Play decision story"}
                  </button>
                </div>
                <div className="dl-scenes">
                  {sceneLabels.map((label, index) => (
                    <button
                      type="button"
                      key={label}
                      aria-pressed={scene === index}
                      onClick={() => {
                        setReplayPlaying(false);
                        applyScene(index);
                      }}
                    >
                      <span>0{index + 1}</span>
                      {label}
                      <i
                        style={{
                          transform: `scaleX(${scene > index ? 1 : scene === index ? 0.55 : 0})`,
                        }}
                      />
                    </button>
                  ))}
                </div>
                <p className="dl-scene-copy" key={scene}>
                  {sceneText}
                </p>
              </div>
            </details>
            <details className="dl-run-provenance">
              <summary>
                Recorded datasets, model assumptions & Member 6 handoff
              </summary>
              <p>
                Run {run.run_id} · {run.algorithm_version} ·{" "}
                {utcLabel(run.created_utc)}. Profile changes clear the current
                result rather than relabeling old measurements.
              </p>
              {run.datasets.map((dataset) => (
                <div key={dataset.site_key}>
                  <strong>
                    {
                      run.sites.find((site) => site.key === dataset.site_key)
                        ?.name
                    }
                  </strong>
                  <p>
                    {dataset.sample_count} source epochs · {dataset.source} ·
                    Retrieved{" "}
                    {dataset.retrieved_utc
                      ? utcLabel(dataset.retrieved_utc)
                      : "not recorded"}
                  </p>
                  <code>{dataset.sha256}</code>
                  {dataset.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ))}
              <ul>
                {run.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
              <p>
                The exported evaluated cells and constraint facts are the
                structured handoff for Member 6. This module does not invoke an
                LLM or replace the advisor.
              </p>
            </details>
          </div>
        )}
        <footer className="dl-footer">
          <label className="dl-motion-toggle">
            <input
              type="checkbox"
              checked={reduced}
              disabled={prefersReduced}
              onChange={(event) => setManualReduced(event.target.checked)}
            />
            Reduce animation
          </label>
          <FlaskConical size={14} />
          <span>
            Geometric screening · terrain and hardware effects excluded.
          </span>
          <button
            type="button"
            onClick={() => {
              resetResults();
              setProfile((current) => ({
                ...structuredClone(DEFAULT_PROFILE),
                sites: current.sites,
                baseline_site_key: current.baseline_site_key,
              }));
            }}
          >
            <RotateCcw size={13} /> Reset requirements
          </button>
        </footer>
      </section>
      {brief && run && active && (
        <DecisionBrief
          run={run}
          chosen={active}
          earliest={earliest}
          onClose={closeBrief}
          onExport={exportEvidence}
        />
      )}
    </div>
  );
}
