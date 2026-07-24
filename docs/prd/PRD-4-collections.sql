-- =====================================================================
-- PRD 4 — cleanup of the earlier synthetic collection tags.
--
-- Collections now map to the REAL category tags already present on
-- recipes.tags (Desserts, Salad, Drinks, …), so NO backfill is needed.
--
-- This script only *removes* the four synthetic tags an earlier draft
-- appended (weeknight / comfort / crowd-pleaser / fresh) so they don't
-- linger as orphaned junk. Optional and idempotent — skip it if you don't
-- mind the extra tags sitting on some rows.
-- Run once in the Supabase SQL editor.
-- =====================================================================

update public.recipes
set tags = (
  select array_agg(t)
  from unnest(tags) as t
  where t not in ('weeknight', 'comfort', 'crowd-pleaser', 'fresh')
)
where tags && array['weeknight', 'comfort', 'crowd-pleaser', 'fresh'];

-- Note: a row whose ONLY tags were the synthetic four becomes tags = NULL
-- (array_agg over zero rows returns NULL). That's fine — a null tags column
-- is valid and simply means "in no collection."

-- Verify the synthetic tags are gone and the real ones remain:
--   select unnest(tags) as tag, count(*) from public.recipes group by tag order by 2 desc;
