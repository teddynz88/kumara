-- ============================================
-- Kumara: Insert 12 Health with Bec Recipes
-- Paste this into Supabase SQL Editor and Run
-- ============================================

-- Garlic Chicken with Greek Salad
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Garlic Chicken with Greek Salad',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  2,
  15,
  15,
  '[{"qty":"0.5","unit":"piece","name":"continental cucumber"},{"qty":"150","unit":"g","name":"cherry tomatoes"},{"qty":"0.5","unit":"piece","name":"small red onion"},{"qty":"30","unit":"g","name":"Kalamata olives (about 8 olives)"},{"qty":"4","unit":"tbsp","name":"fresh dill"},{"qty":"2","unit":"tbsp","name":"fresh mint"},{"qty":"1.25","unit":"tbsp","name":"garlic powder"},{"qty":"1","unit":"tsp","name":"ground paprika"},{"qty":"1","unit":"tsp","name":"dried oregano"},{"qty":"4","unit":"tsp","name":"olive oil"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"2","unit":"piece","name":"skinless chicken breasts (200g each)"},{"qty":"4","unit":"tbsp","name":"plain Greek yoghurt"},{"qty":"2","unit":"tbsp","name":"lemon juice"},{"qty":"1","unit":"tbsp","name":"balsamic vinegar"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"30","unit":"g","name":"feta cheese, reduced-fat"}]'::jsonb,
  '[{"step":1,"text":"Slice the cucumber into half moons. Halve the cherry tomatoes, thinly slice the red onion, and halve the olives. Chop the dill and mint."},{"step":2,"text":"In a small bowl, mix together 1 tbsp of the garlic powder, paprika, 1/2 tsp dried oregano, 2 tsp olive oil, and salt to make a paste. Rub all over the chicken."},{"step":3,"text":"Air fry at 190\u00b0C for 12-15 minutes, until nicely browned and cooked through. Alternatively, sear in a frying pan over medium-high heat for 4-5 minutes on each side, until nicely browned and cooked through. Allow to rest for 5 minutes, before slicing."},{"step":4,"text":"To assemble the salad, toss the cucumber, cherry tomatoes, red onion, and olives together."},{"step":5,"text":"Whisk together the remaining 2 tsp olive oil, 1 tbsp lemon juice, balsamic vinegar, remaining 1/2 tsp dried oregano, and a good season of salt and pepper, and toss through the salad."},{"step":6,"text":"To make the tzatziki, mix together the Greek yoghurt, remaining 1 tbsp lemon juice, mint, half the dill, and remaining 1/4 tsp garlic powder."},{"step":7,"text":"Divide the salad among your serving bowls, and top with the chicken. Crumble over the feta, garnish with the remaining dill, and dollop on the tzatziki."}]'::jsonb,
  '[{"text":"Air fry or pan-fry the chicken - both methods work well."},{"text":"Cook the chicken on Sunday to get ahead for Monday and Tuesday lunches."}]'::jsonb,
  476, 54, 9, 20, 5,
  ARRAY['low-carb','high-protein','lunch','dinner','meal-prep','gluten-free'],
  false, NULL, 0
);

