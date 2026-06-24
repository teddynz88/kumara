"""Endpoint tests with the AI + network layers mocked.

These prove the routing, validation, and error copy without spending tokens
or needing a live key/database. Real-input tests live in the session notes.
"""

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.auth import AuthedUser, require_user
from app.schemas import (
    GeneratedPlan,
    Ingredient,
    IngredientGroup,
    MacrosPerServe,
    PlanEntry,
)
from app import ai

# The AI endpoints require a signed-in user; stand in a fake one so these
# tests exercise routing/validation without a live Supabase session.
app.dependency_overrides[require_user] = lambda: AuthedUser("test-user", "test-token")

client = TestClient(app)

JSONLD_PAGE = """
<html><head><script type="application/ld+json">
{"@type":"Recipe","name":"Lemon Chicken","recipeYield":"2",
 "recipeIngredient":["2 chicken breasts","1 lemon"],
 "recipeInstructions":[{"@type":"HowToStep","text":"Cook it."}]}
</script></head><body></body></html>
"""


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_ai_endpoints_require_auth():
    # A bare client with NO dependency override should be rejected.
    import pytest
    from fastapi import HTTPException
    from app.auth import require_user

    async def call(auth_header):
        return await require_user(authorization=auth_header)

    import asyncio
    with pytest.raises(HTTPException) as exc:
        asyncio.run(call(None))
    assert exc.value.status_code == 401
    with pytest.raises(HTTPException) as exc:
        asyncio.run(call("Basic xyz"))
    assert exc.value.status_code == 401


def test_import_url_structured_path_no_ai_extraction():
    # The structured (JSON-LD) path must not call the AI *extractor*. It may
    # call the cheap macro *estimator* when the page has no nutrition data —
    # stub that so the test stays offline.
    est = MacrosPerServe(calories=300, protein=25, carbs=10, fat=8, fibre=2, estimated=True)
    with patch("app.main.fetch_page", new=AsyncMock(return_value=(JSONLD_PAGE, "text"))):
        with patch("app.main._run_ai_extraction", side_effect=AssertionError("AI extractor called")):
            with patch("app.main.ai.estimate_macros", return_value=est) as est_mock:
                response = client.post("/import/url", json={"url": "https://example.com/r"})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Lemon Chicken"
    assert body["source_method"] == "structured"
    assert body["servings"] == 2
    assert body["ingredient_groups"][0]["ingredients"][0]["name"] == "chicken breasts"
    # Page had no nutrition → estimator was invoked and its values flow through.
    est_mock.assert_called_once()
    assert body["macros_per_serve"]["calories"] == 300
    assert body["macros_per_serve"]["estimated"] is True


def test_import_url_rejects_instagram():
    response = client.post("/import/url", json={"url": "https://www.instagram.com/p/x"})
    assert response.status_code == 400
    assert "Instagram" in response.json()["detail"]


def test_import_url_unreachable_page():
    from app.fetcher import PageUnreachable

    with patch("app.main.fetch_page", new=AsyncMock(side_effect=PageUnreachable(
        "We couldn't reach that page. Check the link and try again."
    ))):
        response = client.post("/import/url", json={"url": "https://nope.example/x"})
    assert response.status_code == 400
    assert "couldn't reach" in response.json()["detail"]


def test_import_url_no_recipe_found_friendly_error():
    plain_page = "<html><body><p>" + ("Just a news article. " * 30) + "</p></body></html>"
    with patch("app.main.fetch_page", new=AsyncMock(return_value=(plain_page, "Just a news article. " * 30))):
        with patch("app.main._run_ai_extraction", side_effect=ai.NoRecipeFound("x")):
            response = client.post("/import/url", json={"url": "https://example.com/news"})
    assert response.status_code == 400
    assert "enter it manually" in response.json()["detail"]


def _fake_library():
    return [
        {"id": "aaa", "title": "Garlic Chicken", "tags": ["dinner"], "calories": 476,
         "protein_g": 54, "carbs_g": 9, "fat_g": 20, "fibre_g": 5, "rating": 5,
         "is_favourite": True, "prep_time_mins": 15, "cook_time_mins": 15,
         "ingredients": [{"name": "chicken"}]},
        {"id": "bbb", "title": "Snapper Salad", "tags": ["dinner", "fish"], "calories": 475,
         "protein_g": 35, "carbs_g": 16, "fat_g": 29, "fibre_g": 6, "rating": 4,
         "is_favourite": False, "prep_time_mins": 10, "cook_time_mins": 30,
         "ingredients": [{"name": "snapper"}]},
    ]


def test_plan_generate_validates_ids_and_slots():
    fake_plan = GeneratedPlan(entries=[
        PlanEntry(day=0, slot="dinner", recipe_id="aaa"),       # valid
        PlanEntry(day=1, slot="dinner", recipe_id="zzz"),       # invalid id -> dropped
        PlanEntry(day=2, slot="dinner", recipe_id="bbb"),       # slot not requested -> dropped
        PlanEntry(day=0, slot="dinner", recipe_id="bbb"),       # duplicate slot -> dropped
    ])
    with patch("app.main.fetch_library", new=AsyncMock(return_value=_fake_library())):
        with patch("app.main.fetch_targets", new=AsyncMock(return_value=None)):
            with patch("app.main.ai.generate_plan", return_value=fake_plan):
                response = client.post("/plan/generate", json={
                    "week_start": "2026-06-08",
                    "prompt": "no fish",
                    "slots_to_fill": [
                        {"day": 0, "slot": "dinner"},
                        {"day": 1, "slot": "dinner"},
                    ],
                })
    assert response.status_code == 200
    body = response.json()
    assert body["entries"] == [
        {"day": 0, "slot": "dinner", "entry_type": "recipe", "recipe_id": "aaa"}
    ]
    assert body["dropped"] == 3


def test_plan_generate_accepts_special_day_markers():
    # A non-recipe marker (e.g. a Friday restaurant night) carries no recipe_id
    # and should pass validation as-is, alongside a normal recipe entry.
    fake_plan = GeneratedPlan(entries=[
        PlanEntry(day=0, slot="dinner", recipe_id="aaa"),
        PlanEntry(day=4, slot="dinner", entry_type="restaurant"),
    ])
    with patch("app.main.fetch_library", new=AsyncMock(return_value=_fake_library())):
        with patch("app.main.fetch_targets", new=AsyncMock(return_value=None)):
            with patch("app.main.ai.generate_plan", return_value=fake_plan) as gen:
                response = client.post("/plan/generate", json={
                    "week_start": "2026-06-08",
                    "prompt": "restaurant friday dinner",
                    "packs": ["Health with Bec - Meal Plan 76 (June 2026)"],
                    "slots_to_fill": [
                        {"day": 0, "slot": "dinner"},
                        {"day": 4, "slot": "dinner"},
                    ],
                })
    assert response.status_code == 200
    body = response.json()
    assert body["entries"] == [
        {"day": 0, "slot": "dinner", "entry_type": "recipe", "recipe_id": "aaa"},
        {"day": 4, "slot": "dinner", "entry_type": "restaurant", "recipe_id": None},
    ]
    assert body["dropped"] == 0
    # The selected packs are forwarded to the generator.
    assert gen.call_args.args[4] == ["Health with Bec - Meal Plan 76 (June 2026)"]


def test_plan_generate_empty_slots_short_circuits():
    response = client.post("/plan/generate", json={
        "week_start": "2026-06-08", "slots_to_fill": [],
    })
    assert response.status_code == 200
    assert response.json() == {"entries": [], "dropped": 0}
