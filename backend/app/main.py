"""Kūmara backend — FastAPI service for recipe import and meal plan generation.

Run locally:  uvicorn app.main:app --reload --port 8000  (from backend/)
The Vite dev server proxies /api/* here, so the frontend just calls /api/...
"""

from urllib.parse import urljoin

import anthropic
from bs4 import BeautifulSoup
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from . import ai, config, pdf_text
from .auth import AuthedUser, require_user
from .fetcher import PageUnreachable, fetch_page
from .jsonld import find_recipe_jsonld, jsonld_to_recipe
from .schemas import (
    ExtractedRecipe,
    PlanGenerateRequest,
    PlanGenerateResponse,
    UrlImportRequest,
)
from .supabase_client import (
    LibraryUnavailable,
    fetch_library,
    fetch_targets,
    summarise_library,
)

NO_RECIPE_ERROR = "We couldn't find a recipe there. You can enter it manually instead."

app = FastAPI(title="Kūmara backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


def _og_image(html: str | None, base_url: str) -> str | None:
    """Absolute og:image URL from the page, or None."""
    if not html:
        return None
    og = BeautifulSoup(html, "html.parser").find("meta", property="og:image")
    src = og.get("content") if og else None
    return urljoin(base_url, src) if src else None


def _ai_recipe_to_extracted(
    recipe: "ai.AIExtractedRecipe", source_url: str, photo_url: str | None = None
) -> ExtractedRecipe:
    notes = None
    if recipe.other_recipes_skipped:
        plural = "s" if recipe.other_recipes_skipped != 1 else ""
        notes = (
            f"This document had {recipe.other_recipes_skipped} more recipe{plural} — "
            "only the first was imported. Import the others separately if you want them."
        )
    return ExtractedRecipe(
        title=recipe.title,
        source_url=source_url,
        source_method="ai",
        servings=recipe.servings,
        prep_minutes=recipe.prep_minutes,
        cook_minutes=recipe.cook_minutes,
        ingredient_groups=recipe.ingredient_groups,
        steps=recipe.steps,
        macros_per_serve=recipe.macros_per_serve,
        tags=recipe.tags,
        photo_url=photo_url,
        notes=notes,
    )


def _run_ai_extraction(text: str, source_hint: str) -> "ai.AIExtractedRecipe":
    """Call Claude, retrying once on transient API errors (brief §7.1)."""
    try:
        return ai.extract_recipe_from_text(text, source_hint)
    except (anthropic.APIConnectionError, anthropic.InternalServerError):
        return ai.extract_recipe_from_text(text, source_hint)


@app.post("/import/url", response_model=ExtractedRecipe)
async def import_url(body: UrlImportRequest, user: AuthedUser = Depends(require_user)) -> ExtractedRecipe:
    url = body.url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(400, "Please enter a full link starting with https://")
    if "instagram.com" in url:
        raise HTTPException(
            400,
            "Instagram links can't be imported — Instagram requires login to view "
            "posts. Copy the recipe text and enter it manually instead.",
        )

    try:
        html, text = await fetch_page(url)
    except PageUnreachable as exc:
        raise HTTPException(400, str(exc)) from exc

    # 1. Cheap path: schema.org JSON-LD — no AI call at all.
    if html:
        node = find_recipe_jsonld(html)
        if node:
            recipe = jsonld_to_recipe(node, url)
            if recipe.title and recipe.ingredient_groups:
                if not recipe.photo_url:
                    recipe.photo_url = _og_image(html, url)
                return recipe

    # 2. Fallback: Claude structures the readable page text.
    if len(text.strip()) < 100:
        raise HTTPException(400, NO_RECIPE_ERROR)
    try:
        ai_recipe = _run_ai_extraction(text, f"webpage {url}")
    except ai.NoRecipeFound:
        raise HTTPException(400, NO_RECIPE_ERROR)
    except anthropic.AuthenticationError:
        raise HTTPException(500, "The Claude API key on the backend is missing or invalid.")
    except anthropic.APIError as exc:
        raise HTTPException(502, f"The AI service had a problem: {exc.message}")
    except RuntimeError as exc:  # missing key
        raise HTTPException(500, str(exc))

    return _ai_recipe_to_extracted(ai_recipe, url, _og_image(html, url))


@app.post("/import/pdf", response_model=ExtractedRecipe)
async def import_pdf(file: UploadFile = File(...), user: AuthedUser = Depends(require_user)) -> ExtractedRecipe:
    data = await file.read()
    if not data:
        raise HTTPException(400, "That file looks empty. Try choosing it again.")

    try:
        text = pdf_text.extract_pdf_text(data)
    except pdf_text.NoTextLayer as exc:
        raise HTTPException(400, str(exc)) from exc

    try:
        ai_recipe = _run_ai_extraction(text, f"PDF file {file.filename or ''}")
    except ai.NoRecipeFound:
        raise HTTPException(400, NO_RECIPE_ERROR)
    except anthropic.AuthenticationError:
        raise HTTPException(500, "The Claude API key on the backend is missing or invalid.")
    except anthropic.APIError as exc:
        raise HTTPException(502, f"The AI service had a problem: {exc.message}")
    except RuntimeError as exc:
        raise HTTPException(500, str(exc))

    return _ai_recipe_to_extracted(ai_recipe, file.filename or "PDF upload")


@app.post("/plan/generate", response_model=PlanGenerateResponse)
async def plan_generate(
    body: PlanGenerateRequest, user: AuthedUser = Depends(require_user)
) -> PlanGenerateResponse:
    if not body.slots_to_fill:
        return PlanGenerateResponse(entries=[], dropped=0)

    # Read THIS user's library (their JWT scopes the query via RLS).
    try:
        library = await fetch_library(user.token)
    except LibraryUnavailable as exc:
        raise HTTPException(502, str(exc)) from exc
    if not library:
        raise HTTPException(400, "Your recipe library is empty — add some recipes first.")

    targets = await fetch_targets(user.token)
    targets_text = "(not set)"
    if targets:
        targets_text = (
            f"{targets.get('calories')} cal, {targets.get('protein_g')}g protein, "
            f"{targets.get('carbs_g')}g carbs, {targets.get('fat_g')}g fat, "
            f"{targets.get('fibre_g')}g fibre per day"
        )

    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    slots_text = "\n".join(
        f"- day={s.day} ({day_names[s.day]}), slot={s.slot}" for s in body.slots_to_fill
    )

    try:
        plan = ai.generate_plan(
            summarise_library(library), slots_text, targets_text, body.prompt
        )
    except anthropic.AuthenticationError:
        raise HTTPException(500, "The Claude API key on the backend is missing or invalid.")
    except anthropic.APIError as exc:
        raise HTTPException(502, f"The AI service had a problem: {exc.message}")
    except RuntimeError as exc:
        raise HTTPException(500, str(exc))

    # Validate: only real recipe ids, only requested slots, one entry per slot.
    valid_ids = {str(r["id"]) for r in library}
    requested = {(s.day, s.slot) for s in body.slots_to_fill}
    seen: set[tuple[int, str]] = set()
    entries = []
    dropped = 0
    for entry in plan.entries:
        key = (entry.day, entry.slot)
        if entry.recipe_id in valid_ids and key in requested and key not in seen:
            seen.add(key)
            entries.append(entry)
        else:
            dropped += 1

    return PlanGenerateResponse(entries=entries, dropped=dropped)
