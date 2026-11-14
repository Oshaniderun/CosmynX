import { useEffect, useRef, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import Static from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import CircleGeom from "ol/geom/Circle";
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";
import ScaleLine from "ol/control/ScaleLine";
import Zoom from "ol/control/Zoom";

import type { LandingSite } from "../../../types/helios";
import {
  LUNAR_POLAR_EXTENT,
  setupLunarProjection,
  forwardLunarPolar,
  inverseLunarPolar,
} from "../utils/lunarCoordinates";
import { Crosshair, Eye, EyeOff, RotateCcw } from "lucide-react";

interface LunarMapProps {
  sites: LandingSite[];
  selectedSite: LandingSite | null;
  onSelectSite: (site: LandingSite) => void;
  customSite: LandingSite | null;
  onMapClickCoordinates?: (lat: number, lon: number) => void;
  isPinDropMode?: boolean;
  onZoomOutToGlobe?: () => void;
}

export function LunarMap({
  sites,
  selectedSite,
  onSelectSite,
  customSite,
  onMapClickCoordinates,
  isPinDropMode = false,
  onZoomOutToGlobe,
}: LunarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const onZoomOutRef = useRef(onZoomOutToGlobe);
  onZoomOutRef.current = onZoomOutToGlobe;
  const siteVectorSourceRef = useRef<VectorSource>(new VectorSource());
  const graticuleVectorSourceRef = useRef<VectorSource>(new VectorSource());
  const graticuleLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const [cursorCoords, setCursorCoords] = useState<{
    lat: number;
    lon: number;
    distKm: number;
  } | null>(null);
  const [showGraticule, setShowGraticule] = useState<boolean>(true);

  // 1. Build Lunar Graticule (Polar Rings, Meridian Lines, and Landmark Crater Labels)
  const buildGraticuleFeatures = useCallback((): Feature[] => {
    const features: Feature[] = [];

    // Latitude rings: 89S, 88S, 87S, 86S, 85S
    const latRings = [-89, -88, -87, -86, -85];
    for (const lat of latRings) {
      const [_, y] = forwardLunarPolar(lat, 0);
      const radius = Math.abs(y);
      const ringFeature = new Feature({
        geometry: new CircleGeom([0, 0], radius),
        type: "graticule_ring",
        label: `${Math.abs(lat)}°S`,
      });
      ringFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgba(56, 189, 248, 0.22)",
            width: 1,
            lineDash: [4, 6],
          }),
          text: new Text({
            text: `${Math.abs(lat)}°S`,
            font: "10px 'IBM Plex Mono', monospace",
            fill: new Fill({ color: "rgba(148, 163, 184, 0.7)" }),
            offsetX: 0,
            offsetY: -radius,
            placement: "point",
          }),
        })
      );
      features.push(ringFeature);
    }

    // Radial Meridian lines every 30 deg out to 240km
    const meridians = [
      { deg: 0, label: "0° (Earth / Prime Meridian)" },
      { deg: 90, label: "90°E" },
      { deg: 180, label: "180° (Far Side)" },
      { deg: -90, label: "90°W (-90°)" },
      { deg: 30, label: "30°E" },
      { deg: 60, label: "60°E" },
      { deg: 120, label: "120°E" },
      { deg: 150, label: "150°E" },
      { deg: -30, label: "30°W" },
      { deg: -60, label: "60°W" },
      { deg: -120, label: "120°W" },
      { deg: -150, label: "150°W" },
    ];

    for (const m of meridians) {
      const [xEnd, yEnd] = forwardLunarPolar(-82.0, m.deg);
      const lineFeature = new Feature({
        geometry: new LineString([
          [0, 0],
          [xEnd, yEnd],
        ]),
        type: "graticule_meridian",
      });
      const isMajor = m.deg % 90 === 0;
      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: isMajor
              ? "rgba(56, 189, 248, 0.35)"
              : "rgba(100, 116, 139, 0.18)",
            width: isMajor ? 1.5 : 1,
            lineDash: isMajor ? undefined : [2, 4],
          }),
        })
      );
      features.push(lineFeature);

      // Label at meridian perimeter
      if (isMajor) {
        const [xLab, yLab] = forwardLunarPolar(-82.5, m.deg);
        const labFeature = new Feature({
          geometry: new Point([xLab, yLab]),
        });
        labFeature.setStyle(
          new Style({
            text: new Text({
              text: m.label,
              font: "11px 'IBM Plex Mono', monospace",
              fill: new Fill({ color: "rgba(226, 232, 240, 0.85)" }),
              backgroundFill: new Fill({ color: "rgba(13, 23, 40, 0.85)" }),
              backgroundStroke: new Stroke({ color: "rgba(56, 189, 248, 0.2)", width: 1 }),
              padding: [2, 6, 2, 6],
            }),
          })
        );
        features.push(labFeature);
      }
    }

    // South Pole center marker (lat: -90)
    const poleFeature = new Feature({
      geometry: new Point([0, 0]),
      type: "pole",
    });
    poleFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 4.5,
          fill: new Fill({ color: "#38bdf8" }),
          stroke: new Stroke({ color: "#ffffff", width: 1.5 }),
        }),
        text: new Text({
          text: "SOUTH POLE (90°S)",
          font: "600 11px 'Space Grotesk', sans-serif",
          fill: new Fill({ color: "#38bdf8" }),
          offsetY: 15,
        }),
      })
    );
    features.push(poleFeature);

    // Key craters landmarks
    const landmarkCraters = [
      { name: "Shackleton (21km)", lat: -89.67, lon: 129.8 },
      { name: "de Gerlache (32km)", lat: -88.5, lon: -87.1 },
      { name: "Shoemaker (50km)", lat: -88.1, lon: 45.0 },
      { name: "Faustini (39km)", lat: -87.3, lon: 77.0 },
      { name: "Haworth (51km)", lat: -87.45, lon: -5.0 },
      { name: "Cabeus (LCROSS)", lat: -84.9, lon: -35.5 },
    ];
    for (const c of landmarkCraters) {
      const [cx, cy] = forwardLunarPolar(c.lat, c.lon);
      const craterFeat = new Feature({
        geometry: new Point([cx, cy]),
        type: "crater_label",
      });
      craterFeat.setStyle(
        new Style({
          text: new Text({
            text: c.name,
            font: "italic 10px 'Inter', sans-serif",
            fill: new Fill({ color: "rgba(203, 213, 225, 0.7)" }),
            backgroundFill: new Fill({ color: "rgba(8, 14, 27, 0.75)" }),
            backgroundStroke: new Stroke({ color: "rgba(148, 163, 184, 0.15)", width: 0.5 }),
            padding: [2, 4, 2, 4],
          }),
        })
      );
      features.push(craterFeat);
    }

    return features;
  }, []);

  // 2. Initialize OpenLayers Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lunarProj = setupLunarProjection();

    // Base Layer: Simulated South Polar Topography (Illustrative Basemap)
    const baseLayer = new ImageLayer({
      source: new Static({
        url: "/assets/lunar/lunar-south-pole-lola.png",
        imageExtent: LUNAR_POLAR_EXTENT,
        projection: lunarProj,
      }),
    });

    // Graticule & Landmarks Vector Layer
    const graticuleSource = graticuleVectorSourceRef.current;
    graticuleSource.clear();
    graticuleSource.addFeatures(buildGraticuleFeatures());

    const graticuleLayer = new VectorLayer({
      source: graticuleSource,
      zIndex: 5,
    });
    graticuleLayerRef.current = graticuleLayer;

    // Candidate Landing Sites Vector Layer
    const siteLayer = new VectorLayer({
      source: siteVectorSourceRef.current,
      zIndex: 20,
    });

    // View: Centered at South Pole [0, 0]
    const view = new View({
      projection: lunarProj,
      center: [0, 0],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 7.5,
      extent: [-300000, -300000, 300000, 300000],
    });

    const map = new Map({
      target: mapContainerRef.current,
      layers: [baseLayer, graticuleLayer, siteLayer],
      view: view,
      controls: [
        new Zoom({ className: "ol-zoom !top-3 !left-3" }),
        new ScaleLine({ units: "metric", className: "ol-scale-line !bottom-3 !left-3" }),
      ],
    });

    mapRef.current = map;

    // Pointer move listener for live coordinate readout & cursor style
    map.on("pointermove", (evt) => {
      const coords = evt.coordinate;
      if (!coords) return;
      const [lat, lon] = inverseLunarPolar(coords[0], coords[1]);
      const distKm = Math.hypot(coords[0], coords[1]) / 1000.0;
      setCursorCoords({ lat, lon, distKm });

      // Change cursor when hovering over sites
      const hit = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: (l) => l === siteLayer,
      });
      const targetEl = map.getTargetElement();
      if (targetEl) {
        targetEl.style.cursor = hit
          ? "pointer"
          : isPinDropMode
          ? "crosshair"
          : "";
      }
    });

    // Single click listener for site selection or custom pin drop
    map.on("singleclick", (evt) => {
      const clickedFeatures = map.getFeaturesAtPixel(evt.pixel, {
        layerFilter: (l) => l === siteLayer,
      });

      if (clickedFeatures.length > 0) {
        const site = clickedFeatures[0].get("site") as LandingSite | undefined;
        if (site) {
          onSelectSite(site);
          return;
        }
      }

      // If clicked empty space while pin drop mode is on
      if (isPinDropMode && onMapClickCoordinates && evt.coordinate) {
        const [lat, lon] = inverseLunarPolar(evt.coordinate[0], evt.coordinate[1]);
        onMapClickCoordinates(lat, lon);
      }
    });

    const containerEl = mapContainerRef.current;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && (view.getZoom() ?? 2.2) <= 1.55) {
        onZoomOutRef.current?.();
      }
    };
    containerEl.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      containerEl.removeEventListener("wheel", handleWheel);
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [buildGraticuleFeatures, onSelectSite, onMapClickCoordinates, isPinDropMode]);

  // 3. Update Site Markers whenever sites, selectedSite, or customSite change
  useEffect(() => {
    const source = siteVectorSourceRef.current;
    source.clear();

    const allSites = [...sites];
    if (customSite && !allSites.some((s) => s.site_id === customSite.site_id)) {
      allSites.push(customSite);
    }

    for (const site of allSites) {
      const [x, y] = forwardLunarPolar(site.latitude_deg, site.longitude_deg);
      const isSelected = selectedSite?.site_id === site.site_id;
      const isCustom = site.site_id.startsWith("custom_");

      const feature = new Feature({
        geometry: new Point([x, y]),
        site,
      });

      // Pin styling based on selection state
      if (isSelected) {
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 9,
              fill: new Fill({ color: isCustom ? "#c084fc" : "#06b6d4" }),
              stroke: new Stroke({
                color: "#ffffff",
                width: 2.5,
              }),
            }),
            text: new Text({
              text: isCustom
                ? `★ ${site.name}\n${site.latitude_deg.toFixed(2)}°S, ${site.longitude_deg >= 0 ? `${site.longitude_deg.toFixed(2)}°E` : `${Math.abs(site.longitude_deg).toFixed(2)}°W`}`
                : `★ ${site.name} (Region Centroid)\n${site.latitude_deg.toFixed(2)}°S, ${site.longitude_deg >= 0 ? `${site.longitude_deg.toFixed(2)}°E` : `${Math.abs(site.longitude_deg).toFixed(2)}°W`}`,
              font: "600 11px 'Space Grotesk', sans-serif",
              fill: new Fill({ color: "#ffffff" }),
              backgroundFill: new Fill({
                color: isCustom ? "rgba(79, 70, 229, 0.92)" : "rgba(12, 74, 110, 0.92)",
              }),
              backgroundStroke: new Stroke({
                color: isCustom ? "#818cf8" : "#38bdf8",
                width: 1.5,
              }),
              padding: [4, 8, 4, 8],
              offsetY: -26,
            }),
            zIndex: 100,
          })
        );
      } else {
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isCustom ? 6 : 5,
              fill: new Fill({ color: isCustom ? "#818cf8" : "#f59e0b" }),
              stroke: new Stroke({
                color: isCustom ? "#e0e7ff" : "#ffffff",
                width: 1.5,
              }),
            }),
            text: new Text({
              text: site.name,
              font: "500 10px 'Inter', sans-serif",
              fill: new Fill({ color: isCustom ? "#e0e7ff" : "#fef3c7" }),
              backgroundFill: new Fill({
                color: isCustom ? "rgba(49, 46, 129, 0.8)" : "rgba(17, 29, 50, 0.85)",
              }),
              backgroundStroke: new Stroke({
                color: isCustom ? "#6366f1" : "#d97706",
                width: 1,
              }),
              padding: [2, 5, 2, 5],
              offsetY: -18,
            }),
            zIndex: 50,
          })
        );
      }

      source.addFeature(feature);
    }
  }, [sites, selectedSite, customSite]);

  // 4. Smoothly Pan to Selected Site
  useEffect(() => {
    if (!mapRef.current || !selectedSite) return;
    const view = mapRef.current.getView();
    const [targetX, targetY] = forwardLunarPolar(
      selectedSite.latitude_deg,
      selectedSite.longitude_deg
    );
    view.animate({
      center: [targetX, targetY],
      zoom: Math.max(view.getZoom() ?? 2.2, 4.2),
      duration: 700,
    });
  }, [selectedSite]);

  // 5. Toggle Graticule Layer
  const toggleGraticule = () => {
    if (graticuleLayerRef.current) {
      const next = !showGraticule;
      graticuleLayerRef.current.setVisible(next);
      setShowGraticule(next);
    }
  };

  // 6. Reset View to South Pole
  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.getView().animate({
        center: [0, 0],
        zoom: 2.2,
        duration: 600,
      });
    }
  };

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-white/[0.08] border-t-white/[0.18] bg-[#02050C]/90 shadow-2xl shadow-black/60">
      {/* OpenLayers Map Canvas Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top-Right Map Controls Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#060D19]/80 p-1.5 shadow-xl backdrop-blur-md">
        <button
          onClick={toggleGraticule}
          title={showGraticule ? "Hide Coordinate Grid" : "Show Coordinate Grid"}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium font-sans transition ${
            showGraticule
              ? "border border-sky-400/40 bg-[#12223B]/90 text-sky-300 shadow-sm"
              : "border border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-slate-200"
          }`}
        >
          {showGraticule ? <Eye className="h-3.5 w-3.5 text-sky-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          Grid
        </button>
        <button
          onClick={resetView}
          title="Reset View to South Pole (90°S)"
          className="flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium font-sans text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-slate-200 transition"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          Pole
        </button>
      </div>

      {/* Live Coordinate Status Bar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[#040915]/85 px-3.5 py-1.5 text-xs font-mono text-slate-200 shadow-2xl backdrop-blur-md">
        {cursorCoords ? (
          <>
            <span className="flex items-center gap-1 text-sky-300 font-semibold">
              <Crosshair className="h-3.5 w-3.5 text-sky-400" />
              <span>{Math.abs(cursorCoords.lat).toFixed(3)}°S</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              {cursorCoords.lon >= 0
                ? `${cursorCoords.lon.toFixed(3)}°E`
                : `${Math.abs(cursorCoords.lon).toFixed(3)}°W`}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300/90 font-medium">
              Dist: {cursorCoords.distKm.toFixed(1)} km
            </span>
          </>
        ) : (
          <span className="text-slate-500 italic">Hover map for coordinates</span>
        )}
      </div>

      {/* Pin Drop Mode Banner */}
      {isPinDropMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-violet-500/40 bg-[#0A1224]/90 px-4 py-1.5 text-xs font-medium font-sans text-violet-200 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Click anywhere on the lunar surface to drop a custom pin
        </div>
      )}
    </div>
  );
}
