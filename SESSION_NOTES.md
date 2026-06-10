# Session notes — overnight MVP build, 10–11 June 2026

Built by Claude (Fable) from `Kūmara — Overnight MVP Build Brief v1.1`.
All 12 objectives (including both stretch goals) are code-complete and
committed, one commit per objective (or tight group — see `git log`).

> **UPDATE 11 June, verified with Matt:** all three setup steps below are
> DONE (Supabase restored, migration + RLS fix run, key in backend/.env)
> and the full acceptance walkthrough passed live — URL import, PDF import
> (Bec December PDF), save-to-library, planner persistence, "no fish"
> generation (hardened after a live catch), shopping list build. The app
> runs at http://localhost:5173 with the backend on :8000. Remaining open
> items are in "Loose ends" only.

---

## ⚠️ The three things to look at first (✅ all done 11 June)

### 1. The Supabase project is PAUSED — restore it (1 click)

`yxzbwbtwvdemkiiijcpa.supabase.co` no longer resolves: the free-tier project
**"Kumara Recipes"** was paused after inactivity (last touched April). Until
it's restored, the app has no data at all — no seeded recipes, no saving.

→ supabase.com dashboard → Teddys Projects → **Kumara Recipes** → Restore.
(I left this page open in a Chrome tab. I was permission-blocked from
clicking Restore myself.) Data survives a pause, so the 12 seeded recipes
should come back with it.

### 2. Run the Phase 2 migration (paste + Run)

Once the project is back: Supabase → SQL Editor → paste all of
**`migrations/2026-06-10_phase2_recipes_and_planner.sql`** → Run.
It's additive-only and safe to re-run; the seeded recipes are untouched.
This enables: grouped ingredients, the meal planner, targets, and the
shopping list. The app works before the migration too (feature-detected),
it just can't persist the new stuff.

### 3. Add your Claude API key to `backend/.env`

```
cd backend
copy .env.example .env    # then edit:
ANTHROPIC_API_KEY=sk-ant-...   (same key as in Vercel)
SUPABASE_URL=...               (same as frontend/.env)
SUPABASE_ANON_KEY=...          (same as frontend/.env)
```

Without it: URL import still works on structured sites (verified live
against RecipeTin Eats — no AI needed), but PDF import, unstructured-blog
import, and meal plan generation will return a clear "key missing" error.

---

## What was built

- **Objective 1 — design tokens.** Cormorant Garamond / Archivo / Archivo
  Narrow, full sand/stone/plum/ember/sage/clay palette as Tailwind v4 tokens,
  type-scale classes, the three approved gradients, global 1.9px icon stroke.
- **Objective 2 — full reskin + icon.** Every screen on the new system;
  lucide line icons replace react-icons; kūmara mark in header + favicon;
  meal-type filter chips (All/Breakfast/Lunch/Snack/Dinner/Favourites);
  no emoji, no hard-coded hex, no serif in buttons.
- **Objective 3 — data model.** Migration adds `ingredient_groups` (with
  backfill from the flat lists), `source_method`, `macros_estimated` +
  `meal_plan_entries`, `nutrition_targets`, `shopping_list_items` tables.
  Frontend writes both shapes and feature-detects the schema.
- **Objective 4 — FastAPI backend** (`backend/`). uvicorn, CORS for the
  Vite origin, `/health`, documented `.env.example`, Claude key server-side
  only. Frontend reaches it via the `/api` proxy in `vite.config.js`.
- **Objective 5 — URL import.** JSON-LD first (handles `@graph`, type
  arrays, HowToSections) with **zero AI calls** — live-verified against
  RecipeTin Eats Butter Chicken (17 ingredients parsed with quantities,
  real macros, photo). Claude fallback for unstructured pages. Friendly
  error copy per the brief; Instagram blocked early; Jina Reader fallback
  for scrape-hostile sites.
- **Objective 6 — PDF import.** pdfplumber text layer (scanned PDFs get a
  clear error, no OCR), Claude structuring, multi-recipe PDFs take the
  first and report how many were skipped. Text extraction live-verified
  against `Downloads\Misc\BEC DECEMBER.pdf` (38k chars extracted cleanly).
- **Objective 7 — review screen.** One shared "*Here's what we found*"
  review for URL + PDF, every field editable (group names, ingredients,
  step reordering), ESTIMATED chips on AI-guessed macros (editing a macro
  clears the flag — it's yours now). Nothing is ever saved silently.
- **Objectives 8–10 — planner.** 7×4 grid, searchable recipe picker,
  Freedom/Takeaway/Restaurant line-icon slots, week nav + Today, Generate
  with prompt box (fills empty slots only; "redo…" prompts replace recipe
  slots but never manual marks), Undo + confirmed Clear week, per-day +
  weekly-average macro chips traffic-lit sage/ink/clay against targets,
  non-recipe slots excluded from totals.
- **Objective 11 — shopping list.** Build/rebuild from plan (rebuild keeps
  manual items), same-name+unit quantities summed, aisle grouping,
  persisted check-offs, manual add with category picker.
- **Objective 12 — targets.** Editable daily targets in Profile (drives
  the planner traffic lights) + calories-per-day bar chart for the week.

**Tests:** 23 backend unit/endpoint tests pass (ingredient parser, ISO
durations, JSON-LD shapes, route validation with AI mocked). Frontend
builds clean; every screen visually verified in the dev preview.

## What was skipped or is untested

- **Anything needing the live DB**: saving an imported recipe, planner
  persistence, shopping persistence, targets. All code paths exist and
  degrade gracefully (banners + in-memory state) — they just couldn't be
  exercised against a paused project.
- **Anything needing the Claude key**: AI URL fallback, PDF structuring,
  plan generation. Built + mock-tested only. Morning test once the key is
  in: import `BEC DECEMBER.pdf`, then Generate with
  *"easy week, high protein, no fish"*.
- **The acceptance walkthrough** (brief §9) — blocked on items 1–3 above,
  otherwise everything it needs is in place.

## Loose ends / decisions for Matt

- **Nothing pushed to GitHub** (your guardrail: no push without OK).
  8 local commits on `main` are ready: `git push` when happy.
- **Production deployment changed shape**: the old Vercel serverless
  import (`frontend/api/extract-recipe.js`) is superseded by the FastAPI
  backend but left in place. A deployed frontend would need the backend
  hosted somewhere (or the endpoints ported to Vercel functions) — local
  dev doesn't care.
- **Repo location**: this clone lives at `alfred\side-quests\Kumara.Recipes`,
  while `C:\repos\kumara` is a stub clone of the *same* GitHub remote
  (one initial commit). Per your Code-bucket rule everything should live in
  `C:\repos\` — worth consolidating to one clone and leaving a pointer note,
  but I didn't move anything tonight.
- **Git identity** on this repo is `Matt Gibbs <Matt@INDUSTRIOUS.local>`
  (matches all prior commits). If kumara is personal-side, you may want
  `git config user.email` set to your personal address here.
- `seed-starter-recipes.sql` and `frontend/src/seedRecipes.js` are Phase 1
  leftovers — untouched, probably deletable once you confirm.
