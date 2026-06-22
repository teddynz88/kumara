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
  Starting Recipe Pack" badge. Packs are seeded via SQL migration.
- **Next:** let users share individual recipes and whole packs with each other
  (peer sharing), then the paid creator marketplace — creators publish
  collections / weekly meal plans, subscribers one-tap them into their own
  library + planner.
- **Open question:** what actually goes *in* the starter pack? Right now it's a
  straight copy of all of Matt's recipes. Curating = choosing which recipes
  carry `pack_id` (a subset), rather than all.

## Admin / creator section  🔵
*Turn pack curation into a UI instead of a migration.*

- A small admin area for Matt (and later creators) to: name a pack, set its
  cover + source/creator attribution, choose which recipes go in it, and
  publish / unpublish.
- Natural follow-on from the starter-pack MVP; the on-ramp to the marketplace.

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
