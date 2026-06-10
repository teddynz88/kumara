-- ============================================
-- Kumara: 8 Starter Recipes (Low-Carb, High-Protein)
-- Paste into Supabase SQL Editor and Run
-- ============================================

-- 1. BREAKFAST: Spinach & Feta Omelette
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Spinach & Feta Omelette',
  'manual', 1, 5, 5,
  'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&fit=crop',
  '[{"qty":"3","unit":"piece","name":"eggs"},{"qty":"1","unit":"cup","name":"baby spinach"},{"qty":"30","unit":"g","name":"feta cheese, crumbled"},{"qty":"0.25","unit":"piece","name":"red onion, diced"},{"qty":"1","unit":"tsp","name":"olive oil"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"0.25","unit":"tsp","name":"dried oregano"}]'::jsonb,
  '[{"step":1,"text":"Crack the eggs into a bowl, season with salt, pepper, and oregano, and whisk until combined."},{"step":2,"text":"Heat olive oil in a non-stick frying pan over medium heat. Add the diced red onion and cook for 1-2 minutes until softened."},{"step":3,"text":"Add the baby spinach and stir until just wilted, about 30 seconds."},{"step":4,"text":"Pour in the egg mixture and tilt the pan to spread evenly. Cook for 2-3 minutes until the edges are set."},{"step":5,"text":"Scatter the crumbled feta over one half of the omelette. Fold the other half over and cook for another minute."},{"step":6,"text":"Slide onto a plate and serve immediately."}]'::jsonb,
  '[{"text":"Don''t overstir the eggs once in the pan - let them set for a creamy texture."},{"text":"Add a few cherry tomatoes on the side for extra colour and nutrients."}]'::jsonb,
  380, 28, 4, 28, 2,
  ARRAY['breakfast','quick','high-protein','low-carb','vegetarian','gluten-free'],
  false, NULL, 0
);

-- 2. BREAKFAST: Berry Protein Smoothie
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Berry Protein Smoothie',
  'manual', 1, 5, 0,
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&fit=crop',
  '[{"qty":"1","unit":"cup","name":"frozen mixed berries"},{"qty":"1","unit":"cup","name":"unsweetened almond milk"},{"qty":"30","unit":"g","name":"vanilla protein powder"},{"qty":"1","unit":"tbsp","name":"almond butter"},{"qty":"1","unit":"tbsp","name":"chia seeds"},{"qty":"0.5","unit":"cup","name":"ice cubes"}]'::jsonb,
  '[{"step":1,"text":"Add almond milk, frozen berries, protein powder, almond butter, and chia seeds to a blender."},{"step":2,"text":"Blend on high for 30-45 seconds until smooth and creamy."},{"step":3,"text":"Add ice cubes and blend again briefly for desired thickness."},{"step":4,"text":"Pour into a glass and serve immediately."}]'::jsonb,
  '[{"text":"Freeze bananas and swap in half a banana for extra creaminess if you don''t mind the extra carbs."},{"text":"Prep smoothie bags the night before - add all dry ingredients and frozen fruit to a zip lock bag, then just add milk and blend in the morning."}]'::jsonb,
  310, 30, 18, 12, 8,
  ARRAY['breakfast','quick','high-protein','low-carb','smoothie','gluten-free','dairy-free'],
  false, NULL, 0
);

