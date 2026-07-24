# PRD 3 — First-visit orientation prompt

**Finding:** 1 (RQ1.1) — first-time hesitation about where to start.
**Status:** Not started
**Stacks on:** independent, but references the two entry points (create /
discover) that PRD 1 and PRD 2 improve.

## Problem
A first-time visitor lands on Home with no explicit "start here." The existing
`IntroScroll` `scroll ↓` hint and the global nav already handle *movement*, but
nothing frames the two things to *do*: snap a recipe, or browse the pantry.

## Goal
A single, lightweight, dismissable first-visit prompt that names the two entry
points — shown once, never nagging.

## Non-goals
- No multi-step coach-marks / spotlight tour (explicitly rejected as annoying).
- No account-level storage; `localStorage` is sufficient.

## UX
- After the intro settles (or immediately if reduced-motion), show a compact
  card/banner anchored bottom-center (above `MobileNav` on mobile):
  > **New here?** Snap a photo to turn any recipe into a card, or browse the
  > pantry to explore. — buttons: **Add a recipe** · **Browse** · dismiss (×)
- Appears once. Dismiss, or clicking either CTA, sets
  `localStorage["necipies.onboarded"] = "1"` and it never returns.
- Slides in with a gentle transition; respects `prefers-reduced-motion`.

## Components
- **New:** `src/components/onboarding/FirstVisitPrompt.tsx` — self-contained,
  reads/writes localStorage, renders null when onboarded or dismissed.
- Mount in `Home.tsx` (not global) so it only greets people on the landing page.

## Analytics
- `trackEvent("onboarding_shown")` on first render.
- `trackEvent("onboarding_cta", { target: "new" | "discover" })`.
- `trackEvent("onboarding_dismissed")`.

## Accessibility
- `role="dialog"` + `aria-label`, focusable dismiss button, `Esc` dismisses.
- Not a focus trap (non-blocking); does not steal focus on mount.

## Acceptance criteria
1. First-ever visit shows the prompt once the page is interactive.
2. Dismiss or either CTA permanently hides it (survives reload).
3. Returning visitors never see it.
4. Reduced-motion users get it without animation.
5. Does not overlap or block the mobile bottom nav; build passes.

## Rollback
Delete the component + its mount line in `Home.tsx`. No data or schema impact.
