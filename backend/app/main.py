import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api import comparison, conditions, ephemeris, helios, sites, stress_tests, terrain

load_dotenv()

app = FastAPI(
    title="HELIOS — Lunar Landing Site Navigator API",
    description="NASA Space Apps Challenge 2026 backend for lunar mission analysis.",
    version="0.1.0",
)

raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
allowed_origins = (
    [origin.strip() for origin in raw_allowed_origins.split(",") if origin.strip()]
    if raw_allowed_origins
    else ["http://localhost:5173", "http://127.0.0.1:5173"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=None if raw_allowed_origins else r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Basic backend health check."""
    return {"status": "ok", "service": "helios-backend"}


app.include_router(sites.router, prefix="/api", tags=["Sites"])
app.include_router(terrain.router, prefix="/api", tags=["Terrain"])
app.include_router(ephemeris.router, prefix="/api", tags=["Ephemeris"])
app.include_router(conditions.router, prefix="/api", tags=["Conditions"])
app.include_router(comparison.router, prefix="/api", tags=["Comparison"])
app.include_router(stress_tests.router, prefix="/api", tags=["Delay Lab"])
app.include_router(helios.router, prefix="/api/helios", tags=["HELIOS AI"])
