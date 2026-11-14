import { useState } from "react";
import { ArrowRightLeft, Clock3 } from "lucide-react";
import { ComparisonPanel } from "./ComparisonPanel";
import { DelayLabPanel } from "../delay-lab/DelayLabPanel";
import "../workspaceComparison.css";

export function ComparisonWorkspace({ active }: { active: boolean }) {
  const [mode, setMode] = useState("sites");
  const [delayVisited, setDelayVisited] = useState(false);
  return (
    <div className="comparison-workspace">
      <div className="cw-mode-bar">
        <div
          className="cw-mode-switch"
          role="group"
          aria-label="Comparison mode"
        >
          <button
            type="button"
            aria-pressed={mode === "sites"}
            aria-controls="site-comparison"
            onClick={() => setMode("sites")}
          >
            <ArrowRightLeft size={15} />
            Sites & dates
          </button>
          <button
            type="button"
            aria-pressed={mode === "delay"}
            aria-controls="delay-analysis"
            onClick={() => {
              setMode("delay");
              setDelayVisited(true);
            }}
          >
            <Clock3 size={15} />
            Delay analysis
          </button>
        </div>
        <span>
          NASA/JPL Horizons <i /> UTC
        </span>
      </div>
      <div
        id="site-comparison"
        className="helios-panel"
        hidden={mode !== "sites"}
      >
        <ComparisonPanel />
      </div>
      <div
        id="delay-analysis"
        className="helios-panel"
        hidden={mode !== "delay"}
      >
        {delayVisited && <DelayLabPanel visible={active && mode === "delay"} />}
      </div>
    </div>
  );
}
