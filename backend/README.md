# Kūmara backend

FastAPI service for recipe import (URL + PDF) and AI meal plan generation.
The Claude API key lives here, server-side only.

## First-time setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env     # then fill in ANTHROPIC_API_KEY + Supabase values
```

## Run

```powershell
cd backend
.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

The frontend dev server (`npm run dev` in `frontend/`) proxies `/api/*` to
`http://localhost:8000`, so both must be running for imports and generation.

## Endpoints

| Route | What it does |
|---|---|
| `GET /health` | `{"status": "ok"}` |
| `POST /import/url` | `{url}` → recipe in the extraction schema. JSON-LD first (no AI), Claude fallback. Saves nothing. |
| `POST /import/pdf` | multipart PDF upload → same schema. Text layer only (no OCR). |
| `POST /plan/generate` | `{week_start, prompt?, slots_to_fill}` → validated plan entries from your own library. |

## Tests

```powershell
cd backend
.venv\Scripts\python -m pytest
```

Unit tests cover the JSON-LD/ingredient parsing and endpoint validation with
the AI layer mocked — no key or network needed.
