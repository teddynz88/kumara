"""Environment configuration. All secrets come from backend/.env (gitignored)."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

ANTHROPIC_API_KEY = (os.getenv("ANTHROPIC_API_KEY") or "").strip()
AI_MODEL = os.getenv("KUMARA_AI_MODEL", "claude-opus-4-8")
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip().rstrip("/")
SUPABASE_ANON_KEY = (os.getenv("SUPABASE_ANON_KEY") or "").strip()
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


def require_ai_key() -> str:
    """Fail with a clear message when the Claude key is missing."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Add it to backend/.env "
            "(see backend/.env.example)."
        )
    return ANTHROPIC_API_KEY