-- 3. LUNCH: Grilled Chicken Caesar Salad (No Croutons)
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Grilled Chicken Caesar Salad',
  'manual', 2, 10, 10,
  'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&fit=crop',
  '[{"qty":"2","unit":"piece","name":"skinless chicken breasts (180g each)"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"1","unit":"tsp","name":"garlic powder"},{"qty":"1","unit":"tsp","name":"smoked paprika"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"1","unit":"piece","name":"large cos lettuce, chopped"},{"qty":"30","unit":"g","name":"Parmesan cheese, shaved"},{"qty":"2","unit":"tbsp","name":"mayonnaise"},{"qty":"1","unit":"tbsp","name":"lemon juice"},{"qty":"1","unit":"tsp","name":"Dijon mustard"},{"qty":"1","unit":"tsp","name":"Worcestershire sauce"},{"qty":"1","unit":"piece","name":"garlic clove, minced"},{"qty":"1","unit":"tbsp","name":"olive oil"}]'::jsonb,
  '[{"step":1,"text":"Rub chicken breasts with 1 tbsp olive oil, garlic powder, smoked paprika, salt, and pepper."},{"step":2,"text":"Heat a grill pan or BBQ over medium-high heat. Cook chicken for 5-6 minutes per side until cooked through. Rest for 5 minutes, then slice."},{"step":3,"text":"Make the dressing: whisk together mayonnaise, lemon juice, Dijon mustard, Worcestershire sauce, minced garlic, and 1 tbsp olive oil. Season with salt and pepper."},{"step":4,"text":"Arrange the chopped cos lettuce in bowls. Top with sliced chicken and shaved Parmesan."},{"step":5,"text":"Drizzle with the Caesar dressing and serve."}]'::jsonb,
  '[{"text":"Cook extra chicken on Sunday for easy weekday lunches."},{"text":"For a lighter dressing, swap half the mayo for Greek yoghurt."}]'::jsonb,
  465, 48, 5, 27, 3,
  ARRAY['lunch','high-protein','low-carb','meal-prep','gluten-free'],
  false, NULL, 0
);

-- 4. LUNCH: Tuna Lettuce Wraps
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Tuna Lettuce Wraps',
  'manual', 2, 10, 0,
  'https://images.unsplash.com/photo-1529059356100-bb0bbfd7ee3c?w=800&fit=crop',
  '[{"qty":"2","unit":"piece","name":"tins tuna in spring water (95g each), drained"},{"qty":"0.25","unit":"piece","name":"red onion, finely diced"},{"qty":"1","unit":"piece","name":"celery stalk, finely diced"},{"qty":"0.25","unit":"piece","name":"continental cucumber, diced"},{"qty":"10","unit":"piece","name":"cherry tomatoes, quartered"},{"qty":"1","unit":"tbsp","name":"mayonnaise"},{"qty":"1","unit":"tbsp","name":"lemon juice"},{"qty":"1","unit":"tsp","name":"Dijon mustard"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"6","unit":"piece","name":"large butter lettuce leaves"},{"qty":"0.5","unit":"piece","name":"avocado, sliced"}]'::jsonb,
  '[{"step":1,"text":"Drain the tuna and flake into a mixing bowl."},{"step":2,"text":"Add the diced red onion, celery, cucumber, and cherry tomatoes. Mix to combine."},{"step":3,"text":"In a small bowl, whisk together the mayonnaise, lemon juice, Dijon mustard, salt, and pepper."},{"step":4,"text":"Pour the dressing over the tuna mixture and toss gently."},{"step":5,"text":"Spoon the tuna mixture into butter lettuce leaves, top with avocado slices, and serve."}]'::jsonb,
  '[{"text":"These are perfect for meal prep - keep the tuna filling and lettuce cups separate until ready to eat."},{"text":"Swap mayo for Greek yoghurt for fewer calories."}]'::jsonb,
  340, 35, 7, 18, 4,
  ARRAY['lunch','quick','high-protein','low-carb','gluten-free','dairy-free'],
  false, NULL, 0
);

