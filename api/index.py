"""Vercel entrypoint — wraps the FastAPI backend as one serverless function.

Vercel rewrites /api/* here (see vercel.json) and passes the original
request path through, so the backend app is mounted under /api to match.
Locally this file is unused: uvicorn serves backend/app directly and the
Vite proxy strips the /api prefix instead.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from fastapi import FastAPI  # noqa: E402

from app.main import app as backend_app  # noqa: E402

app = FastAPI()
app.mount("/api", backend_app)
