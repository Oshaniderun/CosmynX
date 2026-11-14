import { Moon } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Moon className="h-6 w-6 text-amber-400" />
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-slate-100">
              HELIOS
            </h1>
            <p className="text-xs text-slate-400">
              AI-Powered Lunar Landing Site Navigator
            </p>
          </div>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
          NASA Space Apps 2026
        </span>
      </div>
    </header>
  );
}
