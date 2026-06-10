"""Pydantic models — the shared extraction schema (brief §7.1) and plan shapes.

Every import path (JSON-LD, AI URL fallback, PDF) returns ExtractedRecipe,
so the frontend has exactly one shape to review and save.
"""

from typing import Literal, Optional, Union

from pydantic import BaseModel, Field


class Ingredient(BaseModel):
    # Quantity is a number when parseable ("500" -> 500.0), a string when the
    # source uses a range or words ("1-2"), or null when there is none.
    quantity: Optional[Union[float, str]] = None
    unit: str = ""
    name: str
    note: str = ""


class IngredientGroup(BaseModel):
    group_name: Optional[str] = None
    ingredients: list[Ingredient]


class MacrosPerServe(BaseModel):
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fibre: Optional[float] = None
    # True when the values are an AI estimate rather than stated by the source.
    estimated: bool = True


class ExtractedRecipe(BaseModel):
    title: str = ""
    source_url: str = ""
    source_method: Literal["structured", "ai"] = "ai"
    servings: int = 4
    prep_minutes: Optional[int] = None
    cook_minutes: Optional[int] = None
    ingredient_groups: list[IngredientGroup] = Field(default_factory=list)
    steps: list[str] = Field(default_factory=list)
    macros_per_serve: MacrosPerServe = Field(default_factory=MacrosPerServe)
    tags: list[str] = Field(default_factory=list)
    # Extras the frontend uses but the brief schema doesn't mandate:
    photo_url: Optional[str] = None
    notes: Optional[str] = None  # e.g. "3 more recipes in this PDF were skipped"


# --- AI-only shape: what Claude returns for extraction (no source fields) ---

class AIExtractedRecipe(BaseModel):
    title: str
    servings: int = 4
    prep_minutes: Optional[int] = None
    cook_minutes: Optional[int] = None
    ingredient_groups: list[IngredientGroup]
    steps: list[str]
    macros_per_serve: MacrosPerServe
    tags: list[str] = Field(default_factory=list)
    # True when the document contained more than one recipe and only the
    # first was extracted.
    other_recipes_skipped: int = 0


class UrlImportRequest(BaseModel):
    url: str


# --- Meal plan generation ---

class SlotRef(BaseModel):
    day: int = Field(ge=0, le=6)
    slot: Literal["breakfast", "lunch", "snack", "dinner"]


class PlanGenerateRequest(BaseModel):
    week_start: str  # ISO date, Monday
    prompt: Optional[str] = None
    # Slots the frontend wants filled (i.e. currently empty ones).
    slots_to_fill: list[SlotRef]


class PlanEntry(BaseModel):
    day: int = Field(ge=0, le=6)
    slot: Literal["breakfast", "lunch", "snack", "dinner"]
    recipe_id: str


class GeneratedPlan(BaseModel):
    # Listed first on purpose: the model enumerates which library recipes the
    # user's request rules out BEFORE it assigns slots, which makes it far
    # less likely to slip an excluded recipe into the plan.
    excluded_recipe_ids: list[str] = Field(default_factory=list)
    entries: list[PlanEntry]


class PlanGenerateResponse(BaseModel):
    entries: list[PlanEntry]
    dropped: int = 0  # entries Claude returned with invalid recipe ids
