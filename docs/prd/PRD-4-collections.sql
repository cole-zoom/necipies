-- =====================================================================
-- PRD 4 — assign existing seed recipes to curated collections.
-- Run once in the Supabase SQL editor. Reuses the existing recipes.tags
-- (text[]) column — no schema change needed.
-- Idempotent: each statement only appends a tag if it isn't already present,
-- so it's safe to re-run. Keyword heuristics only — adjust by hand as you like.
-- Collection tags mirror src/lib/collections.ts:
--   weeknight-dinners → 'weeknight'
--   comfort-food      → 'comfort'
--   crowd-pleasers    → 'crowd-pleaser'
--   fresh-and-light   → 'fresh'
-- =====================================================================

-- Weeknight dinners: quick, low-fuss mains.
update public.recipes
set tags = array_append(coalesce(tags, '{}'), 'weeknight')
where is_seed = true
  and not ('weeknight' = any(coalesce(tags, '{}')))
  and (
    title ~* '(pasta|stir[- ]?fry|tacos|skillet|sheet[- ]?pan|quick|weeknight|noodle|fried rice)'
    or (meal_type = 'dinner' and coalesce(prep_time_minutes, 0) + coalesce(cook_time_minutes, 0) <= 40)
  );

-- Comfort food: warm, hearty, indulgent.
update public.recipes
set tags = array_append(coalesce(tags, '{}'), 'comfort')
where is_seed = true
  and not ('comfort' = any(coalesce(tags, '{}')))
  and (
    title ~* '(mac|cheese|stew|roast|casserole|pot pie|meatloaf|lasagna|dumpling|soup|chili|gratin|braise)'
    or health_level = 'indulgent'
  );

-- Crowd-pleasers: dishes that scale to a table.
update public.recipes
set tags = array_append(coalesce(tags, '{}'), 'crowd-pleaser')
where is_seed = true
  and not ('crowd-pleaser' = any(coalesce(tags, '{}')))
  and (
    title ~* '(pizza|lasagna|tacos|burger|wings|nachos|platter|board|bake|pie|cake|dip)'
    or coalesce(servings, 0) >= 6
  );

-- Fresh & light: bright, veg-forward.
update public.recipes
set tags = array_append(coalesce(tags, '{}'), 'fresh')
where is_seed = true
  and not ('fresh' = any(coalesce(tags, '{}')))
  and (
    title ~* '(salad|bowl|slaw|veg|greens|citrus|herb|grain bowl|wrap|poke|zucchini|cucumber)'
    or health_level = 'light'
  );

-- Check the result:
--   select unnest(tags) as tag, count(*) from public.recipes group by tag order by 2 desc;
