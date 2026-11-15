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
  id,
  icon,
  children,
}: ModuleCardProps) {
  return (
    <section
      id={id}
      className="mission-panel rounded-2xl border border-sky-200/15 bg-[#081224]/50 p-5 sm:p-6 text-slate-100 shadow-lg backdrop-blur-md"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-sky-200/12 pb-3.5">
        <h2 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {icon && (
          <span className="mission-panel__icon text-sky-200" aria-hidden="true">
            {icon}
          </span>
        )}
      </header>
      <div className="text-[15px] sm:text-base text-slate-200">{children}</div>
    </section>
  );
}
