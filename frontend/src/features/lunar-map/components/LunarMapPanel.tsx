import { useEffect, useState, useTransition } from "react";
import {
  MapPin,
  Compass,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Mountain,
  Calendar,
  Radio,
} from "lucide-react";

import { ModuleCard } from "../../../components/shared/ModuleCard";
import { useMission } from "../../../context/MissionContext";
import {
  fetchCandidateSites,
  validateCustomSite,
} from "../services/sitesService";
import type { LandingSite } from "../../../types/helios";
import { LunarMap } from "./LunarMap";

export function LunarMapPanel() {
  const {
    selectedSite,
    setSelectedSite,
    missionDates,
    customCoordinates,
    setCustomCoordinates,
  } = useMission();

  const [sites, setSites] = useState<LandingSite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Custom coordinate input state
  const [customLat, setCustomLat] = useState<string>("-89.20");
  const [customLon, setCustomLon] = useState<string>("145.00");
  const [customName, setCustomName] = useState<string>("Custom Polar Target");
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"candidates" | "custom">("candidates");

  const [_, startTransition] = useTransition();

  // Load candidate sites from backend API
  const loadSites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandidateSites();
      setSites(data);
      // Auto-select candidate_001 if no site is selected
      if (!selectedSite && data.length > 0) {
        setSelectedSite(data[0]);
      }
    } catch (err: unknown) {
      console.error("Failed to load candidate sites:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve candidate landing sites from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  // Handle custom site plot
  const handlePlotCustomSite = async (lat?: number, lon?: number) => {
    const targetLat = lat ?? parseFloat(customLat);
    const targetLon = lon ?? parseFloat(customLon);

    if (isNaN(targetLat) || targetLat < -90.0 || targetLat > -80.0) {
      alert("Latitude must be between -90.0° and -80.0° for the Lunar South Pole.");
      return;
    }
    if (isNaN(targetLon) || targetLon < -180.0 || targetLon > 360.0) {
      alert("Longitude must be between -180.0° and +360.0°.");
      return;
    }

    try {
      const validated = await validateCustomSite({
        name: customName.trim() || "Custom Polar Target",
        latitude_deg: targetLat,
        longitude_deg: targetLon,
        description: `Custom coordinate target placed at ${targetLat.toFixed(3)}°S, ${targetLon.toFixed(3)}°.`,
      });
      setCustomCoordinates({
        latitude_deg: validated.latitude_deg,
        longitude_deg: validated.longitude_deg,
      });
      setSelectedSite(validated);
      setIsPinDropMode(false);
    } catch {
      // Local fallback if backend endpoint is unavailable
      const fallbackSite: LandingSite = {
        site_id: `custom_${targetLat.toFixed(3)}_${(targetLon > 180 ? targetLon - 360 : targetLon).toFixed(3)}`,
        name: customName.trim() || "Custom Polar Target",
        region: "Lunar South Pole (Custom)",
        latitude_deg: targetLat,
        longitude_deg: targetLon > 180 ? targetLon - 360 : targetLon,
        description: `Custom target placed at ${targetLat.toFixed(3)}°S, ${targetLon.toFixed(3)}°.`,
        source: "User Coordinate Input",
        coordinate_type: "custom_user_pin",
      };
      setCustomCoordinates({
        latitude_deg: fallbackSite.latitude_deg,
        longitude_deg: fallbackSite.longitude_deg,
      });
      setSelectedSite(fallbackSite);
      setIsPinDropMode(false);
    }
  };

  // Map pin drop handler
  const handleMapClickCoordinates = (lat: number, lon: number) => {
    setCustomLat(lat.toFixed(3));
    setCustomLon(lon.toFixed(3));
    handlePlotCustomSite(lat, lon);
  };

  // Build custom site object if active
  const customSiteObj: LandingSite | null = customCoordinates
    ? {
        site_id: "custom_user_target",
        name: customName || "Custom Polar Target",
        region: "Lunar South Pole (Custom)",
        latitude_deg: customCoordinates.latitude_deg,
        longitude_deg: customCoordinates.longitude_deg,
        description: "User-defined coordinate location on the lunar surface.",
        source: "User Coordinate Input",
      }
    : null;

  return (
    <ModuleCard
      title="Interactive Lunar Map & Landing Site Selection"
      eyebrow="Lunar south-pole site workspace"
      icon={<MapPin className="h-4 w-4" />}
    >
      {/* Top Mission Status Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
          <span className="text-slate-400">Selected Site:</span>
          <span className="font-semibold text-cyan-300">
            {selectedSite ? selectedSite.name : "None (Select on Map or List)"}
          </span>
          {selectedSite && (
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
              {selectedSite.latitude_deg.toFixed(2)}°S,{" "}
              {selectedSite.longitude_deg >= 0
                ? `${selectedSite.longitude_deg.toFixed(2)}°E`
                : `${Math.abs(selectedSite.longitude_deg).toFixed(2)}°W`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono text-slate-300">
              {missionDates.startUtc.slice(0, 10)} → {missionDates.endUtc.slice(0, 10)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300">
              {sites.length} Artemis Candidates
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Site Details / Selector (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: OpenLayers Lunar Map Canvas (8 Cols) */}
        <div className="flex flex-col gap-2.5 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-medium text-slate-200">
                Simulated South Polar Topography — Illustrative Basemap (R = 1,737.4 km)
              </span>
            </div>

            {/* Pin Drop Mode Toggle */}
            <button
              onClick={() => setIsPinDropMode((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                isPinDropMode
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {isPinDropMode ? "Pin Drop Active" : "Click to Drop Pin"}
            </button>
          </div>

          {/* OpenLayers Map Component */}
          <LunarMap
            sites={sites}
            selectedSite={selectedSite}
            onSelectSite={(site) => {
              startTransition(() => {
                setSelectedSite(site);
              });
            }}
            customSite={customSiteObj}
            onMapClickCoordinates={handleMapClickCoordinates}
            isPinDropMode={isPinDropMode}
          />

          {/* Map Legend & Projection Details */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800/80 bg-slate-900/40 px-3 py-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span>Candidate Site</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40" />
                <span>Active Selection</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>Custom Target</span>
              </span>
            </div>
            <span className="text-slate-500 font-mono">
              IAU/NASA Lunar South Polar Stereographic (0° Prime Meridian facing Earth)
            </span>
          </div>
        </div>

        {/* Right: Site Selector & Details Panel (4 Cols) */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          {/* Tab Navigation: Candidate Sites vs Custom Coordinates */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab("candidates")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                activeTab === "candidates"
                  ? "bg-slate-800 text-cyan-300 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Artemis Candidate Regions ({sites.length})
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                activeTab === "custom"
                  ? "bg-slate-800 text-purple-300 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Custom Coordinates
            </button>
          </div>

          {/* Loading & Error Indicators */}
          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Fetching NASA candidate sites...</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Failed to load sites</p>
                <p className="text-slate-400 mt-0.5">{error}</p>
                <button
                  onClick={loadSites}
                  className="mt-2 flex items-center gap-1 rounded bg-rose-900/60 px-2 py-0.5 text-rose-200 hover:bg-rose-900"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            </div>
          )}

          {/* Tab 1: Candidate Sites List */}
          {activeTab === "candidates" && !loading && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400">
                Select Candidate Landing Region:
              </label>
              <div className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
                {sites.map((site) => {
                  const isSelected = selectedSite?.site_id === site.site_id;
                  return (
                    <button
                      key={site.site_id}
                      onClick={() => setSelectedSite(site)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition ${
                        isSelected
                          ? "border-cyan-500/60 bg-cyan-950/30 text-cyan-100 shadow-sm"
                          : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                        ) : (
                          <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-100">{site.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {site.latitude_deg.toFixed(2)}°S,{" "}
                            {site.longitude_deg >= 0
                              ? `${site.longitude_deg.toFixed(2)}°E`
                              : `${Math.abs(site.longitude_deg).toFixed(2)}°W`}{" "}
                            <span className="text-[10px] text-slate-500 font-sans italic">
                              (centroid)
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                        {site.site_id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Custom Coordinate Entry Form */}
          {activeTab === "custom" && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-purple-900/40 bg-purple-950/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-200">
                  Target Coordinate Entry
                </span>
                <span className="text-[10px] text-purple-400 font-mono">
                  South Polar: -90° to -80°
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Target Label</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. South Pole Ridge Point"
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">
                    Latitude (°S)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="-90.0"
                    max="-80.0"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">
                    Longitude (°)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="-180.0"
                    max="360.0"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handlePlotCustomSite()}
                  className="flex flex-1 items-center justify-center gap-1 rounded bg-purple-600 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Plot Custom Target
                </button>
                {customCoordinates && (
                  <button
                    onClick={() => {
                      setCustomCoordinates(null);
                      if (sites.length > 0) setSelectedSite(sites[0]);
                    }}
                    className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selected Landing Site Details Card */}
          {selectedSite && (
            <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 shadow-inner">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-slate-100">
                      {selectedSite.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedSite.region}</p>
                </div>
                <span className="rounded-full border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                  {selectedSite.site_id}
                </span>
              </div>

              {/* Geographic Coordinates & Elevation */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-slate-950/80 p-2">
                  <span className="text-[10px] text-slate-500 uppercase">
                    Latitude
                  </span>
                  <p className="font-mono font-medium text-slate-200">
                    {selectedSite.latitude_deg.toFixed(3)}°S
                  </p>
                </div>
                <div className="rounded bg-slate-950/80 p-2">
                  <span className="text-[10px] text-slate-500 uppercase">
                    Longitude
                  </span>
                  <p className="font-mono font-medium text-slate-200">
                    {selectedSite.longitude_deg >= 0
                      ? `${selectedSite.longitude_deg.toFixed(3)}°E`
                      : `${Math.abs(selectedSite.longitude_deg).toFixed(3)}°W`}
                  </p>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded bg-slate-950/80 px-2.5 py-1.5 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Mountain className="h-3.5 w-3.5 text-slate-400" />
                    Elevation:
                  </span>
                  {selectedSite.elevation_m !== undefined &&
                  selectedSite.elevation_m !== null ? (
                    <span className="font-mono text-amber-300">
                      +{selectedSite.elevation_m.toFixed(0)} m (approx)
                    </span>
                  ) : (
                    <span className="text-slate-500 italic font-mono text-[10px]">
                      Varies across 15×15 km zone
                    </span>
                  )}
                </div>
              </div>

              {/* Scientific Description */}
              {selectedSite.description && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/60">
                  {selectedSite.description}
                </p>
              )}

              {/* Data Provenance & Attribution */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                <span className="truncate max-w-[240px]" title={selectedSite.source || "NASA Artemis III / LRO"}>
                  Source: {selectedSite.source || "NASA Artemis III / LRO"}
                </span>
                <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-slate-400 uppercase">
                  {selectedSite.coordinate_type?.replace(/_/g, " ") || "centroid"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModuleCard>
  );
}
