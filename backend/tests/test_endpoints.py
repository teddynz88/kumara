"""Endpoint tests with the AI + network layers mocked.

These prove the routing, validation, and error copy without spending tokens
or needing a live key/database. Real-input tests live in the session notes.
"""

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import (
    GeneratedPlan,
    Ingredient,
    IngredientGroup,
    MacrosPerServe,
    PlanEntry,
)
from app import ai

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


def test_import_url_structured_path_no_ai():
    with patch("app.main.fetch_page", new=AsyncMock(return_value=(JSONLD_PAGE, "text"))):
        # No AI call should happen — patch it to blow up if touched.
        with patch("app.main._run_ai_extraction", side_effect=AssertionError("AI called")):
            response = client.post("/import/url", json={"url": "https://example.com/r"})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Lemon Chicken"
    assert body["source_method"] == "structured"
    assert body["servings"] == 2
    assert body["ingredient_groups"][0]["ingredients"][0]["name"] == "chicken breasts"


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
    assert body["entries"] == [{"day": 0, "slot": "dinner", "recipe_id": "aaa"}]
    assert body["dropped"] == 3


def test_plan_generate_empty_slots_short_circuits():
    response = client.post("/plan/generate", json={
        "week_start": "2026-06-08", "slots_to_fill": [],
    })
    assert response.status_code == 200
    assert response.json() == {"entries": [], "dropped": 0}
