-- 0011_variant_overrides.sql: let a recipe variant override time and servings
-- (it already has ingredients, instructions, and nutrition jsonb). Additive
-- columns on the existing recipe_variants table; grants/RLS from 0001/0003 apply.
alter table public.recipe_variants add column if not exists time_minutes int;
alter table public.recipe_variants add column if not exists servings int;