-- Apple & Walnut Loaf
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Apple & Walnut Loaf',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  10,
  10,
  40,
  '[{"qty":"3","unit":"piece","name":"eggs"},{"qty":"100","unit":"g","name":"butter"},{"qty":"0.5","unit":"cup","name":"almond meal"},{"qty":"0.3125","unit":"cup","name":"coconut flour (1/4 cup + 1 tbsp)"},{"qty":"2","unit":"tbsp","name":"granulated monk fruit"},{"qty":"1.5","unit":"tsp","name":"baking powder"},{"qty":"2","unit":"tsp","name":"cinnamon"},{"qty":"0.5","unit":"tsp","name":"allspice"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"2","unit":"piece","name":"small apples"},{"qty":"0.33","unit":"cup","name":"walnuts"},{"qty":"1","unit":"tsp","name":"vanilla extract"}]'::jsonb,
  '[{"step":1,"text":"Bring the eggs to room temperature."},{"step":2,"text":"Preheat oven to 170\u00b0C fan-forced / 340\u00b0F. Line a 20 cm x 11 cm loaf tin with baking paper."},{"step":3,"text":"Melt the butter in the microwave and set aside to cool slightly."},{"step":4,"text":"In a mixing bowl, combine almond meal, coconut flour, monk fruit, baking powder, cinnamon, allspice, and salt."},{"step":5,"text":"Peel the apples and dice into 1 cm pieces. Roughly chop the walnuts."},{"step":6,"text":"In a separate bowl, whisk together the eggs and vanilla."},{"step":7,"text":"Pour the wet ingredients into the dry, then add melted butter and apple, and gently fold to combine."},{"step":8,"text":"Transfer the mixture to the prepared loaf tin and smooth the top with the back of a spoon. Sprinkle over the chopped walnuts."},{"step":9,"text":"Bake for 35-40 minutes, or until cooked through."},{"step":10,"text":"Allow to cool for 10 minutes before transferring to a wire rack. Once completely cool, slice the loaf into 10 pieces."}]'::jsonb,
  '[{"text":"To make this dairy free, swap butter to equal parts coconut oil."},{"text":"Monk fruit can be swapped to stevia if desired. Golden monk fruit tastes similar to brown sugar and enhances the colour and flavour."},{"text":"If you''re nut free, swap almond meal to lupin flour and leave out the walnuts."},{"text":"If you like an extra moist loaf, grate the apple instead of dicing it. Store in an airtight container in the fridge for up to 5 days. You can also freeze each slice individually. This loaf is also great as muffins - bake in a muffin tray for about 15 minutes."}]'::jsonb,
  150, 4, 5, 12, 3,
  ARRAY['low-carb','snack','baking','meal-prep','gluten-free','vegetarian'],
  false, NULL, 0
);

-- Lemon Grilled Fish, Roasted Pumpkin Pieces & Salad
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Lemon Grilled Fish, Roasted Pumpkin Pieces & Salad',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  1,
  10,
  30,
  '[{"qty":"170","unit":"g","name":"pumpkin"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"1","unit":"tbsp","name":"fresh rosemary"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"150","unit":"g","name":"snapper"},{"qty":"1","unit":"tsp","name":"olive oil"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"0.25","unit":"piece","name":"lemon"},{"qty":"0.25","unit":"piece","name":"fennel bulb"},{"qty":"50","unit":"g","name":"rocket"},{"qty":"1","unit":"tbsp","name":"balsamic vinegar"},{"qty":"0.5","unit":"tbsp","name":"olive oil"}]'::jsonb,
  '[{"step":1,"text":"Preheat the oven to 180\u00b0C fan-forced / 360\u00b0F."},{"step":2,"text":"Chop the pumpkin into 2 cm cubes and add to a large baking tray. Drizzle or spray with olive oil, add rosemary and salt, and toss to coat."},{"step":3,"text":"Roast for 20 minutes, then flip and roast for a further 10 minutes, or until golden."},{"step":4,"text":"Heat a grill pan over high heat."},{"step":5,"text":"Brush fish with olive oil and season with salt and pepper."},{"step":6,"text":"Grill for about 2 minutes per side, or until cooked through."},{"step":7,"text":"Remove from heat and top with a squeeze of lemon juice."},{"step":8,"text":"Finely slice the fennel and add to a salad bowl along with the rocket. Drizzle over balsamic vinegar and olive oil and toss to combine."},{"step":9,"text":"Serve with the grilled fish and roasted pumpkin."}]'::jsonb,
  '[{"text":"Red emperor or pink snapper are the best fish for this dish but you can use any firm white fish."},{"text":"Spraying oil over your vegetables helps to distribute a small amount of oil evenly. Use a refillable oil sprayer bottle rather than an aerosol cooking oil."}]'::jsonb,
  475, 35, 16, 29, 6,
  ARRAY['low-carb','dinner','high-protein','gluten-free','dairy-free','fish'],
  false, NULL, 0
);

