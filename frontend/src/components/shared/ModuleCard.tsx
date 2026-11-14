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
    <section className="glass-panel rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-white/[0.14]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-3.5">
        <h2 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-slate-100">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/[0.08] bg-[#0D182A]/70 px-2.5 py-1 font-mono text-xs font-medium text-slate-300">
            {owner}
          </span>
          <code className="rounded-md border border-amber-400/25 bg-amber-950/30 px-2.5 py-1 font-mono text-xs text-amber-300">
            {branch}
          </code>
        </div>
      </div>
      <div className="text-[15px] sm:text-base text-slate-300">{children}</div>
    </section>
  );
}
