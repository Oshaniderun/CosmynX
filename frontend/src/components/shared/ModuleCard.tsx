import type { ReactNode } from "react";

interface ModuleCardProps {
  title: string;
  eyebrow?: string;
  id?: string;
  icon?: ReactNode;
  owner?: string;
  branch?: string;
  children?: ReactNode;
}

export function ModuleCard({
  title,
  eyebrow,
  id,
  icon,
  owner,
  branch,
  children,
}: ModuleCardProps) {
  return (
    <section id={id} className="mission-panel rounded-xl border border-[#262626] bg-[#141414] p-5 sm:p-6 transition-all duration-200">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3.5">
        <div className="flex flex-col gap-1">
          {eyebrow && <p className="panel-eyebrow font-mono text-xs text-[#B5A38D] tracking-wider uppercase">{eyebrow}</p>}
          <h2 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-[#F1F0EC]">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {icon && <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#B5A38D]" aria-hidden="true">{icon}</span>}
          {owner && (
            <span className="rounded border border-[#2A2A2A] bg-[#171717] px-2 py-0.5 font-mono text-xs font-medium text-[#A8A8A8]">
              {owner}
            </span>
          )}
          {branch && (
            <code className="rounded border border-[#2A2A2A] bg-[#171717] px-2 py-0.5 font-mono text-xs text-[#B5A38D]">
              {branch}
            </code>
          )}
        </div>
      </header>
      <div className="text-[14px] sm:text-base text-[#A8A8A8]">{children}</div>
    </section>
  );
}
