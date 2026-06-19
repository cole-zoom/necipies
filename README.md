# Necepies — Notion for Recipes

A calm, Notion-style notebook for home-cooked recipes. Snap a photo, get a parsed recipe, share with a link.

Built with **React + Vite + TypeScript**, **Tailwind + shadcn-style UI**, **Supabase** (Postgres + Auth), and **Gemini** (via a Vercel Edge Function so the API key stays server-side).

---

## 1. Local setup

```bash
npm install
cp .env.example .env
# fill in the values (see below)
npm run dev          # vite at http://localhost:5173
```

> The `/api/extract-recipe` Edge Function won't run under plain `vite dev`.
> To test photo extraction locally, install the Vercel CLI and run
> `vercel dev` instead (or just deploy and test there).

---

## 2. `.env` — what goes where

| Variable | Where you put it | Used by | Notes |
|----------|------------------|---------|-------|
| `VITE_SUPABASE_URL` | `.env` (local) **and** Vercel → Project → Settings → Environment Variables | Browser | Safe to ship publicly. |
| `VITE_SUPABASE_ANON_KEY` | same | Browser | The Supabase anon/public key — safe to ship; RLS protects the table. |
| `GEMINI_API_KEY` | `.env` (local) **and** Vercel env vars — **no `VITE_` prefix** | Vercel Edge Function only | Never exposed to the browser. |
| `VITE_GA_MEASUREMENT_ID` | same | Browser | Format `G-XXXXXXXXXX`. Omit to disable GA. |
| `VITE_CLARITY_PROJECT_ID` | same | Browser | Optional. Omit to disable Clarity. |

> Anything that should reach the browser **must** be prefixed `VITE_`.
> `GEMINI_API_KEY` deliberately is **not**, so Vite refuses to inline it.

---

## 3. Supabase setup

1. Create a project at https://supabase.com.
2. SQL editor → paste the contents of `supabase/schema.sql` → Run. This creates the `recipes` table, RLS policies, indexes, and seeds 6 starter recipes.
3. Auth → Providers → Email → enable "Email" with **Magic Link**.
4. Copy `Project URL` → `VITE_SUPABASE_URL` and `anon public` key → `VITE_SUPABASE_ANON_KEY`.

---

## 4. Gemini setup

1. Get a key at https://aistudio.google.com/apikey.
2. Add it as `GEMINI_API_KEY` (no `VITE_`) to both local `.env` and Vercel.

The model used is `gemini-1.5-flash` with a structured-output schema — see `api/extract-recipe.ts`.

---

## 5. Deploy to Vercel

```bash
# either push the repo and import it in the Vercel dashboard, or:
npx vercel
```

After the first deploy, head to **Project → Settings → Environment Variables** and paste in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `VITE_GA_MEASUREMENT_ID` *(optional)*
- `VITE_CLARITY_PROJECT_ID` *(optional)*

Then redeploy (Vercel triggers this automatically when env vars change in some plans, or just push a commit).

`vercel.json` already wires up the SPA rewrite and a 30 s budget for the Gemini function — no edits needed unless you add more functions.

---

## 6. Tech notes

- **Styling** — Notion-inspired warm cream palette (`#FCFBF8` background, terracotta `ember` accents) and Instrument Serif display + Inter body. Attio-style minimalism on cards and borders.
- **Mobile** — bottom tab bar (`MobileNav`), `viewport-fit=cover` with safe-area padding, photo capture button uses `capture="environment"` to open the rear camera.
- **Search** — full-text-ish via Postgres `ilike` over title/description/cuisine/ingredients. Trigram GIN indexes are created by `schema.sql` for speed.
- **Privacy disclaimer** — visible by default at the top of every page until explicitly dismissed. The full notice lives at `/about`. No dark patterns: dismissing doesn't grant consent to anything you weren't already told.
- **Sharing** — every recipe is public and gets `/r/<slug>`. The Share button uses the Web Share API on mobile and falls back to clipboard.

---

## 7. Scripts

| Command | What it does |
|--------|------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript check + production bundle |
| `npm run preview` | Preview the built bundle locally |
| `npm run typecheck` | Type-check only |