-- Frosted Cupcake Smoothie
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Frosted Cupcake Smoothie',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  1,
  3,
  0,
  '[{"qty":"0.5","unit":"cup","name":"frozen cauliflower"},{"qty":"0.5","unit":"cup","name":"raspberries (fresh or frozen)"},{"qty":"1","unit":"cup","name":"almond milk, unsweetened"},{"qty":"36","unit":"g","name":"Morlife Frosted Cupcake protein powder"},{"qty":"1","unit":"tbsp","name":"chia seeds"},{"qty":"0.5","unit":"tsp","name":"vanilla extract"}]'::jsonb,
  '[{"step":1,"text":"Add all the ingredients into a blender and blend until smooth. Add extra water or ice for desired consistency."}]'::jsonb,
  '[{"text":"If the berries aren''t frozen, add 5 cubes of ice."},{"text":"If you''re nut free, swap almond milk to unsweetened soy, hemp, or coconut milk."},{"text":"Don''t have protein powder? Swap to 2 tbsp flaxseed meal. A pinch of salt would be a delicious addition."},{"text":"Want to save time in the morning? The night before, add all ingredients except milk and water into a zip lock bag and pop into the freezer."}]'::jsonb,
  330, 28, 17, 11, 12,
  ARRAY['low-carb','breakfast','quick','high-protein','smoothie','gluten-free','dairy-free'],
  false, NULL, 0
);

-- Roasted Capsicum Dip
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Roasted Capsicum Dip',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  6,
  10,
  30,
  '[{"qty":"6","unit":"piece","name":"garlic cloves"},{"qty":"3","unit":"piece","name":"red capsicums"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"0.75","unit":"cup","name":"cashews"},{"qty":"1","unit":"tbsp","name":"lemon juice"},{"qty":"0.25","unit":"tsp","name":"paprika"},{"qty":"1","unit":"pinch","name":"salt"}]'::jsonb,
  '[{"step":1,"text":"Preheat the oven to 200\u00b0C fan-forced / 400\u00b0F and line a baking tray with baking paper."},{"step":2,"text":"Peel the garlic cloves, place on the baking tray with the whole capsicums and drizzle with olive oil."},{"step":3,"text":"Bake in the oven for 25-30 minutes, until the capsicums have wilted and the skin begins to lightly char."},{"step":4,"text":"Meanwhile, soak the cashews in boiling water for 10 minutes, then drain."},{"step":5,"text":"Once the capsicums are cool enough to handle, peel off the skins, remove the stems and seeds, and roughly chop the flesh."},{"step":6,"text":"Place the capsicums, roasted garlic, cashews, lemon juice, paprika, salt, and 2 tablespoons of water in a food processor. Blend until smooth, adding more water if needed to reach your desired consistency."},{"step":7,"text":"Taste and adjust seasoning if required."}]'::jsonb,
  '[{"text":"Store in an airtight container in the fridge for up to 7 days."}]'::jsonb,
  131, 4, 8, 10, 2,
  ARRAY['low-carb','snack','meal-prep','vegan','gluten-free','dairy-free'],
  false, NULL, 0
);

