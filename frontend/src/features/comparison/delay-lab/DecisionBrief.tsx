import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Download, Printer, X } from "lucide-react";
import { hour, statusLabel, utcLabel } from "./stressTestService";
import type { StressCell, StudyRun } from "./stressTestService";

export function DecisionBrief({
  run,
  chosen,
  earliest,
  onClose,
  onExport,
}: {
  run: StudyRun;
  chosen: StressCell;
  earliest: number;
  onClose: () => void;
  onExport: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const site = run.sites.find((item) => item.key === chosen.site_key)!;
  const reference = run.cells.find(
    (cell) =>
      cell.site_key === run.profile.baseline_site_key && cell.delay_hours === 0,
  )!;
  const impacted = run.cells.find(
    (cell) =>
      cell.site_key === run.profile.baseline_site_key &&
      cell.delay_hours === earliest,
  )!;
  const qualifies = chosen.status === "meets" && chosen.delay_hours >= earliest;
  const source = run.datasets.find(
    (item) => item.site_key === chosen.site_key,
  )!;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const targets = Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          "button,a[href],[tabindex='0']",
        ) ?? [],
      );
      const first = targets[0],
        last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("keydown", keys);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);
  return createPortal(
    <div className="dl-brief-root" role="presentation">
      <div
        className="dl-brief"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delay-brief-title"
        ref={dialog}
      >
        <div className="dl-brief-actions">
          <button onClick={onExport}>
            <Download size={16} /> Full evidence JSON
          </button>
          <button onClick={() => window.print()}>
            <Printer size={16} /> Print / Save PDF
          </button>
          <button
            ref={close}
            onClick={onClose}
            aria-label="Close decision brief"
          >
            <X size={19} />
          </button>
        </div>
        <p className="dl-eyebrow">HELIOS · REPRODUCIBLE DECISION BRIEF</p>
        <h2 id="delay-brief-title">{run.profile.title}</h2>
        <p className="dl-brief-verdict">
          {qualifies
            ? "Inspected option meets the declared constraints at an available departure."
            : "This inspected option does not qualify at the declared availability. No flight recommendation is made."}
        </p>
        <div className="dl-brief-facts">
          <div>
            <small>Inspected option</small>
            <strong>{site.name}</strong>
            <span>
              {site.latitude_deg}°, {site.longitude_deg}° east
            </span>
          </div>
          <div>
            <small>Window / UTC</small>
            <strong>{utcLabel(chosen.start_utc)}</strong>
            <span>Until {utcLabel(chosen.end_utc)}</span>
          </div>
          <div>
            <small>Sampling / scope</small>
            <strong>{run.profile.sample_step_minutes} min · geometric</strong>
            <span>
              {run.profile.mission_duration_hours} h mission ·{" "}
              {statusLabel[chosen.status]}
            </span>
          </div>
        </div>
        <h3>What changed?</h3>
        <p>
          The original reference departs at {utcLabel(reference.start_utc)}.
          Earliest availability is +{earliest} h from nominal. The original site
          at that departure{" "}
          <strong>
            {impacted.status === "meets"
              ? "meets the enabled requirements"
              : impacted.status === "exceeds"
                ? "exceeds at least one requirement"
                : "has unknown required measurements"}
          </strong>
          . The inspected option{" "}
          {chosen.site_key === reference.site_key
            ? "retains the original site"
            : `changes the site to ${site.name}`}{" "}
          and departs {Math.abs(chosen.delay_hours - earliest)} h{" "}
          {chosen.delay_hours < earliest ? "before" : "after"} that
          availability.
        </p>
        <table aria-label="Original, delayed and inspected evidence">
          <thead>
            <tr>
              <th>Sampled metric</th>
              <th>Original</th>
              <th>At availability</th>
              <th>Inspected</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Continuous darkness", "longest_darkness_hours"],
                ["Earth interruption", "longest_earth_outage_hours"],
                ["Joint visibility", "simultaneous_visibility_hours"],
              ] as const
            ).map(([label, key]) => (
              <tr key={key}>
                <td>{label}</td>
                <td>{hour(reference.metrics[key])}</td>
                <td>{hour(impacted.metrics[key])}</td>
                <td>{hour(chosen.metrics[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>Declared requirement</th>
              <th>Limit</th>
              <th>Measured</th>
              <th>Margin</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {chosen.constraints.map((check) => (
              <tr key={check.key}>
                <td>{check.label}</td>
                <td>
                  {check.key.startsWith("minimum") ? "≥" : "≤"}{" "}
                  {hour(check.limit_hours)}
                </td>
                <td>{hour(check.measured_hours)}</td>
                <td>{hour(check.margin_hours)}</td>
                <td>{statusLabel[check.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Disabled constraints:{" "}
          {Object.entries(run.profile.constraints)
            .filter(([, value]) => value === null)
            .map(([key]) => key.split("_").join(" "))
            .join(", ") || "None"}
          . Coverage: Sun {(chosen.sun_coverage_fraction * 100).toFixed(1)}%;
          Earth {(chosen.earth_coverage_fraction * 100).toFixed(1)}%.
        </p>
        <h3>Evidence and limitations</h3>
        <p>
          Source: {source.source}. Retrieved:{" "}
          {source.retrieved_utc
            ? utcLabel(source.retrieved_utc)
            : "not recorded in the source snapshot"}
          . Coordinates: {site.coordinate_type.split("_").join(" ")}.
        </p>
        <p className="dl-hash">
          Dataset SHA-256: {source.sha256}
          <br />
          Run: {run.run_id} · {run.algorithm_version} · Created{" "}
          {utcLabel(run.created_utc)}
        </p>
        <ul>
          {run.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
        <p className="dl-brief-footer">
          A geometric mission-screening/training prototype. These thresholds are
          declared assumptions, not certified hardware limits. This brief
          records the inspected option; it does not establish landing safety or
          mission feasibility.
        </p>
      </div>
    </div>,
    document.body,
  );
}
