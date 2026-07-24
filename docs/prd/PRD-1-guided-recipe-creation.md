# PRD 1 — Guided (step-by-step) recipe creation

**Finding:** 2 (RQ1.2) — recipe creation had the lowest satisfaction and the most session time.
**Status:** Not started
**Stacks on:** nothing (foundation). PRD 2 adds a field into the wizard built here.

## Problem
`RecipeForm.tsx` is a single long scroll of ~15 fields. Required fields (title,
ingredients, steps) are indistinguishable from optional ones, and the only
feedback that something is required arrives as an error toast *after* the user
hits Save. First-time creators can't tell where the finish line is.

## Goal
Turn creation into a progressive, gated, step-by-step flow that (a) makes the
required minimum obvious, (b) keeps photo-to-recipe as the fastest path, and
(c) never loses data when stepping back and forth.

## Non-goals
- No new backend fields (PRD 2 owns `meal_type`).
- No draft persistence to the server (local state only for this PRD).
- No change to the auth gate in `NewRecipe.tsx`.

## UX / flow
Convert `RecipeForm` into a 5-step wizard driven by a local `step` state.

| Step | Name | Fields | Required to advance |
|------|------|--------|---------------------|
| 0 | Start fast | `PhotoExtract` panel + "Start from scratch" link | none (skippable) |
| 1 | The dish | `title*`, `description`, `image_url` | `title` non-empty |
| 2 | Ingredients | ingredient list | ≥1 non-empty ingredient |
| 3 | Steps | steps list | ≥1 non-empty step |
| 4 | Details (optional) | `cuisine`, `servings`, `prep`, `cook`, `difficulty`, `health_level` | none |
| 5 | Review & publish | read-only summary + Save | — |

- Photo extract on step 0 fills fields across steps 1–4, then auto-advances to
  step 1 so the user reviews what was parsed. Extract remains reachable from a
  small "re-scan" affordance on step 1.
- Required fields render a `*` and a `required` helper. Inline error appears
  under the field the moment the user tries to advance, not only on Save.
- Smart defaults preserved: `difficulty=easy`, `health_level=balanced`.
- `author_name` fallback to `user.email` prefix is unchanged.

## Components
- **New:** `src/components/recipes/WizardProgress.tsx` — numbered step rail
  (1–5), current step highlighted, completed steps get a check. Clickable to
  jump *backward* only.
- **New:** `src/components/recipes/wizard.ts` — step metadata + a
  `validateStep(step, form)` helper returning `{ ok, errors }`.
- **Refactor:** `RecipeForm.tsx` — hold `step`, render only the active step's
  section, footer becomes Back / Next (Next disabled or shows inline errors
  until `validateStep` passes) with Save only on the final step.
- **Reuse:** existing `ui/*` primitives; no new dependencies.

## State & validation
- Single `FormState` object stays intact (already all-in-one) so back/forward
  never drops data — only the *rendered* slice changes.
- `validateStep`:
  - step 1 → `title.trim()` non-empty
  - step 2 → `ingredients.some(x => x.trim())`
  - step 3 → `steps.some(x => x.trim())`
  - others → always ok
- Final `handleSubmit` keeps its existing cleaning + insert logic verbatim.

## Analytics
- `trackEvent("create_step_view", { step })` on each step entry.
- `trackEvent("create_step_blocked", { step })` when Next is blocked.
- Keep existing `recipe_created` and extract events.

## Accessibility
- Progress rail is an `<ol>` with `aria-current="step"`.
- Focus moves to the step heading on step change.
- Next/Back are real buttons; Enter on a field advances only from valid steps.
- Respect adjacent-button-size rule: Back/Next share one size variant.

## Acceptance criteria
1. A new user can publish a recipe entering only title, one ingredient, one step.
2. Attempting to skip a required step shows an inline error and does not advance.
3. Photo extract fills fields and lands the user on step 1 with data intact.
4. Stepping backward then forward preserves every entered value.
5. Save only appears on the review step and behaves exactly as today.
6. No TypeScript or lint errors; `npm run build` passes.

## Rollback
Single-commit refactor of `RecipeForm.tsx` + two new files. Revert restores the
flat form.
