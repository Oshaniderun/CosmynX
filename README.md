# CosmynX
# 2026 NASA SpaceApps Challenge

# 🌕 HELIOS — AI-Powered Lunar Landing Site Navigator

### NASA Space Apps Challenge 2026 | Lunar Landing Site Navigator

**Project Type:** AI-Assisted Lunar Mission Planning Web Application  
**Team Size:** 6 Members  
**Development Duration:** 24-Hour Hackathon  
**Status:** Development Planning / Initial Setup

---

## 1. Project Overview

**HELIOS** is an interactive, AI-powered lunar landing site navigation and decision-support platform designed to help mission planners, researchers, educators, and space enthusiasts evaluate potential landing locations on the Moon.

The application focuses primarily on the **lunar south pole**, where extreme lighting conditions, complex terrain, and limited direct-to-Earth communication opportunities make mission planning particularly challenging.

Using official NASA resources, including **JPL Horizons, NASA Moon Trek, and LROC QuickMap**, HELIOS enables users to analyze Sun and Earth positions, evaluate sunlight availability, assess communication opportunities, compare landing scenarios, and receive AI-assisted recommendations.

### Our Mission

> To simplify complex lunar scientific data into an intelligent, accessible, and visually engaging platform that helps users make informed lunar landing decisions.

### Our Innovation

Unlike traditional lunar mapping tools, HELIOS combines:

- Interactive lunar mapping
- Scientific Sun and Earth position analysis
- Solar illumination and communication assessments
- Landing site and mission-date comparison
- AI-assisted landing site recommendations
- Explainable decision-making based on actual scientific results

**HELIOS does not invent astronomical measurements.** Its AI advisor explains and interprets results produced by the scientific analysis engine.

---

## 2. Problem Statement

Selecting suitable landing sites on the Moon, especially near its south pole, presents several challenges.

**Solar illumination:** Certain regions experience extended periods of darkness, limiting solar energy availability.

**Earth visibility:** Earth is not always visible from every lunar location, affecting direct-to-Earth communication opportunities.

**Complex lunar terrain:** Mountains, crater walls, and uneven terrain can obstruct sunlight and communication paths.

**Changing mission schedules:** Launch delays and revised landing dates can significantly change mission conditions.

**Complex existing tools:** Scientific platforms provide detailed lunar information, but combining and comparing their outputs can be difficult for non-specialists.

### Our Solution

HELIOS provides a unified application where users can:

1. Explore lunar landing locations.
2. Select mission dates and times.
3. Analyze Sun and Earth positions.
4. Evaluate sunlight and communication opportunities.
5. Compare multiple landing scenarios.
6. Ask an AI advisor to recommend suitable options based on mission requirements.

---

## 3. Key Application Features

### Feature 1 — Interactive Lunar Map

- Explore the lunar surface using NASA-derived mapping resources.
- Select predefined candidate landing sites.
- Enter custom lunar latitude and longitude coordinates where supported.
- Display selected locations using interactive map markers.
- Navigate and inspect potential landing regions.

### Feature 2 — NASA Scientific Data Integration

- Retrieve ephemeris data from JPL Horizons.
- Access lunar imagery and terrain resources through Moon Trek and QuickMap.
- Process scientific data using Python.
- Standardize coordinates, timestamps, and measurement units.
- Cache retrieved results to improve application performance.

### Feature 3 — Sun and Earth Position Visualization

- Visualize the Sun and Earth's positions relative to the lunar horizon.
- Display solar and Earth elevation angles.
- Display azimuth values.
- Observe position changes across selected dates and times.
- Present scientific information through intuitive visualizations.

### Feature 4 — Solar Power and Communication Analysis

- Calculate sunlight availability for selected mission periods.
- Analyze geometric Earth visibility.
- Identify potential direct-to-Earth communication windows.
- Estimate time remaining before sunset or Earthset when supported by available data.
- Display simplified power and communication condition indicators.

**Scientific limitation:** Geometric visibility alone does not account for terrain obstruction. Actual communication link availability and solar power output require additional modeling.

