# Kūmara — Phase 2 & ideas

The home for "next" ideas for Kūmara, kept *in the project* so they don't get
lost in a Notion board. The big-picture product scope (creator marketplace,
NZ/AU grocery cost intelligence, native apps) lives in
`Kumara_Product_Scope_Down the line.docx`; this file is the near-term backlog.

Status legend: 🔵 idea · 🟡 designed · 🟢 in progress · ✅ done

---

## Recipe packs + sharing  🔵
*The MVP seed of the creator-marketplace pillar.*

- **Done so far:** "Teddy's Starting Recipe Pack" exists; new users can one-tap
  add it on the empty library / in Profile; copied recipes show a "From Teddy's
  Starting Recipe Pack" badge. Packs are seeded via SQL migration. The pack
  picker now lists *all* public packs (not just Teddy's) — second pack added:
  **Health with Bec — Meal Plan 76 (June 2026)**, 14 recipes with the real
  plan photos (`migrations/2026-06-24_hwb76_pack.sql`,
  `frontend/public/packs/hwb-76/`).
- **Next:** let users share individual recipes and whole packs with each other
  (peer sharing), then the paid creator marketplace — creators publish
  collections / weekly meal plans, subscribers one-tap them into their own
  library + planner.
- **Open question:** what actually goes *in* the starter pack? Right now it's a
  straight copy of all of Matt's recipes. Curating = choosing which recipes
  carry `pack_id` (a subset), rather than all.

## Steerable week generation — packs + style prompt  🟢
*Make "Generate" on the planner feel like briefing a coach, not rolling dice.*

- **Shipped:** a **"Build around a pack"** expander under the Generate prompt.
  Pick one or more packs (chips) → on Generate they're pulled into the library
  (idempotent) and the AI builds the week around them. The freeform prompt
  layers on top and can place special days — the generator now returns non-recipe
  markers (`fasting`/`restaurant`/`takeaway`/`freedom`), so prompts like *"add
  the most recent Health with Bec pack, except Friday — I'm going out"* or
  *"fasting Tuesday & Wednesday breakfast"* work. Backend: `packs` on the
  request, `pack_source` in the library summary, `entry_type` on plan entries.
- **Refinements next:**
  - Surface the pack picker more prominently (it's behind an expander today);
    a one-tap "build from this pack" straight off a pack card / the planner.
  - Remember the last-used packs + style as a reusable "week template".
  - Let a pack ship its *own* suggested week layout (a creator's plan, not just
    a bag of recipes) that generation can lay down as a starting point.

## Packs → creator marketplace (staged)  🔵
*The core monetisation pillar. Build each stage so it doesn't box in the next.*

- **v1 — add (done):** public packs seeded by migration; anyone can one-tap add
  a pack into their library; packs steer week generation (above).
- **v2 — build & share:** a creator/admin UI to assemble a pack from your own
  recipes (name, cover, attribution, pick recipes, publish/unpublish) — replaces
  hand-written SQL migrations. Then **share**: a pack gets a shareable **code /
  link** a creator can drop on their socials; opening it adds the pack. Peer
  sharing of single recipes too.
- **v3 — sell:** creators sell packs (one-off or subscription) to their audience;
  Stripe checkout + creator payouts via Stripe Connect; private/paid packs
  alongside public ones.
- **Infra to keep consistent NOW (so v2/v3 aren't a rewrite):**
  - Packs already are first-class rows (`recipe_packs`) with `slug`, creator,
    `is_public` — keep `slug` the stable public handle a share code maps to.
  - Templates live as `pack_id`-stamped recipes copied on add; keep "add" as a
    server-side `SECURITY DEFINER` copy (`add_starter_pack`) so paid/private
    gating can sit in that one function later.
  - Stamp provenance (`pack_source`) on copies — already done; the basis for
    "from <creator>" attribution and, later, usage/royalty signals.
  - Avoid baking "Teddy's starter" assumptions into UI — the picker already
    lists *all* public packs generically, which is the v2/v3 surface too.

## Bigger-vision items (from the scope doc, not yet scheduled)
- Cookbook photo / OCR import, Instagram/TikTok import, voice capture.
- Live NZ/AU grocery **cost intelligence** (cost per serve, cheapest basket).
- Premium tier + Stripe; creator payouts via Stripe Connect.
- Native iOS/Android (off PWA), offline support.

---

## Smaller follow-ups noted in passing
- Planner macros: optional subtle on-target / over-target signal back on the
  chips (removed in favour of the soft purple/orange palette — reinstate as a
  dot/border if wanted, not the old alarm colours).
- Units preference is per-device (localStorage) today; sync it to the account
  if cross-device consistency matters.
