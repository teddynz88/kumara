"""schema.org/Recipe JSON-LD parsing — the cheap path that needs no AI call.

Handles @graph wrappers, @type arrays, HowToStep/HowToSection instructions,
ISO-8601 durations, and free-text ingredient strings ("500 g beef mince").
"""

import json
import re
from typing import Any, Optional

from bs4 import BeautifulSoup

from .schemas import (
    ExtractedRecipe,
    Ingredient,
    IngredientGroup,
    MacrosPerServe,
)

# Units we recognise at the start of an ingredient string, mapped to the
# canonical short form the app uses. Longest match wins.
UNIT_ALIASES = {
    "grams": "g", "gram": "g", "g": "g",
    "kilograms": "kg", "kilogram": "kg", "kgs": "kg", "kg": "kg",
    "milliliters": "ml", "millilitres": "ml", "mls": "ml", "ml": "ml",
    "liters": "l", "litres": "l", "litre": "l", "liter": "l", "l": "l",
    "cups": "cup", "cup": "cup",
    "tablespoons": "tbsp", "tablespoon": "tbsp", "tbsps": "tbsp", "tbsp": "tbsp",
    "teaspoons": "tsp", "teaspoon": "tsp", "tsps": "tsp", "tsp": "tsp",
    "ounces": "oz", "ounce": "oz", "oz": "oz",
    "pounds": "lb", "pound": "lb", "lbs": "lb", "lb": "lb",
    "cloves": "clove", "clove": "clove",
    "cans": "can", "can": "can", "tins": "can", "tin": "can",
    "slices": "slice", "slice": "slice",
    "pieces": "piece", "piece": "piece",
    "pinches": "pinch", "pinch": "pinch",
    "handfuls": "handful", "handful": "handful",
    "sprigs": "sprig", "sprig": "sprig",
    "stalks": "stalk", "stalk": "stalk",
    "bunches": "bunch", "bunch": "bunch",
    "packets": "packet", "packet": "packet", "packs": "packet", "pack": "packet",
    "sheets": "sheet", "sheet": "sheet",
}

UNICODE_FRACTIONS = {
    "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
    "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8,
    "⅙": 1 / 6, "⅚": 5 / 6, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
}

_NUMBER_TOKEN = re.compile(
    r"^\s*(\d+\s+\d+/\d+|\d+/\d+|\d*\.\d+|\d+|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])"
)


def _token_to_number(token: str) -> float:
    token = token.strip()
    if token in UNICODE_FRACTIONS:
        return UNICODE_FRACTIONS[token]
    if "/" in token:
        if " " in token:  # mixed number "1 1/2"
            whole, frac = token.split(None, 1)
            num, den = frac.split("/")
            return float(whole) + float(num) / float(den)
        num, den = token.split("/")
        return float(num) / float(den)
    return float(token)


def parse_quantity(text: str) -> tuple[Optional[float | str], str]:
    """Pull a leading quantity off an ingredient string.

    Returns (quantity, rest). Fractions become decimals; "1 ½" and "1 1/2"
    both become 1.5; ranges like "1-2" are kept as a string.
    """
    text = text.strip()

    # Range: "1-2 cups" / "1 to 2 cups"
    range_match = re.match(
        r"^(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\b", text
    )
    if range_match:
        return f"{range_match.group(1)}-{range_match.group(2)}", text[range_match.end():].strip()

    match = _NUMBER_TOKEN.match(text)
    if not match:
        return None, text

    value = _token_to_number(match.group(1))
    rest = text[match.end():].strip()

    # "1 ½" — whole number followed by a unicode fraction
    if rest and rest[0] in UNICODE_FRACTIONS and float(value).is_integer():
        value += UNICODE_FRACTIONS[rest[0]]
        rest = rest[1:].strip()

    return round(value, 4), rest


def parse_ingredient(text: str) -> Ingredient:
    """Parse a free-text ingredient line into quantity / unit / name / note."""
    text = re.sub(r"\s+", " ", text).strip()

    # Parenthetical -> note ("Kalamata olives (about 8 olives)")
    note = ""
    paren = re.search(r"\(([^)]*)\)", text)
    if paren:
        note = paren.group(1).strip()
        text = (text[: paren.start()] + text[paren.end():]).strip()
        text = re.sub(r"\s+", " ", text).replace(" ,", ",").strip(" ,")

    quantity, rest = parse_quantity(text)

    unit = ""
    if quantity is not None and rest:
        first_word_match = re.match(r"^([A-Za-z]+)\.?\s+(.*)$", rest)
        if first_word_match:
            candidate = first_word_match.group(1).lower()
            if candidate in UNIT_ALIASES:
                unit = UNIT_ALIASES[candidate]
                rest = first_word_match.group(2)

    name = rest.strip(" ,") or text
    return Ingredient(quantity=quantity, unit=unit, name=name, note=note)


_ISO_DURATION = re.compile(
    r"^P(?:(?P<days>\d+(?:\.\d+)?)D)?"
    r"(?:T(?:(?P<hours>\d+(?:\.\d+)?)H)?(?:(?P<minutes>\d+(?:\.\d+)?)M)?"
    r"(?:(?P<seconds>\d+(?:\.\d+)?)S)?)?$",
    re.IGNORECASE,
)


def iso_duration_to_minutes(value: Any) -> Optional[int]:
    """'PT1H30M' -> 90. Returns None for anything unparseable."""
    if not value or not isinstance(value, str):
        return None
    match = _ISO_DURATION.match(value.strip())
    if not match or not any(match.groupdict().values()):
        return None
    parts = {k: float(v) if v else 0.0 for k, v in match.groupdict().items()}
    minutes = parts["days"] * 1440 + parts["hours"] * 60 + parts["minutes"] + parts["seconds"] / 60
    return int(round(minutes)) or None