-- 5. DINNER: Grilled Salmon with Roasted Vegetables
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Grilled Salmon with Roasted Vegetables',
  'manual', 2, 10, 25,
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&fit=crop',
  '[{"qty":"2","unit":"piece","name":"salmon fillets (180g each)"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"1","unit":"tbsp","name":"lemon juice"},{"qty":"1","unit":"tsp","name":"garlic powder"},{"qty":"0.5","unit":"tsp","name":"smoked paprika"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"1","unit":"piece","name":"zucchini, sliced into rounds"},{"qty":"1","unit":"piece","name":"red capsicum, cut into strips"},{"qty":"200","unit":"g","name":"broccoli florets"},{"qty":"200","unit":"g","name":"asparagus, trimmed"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"0.5","unit":"tsp","name":"dried thyme"},{"qty":"1","unit":"piece","name":"lemon, cut into wedges"}]'::jsonb,
  '[{"step":1,"text":"Preheat the oven to 200\u00b0C fan-forced / 400\u00b0F."},{"step":2,"text":"Toss the zucchini, capsicum, broccoli, and asparagus with 1 tbsp olive oil, dried thyme, salt, and pepper on a large baking tray."},{"step":3,"text":"Roast for 15 minutes."},{"step":4,"text":"Meanwhile, rub the salmon fillets with olive oil, lemon juice, garlic powder, smoked paprika, salt, and pepper."},{"step":5,"text":"After 15 minutes, push the vegetables to the sides and place the salmon fillets in the centre of the tray."},{"step":6,"text":"Return to the oven for 10-12 minutes until the salmon is just cooked through and flakes easily."},{"step":7,"text":"Serve with lemon wedges on the side."}]'::jsonb,
  '[{"text":"Don''t overcook the salmon - it should still be slightly translucent in the centre for the best texture."},{"text":"Swap vegetables based on what''s in season - sweet potato, cauliflower, and green beans also work well."}]'::jsonb,
  490, 42, 12, 30, 6,
  ARRAY['dinner','high-protein','low-carb','gluten-free','dairy-free','fish'],
  false, NULL, 0
);

-- 6. DINNER: Chicken & Cashew Stir-fry
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Chicken & Cashew Stir-fry',
  'manual', 2, 10, 10,
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&fit=crop',
  '[{"qty":"350","unit":"g","name":"chicken breast, sliced into strips"},{"qty":"1","unit":"tbsp","name":"sesame oil"},{"qty":"2","unit":"piece","name":"garlic cloves, minced"},{"qty":"1","unit":"tbsp","name":"fresh ginger, grated"},{"qty":"1","unit":"piece","name":"red capsicum, sliced"},{"qty":"100","unit":"g","name":"snow peas, trimmed"},{"qty":"1","unit":"piece","name":"small broccoli, cut into florets"},{"qty":"0.25","unit":"cup","name":"raw cashews"},{"qty":"2","unit":"tbsp","name":"tamari"},{"qty":"1","unit":"tbsp","name":"rice wine vinegar"},{"qty":"1","unit":"tsp","name":"sriracha"},{"qty":"300","unit":"g","name":"cauliflower rice"},{"qty":"1","unit":"tbsp","name":"sesame seeds"},{"qty":"2","unit":"piece","name":"spring onions, sliced"}]'::jsonb,
  '[{"step":1,"text":"Heat sesame oil in a wok or large frying pan over high heat."},{"step":2,"text":"Add the chicken strips and stir-fry for 3-4 minutes until golden and cooked through. Remove and set aside."},{"step":3,"text":"Add garlic and ginger to the wok and stir for 30 seconds until fragrant."},{"step":4,"text":"Add capsicum, snow peas, and broccoli. Stir-fry for 3-4 minutes until tender-crisp."},{"step":5,"text":"Return the chicken to the wok. Add cashews, tamari, rice wine vinegar, and sriracha. Toss to combine and cook for 1 minute."},{"step":6,"text":"Heat cauliflower rice in the microwave according to packet directions."},{"step":7,"text":"Serve the stir-fry over cauliflower rice, topped with sesame seeds and sliced spring onions."}]'::jsonb,
  '[{"text":"Slice the chicken against the grain for more tender pieces."},{"text":"Toast the cashews in a dry pan first for extra crunch and flavour."},{"text":"This recipe works great for meal prep - portion into containers and reheat for lunch."}]'::jsonb,
  445, 44, 15, 22, 5,
  ARRAY['dinner','quick','high-protein','low-carb','meal-prep','gluten-free','dairy-free'],
  false, NULL, 0
);

