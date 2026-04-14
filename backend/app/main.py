from __future__ import annotations

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


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Adaptive EQ Analysis API",
        "version": get_api_version(),
    }
