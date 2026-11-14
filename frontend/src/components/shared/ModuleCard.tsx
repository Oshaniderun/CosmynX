import type { ReactNode } from "react";

interface ModuleCardProps {
  title: string;
  owner: string;
  branch: string;
  children?: ReactNode;
}

export function ModuleCard({
  title,
  owner,
  branch,
  children,
}: ModuleCardProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
            {owner}
          </span>
          <code className="rounded bg-slate-950 px-2 py-0.5 text-amber-400">
            {branch}
          </code>
        </div>
      </div>
      <div className="text-sm text-slate-400">{children}</div>
    </section>
  );
}
