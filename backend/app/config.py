"""Environment configuration. All secrets come from backend/.env (gitignored)."""

import os
import re
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _clean(name: str, default: str = "") -> str:
    # Keys, tokens and URLs here are all printable ASCII. Strip anything else
    # (notably a U+FEFF byte-order-mark, which env-var tooling can prepend and
    # which Python's .strip() does NOT remove) so it can't poison an outgoing
    # request header or invalidate the key. .strip() handles surrounding space.
    raw = os.getenv(name)
    if raw is None:
        return default
    return re.sub(r"[^\x20-\x7E]", "", raw).strip()


ANTHROPIC_API_KEY = _clean("ANTHROPIC_API_KEY")
# Haiku 4.5 is ~5x cheaper + faster than Opus and handles recipe extraction
# and constrained meal planning well. Override with KUMARA_AI_MODEL (e.g. bump
# to claude-sonnet-4-6) if planning constraints ever need more reasoning.
AI_MODEL = _clean("KUMARA_AI_MODEL") or "claude-haiku-4-5"
SUPABASE_URL = _clean("SUPABASE_URL").rstrip("/")
SUPABASE_ANON_KEY = _clean("SUPABASE_ANON_KEY")
FRONTEND_ORIGIN = _clean("FRONTEND_ORIGIN") or "http://localhost:5173"


def require_ai_key() -> str:
    """Fail with a clear message when the Claude key is missing."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Add it to backend/.env "
            "(see backend/.env.example)."
        )
    return ANTHROPIC_API_KEY
