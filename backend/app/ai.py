"""Claude calls — recipe extraction from raw text, and meal plan generation.

The API key lives server-side only (backend/.env). Structured outputs via
client.messages.parse() guarantee schema-valid JSON, so there's no manual
JSON wrangling or retry-on-parse-failure logic to maintain.
"""

import anthropic

from . import config
from .schemas import AIExtractedRecipe, GeneratedPlan

EXTRACTION_SYSTEM = """You are a recipe extraction assistant. You will be given the readable text \
of a webpage or PDF document. Extract the recipe it contains.

Rules:
- Extract faithfully. NEVER invent ingredients or steps that are not in the source.
- Preserve ingredient groupings exactly as the source presents them (e.g. "For the meatballs" / \
"For the sauce"). If the source has no groups, return a single group with group_name = null.
- Quantity and unit are separate fields. Convert fractions to decimals (1/2 -> 0.5). \
If an ingredient has no quantity, use null and put the full description in name.
- Use short unit forms: g, kg, ml, l, cup, tbsp, tsp, piece, clove, can, slice, pinch, handful. \
Empty string when there is no unit.
- Times: null beats guessing. Only set prep_minutes/cook_minutes if the source states them.
- Macros per serve: if the source states them, copy them and set estimated = false. \
If not, estimate them realistically from the ingredients and servings and set estimated = true.
- Tags: meal type (breakfast/lunch/snack/dinner), diet info where evident \
(low-carb, high-protein, gluten-free, dairy-free, vegetarian), main protein. Lowercase.
- If the document contains MORE THAN ONE recipe, extract only the FIRST one and set \
other_recipes_skipped to how many you skipped.
- If there is no recipe in the text at all, return title = "" and empty lists."""


class NoRecipeFound(Exception):
    pass


def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=config.require_ai_key())


def extract_recipe_from_text(text: str, source_hint: str = "") -> AIExtractedRecipe:
    """Structure readable page/PDF text into the extraction schema via Claude."""
    response = _client().messages.parse(
        model=config.AI_MODEL,
        max_tokens=8192,
        system=EXTRACTION_SYSTEM,
        messages=[{
            "role": "user",
            "content": (
                f"Source: {source_hint}\n\n"
                f"Document text:\n{text[:40000]}"
            ),
        }],
        output_format=AIExtractedRecipe,
    )
    recipe = response.parsed_output
    if recipe is None or not recipe.title.strip() or not recipe.ingredient_groups:
        raise NoRecipeFound(
            "We couldn't find a recipe there. You can enter it manually instead."
        )
    return recipe


PLAN_SYSTEM = """You are a meal planning assistant for a household recipe app. You will be given:
- a library of the user's own recipes (id, title, tags, macros per serve, rating, favourite, \
ingredient names)
- a list of empty slots to fill (day 0 = Monday ... day 6 = Sunday; slots are \
breakfast/lunch/snack/dinner)
- optionally the user's daily macro targets and a free-text request.

Fill EVERY listed slot with a recipe from the library.

Hard rules:
- Use ONLY recipe ids from the provided library. Never invent recipes or ids.
- One entry per listed slot; do not add entries for slots that were not listed.
- Match meal-type tags to slots where possible (a recipe tagged "breakfast" goes in breakfast \
slots, "dinner" in dinner, etc.). A snack slot suits recipes tagged snack or baking.
- Vary the week: do not use the same recipe twice unless the library is too small to avoid it.
- Prefer higher-rated and favourited recipes.
- Respect the user's request strictly. For example "no fish" means exclude any recipe whose \
title, tags, or ingredients mention fish or a fish species; "easy week" means prefer recipes \
with shorter prep+cook times; "high protein" means prefer higher protein per serve.
- If daily macro targets are given, aim for daily totals near them across that day's slots."""


def generate_plan(
    library_summary: str,
    slots_text: str,
    targets_text: str,
    user_prompt: str | None,
) -> GeneratedPlan:
    user_content = (
        f"Recipe library:\n{library_summary}\n\n"
        f"Slots to fill:\n{slots_text}\n\n"
        f"Daily macro targets: {targets_text}\n\n"
        f"User request: {user_prompt.strip() if user_prompt else '(none)'}"
    )
    response = _client().messages.parse(
        model=config.AI_MODEL,
        max_tokens=8192,
        system=PLAN_SYSTEM,
        messages=[{"role": "user", "content": user_content}],
        output_format=GeneratedPlan,
    )
    return response.parsed_output or GeneratedPlan(entries=[])