-- Lemongrass Pork Stir-fry
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Lemongrass Pork Stir-fry',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  2,
  10,
  10,
  '[{"qty":"50","unit":"g","name":"green beans"},{"qty":"0.5","unit":"piece","name":"red onion"},{"qty":"1","unit":"tbsp","name":"lemongrass, finely chopped"},{"qty":"0.5","unit":"piece","name":"red chilli"},{"qty":"1","unit":"tbsp","name":"fresh ginger, finely chopped"},{"qty":"1","unit":"piece","name":"garlic clove"},{"qty":"1.5","unit":"tsp","name":"olive oil"},{"qty":"350","unit":"g","name":"pork mince, lean (10% fat)"},{"qty":"1.5","unit":"tbsp","name":"Massaman curry paste, gluten free"},{"qty":"1","unit":"tbsp","name":"fish sauce"},{"qty":"1","unit":"tbsp","name":"lime juice"},{"qty":"1","unit":"tbsp","name":"tamari"},{"qty":"1","unit":"tsp","name":"granulated monk fruit"},{"qty":"0.5","unit":"cup","name":"Thai basil leaves"},{"qty":"300","unit":"g","name":"cauliflower rice"}]'::jsonb,
  '[{"step":1,"text":"Trim and cut the beans into 5 cm pieces. Slice the onion into thin wedges and finely chop the lemongrass, chilli, ginger, and garlic."},{"step":2,"text":"Heat oil in a wok over medium-high heat and add the onion, lemongrass, chilli, ginger, and garlic. Stir fry for 1 minute, or until fragrant."},{"step":3,"text":"Add the pork mince and cook for 4-5 minutes, breaking up with a spoon, until cooked through."},{"step":4,"text":"Stir in the curry paste and cook for 1-2 minutes until fragrant. Add the beans, fish sauce, lime juice, tamari, and monk fruit. Cook for 1-2 minutes, until beans are just tender, then stir in half the Thai basil."},{"step":5,"text":"Heat the cauliflower rice in a microwave and divide between bowls. Top with the stir-fry and sprinkle with remaining basil leaves."}]'::jsonb,
  '[{"text":"Monk fruit can be swapped to stevia if desired."},{"text":"You can use pre-made bags of frozen cauliflower rice, or make your own by blending cauliflower in a food processor until it resembles rice."},{"text":"Make sure you choose a Massaman curry paste that is gluten free."}]'::jsonb,
  453, 42, 12, 24, 5,
  ARRAY['low-carb','dinner','high-protein','quick','gluten-free','dairy-free'],
  false, NULL, 0
);

-- Peri Peri Chicken
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Peri Peri Chicken',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  2,
  30,
  12,
  '[{"qty":"1","unit":"piece","name":"red chilli"},{"qty":"0.5","unit":"piece","name":"medium red capsicum (for marinade)"},{"qty":"2.5","unit":"piece","name":"garlic cloves"},{"qty":"1.5","unit":"tbsp","name":"olive oil"},{"qty":"2","unit":"tbsp","name":"malt vinegar"},{"qty":"1","unit":"tbsp","name":"smoked paprika"},{"qty":"0.5","unit":"tbsp","name":"dried oregano"},{"qty":"1","unit":"tsp","name":"onion powder"},{"qty":"0.25","unit":"tsp","name":"granulated monk fruit"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"2","unit":"piece","name":"skinless chicken breasts (175g each)"},{"qty":"1.5","unit":"tbsp","name":"mayonnaise"},{"qty":"1.5","unit":"tbsp","name":"coconut yoghurt"},{"qty":"0.5","unit":"piece","name":"medium red capsicum (for BBQ veg)"},{"qty":"150","unit":"g","name":"green beans"},{"qty":"0.5","unit":"piece","name":"red onion"},{"qty":"1","unit":"tsp","name":"olive oil"},{"qty":"0.5","unit":"tsp","name":"smoked paprika"}]'::jsonb,
  '[{"step":1,"text":"Make the marinade: Trim stems of chillies, deseed the capsicum, and peel the garlic. Add these to a blender along with the oil, vinegar, paprika, oregano, onion powder, monk fruit, salt, and pepper and blitz to a smooth consistency. Taste and adjust seasoning if required. Reserve 1.5 tablespoons for the sauce."},{"step":2,"text":"Add chicken to a small bowl or zip lock bag and pour in remaining marinade. Cover and place in the fridge to marinate for 20 minutes (but the longer the better)."},{"step":3,"text":"Make the sauce: While the chicken is marinating, in a small bowl mix the reserved marinade together with the mayonnaise and yoghurt. Taste and adjust seasoning if required. If it''s too thick, add a little water. Set aside."},{"step":4,"text":"Preheat a BBQ grill or grill pan to medium-high. Remove chicken from the fridge and cook for 4-6 minutes each side, or until just cooked through. You want the marinade to char."},{"step":5,"text":"While the chicken is cooking, slice the remaining capsicum, trim the green beans, and cut the onion into wedges. Toss in olive oil, smoked paprika, salt, and pepper."},{"step":6,"text":"Heat a BBQ grill or grill pan to medium-high. Grill the vegetables for 5-6 minutes, turning occasionally, until lightly charred and tender-crisp."},{"step":7,"text":"Serve the BBQ vegetables alongside the chicken, with the peri-peri sauce on the side."}]'::jsonb,
  '[{"text":"If you can''t find chicken breasts that are 175g each, slice larger breasts into chunks or slice one larger breast horizontally to create two smaller pieces."},{"text":"Monk fruit can be swapped to stevia if desired."},{"text":"If you are sensitive to eggs, use an egg-free vegan / plant-based mayonnaise."}]'::jsonb,
  483, 44, 12, 25, 7,
  ARRAY['low-carb','dinner','high-protein','gluten-free','BBQ'],
  false, NULL, 0
);