def _first_number(value: Any) -> Optional[float]:
    """'350 calories' / '25 g' / 25 -> 25.0."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    match = re.search(r"\d+(?:\.\d+)?", str(value))
    return float(match.group(0)) if match else None


def _is_recipe_type(node: Any) -> bool:
    t = node.get("@type") if isinstance(node, dict) else None
    if isinstance(t, str):
        return t.lower() == "recipe"
    if isinstance(t, list):
        return any(isinstance(x, str) and x.lower() == "recipe" for x in t)
    return False


def find_recipe_jsonld(html: str) -> Optional[dict]:
    """Find the first schema.org Recipe node in any ld+json block.

    Handles plain objects, top-level arrays, and @graph wrappers.
    """
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text()
        if not raw:
            continue
        try:
            data = json.loads(raw.strip())
        except (json.JSONDecodeError, ValueError):
            continue
        candidates: list[Any] = []
        nodes = data if isinstance(data, list) else [data]
        for node in nodes:
            if not isinstance(node, dict):
                continue
            candidates.append(node)
            graph = node.get("@graph")
            if isinstance(graph, list):
                candidates.extend(n for n in graph if isinstance(n, dict))
        for node in candidates:
            if _is_recipe_type(node):
                return node
    return None


def _parse_servings(value: Any) -> int:
    if isinstance(value, list) and value:
        value = value[0]
    n = _first_number(value)
    return int(n) if n and n > 0 else 4


def _parse_steps(instructions: Any) -> list[str]:
    """recipeInstructions can be a string, a list of strings, HowToSteps,
    or HowToSections containing HowToSteps. Flatten to plain text steps."""
    steps: list[str] = []

    def add_text(value: Any) -> None:
        if isinstance(value, str):
            text = BeautifulSoup(value, "html.parser").get_text(" ", strip=True)
            # A single blob of prose: split on newlines if present
            parts = [p.strip() for p in re.split(r"\n+", text) if p.strip()]
            steps.extend(parts or ([text] if text else []))

    def walk(node: Any) -> None:
        if isinstance(node, str):
            add_text(node)
        elif isinstance(node, list):
            for item in node:
                walk(item)
        elif isinstance(node, dict):
            node_type = str(node.get("@type", "")).lower()
            if "howtosection" in node_type:
                walk(node.get("itemListElement", []))
            else:
                add_text(node.get("text") or node.get("name") or "")

    walk(instructions)
    return steps


def _parse_photo(image: Any) -> Optional[str]:
    if isinstance(image, str):
        return image
    if isinstance(image, list) and image:
        return _parse_photo(image[0])
    if isinstance(image, dict):
        return image.get("url")
    return None


def _parse_tags(node: dict) -> list[str]:
    tags: list[str] = []
    for key in ("keywords", "recipeCategory", "recipeCuisine"):
        value = node.get(key)
        if isinstance(value, str):
            tags.extend(t.strip().lower() for t in value.split(",") if t.strip())
        elif isinstance(value, list):
            tags.extend(str(t).strip().lower() for t in value if str(t).strip())
    # Dedupe, keep order, keep it short
    seen: set[str] = set()
    out = []
    for t in tags:
        if t and t not in seen and len(t) < 30:
            seen.add(t)
            out.append(t)
    return out[:10]


def jsonld_to_recipe(node: dict, source_url: str) -> ExtractedRecipe:
    """Map a schema.org Recipe node onto the app's extraction schema."""
    ingredients_raw = node.get("recipeIngredient") or node.get("ingredients") or []
    if isinstance(ingredients_raw, str):
        ingredients_raw = [ingredients_raw]
    ingredients = [parse_ingredient(str(i)) for i in ingredients_raw if str(i).strip()]

    nutrition = node.get("nutrition") or {}
    has_macros = isinstance(nutrition, dict) and any(
        nutrition.get(k)
        for k in ("calories", "proteinContent", "carbohydrateContent", "fatContent", "fiberContent")
    )
    macros = MacrosPerServe(
        calories=_first_number(nutrition.get("calories")) if isinstance(nutrition, dict) else None,
        protein=_first_number(nutrition.get("proteinContent")) if isinstance(nutrition, dict) else None,
        carbs=_first_number(nutrition.get("carbohydrateContent")) if isinstance(nutrition, dict) else None,
        fat=_first_number(nutrition.get("fatContent")) if isinstance(nutrition, dict) else None,
        fibre=_first_number(nutrition.get("fiberContent")) if isinstance(nutrition, dict) else None,
        estimated=False if has_macros else True,
    )

    prep = iso_duration_to_minutes(node.get("prepTime"))
    cook = iso_duration_to_minutes(node.get("cookTime"))
    if cook is None and prep is not None:
        total = iso_duration_to_minutes(node.get("totalTime"))
        if total and total > prep:
            cook = total - prep

    return ExtractedRecipe(
        title=str(node.get("name") or "").strip(),
        source_url=source_url,
        source_method="structured",
        servings=_parse_servings(node.get("recipeYield")),
        prep_minutes=prep,
        cook_minutes=cook,
        # JSON-LD has no ingredient grouping — one unnamed group (brief §7.1).
        ingredient_groups=[IngredientGroup(group_name=None, ingredients=ingredients)] if ingredients else [],
        steps=_parse_steps(node.get("recipeInstructions")),
        macros_per_serve=macros,
        tags=_parse_tags(node),
        photo_url=_parse_photo(node.get("image")),
    )
