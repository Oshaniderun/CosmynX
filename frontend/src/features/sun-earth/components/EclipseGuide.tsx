import { BatteryCharging, Sun } from "lucide-react";
import type { LunarEclipse } from "../services/lunarEclipses";

type EclipseStage = LunarEclipse["stages"][number];

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const moonShadows = [
  "bg-slate-200",
  "bg-[linear-gradient(100deg,#e2e8f0_46%,#8a8796_85%)]",
  "bg-[linear-gradient(100deg,#e2e8f0_34%,#a44c38_66%)]",
  "bg-[radial-gradient(circle_at_33%_30%,#f0a37d,#a6452e_57%,#49201f)]",
  "bg-[linear-gradient(100deg,#a44c38_34%,#e2e8f0_66%)]",
  "bg-[linear-gradient(100deg,#8a8796_15%,#e2e8f0_54%)]",
  "bg-slate-200",
];

export function EclipsePurpose() {
  return (
    <aside className="flex gap-3 border-b border-amber-300/15 bg-gradient-to-r from-amber-400/10 via-[#121b2a] to-[#0c1421] px-4 py-4 sm:px-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-amber-200">
        <BatteryCharging size={18} aria-hidden="true" />
      </div>
      <div className="max-w-3xl">
        <h3 className="text-sm font-semibold text-amber-100">Why this matters for a lunar mission</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">
          Earth can block direct sunlight even when the Sun is above a landing site’s horizon.
          Replay a past eclipse to see when a solar-powered lander might need backup power and when sunlight returns.
        </p>
      </div>
    </aside>
  );
}

export function EclipseGuide({
  event,
  stage,
  onSeek,
}: {
  event: LunarEclipse;
  stage: EclipseStage;
  onSeek: (time: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div role="group" aria-label="Eclipse stages" className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4 lg:grid-cols-7">
        {event.stages.map((item, index) => {
          const active = item === stage;
          return (
            <button
              key={item.label}
              type="button"
              aria-current={active ? "step" : undefined}
              aria-label={item.label}
              onClick={() => onSeek(Math.round((item.start + item.end) / 2))}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/60 px-2 py-2 text-xs font-medium text-slate-300 hover:border-amber-300/50 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300 aria-[current=step]:border-amber-300/70 aria-[current=step]:bg-amber-300/10 aria-[current=step]:text-amber-100"
            >
              <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ring-1 ring-white/15 ${moonShadows[index]}`} />
              {item.shortLabel}
            </button>
          );
        })}
      </div>

      <article className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0e1725]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-700/80 px-4 py-3">
          <h3 aria-live="polite" className="text-base font-semibold text-slate-100">{stage.label}</h3>
          <p className="text-xs tabular-nums text-slate-400">{clock.format(stage.start)}–{clock.format(stage.end)} UTC</p>
        </div>
        <div className="grid divide-y divide-slate-700/80 md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-4">
            <h4 className="text-xs font-medium text-slate-400">What you’re seeing</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{stage.scene}</p>
          </div>
          <div className="bg-amber-300/5 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-amber-200">
              <Sun size={14} aria-hidden="true" /> Effect at the landing site
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
              <strong className="font-semibold text-amber-100">{stage.sunlight}.</strong> {stage.impact}
            </p>
          </div>
        </div>
      </article>

      <div className="space-y-2 text-xs leading-relaxed text-slate-400">
        <p>
          NASA’s Lunar Reconnaissance Orbiter shuts down most instruments during lunar eclipses to conserve energy.{" "}
          <a
            href="https://science.nasa.gov/moon/eclipses/#eclipses-and-spacecraft"
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 underline decoration-sky-300/40 underline-offset-2 hover:text-sky-100"
          >
            Read the NASA example
          </a>
        </p>
        <p>Historical replay. Sunlight effects are qualitative. The scene uses illustrative sizes and distances.</p>
      </div>
    </div>
  );
}