-- Spaghetti Carbonara
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Spaghetti Carbonara',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  2,
  5,
  10,
  '[{"qty":"100","unit":"g","name":"bacon"},{"qty":"0.5","unit":"cup","name":"fresh parsley"},{"qty":"1","unit":"piece","name":"garlic clove"},{"qty":"2","unit":"piece","name":"egg yolks"},{"qty":"0.33","unit":"cup","name":"Parmesan cheese, grated"},{"qty":"200","unit":"g","name":"Slendier Edamame Bean Spaghetti"},{"qty":"1","unit":"tsp","name":"butter"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"}]'::jsonb,
  '[{"step":1,"text":"Dice the bacon, chop the parsley, and mince the garlic."},{"step":2,"text":"In a small bowl, beat the egg yolks and 3/4 of the Parmesan cheese."},{"step":3,"text":"Cook the Slendier pasta according to packet instructions. Drain and set aside."},{"step":4,"text":"In a deep pan over medium heat, melt the butter, then add the bacon and cook until crispy. Add the garlic to the pan and stir for 1 minute."},{"step":5,"text":"Add the drained pasta to the pan, reduce the heat to medium-low, and stir well to combine."},{"step":6,"text":"Remove from heat and immediately stir in the egg and cheese mixture until it thickens into a creamy sauce (without scrambling)."},{"step":7,"text":"Divide the pasta between bowls, top with parsley, the remaining Parmesan, and season with salt and pepper."}]'::jsonb,
  '[{"text":"Any type of Slendier pasta is fine (spaghetti or fettuccine). Any variety is also fine - it comes in black soybean, soybean, or edamame."},{"text":"If you can''t find Slendier pasta, Qetoe Low Carb Fettuccine or Spaghetti is a great alternative."},{"text":"To make this dairy free, swap the Parmesan for nutritional yeast or vegan Parmesan."}]'::jsonb,
  467, 29, 6, 34, 7,
  ARRAY['low-carb','dinner','quick','high-protein'],
  false, NULL, 0
);

-- Scrambled Eggs with Chives
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Scrambled Eggs with Chives',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  1,
  1,
  4,
  '[{"qty":"1","unit":"tbsp","name":"chives"},{"qty":"2","unit":"piece","name":"eggs"},{"qty":"1","unit":"tbsp","name":"almond milk, unsweetened"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"1","unit":"tsp","name":"butter"},{"qty":"1","unit":"piece","name":"slice Venerdi paleo (super seeded) bread"}]'::jsonb,
  '[{"step":1,"text":"Chop chives."},{"step":2,"text":"Whisk eggs together well. Then, whisk in milk, salt, and pepper."},{"step":3,"text":"Heat the butter in a pan over low-medium heat."},{"step":4,"text":"Add the eggs, stirring slowly, making sure not to burn the bottom. When the eggs are almost finished cooking, add the chives and remove from the pan."}]'::jsonb,
  '[{"text":"Can''t find Venerdi Bread? You can make the Bec''s Bread Loaf recipe instead."},{"text":"To make this dairy free, swap butter to equal parts coconut oil."},{"text":"The key to delicious scrambled eggs is to cook slowly, over low heat, and stir them a lot."}]'::jsonb,
  262, 19, 5, 16, 4,
  ARRAY['low-carb','breakfast','quick','vegetarian','gluten-free'],
  false, NULL, 0
);

