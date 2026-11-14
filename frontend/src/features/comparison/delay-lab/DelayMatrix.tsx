import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { Check, CircleHelp, Minus, MousePointer2 } from "lucide-react";
import { statusLabel, utcLabel } from "./stressTestService";
import type { StudyRun } from "./stressTestService";

export function DelayMatrix({
  run,
  selected,
  earliest,
  onSelect,
}: {
  run: StudyRun;
  selected: string;
  earliest: number;
  onSelect: (id: string) => void;
}) {
  const table = useRef<HTMLTableElement>(null);
  const columns = run.departure_offsets_hours.length;
  function navigate(
    event: KeyboardEvent<HTMLButtonElement>,
    row: number,
    column: number,
  ) {
    let r = row,
      c = column;
    if (event.key === "ArrowRight") c++;
    else if (event.key === "ArrowLeft") c--;
    else if (event.key === "ArrowDown") r++;
    else if (event.key === "ArrowUp") r--;
    else if (event.key === "Home") c = 0;
    else if (event.key === "End") c = columns - 1;
    else return;
    event.preventDefault();
    r = Math.max(0, Math.min(run.sites.length - 1, r));
    c = Math.max(0, Math.min(columns - 1, c));
    const next = run.cells.find(
      (cell) =>
        cell.site_key === run.sites[r].key &&
        cell.delay_hours === run.departure_offsets_hours[c],
    )!;
    onSelect(next.cell_id);
    table.current
      ?.querySelectorAll<HTMLButtonElement>("button[data-cell]")
      [r * columns + c]?.focus();
  }
  return (
    <div className="dl-matrix-block">
      <div className="dl-section-heading">
        <div>
          <p className="dl-eyebrow">THE DEPARTURE LANDSCAPE</p>
          <h3>How much does a delay change?</h3>
        </div>
        <div className="dl-legend">
          <span className="dl-meets">
            <Check size={13} /> Meets
          </span>
          <span className="dl-exceeds">
            <Minus size={13} /> Exceeds
          </span>
          <span className="dl-unknown">
            <CircleHelp size={13} /> Unknown
          </span>
        </div>
      </div>
      <p className="dl-muted">
        <MousePointer2 size={13} /> Select a cell to inspect its evidence. Arrow
        keys move between departures and sites. These are tested windows, not
        probabilities.
      </p>
      <div
        className="dl-matrix-scroll"
        role="region"
        aria-label="Scrollable site by departure comparison"
      >
        <table ref={table} className="dl-matrix">
          <caption>
            Site by tested departure delay. A cell meets only enabled geometric
            visibility constraints. Unknown does not mean a failed constraint.
          </caption>
          <thead>
            <tr>
              <th scope="col">Reference point / site</th>
              {run.departure_offsets_hours.map((offset) => (
                <th
                  scope="col"
                  key={offset}
                  className={offset === earliest ? "dl-available" : ""}
                >
                  {offset === 0 ? "Nominal" : `+${offset} h`}
                  {offset === earliest && <small>Available from</small>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {run.sites.map((site, rowIndex) => {
              const summary = run.summaries.find(
                (item) => item.site_key === site.key,
              )!;
              return (
                <tr key={site.key}>
                  <th scope="row">
                    <strong>{site.name}</strong>
                    <span>
                      {site.latitude_deg}°, {site.longitude_deg}° E
                    </span>
                    <small>
                      {summary.meets}/{columns} meet · {summary.unknown} unknown
                    </small>
                    <small>
                      {summary.first_exceeding_delay_hours === null
                        ? "No known exceedance"
                        : `First exceeds: +${summary.first_exceeding_delay_hours} h`}
                    </small>
                  </th>
                  {run.departure_offsets_hours.map((offset, columnIndex) => {
                    const cell = run.cells.find(
                      (item) =>
                        item.site_key === site.key &&
                        item.delay_hours === offset,
                    )!;
                    const Icon =
                      cell.status === "meets"
                        ? Check
                        : cell.status === "exceeds"
                          ? Minus
                          : CircleHelp;
                    const baseline =
                      site.key === run.profile.baseline_site_key &&
                      offset === 0;
                    return (
                      <td key={offset}>
                        <button
                          data-cell={cell.cell_id}
                          data-status={cell.status}
                          aria-pressed={selected === cell.cell_id}
                          tabIndex={selected === cell.cell_id ? 0 : -1}
                          aria-label={`${site.name}, ${offset === 0 ? "nominal departure" : `plus ${offset} hours`}, ${statusLabel[cell.status]}`}
                          title={`${utcLabel(cell.start_utc)} · ${cell.constraints.find((check) => check.key === cell.binding_constraint)?.label}`}
                          style={{
                            animationDelay: `${Math.min((rowIndex * columns + columnIndex) * 12, 350)}ms`,
                          }}
                          onClick={() => onSelect(cell.cell_id)}
                          onKeyDown={(event) =>
                            navigate(event, rowIndex, columnIndex)
                          }
                        >
                          <Icon size={19} aria-hidden="true" />
                          <span>{statusLabel[cell.status]}</span>
                          {baseline && <small>REFERENCE</small>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="dl-caption">
        Swipe or scroll within the matrix for more departures. Later departures
        can improve again; the first exceedance is not a maximum safe delay.
      </p>
    </div>
  );
}
