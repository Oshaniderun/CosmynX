import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api import comparison, conditions, ephemeris, helios, sites

load_dotenv()

app = FastAPI(
    title="HELIOS — Lunar Landing Site Navigator API",
    description="NASA Space Apps Challenge 2026 backend for lunar mission analysis.",
    version="0.1.0",
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Basic backend health check."""
    return {"status": "ok", "service": "helios-backend"}


app.include_router(sites.router, prefix="/api", tags=["Sites"])
app.include_router(ephemeris.router, prefix="/api", tags=["Ephemeris"])
app.include_router(conditions.router, prefix="/api", tags=["Conditions"])
app.include_router(comparison.router, prefix="/api", tags=["Comparison"])
app.include_router(helios.router, prefix="/api/helios", tags=["HELIOS AI"])
