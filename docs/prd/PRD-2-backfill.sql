-- =====================================================================
-- PRD 2 — best-effort meal_type backfill for existing seed recipes.
-- Run once in the Supabase SQL editor AFTER applying schema.sql.
-- Idempotent: only fills rows where meal_type is still null, so re-running
-- won't clobber values a human set later. Keyword heuristics only —
-- review/adjust by hand where it guesses wrong.
-- =====================================================================

-- Dessert: sweets, baked goods, anything obviously a treat.
update public.recipes set meal_type = 'dessert'
where meal_type is null and (
  title ~* '(cake|pie|cookie|brownie|dessert|tart|pudding|ice cream|cheesecake|muffin|cupcake|donut|doughnut|chocolate|sweet)'
);

-- Breakfast: morning staples.
update public.recipes set meal_type = 'breakfast'
where meal_type is null and (
  title ~* '(pancake|waffle|omelet|omelette|scrambled|french toast|granola|oatmeal|porridge|breakfast|bagel|frittata|smoothie)'
);

-- Snack: small bites, dips, sides.
update public.recipes set meal_type = 'snack'
where meal_type is null and (
  title ~* '(snack|dip|chips|popcorn|trail mix|energy ball|cracker|hummus|guacamole|bar)'
);

-- Dinner: hearty mains — the common default for savory dishes.
update public.recipes set meal_type = 'dinner'
where meal_type is null and (
  title ~* '(steak|roast|curry|stew|pasta|lasagna|risotto|casserole|dinner|chicken|beef|pork|salmon|stir[- ]?fry|tacos|burger)'
);

-- Lunch: lighter savory dishes.
update public.recipes set meal_type = 'lunch'
where meal_type is null and (
  title ~* '(salad|sandwich|soup|wrap|quesadilla|lunch|bowl|toast)'
);

-- Anything still null stays "any" — that's fine, it shows under all filters
-- being cleared and never blocks the grid.