-- Steak & Haloumi Skewers & Salad
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Steak & Haloumi Skewers & Salad',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  2,
  25,
  5,
  '[{"qty":"4","unit":"piece","name":"bamboo skewers"},{"qty":"2","unit":"tbsp","name":"olive oil"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"0.25","unit":"tsp","name":"chilli flakes"},{"qty":"200","unit":"g","name":"lean beef steak"},{"qty":"100","unit":"g","name":"haloumi"},{"qty":"1","unit":"piece","name":"small zucchini"},{"qty":"1","unit":"piece","name":"red capsicum"},{"qty":"0.25","unit":"piece","name":"continental cucumber"},{"qty":"10","unit":"piece","name":"cherry tomatoes"},{"qty":"4","unit":"cup","name":"leafy greens"},{"qty":"1","unit":"tbsp","name":"olive oil"},{"qty":"0.5","unit":"tsp","name":"dijon mustard"},{"qty":"1","unit":"tsp","name":"white wine vinegar"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"}]'::jsonb,
  '[{"step":1,"text":"Soak the bamboo skewers in water for 20 minutes to stop them burning on the BBQ."},{"step":2,"text":"In a large bowl, mix together the olive oil, salt, pepper and chilli flakes."},{"step":3,"text":"Cut the steak and haloumi into 2.5cm cubes. Chop the zucchini and capsicum into similar-sized pieces so everything cooks evenly on the skewer. Add to the bowl with the marinade and toss to coat well."},{"step":4,"text":"Thread one piece each of the steak, haloumi, zucchini, and capsicum onto the skewers and repeat, allowing some space at the end of the skewer for easy turning."},{"step":5,"text":"Heat a BBQ or frying pan to medium-high heat. Add the skewers and cook on each side for 1-2 minutes, until everything has a nice char and is cooked to your liking."},{"step":6,"text":"Remove the skewers from the heat and allow to rest for a few minutes."},{"step":7,"text":"While the skewers are cooking, dice the cucumber and cut the cherry tomatoes in half. Add them to a bowl along with the leafy greens."},{"step":8,"text":"In a jar or small bowl, whisk together the olive oil, mustard, and vinegar. Season with salt and pepper."},{"step":9,"text":"Drizzle the dressing over the salad, toss to coat, and serve alongside your skewers."}]'::jsonb,
  '[{"text":"Use lean cuts of steak such as eye fillet, scotch, porterhouse, or rump."},{"text":"Don''t have skewers? Just pop the skewer ingredients in the air-fryer for 10-15 minutes at 200\u00b0C fan-forced / 390\u00b0F for a tasty warm salad bowl."}]'::jsonb,
  572, 38, 9, 41, 5,
  ARRAY['low-carb','dinner','high-protein','BBQ','gluten-free'],
  false, NULL, 0
);

-- Berry Breakfast Bowl
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Berry Breakfast Bowl',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  1,
  3,
  0,
  '[{"qty":"0.5","unit":"cup","name":"mixed berries (fresh or frozen)"},{"qty":"0.33","unit":"cup","name":"coconut yoghurt"},{"qty":"8","unit":"piece","name":"almonds"},{"qty":"18","unit":"g","name":"vanilla protein powder"},{"qty":"1","unit":"tbsp","name":"chia seeds"},{"qty":"0.25","unit":"tsp","name":"cinnamon (optional)"}]'::jsonb,
  '[{"step":1,"text":"If using frozen berries, place them in a microwave-safe bowl and heat until just thawed."},{"step":2,"text":"Add all ingredients to a bowl and mix well. Add a dash of water if needed to bring the mixture together."}]'::jsonb,
  '[{"text":"Plain raspberries or blueberries are also great instead of mixed berries if preferred."},{"text":"Coconut yoghurt can be swapped to Greek yoghurt if tolerated."},{"text":"If you''re nut free, swap almonds for 1 tbsp raw pumpkin seeds."},{"text":"This makes a great, substantial snack too! Always keep these ingredients stocked in your pantry for a quick and easy meal."}]'::jsonb,
  347, 17, 11, 22, 11,
  ARRAY['low-carb','breakfast','quick','vegetarian','gluten-free','dairy-free'],
  false, NULL, 0
);

