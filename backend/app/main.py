from __future__ import annotations

from datetime import UTC, datetime
import os
import tempfile
from typing import Any

import audioread
from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import requests

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

class AnalyzeRequest(BaseModel):
    audio_url: HttpUrl
    mime_type: str | None = None


@app.post("/analysis/{track_id}")
def analyze_track(track_id: str, payload: AnalyzeRequest) -> dict[str, Any]:
    try:
        import librosa  # Lazy import for faster cold starts
        import numpy as np
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Missing analysis deps: {exc}") from exc

    suffix = ".bin"
    if payload.mime_type:
        if "mpeg" in payload.mime_type or "mp3" in payload.mime_type:
            suffix = ".mp3"
        elif "wav" in payload.mime_type:
            suffix = ".wav"
        elif "ogg" in payload.mime_type:
            suffix = ".ogg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        tmp_path = tmp_file.name

        try:
            with requests.get(str(payload.audio_url), stream=True, timeout=20) as response:
                response.raise_for_status()
                for chunk in response.iter_content(chunk_size=1024 * 256):
                    if chunk:
                        tmp_file.write(chunk)
        except requests.RequestException as exc:
            raise HTTPException(status_code=400, detail=f"Unable to fetch audio: {exc}") from exc

    try:
        # Duration is cheap and helpful, but MP3 duration still needs a decoder.
        try:
            with audioread.audio_open(tmp_path) as audio_file:
                duration_seconds = float(audio_file.duration)
        except Exception:
            duration_seconds = None

        # Analyze a short window for speed; results are still meaningful.
        y, sr = librosa.load(tmp_path, sr=None, mono=True, duration=90.0)
        if y is None or len(y) == 0 or sr is None:
            raise HTTPException(status_code=422, detail="Unable to decode audio for analysis.")

        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        rms = float(np.mean(librosa.feature.rms(y=y)))
        centroid_hz = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))

        if rms < 0.03:
            energy_level = "Low"
        elif rms < 0.07:
            energy_level = "Medium"
        else:
            energy_level = "High"

        if centroid_hz > 2600:
            summary = "Bright and detailed"
            eq_recommendation = "Tame upper highs slightly and add gentle warmth."
        elif centroid_hz < 1600:
            summary = "Warm and full"
            eq_recommendation = "Add a touch of presence and tighten low-bass."
        else:
            summary = "Balanced and clear"
            eq_recommendation = "Small bass lift and subtle presence boost."

        result = {
            "track_id": track_id,
            "summary": summary,
            "eq_recommendation": eq_recommendation,
            "tempo_bpm_estimate": float(tempo),
            "duration_seconds": duration_seconds,
            "rms_energy": rms,
            "spectral_centroid_hz": centroid_hz,
            "energy_level": energy_level,
            "updated_at": datetime.now(UTC).isoformat(),
        }

        analysis_store[track_id] = result
        return result
    except HTTPException:
        raise
    except Exception as exc:
        message = str(exc)
        if "ffmpeg" in message.lower() or "audioread" in message.lower():
            raise HTTPException(
                status_code=422,
                detail="Audio decode failed. Install ffmpeg on the server to analyze MP3 files.",
            ) from exc

        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


@app.get("/analysis/{track_id}")
def get_track_analysis(track_id: str) -> dict[str, Any]:
    if track_id not in analysis_store:
        raise HTTPException(status_code=404, detail="No analysis found for this track yet.")

    return analysis_store[track_id]
