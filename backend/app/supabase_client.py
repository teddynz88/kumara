"""Read-only Supabase REST access (anon key) — recipe library + macro targets."""

from typing import Any, Optional

import httpx

from . import config


class LibraryUnavailable(Exception):
    pass


def _headers() -> dict[str, str]:
    return {
        "apikey": config.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {config.SUPABASE_ANON_KEY}",
    }


async def fetch_library() -> list[dict[str, Any]]:
    """Compact recipe summaries for plan generation."""
    if not config.SUPABASE_URL or not config.SUPABASE_ANON_KEY:
        raise LibraryUnavailable("Supabase is not configured on the backend (see backend/.env.example).")
    url = (
        f"{config.SUPABASE_URL}/rest/v1/recipes"
        "?select=id,title,tags,calories,protein_g,carbs_g,fat_g,fibre_g,"
        "rating,is_favourite,prep_time_mins,cook_time_mins,ingredients"
    )
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=_headers(), timeout=10.0)
        except httpx.HTTPError as exc:
            raise LibraryUnavailable(
                "Couldn't reach the recipe database. Is the Supabase project awake?"
            ) from exc
    if response.status_code != 200:
        raise LibraryUnavailable(f"Recipe database error ({response.status_code}).")
    return response.json()


async def fetch_targets() -> Optional[dict[str, Any]]:
    """First row of nutrition_targets, or None when unset / table missing."""
    if not config.SUPABASE_URL or not config.SUPABASE_ANON_KEY:
        return None
    url = f"{config.SUPABASE_URL}/rest/v1/nutrition_targets?select=*&limit=1"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=_headers(), timeout=10.0)
        except httpx.HTTPError:
            return None
    if response.status_code != 200:
        return None  # table may not exist before the migration runs
    rows = response.json()
    return rows[0] if rows else None


def summarise_library(rows: list[dict[str, Any]]) -> str:
    """One line per recipe — compact enough for the prompt, complete enough
    for constraints like 'no fish' (ingredient names included)."""
    lines = []
    for r in rows:
        ingredients = ", ".join(
            (i.get("name") or "") for i in (r.get("ingredients") or [])
        )[:300]
        time_total = (r.get("prep_time_mins") or 0) + (r.get("cook_time_mins") or 0)
        lines.append(
            f"- id={r['id']} | {r['title']} | tags: {', '.join(r.get('tags') or [])} | "
            f"per serve: {r.get('calories')} cal, {r.get('protein_g')}g protein, "
            f"{r.get('carbs_g')}g carbs, {r.get('fat_g')}g fat, {r.get('fibre_g')}g fibre | "
            f"time: {time_total or '?'} min | rating: {r.get('rating') or '-'}/5 | "
            f"favourite: {bool(r.get('is_favourite'))} | ingredients: {ingredients}"
        )
    return "\n".join(lines)