### Feature 5 — Landing Site and Date Comparison

- Compare multiple candidate landing sites.
- Compare different dates for the same location.
- Display side-by-side metrics.
- Visualize sunlight and Earth visibility timelines.
- Analyze mission schedule changes.
- Highlight advantages and disadvantages of alternative scenarios.

### Feature 6 — HELIOS AI Lunar Landing Advisor

HELIOS provides an AI-assisted recommendation system that translates scientific measurements into understandable mission-planning advice.

Users can describe requirements such as:

> "Find a lunar landing location with maximum sunlight and at least 80% Earth visibility during a three-day mission."

HELIOS will:

1. Interpret the user's mission requirements.
2. Retrieve scientific results for available candidate locations and dates.
3. Filter candidates based on mandatory constraints.
4. Rank suitable candidates.
5. Explain the reasoning behind each recommendation.
6. Highlight trade-offs and limitations.

The first version will use a deterministic, explainable ranking engine. An optional LLM integration may provide natural-language interpretation and conversational explanations.

---

## 4. Official NASA Data & Resources

### NASA Resources

| Resource | Purpose |
|---|---|
| [LROC QuickMap](https://quickmap.lroc.asu.edu/) | Lunar surface imagery, topography, and landing site exploration |
| [NASA Moon Trek](https://trek.nasa.gov/moon/) | Lunar maps, terrain visualization, and available map layers |
| [NASA JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | Sun and Earth ephemeris calculations for lunar locations |

### Space Agency Partner Resource

| Resource | Purpose |
|---|---|
| [Canadian Space Agency — Moon Exploration](https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/) | Lunar exploration mission information and background research |

### Optional 3D Visualization Resource

- [Cesium](https://cesium.com/) — Interactive 3D geospatial visualization and available lunar visualization resources.

### Data Integration Strategy

These resources are scientific portals and services rather than a single unified dataset.

Our application will retrieve the relevant data through supported interfaces, process it into consistent structures, and make it available to the frontend.

**Initial data priorities:**

1. Obtain real Sun/Earth ephemeris values using JPL Horizons.
2. Display a lunar map layer using an authorized mapping service.
3. Prepare a small set of candidate landing sites.
4. Calculate visibility metrics from retrieved scientific data.
5. Store reusable processed results locally or in a lightweight cache.

The application must follow the access requirements, licensing conditions, attribution rules, and usage limitations of each data provider.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI Styling | Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI |
| Data Processing | Pandas, NumPy |
| Astronomical Data | NASA JPL Horizons API |
| Lunar Mapping | OpenLayers |
| Charts and Timelines | Recharts |
| Scientific Libraries | Additional Python libraries as required |
| AI Recommendation Engine | Python-based constraint filtering and ranking |
| AI Explanation Layer | Rule-based explanations, optional LLM API |
| Optional 3D Visualization | Three.js or CesiumJS |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| AI Development Assistance | ChatGPT, Codex, GitHub Copilot |

For the initial 24-hour development cycle, we will prioritize the essential technologies.

Advanced 3D rendering, complex databases, and unnecessary external services will be postponed unless the core application is already functional.

---

## 6. System Architecture

```text
                  USER
                   |
                   v
       +------------------------+
       |    REACT FRONTEND      |
       |------------------------|
       | Lunar Map              |
       | Site & Date Selection  |
       | Sun/Earth Visualization|
       | Power & Communication  |
       | Scenario Comparison    |
       | HELIOS AI Advisor      |
       +------------------------+
                   |
              REST API
                   |
                   v
       +------------------------+
       |    FASTAPI BACKEND     |
       |------------------------|
       | NASA Data Services     |
       | Scientific Analysis    |
       | Visibility Calculations|
       | Comparison Engine      |
       | AI Ranking Engine      |
       | Explanation Engine     |
       +------------------------+
                   |
                   v
       +------------------------+
       |  NASA DATA RESOURCES   |
       |------------------------|
       | JPL Horizons           |
       | NASA Moon Trek         |
       | LROC QuickMap          |
       +------------------------+
                   |
                   v
       +------------------------+
       | DATA PROCESSING/CACHE  |
       |------------------------|
       | Pandas / NumPy         |
       | Processed JSON / Files |
       | Coordinate Conversion  |
       | Data Validation        |
       +------------------------+
```

### Application Workflow

1. The user selects a lunar landing site and mission date.
2. The frontend sends the selected parameters to FastAPI.
3. The backend retrieves or loads relevant NASA-derived scientific data.
4. Scientific modules calculate the required visibility metrics.
5. Results are returned to the React dashboard.
6. The frontend displays maps, charts, and comparison indicators.
7. HELIOS analyzes the scientific results against user requirements.
8. The application provides ranked recommendations and explanations.

---

## 7. Team Structure — Six Functional Modules

Each member owns one functional module, including its frontend and backend functionality where necessary.

Modules will be developed independently and integrated through shared APIs and data models.

### Member 1 — Lunar Map, Site Selection & Technical Integration

**Role:** Technical Lead

**Responsibilities:**

- Initialize the GitHub repository.
- Set up the shared project structure.
- Configure React and FastAPI development environments.
- Implement the interactive lunar map using OpenLayers.
- Integrate suitable lunar mapping imagery.
- Develop landing site markers and coordinate selection.
- Implement shared site/date selection controls.
- Coordinate GitHub contributions and pull requests.
- Manage overall integration and deployment.

**Deliverables:**

- Initialized GitHub repository
- Functional lunar map
- Landing site selection interface
- Shared application setup
- Integrated application

**Branch:** `feature/lunar-map`

### Member 2 — NASA Data Integration

**Role:** NASA Data Engineer

**Responsibilities:**

- Study the official NASA resources.
- Identify suitable APIs and available datasets.
- Implement JPL Horizons data retrieval.
- Retrieve Sun/Earth ephemeris information.
- Investigate access to lunar imagery and terrain layers.
- Normalize coordinates, timestamps, and scientific measurement units.
- Develop reusable Python data services.
- Cache processed results.
- Document scientific data sources and limitations.

**Deliverables:**

- NASA data retrieval module
- Processed ephemeris data
- Reusable data-loading services
- Data source documentation

**Branch:** `feature/nasa-data`

### Member 3 — Sun & Earth Position Visualization

**Role:** Scientific Visualization Developer

**Responsibilities:**

- Consume scientific data provided by Member 2.
- Prepare Sun and Earth azimuth and elevation values.
- Develop a local-horizon visualization.
- Display Sun and Earth positions at selected times.
- Visualize how positions change over a mission interval.
- Provide reusable position visualization components.
- Document the scientific assumptions used.

**Deliverables:**

- Sun and Earth position visualization
- Elevation and azimuth displays
- Position timeline components
- Scientific position API integration

**Branch:** `feature/sun-earth`

### Member 4 — Solar Power & Communication Analysis

**Role:** Scientific Analysis Developer

**Responsibilities:**

- Implement sunlight availability calculations.
- Analyze Earth visibility over selected intervals.
- Calculate sunlight and visibility percentages.
- Identify potential communication windows.
- Calculate available sunlight duration.
- Estimate time to the next visibility transition where data permits.
- Develop power and communication indicator components.
- Provide analysis results to the comparison and AI modules.

**Deliverables:**

- Sunlight analysis service
- Earth visibility calculations
- Communication availability metrics
- Power and communication dashboard cards

**Branch:** `feature/power-communication`

### Member 5 — Scenario Comparison & Timelines

**Role:** Comparison & Timeline Developer

**Responsibilities:**

- Implement side-by-side landing site comparison.
- Compare different mission dates.
- Develop visibility charts using Recharts.
- Implement timeline and date-range controls.
- Build mission-delay scenario analysis.
- Display differences in sunlight and communication conditions.
- Provide structured comparison results to HELIOS.

**Deliverables:**

- Landing site comparison dashboard
- Sunlight and communication timelines
- Date-based scenario comparison
- Mission-delay analysis feature

**Branch:** `feature/comparison`

### Member 6 — HELIOS AI Lunar Landing Advisor

**Role:** AI Recommendation Developer

**Responsibilities:**

- Build the HELIOS assistant interface.
- Implement structured mission requirement inputs.
- Support natural-language requirement interpretation if feasible.
- Consume scientific metrics from other modules.
- Filter candidate sites based on mandatory requirements.
- Develop transparent site ranking logic.
- Generate evidence-based explanations.
- Return ranked recommendations and trade-off summaries.
- Integrate an optional LLM API for conversational responses.

**Deliverables:**

- HELIOS recommendation engine
- Mission constraint filtering
- Explainable site rankings
- AI advisor interface

**Branch:** `feature/helios-ai`

---

## 8. GitHub Repository Structure

We will use a single GitHub repository containing both frontend and backend code.

```text
helios-lunar-navigator/
|
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   |
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── shared/
│   │   |
│   │   ├── features/
│   │   │   |
│   │   │   ├── lunar-map/             # Member 1
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   |
│   │   │   ├── sun-earth/             # Member 3
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   |
│   │   │   ├── power-communication/   # Member 4
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   |
│   │   │   ├── comparison/            # Member 5
│   │   │   │   ├── components/
│   │   │   │   └── services/
│   │   │   |
│   │   │   └── helios-ai/             # Member 6
│   │   │       ├── components/
│   │   │       └── services/
│   │   |
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   |
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
|
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   |
│   │   ├── api/
│   │   │   ├── sites.py
│   │   │   ├── ephemeris.py
│   │   │   ├── conditions.py
│   │   │   ├── comparison.py
│   │   │   └── helios.py
│   │   |
│   │   ├── models/
│   │   │   └── schemas.py
│   │   |
│   │   ├── services/
│   │   │   ├── nasa_data.py           # Member 2
│   │   │   ├── positions.py           # Member 3
│   │   │   ├── visibility.py          # Member 4
│   │   │   ├── comparison.py          # Member 5
│   │   │   └── helios_advisor.py      # Member 6
│   │   |
│   │   └── utils/
│   |
│   ├── .env.example
│   └── requirements.txt
|
├── data/
│   ├── raw/
│   └── processed/
|
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   ├── data-sources.md
│   └── scientific-assumptions.md
|
├── tests/                          # Formal testing phase
|
├── .gitignore
├── LICENSE                         # Add after license selection
└── README.md
```

**Note:** This is our target repository structure. Some folders and modules will be created during development rather than existing immediately.

### Repository Organization Rules

- Each member works primarily inside their assigned module.
- Shared API models and interfaces must be agreed upon before development.
- Common files such as `App.tsx`, `main.py`, and shared schemas are coordinated by the technical lead.
- Large scientific datasets should not be committed directly without considering repository size and licensing.
- API credentials and environment secrets must never be committed.
- All functional modules are merged into `main` through reviewed pull requests.

---

## 9. GitHub Collaboration Workflow

### Step 1 — Create the Repository

Repository name:

`helios-lunar-navigator`

Create the repository on GitHub and invite all six team members as collaborators.

Initialize the repository with a README.

### Step 2 — Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/helios-lunar-navigator.git
cd helios-lunar-navigator
```

Replace `YOUR-USERNAME` with the repository owner's GitHub username or organization.

### Step 3 — Configure Git

Each member should configure their own Git identity if it is not already configured.

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Step 4 — Initialize the Frontend

The technical lead initializes the frontend.

```bash
npm create vite@latest frontend -- --template react-ts

cd frontend

npm install

cd ..
```

Tailwind CSS, shadcn/ui, OpenLayers, and Recharts will be configured during frontend setup.

### Step 5 — Initialize the Backend

Inside the repository root:

```bash
mkdir backend
cd backend

python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install initial dependencies:

```bash
python -m pip install fastapi "uvicorn[standard]" httpx pandas numpy python-dotenv pydantic
```

Create the initial FastAPI application and requirements file.

The technical lead should commit this initial project setup before other members begin developing their modules.

### Step 6 — Create Feature Branches

Each member creates a separate branch.

Example:

```bash
git switch main
git pull origin main

git switch -c feature/lunar-map
```

Use the corresponding branch name assigned in the team responsibility section.

### Step 7 — Commit and Push Changes

After completing a development milestone:

```bash
git add .

git commit -m "feat: implement lunar map functionality"

git push -u origin feature/lunar-map
```

Replace the branch name and commit message with the relevant module.

### Step 8 — Pull Requests

1. Push changes to the feature branch.
2. Open a pull request targeting `main`.
3. Inform the technical lead.
4. Resolve conflicts if necessary.
5. Merge after review.
6. Pull the updated `main` branch before beginning additional integrated work.

### Commit Message Conventions

```text
feat: add new functionality
fix: resolve a bug
docs: update documentation
refactor: improve existing code
style: update UI styling
chore: project configuration
```

---

## 10. Shared API Design

We will use FastAPI REST endpoints to connect the scientific modules with the React frontend.

The following endpoints represent our initial API contract.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Basic backend health check |
| `/api/sites` | GET | Retrieve available lunar landing sites |
| `/api/ephemeris` | GET | Retrieve Sun/Earth position data |
| `/api/conditions` | GET | Retrieve sunlight and communication metrics |
| `/api/compare` | POST | Compare selected landing scenarios |
| `/api/helios/recommend` | POST | Generate ranked landing recommendations |

### Standard Scientific Data Format

All modules should use consistent field names and measurement units.

Example structure:

```json
{
  "site_id": "candidate_001",
  "latitude_deg": -89.0,
  "longitude_deg": 0.0,
  "start_utc": "2026-11-20T00:00:00Z",
  "end_utc": "2026-11-23T00:00:00Z",
  "step_minutes": 60,
  "metrics": {
    "sunlit_fraction": null,
    "earth_visible_fraction": null,
    "sunlit_hours": null,
    "earth_visible_hours": null
  },
  "horizon_model": "geometric",
  "status": "pending",
  "source": "JPL Horizons"
}
```

This is an illustrative API structure, not real scientific output.

### Data Conventions

- Latitude and longitude will be represented in decimal degrees.
- Longitude convention must be documented and consistent across all modules.
- All timestamps will use UTC in ISO 8601 format.
- Angles will be measured in degrees.
- Durations will be measured in hours.
- Visibility fractions will range from 0 to 1.
- Percentage values shown in the UI will be calculated from those fractions.
- Missing or unsupported results must be represented explicitly.
- Every scientific result should identify its data source and calculation assumptions.

These conventions must be finalized before module implementation.

---

## 11. HELIOS AI Recommendation Architecture

### User Input

Users specify mission constraints through a form or natural-language query.

Example:

> "I need a lunar landing site with maximum sunlight and at least 80% Earth visibility for a three-day mission."

### Step 1 — Requirement Interpretation

The application converts the request into structured conditions.

Example:

```json
{
  "objective": "maximize_sunlight",
  "minimum_earth_visibility_pct": 80,
  "mission_duration_hours": 72
}
```

### Step 2 — Scientific Evaluation

The backend obtains the relevant sunlight and Earth visibility measurements for supported candidate sites and mission intervals.

These results must come from NASA-derived scientific data and documented calculations.

### Step 3 — Constraint Filtering

HELIOS filters candidate scenarios based on mandatory requirements.

For example:

- Earth visibility must be at least 80%.
- The candidate must have complete data for the required mission interval.
- The mission date must fall within supported data coverage.

Candidates that fail mandatory constraints are excluded from the eligible shortlist.

### Step 4 — Ranking

Eligible candidates are ranked using a transparent scoring model.

For the initial MVP, a rule-based ranking system will be used.

A possible ranking formula is:

```text
Score =
    w1 × Normalized Sunlight Availability
  + w2 × Normalized Earth Visibility
```

Where:

- `w1` is the selected importance of sunlight.
- `w2` is the selected importance of Earth visibility.
- `w1 + w2 = 1`.

The weighting method, normalization, and ranking assumptions must be documented.

When the user explicitly prioritizes maximum sunlight, eligible candidates can be ranked directly by sunlight availability rather than using arbitrary weights.

### Step 5 — Explainable Recommendations

HELIOS produces explanations based on actual calculated metrics.

**Example explanation:**

"Site A ranks above Site B because it provides a longer sunlight window while meeting the minimum Earth visibility requirement. Site B offers more favorable communication visibility but has less sunlight during the selected mission period."

This is illustrative wording only.

Actual explanations must reference the corresponding scientific measurements.

### Step 6 — AI Integration

The first version will use deterministic explanations based on scientific values.

If time permits, an external LLM API may be added to:

- Interpret flexible natural-language requests.
- Explain scientific trade-offs conversationally.
- Summarize ranked results.
- Help users explore alternative mission conditions.

**AI Safety and Scientific Reliability Rules**

- The LLM must not generate astronomical measurements.
- All numeric results must come from the scientific analysis engine.
- Missing data must never be replaced with invented values.
- Recommendations must state assumptions and limitations.
- The application must distinguish computed scientific facts from heuristic scores.
- If no site satisfies the requested constraints, HELIOS must clearly report that result.

---

## 12. Development Roadmap — 24 Hours

Our development process consists of seven stages.

Formal testing will take place separately after development, while essential functionality and integration checks will be performed during the hackathon.

| Time | Phase | Activities |
|---|---|---|
| Hours 0–2 | Project Setup | GitHub, architecture, API contracts, NASA data feasibility |
| Hours 2–5 | Initial Development | Parallel module development and first data retrieval |
| Hours 5–10 | Core Development | Scientific analysis, maps, UI, comparison logic, HELIOS ranking |
| Hours 10–15 | Integration | Connect frontend, backend, and NASA-derived results |
| Hours 15–19 | Final Features | Complete HELIOS, charts, timelines, and UI improvements |
| Hours 19–22 | Deployment | Merge modules, resolve blockers, deploy application |
| Hours 22–24 | Submission | README, documentation, demonstration, final submission |

### Phase 1 — Setup (Hours 0–2)

**All Members**

- [ ] Confirm module ownership.
- [ ] Create and clone the GitHub repository.
- [ ] Initialize React and FastAPI.
- [ ] Review official NASA data access methods.
- [ ] Define shared API response models.
- [ ] Agree on coordinate and time conventions.
- [ ] Create feature branches.
- [ ] Confirm basic data retrieval feasibility.

**Milestone:** Repository initialized and all six members ready to develop.

### Phase 2 — Initial Development (Hours 2–5)

**Member 1**
- [ ] Set up the frontend shell.
- [ ] Begin lunar map integration.

**Member 2**
- [ ] Connect to JPL Horizons.
- [ ] Retrieve the first valid ephemeris dataset.

**Member 3**
- [ ] Build the local-horizon visualization.

**Member 4**
- [ ] Implement basic sunlight and visibility calculation functions.

**Member 5**
- [ ] Build the comparison interface with agreed mock data.

**Member 6**
- [ ] Create the HELIOS advisor interface and constraint schema.

**Milestone:** Every member has an initial functioning module.

### Phase 3 — Core Development (Hours 5–10)

- [ ] Complete NASA data processing services.
- [ ] Complete site selection functionality.
- [ ] Display Sun/Earth positions.
- [ ] Calculate sunlight and communication visibility metrics.
- [ ] Implement comparison charts.
- [ ] Implement constraint filtering and recommendation ranking.

**Milestone:** Core modules produce usable outputs.

### Phase 4 — Integration (Hours 10–15)

- [ ] Connect the lunar map to shared site selection.
- [ ] Connect scientific APIs to frontend visualizations.
- [ ] Connect metrics to comparison charts.
- [ ] Connect HELIOS to real scientific results.
- [ ] Handle loading, unavailable data, and errors.
- [ ] Confirm consistent API responses across modules.

**Milestone:** Complete end-to-end application flow.

### Phase 5 — Final Features (Hours 15–19)

- [ ] Polish the main dashboard.
- [ ] Complete mission date comparisons.
- [ ] Improve visibility timelines.
- [ ] Complete HELIOS explanations.
- [ ] Add mission-delay scenario analysis if feasible.
- [ ] Improve responsive UI.
- [ ] Add optional 3D visualization only if the MVP is stable.

**Milestone:** Feature-complete hackathon MVP.

### Phase 6 — Deployment (Hours 19–22)

- [ ] Merge all feature branches.
- [ ] Resolve integration conflicts.
- [ ] Configure environment variables.
- [ ] Deploy React frontend to Vercel.
- [ ] Deploy FastAPI backend to Render.
- [ ] Configure frontend API URL and backend CORS.
- [ ] Verify a basic end-to-end demonstration using real data.

**Milestone:** Publicly accessible application.

### Phase 7 — Documentation and Submission (Hours 22–24)

- [ ] Finalize the README.
- [ ] Document NASA data sources.
- [ ] Document scientific limitations.
- [ ] Prepare project screenshots.
- [ ] Record a short application demonstration.
- [ ] Prepare project pitch and description.
- [ ] Verify current hackathon submission requirements.
- [ ] Submit all required project materials before the official deadline.

**Milestone:** Completed hackathon submission.

---

## 13. MVP Scope and Priorities

### Essential Features

- [ ] Working NASA data integration
- [ ] Interactive lunar map
- [ ] Landing site selection
- [ ] Mission date/time selection
- [ ] Sun and Earth position visualization
- [ ] Sunlight availability analysis
- [ ] Earth visibility analysis
- [ ] Landing site/date comparison
- [ ] Interactive visibility timelines
- [ ] HELIOS constraint filtering
- [ ] Explainable landing site recommendations
- [ ] Functional deployed web application

### Optional Features

- [ ] Advanced natural-language chatbot
- [ ] Cesium-based 3D lunar visualization
- [ ] Terrain-aware shadow simulations
- [ ] Advanced mission feasibility optimization
- [ ] Persistent user accounts and saved scenarios
- [ ] Additional mission data integrations

**Development Rule:** Complete the essential features before implementing optional enhancements.

---

## 14. Scientific Assumptions and Limitations

The initial MVP focuses on scientifically grounded, simplified analysis.

### Geometric Horizon Model

Sunlight and Earth visibility can initially be evaluated using geometric elevation angles.

This simplified method does not fully account for lunar terrain obstruction.

### Terrain Effects

Mountains and crater walls can block sunlight or Earth visibility.

Accurate terrain-aware horizon modeling requires suitable elevation data and additional calculations.

### Solar Power Estimation

Solar elevation is useful for assessing illumination conditions, but actual power generation depends on solar array orientation, efficiency, shadowing, and other hardware characteristics.

### Communication Availability

Earth visibility indicates a possible direct line of sight but does not guarantee a usable communication link.

Radio equipment, link budgets, interference, and other mission-specific factors are not necessarily included.

### Temporal Accuracy

Sunlight and visibility durations depend on the selected time interval and data sampling resolution.

Short visibility transitions may be missed when using coarse time steps.

### AI Recommendation Limitations

HELIOS provides decision-support recommendations based on available calculations and user-defined constraints.

It is not a certified mission-planning or flight-safety system.

The application must communicate uncertainty, incomplete data, and unsupported scenarios clearly.

---

## 15. Collaboration Guidelines

All six members must follow these development practices:

1. Work on your assigned GitHub feature branch.
2. Keep changes within your module whenever possible.
3. Follow the shared API contracts.
4. Use UTC timestamps and consistent coordinate conventions.
5. Commit code regularly using meaningful commit messages.
6. Do not overwrite another member's work.
7. Communicate changes to shared interfaces immediately.
8. Use pull requests for integration.
9. Never commit credentials or secrets.
10. Document important scientific assumptions.
11. Use real NASA-derived data for final scientific outputs.
12. Keep the technical lead informed about integration blockers.

### Team Coordination

The technical lead will coordinate:

- Repository structure
- Shared interfaces
- Integration decisions
- Pull request reviews
- Deployment configuration
- Final application assembly

All members are responsible for completing and integrating their assigned functional modules.

---

## 16. Expected Final Deliverables

At the end of the hackathon, our team aims to deliver:

1. A functional HELIOS web application.
2. A working lunar landing site map.
3. NASA scientific data integration.
4. Sun and Earth position visualizations.
5. Solar illumination and communication analysis.
6. Landing site and mission date comparisons.
7. Explainable AI landing recommendations.
8. A deployed frontend and backend.
9. A collaborative GitHub repository.
10. Project documentation and scientific assumptions.
11. A demonstration video or presentation.
12. The completed NASA Space Apps project submission.

---

## 17. Project Demonstration

Our final demonstration will follow this user journey.

### Step 1 — Explore

The user opens HELIOS and selects a lunar landing location using the interactive map.

### Step 2 — Analyze

The application displays Sun and Earth positions, sunlight availability, and potential communication windows for the selected mission date.

### Step 3 — Compare

The user selects another landing site or changes the mission date to compare environmental conditions.

### Step 4 — Ask HELIOS

The user enters mission requirements such as:

> "Find the best available landing site with maximum sunlight and at least 80% Earth visibility."

### Step 5 — Recommend

HELIOS evaluates supported candidates, produces a ranked shortlist, and explains the trade-offs using actual scientific results.

**Our demonstration story: Explore → Analyze → Compare → Recommend.**

---

## 18. Development Status

| Component | Status |
|---|---|
| Project architecture | Planned |
| GitHub repository setup | Pending |
| NASA data integration | Pending |
| Lunar map | Pending |
| Sun/Earth visualization | Pending |
| Power and communication analysis | Pending |
| Scenario comparison | Pending |
| HELIOS recommendation engine | Pending |
| Deployment | Pending |
| Formal testing | Separate later phase |

This table should be updated as development progresses.

---

## 19. Project Links

**GitHub Repository:** To be added  
**Live Web Application:** To be added  
**Demo Video:** To be added  
**NASA Challenge:** [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)

---

## 20. Credits and Acknowledgments

This project is developed as part of the NASA Space Apps Challenge 2026.

Scientific data and background resources are provided by or accessed through:

- NASA Jet Propulsion Laboratory — Horizons System
- NASA Moon Trek
- Lunar Reconnaissance Orbiter Camera (LROC) QuickMap
- Arizona State University — LROC QuickMap
- Canadian Space Agency — Moon Exploration resources

Additional software libraries and services will be credited according to their respective licenses.

AI-assisted development tools may be used for code generation, debugging, documentation, and implementation support. Their use will be disclosed as required by the hackathon.

**Disclaimer:** HELIOS is an independent hackathon project and is not an official NASA mission-planning system. NASA does not endorse this application.

---

## 21. Team Members

| Member | Functional Responsibility | Name |
|---|---|---|
| Member 1 | Lunar Map & Technical Integration | To be added |
| Member 2 | NASA Data Integration | To be added |
| Member 3 | Sun & Earth Visualization | To be added |
| Member 4 | Power & Communication Analysis | To be added |
| Member 5 | Scenario Comparison & Timeline | To be added |
| Member 6 | HELIOS AI Landing Advisor | To be added |

---

## 22. Final Project Vision

**HELIOS aims to make lunar landing site evaluation more accessible, intelligent, and explainable.**

By combining NASA scientific data, interactive lunar visualizations, mission scenario analysis, and explainable AI, we aim to transform complex mission-planning information into clear and actionable insights.

Rather than simply presenting raw data, HELIOS helps users understand:

- Where a landing could be considered.
- When environmental conditions may be favorable.
- How sunlight and Earth visibility affect mission feasibility.
- Why one landing scenario may be preferable to another.
- What trade-offs should be considered when mission conditions change.

### HELIOS — Explore the Moon. Understand the Conditions. Choose with Confidence. 🌕🚀

**Built with curiosity, collaboration, science, and AI for NASA Space Apps Challenge 2026.**
