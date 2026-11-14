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
- **NASA Moon Trek**: https://trek.nasa.gov/moon/ — Lunar maps, terrain visualization, and WMTS tile layers (`https://trek.nasa.gov/tiles/Moon/EQ/`).
- **LROC QuickMap**: https://quickmap.lroc.asu.edu/ — Lunar surface imagery, topography, and landing site exploration.
- **Canadian Space Agency — Moon Exploration**: https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/ — Background lunar exploration resources.

## Data Reliability & Limitations
- If JPL Horizons is unreachable or returns no ephemeris rows, the service returns an empty list (`status: "unavailable"`) and never invents values.
- Apparent elevation angles are geometric and do not include local lunar terrain/crater-wall obstruction.
