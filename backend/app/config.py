from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


def get_frontend_origin() -> str:
    return os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173")


def get_api_version() -> str:
    return os.getenv("BACKEND_API_VERSION", "0.1.0")
