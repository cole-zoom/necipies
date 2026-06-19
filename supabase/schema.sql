-- =====================================================================
-- Necepies — Supabase schema
-- Run this once in the Supabase SQL editor for your project.
-- Idempotent: safe to re-run.
-- =====================================================================

-- Extensions must come first — pg_trgm provides gin_trgm_ops used by the
-- indexes below; pgcrypto provides gen_random_uuid() for the primary key.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.recipes (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  description      text,
  cuisine          text,
  difficulty       text not null default 'easy' check (difficulty in ('easy','medium','hard')),
  health_level     text not null default 'balanced' check (health_level in ('light','balanced','indulgent')),
  prep_time_minutes int,
  cook_time_minutes int,
  servings         int,
  yield_label      text,
  ingredients      jsonb not null default '[]'::jsonb,
  ingredients_text text,
  steps            jsonb not null default '[]'::jsonb,
  tags             text[],
  image_url        text,
  source_url       text,
  author_name      text,
  author_id        uuid references auth.users(id) on delete set null,
  is_seed          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);
create index if not exists recipes_author_idx     on public.recipes (author_id);
create index if not exists recipes_title_trgm     on public.recipes using gin (title gin_trgm_ops);
create index if not exists recipes_ingredients_trgm on public.recipes using gin (ingredients_text gin_trgm_ops);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute procedure public.set_updated_at();

-- =====================================================================
-- Row-Level Security
-- All recipes are public; authenticated users can write their own.
-- =====================================================================

alter table public.recipes enable row level security;

drop policy if exists "Recipes are publicly readable" on public.recipes;
create policy "Recipes are publicly readable"
  on public.recipes for select
  using (true);

drop policy if exists "Authenticated users can insert their own recipes" on public.recipes;
create policy "Authenticated users can insert their own recipes"
  on public.recipes for insert
  with check (
    -- Either the author_id matches the caller, or it's a no-author guest insert
    auth.uid() = author_id or author_id is null
  );

drop policy if exists "Authors can update their own recipes" on public.recipes;
create policy "Authors can update their own recipes"
  on public.recipes for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Authors can delete their own recipes" on public.recipes;
create policy "Authors can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = author_id);
