-- Multi-section recipes: add a `sections` column to recipes.
-- Each element is { title, ingredients: [], instructions: [] } for one
-- component of a multi-part recipe (e.g. a flan's pie pastry, flan custard, and
-- finishing). Empty for single-component recipes, which keep using the flat
-- ingredients/instructions columns. Apply via the Supabase SQL editor / mgmt API.
alter table public.recipes
  add column if not exists sections jsonb not null default '[]'::jsonb;