-- Spiced Snapper with Crispy Salt & Pepper Cauliflower
INSERT INTO recipes (
  title, source_url, source_type, servings,
  prep_time_mins, cook_time_mins,
  ingredients, method_steps, tips,
  calories, protein_g, carbs_g, fat_g, fibre_g,
  tags, is_favourite, rating, times_cooked
) VALUES (
  'Spiced Snapper with Crispy Salt & Pepper Cauliflower',
  'Health with Bec - 7 Day Meal Plan 70 (December 2025)',
  'manual',
  1,
  15,
  20,
  '[{"qty":"125","unit":"g","name":"snapper fillets, skinless"},{"qty":"0.5","unit":"tbsp","name":"lime juice"},{"qty":"0.5","unit":"tsp","name":"olive oil"},{"qty":"0.5","unit":"tsp","name":"ground cumin"},{"qty":"0.25","unit":"tsp","name":"smoked paprika"},{"qty":"0.25","unit":"tsp","name":"garlic powder"},{"qty":"1","unit":"pinch","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"1","unit":"piece","name":"egg"},{"qty":"0.5","unit":"tbsp","name":"almond milk, unsweetened"},{"qty":"15","unit":"g","name":"almond meal"},{"qty":"30","unit":"g","name":"Parmesan cheese, grated"},{"qty":"0.25","unit":"tsp","name":"garlic powder"},{"qty":"0.5","unit":"tsp","name":"salt"},{"qty":"1","unit":"pinch","name":"pepper"},{"qty":"0.25","unit":"piece","name":"medium cauliflower"},{"qty":"1.5","unit":"tbsp","name":"arrowroot flour"},{"qty":"1","unit":"handful","name":"fresh coriander, to serve"},{"qty":"1","unit":"piece","name":"lime wedges, to serve"}]'::jsonb,
  '[{"step":1,"text":"Lightly grease or line two air-fryer trays and set aside."},{"step":2,"text":"Place the snapper in a shallow dish. Pour over the lime juice, oil, cumin, smoked paprika, garlic powder, salt, and pepper. Rub all over to coat both sides. Cover and refrigerate while preparing the cauliflower."},{"step":3,"text":"Crack the egg into a bowl, add the almond milk, and whisk to combine. Pour into a shallow dish."},{"step":4,"text":"In a separate bowl, combine the almond meal, Parmesan, garlic powder, salt, and a generous season of pepper. Mix well and tip onto a plate."},{"step":5,"text":"Chop the cauliflower into small florets. Add to a large bowl with the arrowroot flour and toss until evenly coated."},{"step":6,"text":"Set up the bowls in an assembly line: first the cauliflower, then the egg mixture, then the almond meal mixture, and finally the prepared trays."},{"step":7,"text":"Take a piece of coated cauliflower and shake off any excess arrowroot powder. Dip into the egg, then the almond meal mixture, shaking off any excess, and place on the prepared trays in a single layer. Repeat with remaining cauliflower."},{"step":8,"text":"Cook in the air fryer at 180\u00b0C fan-forced / 360\u00b0F for 15 minutes, then turn over and cook for an additional 10 minutes until golden brown and crisp."},{"step":9,"text":"Five minutes before the cauliflower is done, heat a large non-stick frying pan over medium-high heat. Add the snapper and cook for 2-3 minutes each side, until browned and cooked through."},{"step":10,"text":"Serve hot, with the crispy cauliflower, lime wedges, and fresh coriander to garnish."}]'::jsonb,
  '[{"text":"You can buy frozen snapper fillets in 125g portions from supermarkets."},{"text":"You can also bake the cauliflower in the oven at 180\u00b0C fan-forced / 200\u00b0C conventional, for the same amount of time or up to 10 minutes longer, until crisp."},{"text":"To make the cauliflower crumbing process easy, use one hand for the coating in the egg, and one hand for coating in the dry mixture."}]'::jsonb,
  504, 46, 20, 23, 9,
  ARRAY['low-carb','dinner','high-protein','fish','gluten-free'],
  false, NULL, 0
);
