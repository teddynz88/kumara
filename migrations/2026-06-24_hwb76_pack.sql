-- ============================================================
-- Kumara - Recipe pack: Health with Bec, Meal Plan 76 (June 2026)
-- ============================================================
-- Adds a second public recipe pack (14 recipes) as pack TEMPLATES
-- (pack_id set, user_id null), exactly like Teddy's Starting Pack.
-- Users copy it into their library via add_starter_pack('hwb-76-june-2026').
-- Photos are committed static assets under frontend/public/packs/hwb-76/.
--
-- Paste into the Supabase SQL editor and Run. Safe to run repeatedly
-- (idempotent on pack slug and on recipe title within the pack).
-- Requires the users/accounts migration (recipe_packs + pack columns).
-- ============================================================

insert into recipe_packs (slug, name, creator_name, description)
values (
  'hwb-76-june-2026',
  'Health with Bec - Meal Plan 76 (June 2026)',
  'Bec Miller / Health with Bec',
  'A 7-day low-carb, high-protein wholefood plan: 14 recipes from Health with Bec''s June 2026 meal plan (No. 76).'
)
on conflict (slug) do nothing;


insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Blueberry Protein & Chia Pudding', '/packs/hwb-76/blueberry-protein-chia-pudding.jpg', 1, 5, 2,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "3", "unit": "tbsp", "name": "chia seeds"}, {"qty": "35", "unit": "g", "name": "vanilla protein powder"}, {"qty": "1", "unit": "tsp", "name": "monk fruit blend (optional)"}, {"qty": "0.5", "unit": "cup", "name": "almond milk, unsweetened"}, {"qty": "0.5", "unit": "cup", "name": "water"}, {"qty": "0.5", "unit": "cup", "name": "blueberries (fresh or frozen)"}, {"qty": "2", "unit": "tbsp", "name": "coconut yoghurt"}]'::jsonb, null,
  '[{"step": 1, "text": "In a small microwave-safe bowl, stir together the chia seeds, protein powder, monk fruit (if using), almond milk and water. The mix should be fairly runny - add a splash more water if needed."}, {"step": 2, "text": "Stir through the blueberries."}, {"step": 3, "text": "Microwave for 90 seconds."}, {"step": 4, "text": "Top with the coconut yoghurt and enjoy."}]'::jsonb, '[{"text": "Sweetness varies with your protein powder - adjust to taste with a monk fruit blend."}, {"text": "For an overnight version, skip the microwave and chill in the fridge overnight instead."}, {"text": "Any flavour of protein powder and any berry works here."}, {"text": "Coconut yoghurt can be swapped for Greek yoghurt if tolerated."}]'::jsonb, 401, 33, 17, 19, 16,
  false, ARRAY['low-carb','high-protein','breakfast','snack','quick','vegetarian','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Blueberry Protein & Chia Pudding'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Healing Chicken Soup', '/packs/hwb-76/healing-chicken-soup.jpg', 6, 15, 35,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "1", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "1", "unit": "", "name": "small onion, diced"}, {"qty": "1", "unit": "clove", "name": "garlic, minced"}, {"qty": "1", "unit": "tsp", "name": "minced ginger"}, {"qty": "1", "unit": "tsp", "name": "ground turmeric"}, {"qty": "2", "unit": "cups", "name": "celery, diced"}, {"qty": "2", "unit": "cups", "name": "carrot, diced"}, {"qty": "4", "unit": "cups", "name": "chicken broth"}, {"qty": "1", "unit": "cup", "name": "water"}, {"qty": "600", "unit": "g", "name": "chicken breast, skinless"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}]'::jsonb, null,
  '[{"step": 1, "text": "Heat the oil in a large pot or dutch oven over medium. Add the onion, garlic, ginger and turmeric and cook for 2 minutes."}, {"step": 2, "text": "Add the celery and carrot and cook for 3 minutes, stirring occasionally."}, {"step": 3, "text": "Add the broth, water and whole chicken breasts."}, {"step": 4, "text": "Bring to a simmer, cover and cook for about 30 minutes, until the chicken is cooked through."}, {"step": 5, "text": "Remove the chicken and shred with two forks."}, {"step": 6, "text": "Return the shredded chicken to the pot. Taste and adjust seasoning with salt and pepper."}]'::jsonb, '[{"text": "A great batch-cook meal - portion the extra serves and freeze."}, {"text": "Lovely with a slice of Bec''s Bread Loaf spread with butter."}]'::jsonb, 168, 25, 4, 3, 2,
  false, ARRAY['low-carb','high-protein','lunch','dinner','soup','meal-prep','gluten-free','dairy-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Healing Chicken Soup'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Bec''s Bread Loaf', '/packs/hwb-76/becs-bread-loaf.jpg', 16, 15, 60,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "2.5", "unit": "cups", "name": "almond meal"}, {"qty": "0.5", "unit": "cup", "name": "coconut flour"}, {"qty": "0.33", "unit": "cup", "name": "flaxseed meal"}, {"qty": "6", "unit": "tbsp", "name": "psyllium husks"}, {"qty": "1", "unit": "tbsp", "name": "baking powder (heaped)"}, {"qty": "1", "unit": "tsp", "name": "salt"}, {"qty": "2", "unit": "cups", "name": "warm water"}, {"qty": "1", "unit": "tsp", "name": "apple cider vinegar"}, {"qty": "2", "unit": "tbsp", "name": "extra virgin olive oil"}]'::jsonb, null,
  '[{"step": 1, "text": "Preheat the oven to 200C fan-forced / 390F. Line a loaf tin (about 21 x 11 cm) with baking paper."}, {"step": 2, "text": "In a bowl, combine the almond meal, coconut flour, flaxseed meal, psyllium husks, baking powder and salt."}, {"step": 3, "text": "Add the warm water, apple cider vinegar and olive oil, and mix with a spoon."}, {"step": 4, "text": "Knead gently by hand until just combined - don''t overmix or it may not rise enough."}, {"step": 5, "text": "Set the dough aside for 10 minutes to absorb the moisture."}, {"step": 6, "text": "Shape the dough and place it into the loaf tin."}, {"step": 7, "text": "Bake for 60 minutes, or until a skewer comes out clean."}, {"step": 8, "text": "Remove from the tin and cool on a wire rack."}, {"step": 9, "text": "Cool completely before slicing into 16 pieces."}]'::jsonb, '[{"text": "Add dried herbs - oregano, Italian herbs, whatever you fancy - to flavour the loaf."}, {"text": "Store in an airtight container for 3-4 days, or freeze for up to 6 months."}]'::jsonb, 135, 5, 1, 11, 6,
  false, ARRAY['low-carb','baking','bread','meal-prep','vegetarian','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Bec''s Bread Loaf'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Caramel & Banana Protein Loaf', '/packs/hwb-76/caramel-banana-protein-loaf.jpg', 8, 10, 45,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "2", "unit": "", "name": "ripe medium bananas (230 g)"}, {"qty": "1", "unit": "", "name": "egg"}, {"qty": "0.5", "unit": "cup", "name": "egg whites"}, {"qty": "100", "unit": "ml", "name": "almond milk, unsweetened"}, {"qty": "1", "unit": "tsp", "name": "vanilla extract"}, {"qty": "50", "unit": "g", "name": "caramel protein powder"}, {"qty": "75", "unit": "g", "name": "almond meal"}, {"qty": "2", "unit": "tbsp", "name": "arrowroot flour"}, {"qty": "1", "unit": "tbsp", "name": "powdered monk fruit blend"}, {"qty": "1", "unit": "tsp", "name": "baking powder"}, {"qty": "0.25", "unit": "tsp", "name": "bi-carb soda"}, {"qty": "1", "unit": "pinch", "name": "salt"}]'::jsonb, null,
  '[{"step": 1, "text": "Preheat the oven to 180C fan-forced / 360F. Line a 20 x 10 cm loaf tin with baking paper."}, {"step": 2, "text": "Mash the bananas well. Add the egg, egg whites, almond milk and vanilla, and mix until smooth."}, {"step": 3, "text": "Stir in the protein powder, almond meal, arrowroot, monk fruit, baking powder, bi-carb soda and salt. Mix until just combined."}, {"step": 4, "text": "The batter should be thick but pourable - add a splash more almond milk if needed."}, {"step": 5, "text": "Pour into the tin and bake for 40-50 minutes, until just set in the centre. Don''t overbake or it can dry out."}, {"step": 6, "text": "Cool completely before slicing into 8 slices."}]'::jsonb, '[{"text": "No carton egg whites? Separate the whites from whole eggs - 1/2 cup is about 6 eggs."}]'::jsonb, 148, 10, 12, 7, 2,
  false, ARRAY['low-carb','snack','baking','high-protein','meal-prep','vegetarian','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Caramel & Banana Protein Loaf'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Prawn & Cashew Stir-fry', '/packs/hwb-76/prawn-cashew-stir-fry.jpg', 1, 5, 10,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "0.5", "unit": "", "name": "head broccoli, cut into florets"}, {"qty": "0.5", "unit": "tbsp", "name": "fish sauce"}, {"qty": "1.5", "unit": "tbsp", "name": "tamari"}, {"qty": "0.5", "unit": "tsp", "name": "monk fruit blend"}, {"qty": "0.5", "unit": "tsp", "name": "sesame oil"}, {"qty": "0.5", "unit": "tbsp", "name": "lime juice"}, {"qty": "0.5", "unit": "tbsp", "name": "coconut oil"}, {"qty": "0.5", "unit": "", "name": "red chilli, diced"}, {"qty": "0.5", "unit": "tbsp", "name": "minced ginger"}, {"qty": "0.25", "unit": "cup", "name": "roasted cashew nuts"}, {"qty": "125", "unit": "g", "name": "prawns, raw and peeled"}, {"qty": "1", "unit": "clove", "name": "garlic, crushed"}]'::jsonb, null,
  '[{"step": 1, "text": "Steam or boil the broccoli until just tender, about 2-3 minutes. Strain, rinse under cold water and set aside."}, {"step": 2, "text": "In a small bowl, whisk together the fish sauce, tamari, monk fruit, sesame oil and lime juice. Set aside."}, {"step": 3, "text": "Heat the coconut oil in a large frying pan or wok. Add the chilli, ginger and cashews and stir-fry for 1 minute."}, {"step": 4, "text": "Add the prawns and stir for 1 minute, then add the garlic and stir for a further 30 seconds."}, {"step": 5, "text": "Add the broccoli and sauce, stir-fry for 1 minute and serve immediately."}]'::jsonb, '[{"text": "Broccoli can be swapped for any other low-carb veggie you like."}]'::jsonb, 464, 46, 8, 25, 7,
  false, ARRAY['low-carb','high-protein','dinner','quick','seafood','dairy-free','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Prawn & Cashew Stir-fry'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Pork, Apple & Fennel Tray Bake', '/packs/hwb-76/pork-apple-fennel-tray-bake.jpg', 2, 15, 35,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "1", "unit": "bunch", "name": "silverbeet"}, {"qty": "0.5", "unit": "", "name": "small head red cabbage, sliced into wedges"}, {"qty": "1", "unit": "", "name": "small red onion, sliced into wedges"}, {"qty": "1", "unit": "bulb", "name": "fennel, sliced into wedges"}, {"qty": "2", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "0.5", "unit": "tsp", "name": "salt"}, {"qty": "10", "unit": "g", "name": "fresh sage, chopped"}, {"qty": "2", "unit": "cloves", "name": "garlic, finely chopped"}, {"qty": "300", "unit": "g", "name": "pork loin chops, trimmed of fat"}, {"qty": "2", "unit": "tsp", "name": "wholegrain mustard"}, {"qty": "1", "unit": "", "name": "small apple, sliced into wedges"}, {"qty": "0.25", "unit": "cup", "name": "chicken stock"}, {"qty": "1", "unit": "tbsp", "name": "balsamic vinegar"}]'::jsonb, null,
  '[{"step": 1, "text": "Preheat the oven to 200C fan-forced / 390F."}, {"step": 2, "text": "Separate the silverbeet leaves from the stems, and roughly chop both."}, {"step": 3, "text": "Toss the silverbeet stems, cabbage, onion and fennel with half the oil, 1/2 tsp salt, most of the sage (reserve some) and the garlic. Spread on a roasting tray and roast for 15 minutes."}, {"step": 4, "text": "In a bowl, coat the pork with the mustard, remaining oil and salt."}, {"step": 5, "text": "Remove the tray from the oven, add the pork, apple and chicken stock, toss gently, and roast for a further 15-20 minutes until the pork is cooked through."}, {"step": 6, "text": "In the last 5 minutes, add the silverbeet leaves and cook until wilted."}, {"step": 7, "text": "Drizzle with the balsamic vinegar and scatter with the remaining sage. Serve warm."}]'::jsonb, '[{"text": "Alternatively, use a 300 g pork shoulder roast cut into 4-5 chunks; add with the apple and roast at 200C fan-forced for 30-40 minutes."}]'::jsonb, 469, 45, 12, 18, 15,
  false, ARRAY['low-carb','high-protein','dinner','tray-bake','gluten-free','dairy-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Pork, Apple & Fennel Tray Bake'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Poached Eggs with Avo on Bec''s Bread', '/packs/hwb-76/poached-eggs-avo-becs-bread.jpg', 1, 3, 7,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "2", "unit": "", "name": "large eggs"}, {"qty": "1", "unit": "slice", "name": "Bec''s Bread Loaf"}, {"qty": "0.5", "unit": "", "name": "medium avocado, sliced"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}]'::jsonb, null,
  '[{"step": 1, "text": "Bring a saucepan of water to a simmer over medium heat. Crack one egg into a small bowl, stir a whirlpool in the water and slip the egg in. Repeat with the second egg. Poach for 3-4 minutes, then gently remove."}, {"step": 2, "text": "Meanwhile, toast the bread."}, {"step": 3, "text": "Serve the toast with the poached eggs and avocado, seasoned with salt and pepper."}]'::jsonb, '[{"text": "Swap Bec''s Bread for a slice of Venerdi bread if you prefer."}]'::jsonb, 328, 18, 0, 26, 9,
  false, ARRAY['low-carb','breakfast','quick','vegetarian'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Poached Eggs with Avo on Bec''s Bread'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  '15 Minute Chicken & Pesto Pasta', '/packs/hwb-76/15-minute-chicken-pesto-pasta.jpg', 2, 10, 15,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "200", "unit": "g", "name": "chicken breast, skinless"}, {"qty": "2", "unit": "bunches", "name": "broccolini (14 stalks)"}, {"qty": "1", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "1", "unit": "clove", "name": "garlic, crushed"}, {"qty": "200", "unit": "g", "name": "Slendier legume pasta, uncooked"}, {"qty": "10", "unit": "", "name": "cherry tomatoes, halved"}, {"qty": "3", "unit": "tbsp", "name": "pesto"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}, {"qty": "8", "unit": "", "name": "fresh basil leaves"}]'::jsonb, null,
  '[{"step": 1, "text": "Bring a large saucepan of water to a boil."}, {"step": 2, "text": "Cut the chicken into bite-sized pieces and cut the broccolini into thirds."}, {"step": 3, "text": "Heat the olive oil in a large pan over medium. Cook the chicken, stirring occasionally, for 8-10 minutes until browned and cooked through."}, {"step": 4, "text": "Reduce the heat to low, add the garlic and stir for 1 minute, then turn off the heat."}, {"step": 5, "text": "Add the pasta to the boiling water and cook for 2 minutes, then add the broccolini and cook a further 2 minutes. Drain."}, {"step": 6, "text": "Add the pasta, broccolini, cherry tomatoes and pesto to the chicken. Return to low heat and stir gently to warm through. Season to taste."}, {"step": 7, "text": "Serve topped with fresh basil."}]'::jsonb, '[{"text": "Great for the whole family - serve theirs with regular pasta."}]'::jsonb, 454, 45, 9, 23, 12,
  false, ARRAY['low-carb','high-protein','dinner','lunch','quick'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = '15 Minute Chicken & Pesto Pasta'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Mocha Mug Cake', '/packs/hwb-76/mocha-mug-cake.jpg', 1, 1, 2,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "1", "unit": "tsp", "name": "coconut oil"}, {"qty": "2", "unit": "tbsp", "name": "almond meal"}, {"qty": "1", "unit": "tbsp", "name": "coconut flour"}, {"qty": "18", "unit": "g", "name": "chocolate protein powder"}, {"qty": "1", "unit": "tsp", "name": "monk fruit blend"}, {"qty": "0.5", "unit": "tsp", "name": "baking powder"}, {"qty": "1", "unit": "tsp", "name": "cacao powder"}, {"qty": "1", "unit": "", "name": "egg"}, {"qty": "1", "unit": "tsp", "name": "instant coffee granules"}, {"qty": "2", "unit": "tbsp", "name": "almond milk, unsweetened"}, {"qty": "0.5", "unit": "tsp", "name": "vanilla extract"}, {"qty": "2", "unit": "tbsp", "name": "coconut yoghurt"}]'::jsonb, null,
  '[{"step": 1, "text": "Melt the coconut oil in a large microwave-safe mug."}, {"step": 2, "text": "Add the dry ingredients and stir to combine. Add the egg, coffee, almond milk and vanilla, and mix until smooth and the coffee has dissolved."}, {"step": 3, "text": "Microwave for 90 seconds to 2 minutes - it''s done when the centre springs back when lightly touched."}, {"step": 4, "text": "Serve warm, topped with the coconut yoghurt."}]'::jsonb, '[{"text": "Coconut yoghurt can be swapped for Greek yoghurt if tolerated."}]'::jsonb, 368, 24, 6, 25, 7,
  false, ARRAY['low-carb','snack','breakfast','quick','high-protein','vegetarian','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Mocha Mug Cake'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Tofu, Broccoli & Tomato Curry with Flaked Almonds', '/packs/hwb-76/tofu-broccoli-tomato-curry.jpg', 2, 10, 15,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "300", "unit": "g", "name": "firm organic tofu"}, {"qty": "1", "unit": "tsp", "name": "extra virgin olive oil"}, {"qty": "1", "unit": "", "name": "small brown onion, finely diced"}, {"qty": "3", "unit": "cloves", "name": "garlic, crushed"}, {"qty": "2", "unit": "tsp", "name": "minced ginger"}, {"qty": "2", "unit": "tsp", "name": "curry powder"}, {"qty": "0.5", "unit": "tsp", "name": "ground turmeric"}, {"qty": "400", "unit": "g", "name": "canned crushed tomatoes"}, {"qty": "0.5", "unit": "cup", "name": "vegetable stock"}, {"qty": "0.5", "unit": "", "name": "medium head broccoli, cut into florets"}, {"qty": "60", "unit": "g", "name": "baby spinach"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "250", "unit": "g", "name": "frozen cauliflower rice"}, {"qty": "2", "unit": "tbsp", "name": "coconut yoghurt"}, {"qty": "2", "unit": "tbsp", "name": "flaked almonds"}, {"qty": "10", "unit": "g", "name": "fresh coriander"}]'::jsonb, null,
  '[{"step": 1, "text": "Chop the tofu into large cubes."}, {"step": 2, "text": "Heat the oil in a large saucepan over medium-high. Add the onion and cook, stirring, for 3-4 minutes until soft."}, {"step": 3, "text": "Stir in the garlic, ginger, curry powder and turmeric. Add the tomatoes and stock and bring to a simmer, then add the tofu and broccoli. Simmer for 5-7 minutes."}, {"step": 4, "text": "Add the spinach and salt and cook until just wilted."}, {"step": 5, "text": "Meanwhile, steam or microwave the cauliflower rice."}, {"step": 6, "text": "Divide the cauliflower rice and curry between bowls. Top with a dollop of coconut yoghurt, the flaked almonds and coriander. Serve hot."}]'::jsonb, '[{"text": "Coconut yoghurt can be swapped for Greek yoghurt if tolerated."}]'::jsonb, 432, 34, 19, 19, 18,
  false, ARRAY['low-carb','high-protein','dinner','vegetarian','curry','gluten-free','dairy-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Tofu, Broccoli & Tomato Curry with Flaked Almonds'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Breakfast Shakshuka', '/packs/hwb-76/breakfast-shakshuka.jpg', 1, 10, 15,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "1", "unit": "", "name": "spring onion"}, {"qty": "0.5", "unit": "tsp", "name": "extra virgin olive oil"}, {"qty": "0.5", "unit": "", "name": "small red capsicum, sliced"}, {"qty": "200", "unit": "g", "name": "canned crushed tomatoes"}, {"qty": "0.5", "unit": "tbsp", "name": "tomato paste"}, {"qty": "0.5", "unit": "tsp", "name": "ground cumin"}, {"qty": "0.5", "unit": "tsp", "name": "ground paprika"}, {"qty": "0.125", "unit": "tsp", "name": "chilli powder (optional)"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}, {"qty": "30", "unit": "g", "name": "spinach"}, {"qty": "2", "unit": "", "name": "eggs"}, {"qty": "20", "unit": "g", "name": "feta cheese, reduced-fat"}, {"qty": "1", "unit": "tsp", "name": "lemon zest"}, {"qty": "0.25", "unit": "tsp", "name": "chilli flakes"}]'::jsonb, null,
  '[{"step": 1, "text": "Thinly slice the spring onion, keeping the dark green part separate."}, {"step": 2, "text": "Heat the oil in a skillet over medium. Add the capsicum and half the white spring onion and cook for 3-4 minutes until softened."}, {"step": 3, "text": "Add the crushed tomatoes, tomato paste, cumin, paprika and chilli powder (if using), and season. Simmer for 3-5 minutes."}, {"step": 4, "text": "Add the spinach in batches, stirring until wilted. Let excess moisture cook off so the sauce stays rich."}, {"step": 5, "text": "Make small wells and crack in the eggs. Cover and cook until the eggs are just set to your liking."}, {"step": 6, "text": "Crumble over the feta, then scatter with the spring onion greens, lemon zest, chilli flakes and black pepper."}]'::jsonb, '[{"text": "Dairy free? Omit the feta or use a vegan alternative."}, {"text": "Short on time, use a ready-made shakshuka sauce with a short ingredient list and no added sugar."}]'::jsonb, 306, 24, 8, 16, 7,
  false, ARRAY['low-carb','breakfast','high-protein','vegetarian','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Breakfast Shakshuka'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Slow Cooked Chicken Cacciatore', '/packs/hwb-76/slow-cooked-chicken-cacciatore.jpg', 4, 10, 270,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "1.5", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "1", "unit": "", "name": "medium brown onion, finely chopped"}, {"qty": "600", "unit": "g", "name": "chicken breast, skinless"}, {"qty": "2", "unit": "stalks", "name": "celery, diced"}, {"qty": "2", "unit": "", "name": "carrots, diced"}, {"qty": "3", "unit": "cloves", "name": "garlic, finely chopped"}, {"qty": "0.25", "unit": "cup", "name": "fresh basil, roughly chopped"}, {"qty": "450", "unit": "g", "name": "tomato passata"}, {"qty": "0.5", "unit": "cup", "name": "chicken broth"}, {"qty": "2", "unit": "tsp", "name": "dried oregano"}, {"qty": "2", "unit": "tsp", "name": "mixed herbs"}, {"qty": "1", "unit": "pinch", "name": "chilli flakes (optional)"}, {"qty": "500", "unit": "g", "name": "mushrooms, sliced"}, {"qty": "0.33", "unit": "cup", "name": "Kalamata olives"}, {"qty": "1", "unit": "", "name": "medium head cauliflower, cut into florets"}, {"qty": "2", "unit": "tbsp", "name": "butter"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}, {"qty": "200", "unit": "g", "name": "green beans"}]'::jsonb, '[{"group_name": "For the chicken cacciatore", "ingredients": [{"qty": "1.5", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "1", "unit": "", "name": "medium brown onion, finely chopped"}, {"qty": "600", "unit": "g", "name": "chicken breast, skinless"}, {"qty": "2", "unit": "stalks", "name": "celery, diced"}, {"qty": "2", "unit": "", "name": "carrots, diced"}, {"qty": "3", "unit": "cloves", "name": "garlic, finely chopped"}, {"qty": "0.25", "unit": "cup", "name": "fresh basil, roughly chopped"}, {"qty": "450", "unit": "g", "name": "tomato passata"}, {"qty": "0.5", "unit": "cup", "name": "chicken broth"}, {"qty": "2", "unit": "tsp", "name": "dried oregano"}, {"qty": "2", "unit": "tsp", "name": "mixed herbs"}, {"qty": "1", "unit": "pinch", "name": "chilli flakes (optional)"}, {"qty": "500", "unit": "g", "name": "mushrooms, sliced"}, {"qty": "0.33", "unit": "cup", "name": "Kalamata olives"}]}, {"group_name": "For the cauliflower mash", "ingredients": [{"qty": "1", "unit": "", "name": "medium head cauliflower, cut into florets"}, {"qty": "2", "unit": "tbsp", "name": "butter"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}]}, {"group_name": "To serve", "ingredients": [{"qty": "200", "unit": "g", "name": "green beans"}]}]'::jsonb,
  '[{"step": 1, "text": "Heat 1/2 tbsp olive oil in a large frying pan over medium. Cook the onion, stirring, for 5 minutes until softened, then transfer to the slow cooker."}, {"step": 2, "text": "Heat the remaining 1 tbsp oil in the same pan. Brown the chicken for 2 minutes each side, then transfer to the slow cooker."}, {"step": 3, "text": "Add the celery, carrots, garlic and most of the basil (reserve some) to the slow cooker, along with the passata, chicken broth, oregano, mixed herbs and chilli flakes (if using). Stir to combine."}, {"step": 4, "text": "Cover and cook on high for 4 hours (or low for 8). Add the mushrooms in the final 30 minutes."}, {"step": 5, "text": "Stir the olives through."}, {"step": 6, "text": "For the mash: steam the cauliflower for 5-7 minutes until easily pierced. Blend with the butter, salt and pepper until smooth and creamy."}, {"step": 7, "text": "Steam the green beans for 3-4 minutes until tender-crisp."}, {"step": 8, "text": "Serve the cacciatore with the cauliflower mash and green beans, garnished with the reserved basil."}]'::jsonb, '[{"text": "No slow cooker? Cook in a covered oven-safe dish at 180C fan-forced for 1.5-2 hours, adding the mushrooms in the last 30 minutes."}, {"text": "Freezes well for up to 3 months - freeze the extra serves for next week."}]'::jsonb, 438, 45, 19, 15, 10,
  false, ARRAY['low-carb','high-protein','dinner','slow-cooker','meal-prep','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Slow Cooked Chicken Cacciatore'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Pesto & Spinach Omelette', '/packs/hwb-76/pesto-spinach-omelette.jpg', 1, 5, 10,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "2", "unit": "", "name": "eggs"}, {"qty": "0.25", "unit": "cup", "name": "egg whites (60 g)"}, {"qty": "2", "unit": "tbsp", "name": "canned coconut milk"}, {"qty": "1", "unit": "tbsp", "name": "pesto"}, {"qty": "1", "unit": "tbsp", "name": "lemon juice"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}, {"qty": "50", "unit": "g", "name": "mushrooms, sliced"}, {"qty": "2", "unit": "cups", "name": "baby spinach"}]'::jsonb, null,
  '[{"step": 1, "text": "In a bowl, whisk together the eggs, egg whites, coconut milk, pesto, lemon juice, salt and pepper."}, {"step": 2, "text": "Heat a small non-stick frying pan over medium. Add the mushrooms and cook for 2-3 minutes until browned and softened."}, {"step": 3, "text": "Add the spinach and cook for a further minute until wilted."}, {"step": 4, "text": "Pour the egg mixture over the vegetables and reduce the heat to medium-low. As it sets, lift an edge and tilt the pan so the runny egg flows underneath; repeat around the edges until no runny egg remains."}, {"step": 5, "text": "Cook a further 1-2 minutes until just set, then flip over one side."}, {"step": 6, "text": "Slide onto a plate and serve immediately."}]'::jsonb, '[{"text": "No carton egg whites? Use the whites of about 2 eggs (60 g)."}]'::jsonb, 350, 24, 7, 25, 3,
  false, ARRAY['low-carb','breakfast','high-protein','vegetarian','quick','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Pesto & Spinach Omelette'
);

insert into recipes (
  title, photo_url, servings, prep_time_mins, cook_time_mins,
  source_type, source_url, ingredients, ingredient_groups,
  method_steps, tips, calories, protein_g, carbs_g, fat_g, fibre_g,
  macros_estimated, tags, is_favourite, rating, times_cooked, user_id, pack_id
)
select
  'Low Carb Lasagna', '/packs/hwb-76/low-carb-lasagna.jpg', 4, 15, 45,
  'manual', 'Health with Bec - 7 Day Meal Plan 76 (June 2026)', '[{"qty": "2", "unit": "", "name": "medium zucchinis, thinly sliced lengthways"}, {"qty": "1", "unit": "", "name": "large eggplant, thinly sliced lengthways"}, {"qty": "1", "unit": "", "name": "olive oil spray"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}, {"qty": "1", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "600", "unit": "g", "name": "beef mince, lean (5% fat)"}, {"qty": "1", "unit": "tsp", "name": "dried oregano"}, {"qty": "0.5", "unit": "tsp", "name": "chilli flakes (optional)"}, {"qty": "250", "unit": "g", "name": "tomato passata"}, {"qty": "0.5", "unit": "cup", "name": "mozzarella cheese, reduced fat"}, {"qty": "20", "unit": "", "name": "fresh basil leaves"}, {"qty": "2", "unit": "tbsp", "name": "butter"}, {"qty": "1", "unit": "tbsp", "name": "arrowroot flour"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "cup", "name": "almond milk, unsweetened"}, {"qty": "3", "unit": "tbsp", "name": "Parmesan cheese, grated"}]'::jsonb, '[{"group_name": "For the lasagna", "ingredients": [{"qty": "2", "unit": "", "name": "medium zucchinis, thinly sliced lengthways"}, {"qty": "1", "unit": "", "name": "large eggplant, thinly sliced lengthways"}, {"qty": "1", "unit": "", "name": "olive oil spray"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "pinch", "name": "pepper"}, {"qty": "1", "unit": "tbsp", "name": "extra virgin olive oil"}, {"qty": "600", "unit": "g", "name": "beef mince, lean (5% fat)"}, {"qty": "1", "unit": "tsp", "name": "dried oregano"}, {"qty": "0.5", "unit": "tsp", "name": "chilli flakes (optional)"}, {"qty": "250", "unit": "g", "name": "tomato passata"}, {"qty": "0.5", "unit": "cup", "name": "mozzarella cheese, reduced fat"}, {"qty": "20", "unit": "", "name": "fresh basil leaves"}]}, {"group_name": "For the white sauce", "ingredients": [{"qty": "2", "unit": "tbsp", "name": "butter"}, {"qty": "1", "unit": "tbsp", "name": "arrowroot flour"}, {"qty": "1", "unit": "pinch", "name": "salt"}, {"qty": "1", "unit": "cup", "name": "almond milk, unsweetened"}, {"qty": "3", "unit": "tbsp", "name": "Parmesan cheese, grated"}]}]'::jsonb,
  '[{"step": 1, "text": "Preheat the oven to 220C fan-forced / 430F. Line two large baking trays with baking paper."}, {"step": 2, "text": "Lay the sliced zucchini and eggplant on the trays, spray lightly with olive oil and season. Bake for 15 minutes until lightly golden and tender."}, {"step": 3, "text": "Meanwhile, heat the olive oil in a frying pan over medium. Add the mince, oregano, chilli flakes (if using) and seasoning, and cook, breaking up the mince, until browned. Add most of the passata (reserve 2-3 tbsp) and simmer for 10 minutes to thicken."}, {"step": 4, "text": "For the white sauce: melt the butter in a saucepan over low heat, whisk in the arrowroot and a pinch of salt."}, {"step": 5, "text": "Slowly pour in the almond milk, whisking constantly. Bring to a low simmer, then stir in the Parmesan until smooth."}, {"step": 6, "text": "Lower the oven to 180C fan-forced / 360F. Grease a 20 x 30 cm baking dish and spread the reserved passata over the base."}, {"step": 7, "text": "Layer: vegetables, meat sauce, a drizzle of white sauce - repeat until everything is used."}, {"step": 8, "text": "Top with the mozzarella and bake for 30 minutes. Cover with foil and bake a further 10-15 minutes until golden and bubbling. Rest for 10 minutes."}, {"step": 9, "text": "Garnish with fresh basil leaves before serving."}]'::jsonb, '[{"text": "Freezes well - double or quadruple the batch. Cool completely in the fridge first (easier to slice cold), then portion and freeze."}]'::jsonb, 421, 42, 12, 21, 6,
  false, ARRAY['low-carb','high-protein','dinner','meal-prep','gluten-free'], false, null, 0,
  null, (select id from recipe_packs where slug = 'hwb-76-june-2026')
where not exists (
  select 1 from recipes t
  where t.pack_id = (select id from recipe_packs where slug = 'hwb-76-june-2026')
    and t.title = 'Low Carb Lasagna'
);
