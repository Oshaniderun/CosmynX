import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import earthMap from "../assets/earth.webp";
import moonMap from "../assets/moon.webp";
import sunMap from "../assets/sun.webp";
import { createSpaceScene, type SceneFrame } from "./spaceScene";
import type { LandingSite } from "../../../types/helios";
import {
  APOLLO_DOSSIERS,
  apolloDossierToLandingSite,
} from "../services/apolloDossiers";

export default function SpaceViewport({
  frame,
  onSelectSite,
  onZoomChange,
}: {
  frame: SceneFrame;
  onSelectSite?: (site: LandingSite) => void;
  onZoomChange?: (zoom: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const sunLabel = useRef<HTMLSpanElement>(null);
  const earthLabel = useRef<HTMLSpanElement>(null);
  const moonLabel = useRef<HTMLSpanElement>(null);
  const scene = useRef<ReturnType<typeof createSpaceScene>>();
  const currentFrame = useRef(frame);
  const onSelectSiteRef = useRef(onSelectSite);
  const onZoomChangeRef = useRef(onZoomChange);
  const [unavailable, setUnavailable] = useState(false);
  const [rotating, setRotating] = useState(false);
  const mode = frame.mode;

  onSelectSiteRef.current = onSelectSite;
  onZoomChangeRef.current = onZoomChange;

  useEffect(() => { currentFrame.current = frame; scene.current?.update(frame); }, [frame]);

  useEffect(() => {
    if (!host.current || !sunLabel.current || !earthLabel.current || !moonLabel.current) return;
    let viewport: ReturnType<typeof createSpaceScene>;
    try {
      viewport = createSpaceScene(
        host.current,
        [sunLabel.current, earthLabel.current, moonLabel.current],
        mode,
        {
          onSelectSite: (site) => onSelectSiteRef.current?.(site),
          onZoomChange: (zoom) => onZoomChangeRef.current?.(zoom),
        }
      );
    } catch (error) {
      console.warn("Unable to initialize the 3D viewport", error);
      setUnavailable(true);
      return;
    }
    scene.current = viewport;
    viewport.update(currentFrame.current);
    return () => { viewport.dispose(); scene.current = undefined; };
  }, [mode]);
  useEffect(() => { scene.current?.rotate(rotating); }, [mode, rotating]);

  return (
    <div className="relative h-[340px] overflow-hidden bg-[radial-gradient(ellipse_at_22%_50%,#211226_0%,#0b1322_46%,#04070d_78%)] sm:h-[460px] lg:h-[510px]">
      <div ref={host} className="absolute inset-0 cursor-grab active:cursor-grabbing [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span ref={sunLabel} hidden className="absolute -translate-x-1/2 rounded bg-slate-950/80 px-2 py-1 text-xs font-medium text-amber-200">Sun</span>
        <span ref={earthLabel} hidden className="absolute -translate-x-1/2 rounded bg-slate-950/80 px-2 py-1 text-xs font-medium text-sky-200">Earth</span>
        <span ref={moonLabel} hidden className="absolute -translate-x-1/2 rounded bg-slate-950/80 px-2 py-1 text-xs font-medium text-slate-100">Moon</span>
      </div>
      {unavailable ? (
        <div className="absolute inset-0 grid place-content-center gap-5 text-center">
          <div aria-hidden="true" className="flex items-center justify-center gap-7">
            {[[sunMap, "size-[76px] shadow-[0_0_38px_#ff7b1b77]"], [earthMap, "size-[58px]"], [moonMap, "size-[26px]"]].map(([map, style]) => (
              <div key={map} className={`rounded-full border border-white/10 bg-cover ${style}`}
                style={{ backgroundImage: `linear-gradient(105deg, transparent 28%, #030711b8 88%), url("${map}")` }} />
            ))}
          </div>
          <p role="status" className="px-4 text-sm text-slate-300">This browser couldn’t start the 3D view. Time and position controls are available below.</p>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-[#04070d] to-transparent p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
            <span>Drag to orbit · Scroll or pinch to zoom</span>
            <span className="hidden sm:inline-flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[10px]">
              <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Artemis III
              </span>
              <button
                type="button"
                onClick={() => {
                  const defaultApollo = APOLLO_DOSSIERS["apollo_11"];
                  if (defaultApollo) {
                    onSelectSiteRef.current?.(apolloDossierToLandingSite(defaultApollo));
                  }
                }}
                className="pointer-events-auto inline-flex items-center gap-1 font-medium text-sky-300 transition-colors hover:text-sky-200 hover:underline cursor-pointer"
                title="Select Apollo 11 historical landing site"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Apollo 11–17
              </button>
            </span>
          </div>
          <div className="pointer-events-auto flex shrink-0 gap-1.5">
            {mode === "eclipse" && (
              <button type="button" onClick={() => { setRotating(false); scene.current?.focusShadow(); }}
                className="rounded-md border border-slate-700 bg-slate-950/90 px-2.5 py-1.5 text-xs text-slate-100 hover:border-sky-400">
                Shadow close-up
              </button>
            )}
            <button type="button" aria-pressed={rotating} onClick={() => setRotating(!rotating)}
              className="rounded-md border border-slate-700 bg-slate-950/90 px-2.5 py-1.5 text-xs text-slate-100 hover:border-sky-400 aria-pressed:border-sky-400 aria-pressed:text-sky-300">
              Auto-orbit
            </button>
            <button type="button" aria-label="Reset camera" title="Reset camera" onClick={() => { setRotating(false); scene.current?.reset(); }}
              className="rounded-md border border-slate-700 bg-slate-950/90 p-1.5 text-slate-100 hover:border-sky-400">
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
