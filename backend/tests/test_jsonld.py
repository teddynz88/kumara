"""Unit tests for the no-AI parsing layer: ingredient strings, ISO durations,
and schema.org JSON-LD mapping (including @graph and HowToSection shapes)."""

import json

from app.jsonld import (
    find_recipe_jsonld,
    iso_duration_to_minutes,
    jsonld_to_recipe,
    parse_ingredient,
)


def test_parse_simple_metric_ingredient():
    ing = parse_ingredient("500 g beef mince")
    assert ing.quantity == 500
    assert ing.unit == "g"
    assert ing.name == "beef mince"


def test_parse_fraction_becomes_decimal():
    ing = parse_ingredient("1/2 cup almond meal")
    assert ing.quantity == 0.5
    assert ing.unit == "cup"
    assert ing.name == "almond meal"


def test_parse_mixed_number():
    ing = parse_ingredient("1 1/2 tablespoons olive oil")
    assert ing.quantity == 1.5
    assert ing.unit == "tbsp"
    assert ing.name == "olive oil"


def test_parse_unicode_fraction():
    ing = parse_ingredient("½ tsp salt")
    assert ing.quantity == 0.5
    assert ing.unit == "tsp"
    assert ing.name == "salt"


def test_parse_no_quantity():
    ing = parse_ingredient("salt to taste")
    assert ing.quantity is None
    assert ing.unit == ""
    assert ing.name == "salt to taste"


def test_parse_count_only():
    ing = parse_ingredient("2 eggs")
    assert ing.quantity == 2
    assert ing.unit == ""
    assert ing.name == "eggs"


def test_parse_range_kept_as_string():
    ing = parse_ingredient("1-2 cloves garlic")
    assert ing.quantity == "1-2"
    assert ing.unit == "clove"
    assert ing.name == "garlic"


def test_parenthetical_becomes_note():
    ing = parse_ingredient("30 g Kalamata olives (about 8 olives)")
    assert ing.quantity == 30
    assert ing.unit == "g"
    assert ing.name == "Kalamata olives"
    assert ing.note == "about 8 olives"


def test_iso_durations():
    assert iso_duration_to_minutes("PT30M") == 30
    assert iso_duration_to_minutes("PT1H30M") == 90
    assert iso_duration_to_minutes("PT1H") == 60
    assert iso_duration_to_minutes("P0DT2H") == 120
    assert iso_duration_to_minutes("nonsense") is None
    assert iso_duration_to_minutes(None) is None


RECIPE_NODE = {
    "@type": "Recipe",
    "name": "Test Meatballs",
    "recipeYield": "4 servings",
    "prepTime": "PT15M",
    "cookTime": "PT25M",
    "recipeIngredient": ["500 g beef mince", "1 egg", "1/4 cup parmesan"],
    "recipeInstructions": [
        {"@type": "HowToStep", "text": "Mix everything."},
        {"@type": "HowToStep", "text": "Roll into balls and bake."},
    ],
    "nutrition": {
        "@type": "NutritionInformation",
        "calories": "420 calories",
        "proteinContent": "38 g",
        "carbohydrateContent": "6 g",
        "fatContent": "27 g",
        "fiberContent": "1 g",
    },
    "keywords": "dinner, high-protein",
    "image": {"@type": "ImageObject", "url": "https://example.com/pic.jpg"},
}


def _html_with(payload) -> str:
    return (
        "<html><head><script type='application/ld+json'>"
        + json.dumps(payload)
        + "</script></head><body></body></html>"
    )


def test_find_recipe_plain_object():
    assert find_recipe_jsonld(_html_with(RECIPE_NODE))["name"] == "Test Meatballs"


def test_find_recipe_in_graph():
    wrapped = {"@context": "https://schema.org", "@graph": [{"@type": "WebSite"}, RECIPE_NODE]}
    assert find_recipe_jsonld(_html_with(wrapped))["name"] == "Test Meatballs"


def test_find_recipe_type_array():
    node = dict(RECIPE_NODE, **{"@type": ["Recipe", "NewsArticle"]})
    assert find_recipe_jsonld(_html_with(node))["name"] == "Test Meatballs"


def test_find_recipe_none_on_non_recipe_page():
    assert find_recipe_jsonld(_html_with({"@type": "NewsArticle", "name": "x"})) is None


def test_jsonld_to_recipe_full_mapping():
    recipe = jsonld_to_recipe(RECIPE_NODE, "https://example.com/meatballs")
    assert recipe.title == "Test Meatballs"
    assert recipe.source_method == "structured"
    assert recipe.servings == 4
    assert recipe.prep_minutes == 15
    assert recipe.cook_minutes == 25
    assert len(recipe.ingredient_groups) == 1
    assert recipe.ingredient_groups[0].group_name is None
    assert recipe.ingredient_groups[0].ingredients[0].quantity == 500
    assert recipe.steps == ["Mix everything.", "Roll into balls and bake."]
    assert recipe.macros_per_serve.calories == 420
    assert recipe.macros_per_serve.protein == 38
    assert recipe.macros_per_serve.estimated is False
    assert "dinner" in recipe.tags
    assert recipe.photo_url == "https://example.com/pic.jpg"


def test_howto_sections_flatten():
    node = dict(
        RECIPE_NODE,
        recipeInstructions=[
            {
                "@type": "HowToSection",
                "name": "Sauce",
                "itemListElement": [{"@type": "HowToStep", "text": "Simmer the sauce."}],
            },
            {"@type": "HowToStep", "text": "Serve."},
        ],
    )
    recipe = jsonld_to_recipe(node, "https://example.com")
    assert recipe.steps == ["Simmer the sauce.", "Serve."]


def test_relative_image_resolved_to_absolute():
    node = dict(RECIPE_NODE, image="/wp-content/uploads/2022/06/dish.jpg")
    recipe = jsonld_to_recipe(node, "https://example.com/recipes/dish/")
    assert recipe.photo_url == "https://example.com/wp-content/uploads/2022/06/dish.jpg"


def test_protocol_relative_image_resolved():
    node = dict(RECIPE_NODE, image="//cdn.example.com/img/dish.jpg")
    recipe = jsonld_to_recipe(node, "https://example.com/recipes/dish/")
    assert recipe.photo_url == "https://cdn.example.com/img/dish.jpg"


def test_absolute_image_unchanged():
    node = dict(RECIPE_NODE, image="https://example.com/abs.jpg")
    recipe = jsonld_to_recipe(node, "https://example.com/recipes/dish/")
    assert recipe.photo_url == "https://example.com/abs.jpg"


def test_missing_nutrition_marks_estimated():
    node = {k: v for k, v in RECIPE_NODE.items() if k != "nutrition"}
    recipe = jsonld_to_recipe(node, "https://example.com")
    assert recipe.macros_per_serve.calories is None
    assert recipe.macros_per_serve.estimated is True
