import type { ReactNode } from "react";

interface ModuleCardProps {
  title: string;
  eyebrow?: string;
  id?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function ModuleCard({ title, eyebrow, id, icon, children }: ModuleCardProps) {
  return (
    <section id={id} className="mission-panel">
      <header className="mission-panel__header">
        <div className="mission-panel__heading">
          {eyebrow && <p className="panel-eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {icon && <span className="mission-panel__icon" aria-hidden="true">{icon}</span>}
      </header>
      <div className="mission-panel__body">{children}</div>
    </section>
  );
}
