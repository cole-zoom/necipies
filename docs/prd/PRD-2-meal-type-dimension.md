# PRD 2 — Meal-type as a real filter dimension

**Finding:** 3 (RQ1.3) — discovery is the strongest flow; expand it.
**Status:** Not started
**Stacks on:** PRD 1 (adds one field into the wizard's step 4 + review).

## Problem
Discover's "Popular" chips (`Pasta`, `Chicken`, …) are just canned search
strings — there is no structured way to browse by meal occasion
(breakfast/lunch/dinner/snack/dessert). The schema has no `meal_type`; the
`tags text[]` column exists but is unused and unstructured.

## Goal
Add a first-class `meal_type` dimension end-to-end: data model → creation →
extraction → discovery filter.

## Data model
Add to `supabase/schema.sql` (idempotent):
```sql
alter table public.recipes
  add column if not exists meal_type text
  check (meal_type in ('breakfast','lunch','dinner','snack','dessert'));
create index if not exists recipes_meal_type_idx on public.recipes (meal_type);
```
- Nullable (existing rows stay valid; "any" when unset).
- A separate `docs/prd/PRD-2-backfill.sql` best-effort backfills seed rows from
  cuisine/title keywords so the filter isn't empty on day one.

## Types
- `src/types/recipe.ts`: add `export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';`
  and `meal_type: MealType | null;` to `Recipe`; add optional `meal_type?: MealType`
  to `ExtractedRecipe`.

## Creation (wizard step 4)
- Add a `meal_type` `Select` (with an explicit "Any / unspecified" → null option)
  next to Cuisine in the wizard's Details step from PRD 1.
- Include it in the review summary and in the insert `payload`.

## Extraction
- `api/extract-recipe.ts` + `src/lib/gemini.ts`: extend the prompt/schema so
  Gemini returns `meal_type` when inferable; map into `fillFromExtracted`.

## Discovery filter
- `useRecipes` (`src/hooks/useRecipes.ts`): add `mealType?: MealType` arg →
  `if (mealType) q = q.eq('meal_type', mealType)`.
- `Discover.tsx`: add a meal-type segmented control / `Select` beside the sort
  control, synced to a `meal` URL param (like `sort`). Replace the fake POPULAR
  keyword chips with the five real meal types (keep chips styling).
- `trackEvent("filter_meal_type", { value })`.

## Acceptance criteria
1. Creating a recipe can set a meal type; it round-trips to the detail page.
2. Discover shows a meal-type filter that narrows the grid and is URL-shareable
   (`/discover?meal=dinner`).
3. Photo extract populates meal type when the image implies one.
4. Existing recipes with null meal_type still appear under "Any".
5. Schema change is idempotent and safe to re-run; build passes.

## Rollback
Column is additive/nullable — leaving it in place is harmless. UI revert removes
the filter and the wizard select.
