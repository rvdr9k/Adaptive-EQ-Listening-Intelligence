from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_api_version, get_frontend_origins

app = FastAPI(
    title="Adaptive EQ Analysis API",
    version=get_api_version(),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_frontend_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analysis_store: dict[str, dict[str, Any]] = {}


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Adaptive EQ Analysis API",
        "version": get_api_version(),
    }


def build_mock_analysis(track_id: str) -> dict[str, Any]:
    seed = sum(ord(char) for char in track_id) % 3

    moods = ["Balanced and clear", "Warm with punchy lows", "Bright and energetic"]
    recommendations = [
        "Light bass lift and slight presence boost.",
        "Reduce low-mids slightly and open upper mids.",
        "Tame upper highs and tighten sub-bass.",
    ]
    tempo_estimates = [96, 112, 128]
    energy_levels = ["Medium", "High", "Medium-High"]

    return {
        "track_id": track_id,
        "summary": moods[seed],
        "eq_recommendation": recommendations[seed],
        "tempo_bpm_estimate": tempo_estimates[seed],
        "energy_level": energy_levels[seed],
        "updated_at": datetime.now(UTC).isoformat(),
    }


@app.post("/analysis/{track_id}")
def analyze_track(track_id: str) -> dict[str, Any]:
    result = build_mock_analysis(track_id)
    analysis_store[track_id] = result
    return result


@app.get("/analysis/{track_id}")
def get_track_analysis(track_id: str) -> dict[str, Any]:
    if track_id not in analysis_store:
        raise HTTPException(status_code=404, detail="No analysis found for this track yet.")

    return analysis_store[track_id]
