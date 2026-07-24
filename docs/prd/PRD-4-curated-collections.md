# PRD 4 — Curated collections (honest "Popular" gallery)

**Finding:** 3 & 4 (RQ1.3, RQ1.5) — expand discovery/sharing.
**Status:** Not started
**Stacks on:** PRD 2 (reuses the Discover filter surface + tags plumbing).

## Problem
The report asked for a "Popular Recipes gallery" and personalized
recommendations. **There is no popularity signal** (no views, no likes) and no
user-history model — a real "popular" list would be fabricated, and personalized
recs are out of scope for this app's scale. Rather than fake it, ship an honest
equivalent: hand-curated **collections** built on the existing unused
`tags text[]` column.

## Goal
Let discovery surface a few editorially curated collections (e.g. "Weeknight
dinners", "Comfort food", "Crowd-pleasers") that group real recipes, giving the
repeat-visit hook the finding wanted — without inventing metrics.

## Data model
- Reuse the existing `tags text[]` column (no schema change).
- A curated `docs/prd/PRD-4-collections.sql` tags seed recipes with collection
  slugs (best-effort, idempotent `update ... where slug in (...)`).
- Define collections in code, not the DB, so they're easy to edit/review:
  `src/lib/collections.ts` → `[{ slug, title, blurb, tag }]`.

## UX
- **Home:** a "Collections" row above/below "Fresh from the pantry" — horizontal
  cards, each linking to `/discover?collection=<slug>`.
- **Discover:** read a `collection` URL param → filter grid to recipes whose
  `tags` contains the collection's tag (`q.contains('tags', [tag])`), and show a
  removable "Collection: <title>" pill. Composes with the PRD 2 meal-type filter.
- `useRecipes`: add `tag?: string` arg → `if (tag) q = q.contains('tags', [tag])`.

## Analytics
- `trackEvent("collection_open", { slug })`.

## Acceptance criteria
1. Home shows curated collections that link into a filtered Discover view.
2. `/discover?collection=weeknight-dinners` shows only that collection and a
   clearable pill; combines correctly with `?meal=` from PRD 2.
3. Collections are defined in one editable file; no fabricated "popularity."
4. Empty/undefined tags never crash the grid; build passes.

## Explicitly dropped from the original report
- **Personalized recommendations** — no user-history model; out of scope.
- **Auto "Popular" ranking** — no popularity signal exists; would be fake.

## Rollback
Remove the collections row + `collection` param handling and delete
`collections.ts`. Tags on rows are inert if unused.