-- 7. DINNER: Beef & Broccoli
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Beef & Broccoli',
  'manual', 2, 10, 10,
  'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&fit=crop',
  '[{"qty":"350","unit":"g","name":"lean beef rump steak, thinly sliced"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"2","unit":"piece","name":"garlic cloves, minced"},{"qty":"1","unit":"tbsp","name":"fresh ginger, grated"},{"qty":"1","unit":"piece","name":"large head of broccoli, cut into florets"},{"qty":"2","unit":"tbsp","name":"tamari"},{"qty":"1","unit":"tbsp","name":"oyster sauce"},{"qty":"1","unit":"tsp","name":"sesame oil"},{"qty":"0.5","unit":"tsp","name":"chilli flakes"},{"qty":"0.5","unit":"cup","name":"beef stock"},{"qty":"1","unit":"tsp","name":"arrowroot flour"},{"qty":"300","unit":"g","name":"cauliflower rice"},{"qty":"1","unit":"tbsp","name":"sesame seeds"}]'::jsonb,
  '[{"step":1,"text":"In a small bowl, whisk together tamari, oyster sauce, sesame oil, beef stock, and arrowroot flour. Set aside."},{"step":2,"text":"Heat olive oil in a wok over high heat. Add the beef slices and stir-fry for 2-3 minutes until browned. Remove and set aside."},{"step":3,"text":"Add garlic, ginger, and chilli flakes to the wok. Stir for 30 seconds until fragrant."},{"step":4,"text":"Add broccoli florets and stir-fry for 3-4 minutes until bright green and tender-crisp."},{"step":5,"text":"Return the beef to the wok. Pour in the sauce and toss everything together. Cook for 1-2 minutes until the sauce thickens."},{"step":6,"text":"Heat cauliflower rice in the microwave and divide between bowls."},{"step":7,"text":"Serve the beef and broccoli over cauliflower rice, sprinkled with sesame seeds."}]'::jsonb,
  '[{"text":"Slice the beef very thinly against the grain for tender results. Partially freezing the steak for 30 minutes makes slicing easier."},{"text":"If you don''t have arrowroot flour, use a teaspoon of cornflour instead."}]'::jsonb,
  430, 45, 10, 20, 5,
  ARRAY['dinner','quick','high-protein','low-carb','gluten-free','dairy-free'],
  false, NULL, 0
);

-- 8. SNACK: Greek Yoghurt with Berries & Nuts
INSERT INTO recipes (
  title, source_type, servings,
  prep_time_mins, cook_time_mins,
  photo_url,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Greek Yoghurt with Berries & Nuts',
  'manual', 1, 3, 0,
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&fit=crop',
  '[{"qty":"200","unit":"g","name":"plain Greek yoghurt (full fat)"},{"qty":"0.5","unit":"cup","name":"mixed berries (fresh or frozen)"},{"qty":"10","unit":"piece","name":"almonds, roughly chopped"},{"qty":"1","unit":"tbsp","name":"pumpkin seeds"},{"qty":"1","unit":"tbsp","name":"chia seeds"},{"qty":"0.5","unit":"tsp","name":"cinnamon"},{"qty":"1","unit":"tsp","name":"honey (optional)"}]'::jsonb,
  '[{"step":1,"text":"If using frozen berries, thaw in the microwave for 30-40 seconds."},{"step":2,"text":"Spoon the Greek yoghurt into a bowl."},{"step":3,"text":"Top with the berries, chopped almonds, pumpkin seeds, and chia seeds."},{"step":4,"text":"Sprinkle with cinnamon and drizzle with honey if desired."}]'::jsonb,
  '[{"text":"Make this the night before as overnight yoghurt - the chia seeds will absorb moisture and create a thicker, pudding-like texture."},{"text":"Swap almonds for walnuts or macadamias for variety."},{"text":"Skip the honey to keep it lower carb."}]'::jsonb,
  320, 22, 18, 16, 6,
  ARRAY['snack','quick','high-protein','low-carb','vegetarian','gluten-free'],
  false, NULL, 0
);
