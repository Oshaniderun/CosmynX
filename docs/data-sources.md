# NASA Data Sources

All scientific data in HELIOS is retrieved from official NASA and space agency resources listed in `README.md` Section 4:

- **NASA JPL Horizons**: https://ssd.jpl.nasa.gov/horizons/
  - **API Endpoint**: `https://ssd.jpl.nasa.gov/api/horizons.api`
  - **Observer Center**: `'coord@301'` (Moon, body `301`, `COORD_TYPE='GEODETIC'`)
  - **Targets**: Sun (`COMMAND='10'`), Earth (`COMMAND='399'`)
  - **Quantities**: `QUANTITIES='4'` (Apparent Azimuth & Elevation in degrees, airless)
  - **Coordinate Convention**: Geodetic latitude (`-90` to `+90` deg), **East-positive longitude** (`-180` to `+180` deg)
  - **Timestamps**: Normalized to UTC ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)
  - **Caching**: Normalized ephemeris JSON files are cached in `data/processed/` keyed by coordinates, time window, and step size.
- **NASA LRO LOLA DEM (South Pole Terrain & Safety)**:
  - **Dataset**: LRO Lunar Orbiter Laser Altimeter South Pole DEM (`LDEM_80S_20M / 5M`), stored in `data/processed/lola_terrain_south_pole.json`.
  - **Metrics**: Elevation relative to 1737.4 km lunar reference radius (`elevation_m`), mean/max local slope (`mean_slope_deg`, `max_slope_deg`), RMS surface roughness (`roughness_m`), and distance to nearest Permanently Shadowed Region (`psr_proximity_km`).
  - **Safety Classification**: `safe` (`mean_slope_deg <= 10°`, `max_slope_deg <= 15°`, `roughness_m <= 1.0 m`), `caution` (`<= 15° / 25° / 2.0 m`), or `hazardous`.
- **NASA Moon Trek**: https://trek.nasa.gov/moon/ — Lunar maps, terrain visualization, and WMTS tile layers (`EQ` global & `SP` South Pole polar stereographic):
  - **South Pole Imagery (`SP`)**: `https://trek.nasa.gov/tiles/Moon/SP/LRO_WAC_Mosaic_SPole60_100mp/1.0.0/WMTSCapabilities.xml`
    - **Tile Template**: `https://trek.nasa.gov/tiles/Moon/SP/LRO_WAC_Mosaic_SPole60_100mp/1.0.0/default/default028mm/{z}/{y}/{x}.png` (`60S–90S`, zoom `0–4`)
  - **South Pole Solar Illumination % (`SP`)**: `https://trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT_SOUTH_100M/1.0.0/WMTSCapabilities.xml`
    - **Tile Template**: `https://trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT_SOUTH_100M/1.0.0/default/default028mm/{z}/{y}/{x}.png` (zoom `0–5`)
  - **Global Mosaic (`EQ`)**: `https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/WMTSCapabilities.xml`
  - **Global Tile Template (`EQ`)**: `https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`
- **LROC QuickMap**: https://quickmap.lroc.asu.edu/ — Lunar surface imagery, topography, and landing site exploration.
- **Canadian Space Agency — Moon Exploration**: https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/ — Background lunar exploration resources.

## Data Reliability & Limitations
- If JPL Horizons is unreachable or returns no ephemeris rows, the service returns an empty list (`status: "unavailable"`) and never invents values.
- Apparent elevation angles are geometric and do not include local lunar terrain/crater-wall obstruction.
