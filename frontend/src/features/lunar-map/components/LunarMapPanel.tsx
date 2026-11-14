import { useEffect, useState } from "react";
import { Crosshair, MapPin, RotateCw } from "lucide-react";
import { ModuleCard } from "../../../components/shared/ModuleCard";
import type { LandingSite } from "../../../types/helios";
import { fetchCandidateSites } from "../services/sitesService";

export function LunarMapPanel() {
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchCandidateSites()
      .then((availableSites) => {
        if (!active) return;
        setSites(availableSites);
        setSelectedSiteId(availableSites[0]?.site_id ?? "");
        setError(availableSites.length ? "" : "No candidate landing sites are available.");
      })
      .catch(() => {
        if (active) setError("The candidate site catalog could not be reached.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  const selectedSite = sites.find((site) => site.site_id === selectedSiteId);

  return (
    <ModuleCard title="Candidate landing sites" eyebrow="Lunar south-pole catalog" icon={<Crosshair size={17} />}>
      <div className="site-catalog">
        <div className="site-catalog__summary">
          <div className="site-catalog__summary-icon"><MapPin size={17} aria-hidden="true" /></div>
          <div>
            <p className="site-catalog__label">Available candidates</p>
            <p className="site-catalog__count">{loading ? "Loading catalog…" : `${sites.length.toString().padStart(2, "0")} locations`}</p>
          </div>
          <span className="site-catalog__region">LUNAR SOUTH POLE</span>
        </div>

        {error ? (
          <div className="site-catalog__message" role="status">
            <p>{error}</p>
            <button type="button" onClick={() => {
              setLoading(true);
              setError("");
              setReloadKey((key) => key + 1);
            }} aria-label="Retry loading the candidate site catalog"><RotateCw size={14} aria-hidden="true" /> Retry</button>
          </div>
        ) : (
          <div className="site-catalog__list" role="list" aria-label="Candidate landing sites">
            {sites.map((site, index) => (
              <button
                className={`site-catalog__site${site.site_id === selectedSiteId ? " is-selected" : ""}`}
                type="button"
                key={site.site_id}
                aria-pressed={site.site_id === selectedSiteId}
                onClick={() => setSelectedSiteId(site.site_id)}
              >
                <span className="site-catalog__number">0{index + 1}</span>
                <span className="site-catalog__site-name">{site.name}</span>
                <span className="site-catalog__coordinates">{site.latitude_deg.toFixed(2)}°, {site.longitude_deg.toFixed(2)}°</span>
                <span className="site-catalog__indicator" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {selectedSite && (
          <div className="site-catalog__detail" aria-live="polite">
            <span className="site-catalog__detail-label">Selected candidate</span>
            <div className="site-catalog__detail-row">
              <strong>{selectedSite.name}</strong>
              <span>{selectedSite.region}</span>
            </div>
            {selectedSite.description && <p>{selectedSite.description}</p>}
          </div>
        )}
      </div>
    </ModuleCard>
  );
}
