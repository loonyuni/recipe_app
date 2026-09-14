-- Public recipe sharing + permalinks.
-- Run this after the schema and permissions-fix migrations, via the Supabase
-- SQL editor / management API.
--
-- Design: recipes stay private by default. An owner opts a single recipe in
-- with the `publish_recipe` RPC, which flips `is_public` and mints a globally
-- unique `slug`. Anonymous visitors never touch the base tables — they read a
-- security-definer view (`public_recipes`) that returns only public rows and a
-- safe subset of columns (no household_id, created_by, source_text, ratings, or
-- variants). This keeps the existing household RLS untouched and never grants
-- `anon` any access to `public.recipes` itself.

-- 1. Columns -----------------------------------------------------------------
alter table public.recipes
  add column if not exists is_public boolean not null default false;
alter table public.recipes
  add column if not exists slug text;

-- Global slug uniqueness (permalinks have no household context for anon
-- viewers). Partial index so the many NULL slugs on unshared recipes don't
-- collide.
create unique index if not exists recipes_slug_key
  on public.recipes (slug)
  where slug is not null;

create index if not exists recipes_public_idx
  on public.recipes (is_public)
  where is_public;

-- 2. Public read view --------------------------------------------------------
-- security_invoker is left at the default (false), so the view runs with its
-- owner's privileges and bypasses the base-table RLS. Its own WHERE clause is
-- the row filter (only is_public rows), and the column list is the exposure
-- boundary. `anon` gets SELECT on this view only — never on public.recipes.
create or replace view public.public_recipes as
  select
    r.id,
    r.slug,
    r.title,
    r.description,
    r.servings,
    r.time_minutes,
    r.ingredients,
    r.instructions,
    r.sections,
    r.nutrition,
    r.source_label,
    r.source_url,
    r.image_url,
    r.image_urls,
    r.measurement_mode,
    r.created_at,
    r.updated_at,
    coalesce(
      (
        select array_agg(t.name order by t.name)
        from public.recipe_tags rt
        join public.tags t on t.id = rt.tag_id
        where rt.recipe_id = r.id
      ),
      '{}'::text[]
    ) as tags
  from public.recipes r
  where r.is_public = true;

grant select on public.public_recipes to anon, authenticated;

-- 3. Publish / unpublish RPC -------------------------------------------------
-- Runs as definer so the anon key can't be used to write directly. Caller must
-- be signed in and a member of the recipe's household. On publish it mints a
-- unique slug from the title on first share and reuses it thereafter, so a
-- recipe's permalink is stable across unshare/reshare cycles.
create or replace function public.publish_recipe(
  target_recipe uuid,
  make_public boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  rec_title text;
  existing_slug text;
  base_slug text;
  candidate text;
  suffix int := 1;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in';
  end if;

  select title, slug into rec_title, existing_slug
  from public.recipes r
  where r.id = target_recipe
    and public.is_household_member(r.household_id);

  if not found then
    raise exception 'Recipe not found or access denied';
  end if;

  if not make_public then
    update public.recipes
      set is_public = false, updated_at = now()
      where id = target_recipe;
    return existing_slug;
  end if;

  if existing_slug is not null then
    update public.recipes
      set is_public = true, updated_at = now()
      where id = target_recipe;
    return existing_slug;
  end if;

  base_slug := trim(both '-' from regexp_replace(lower(coalesce(rec_title, 'recipe')), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'recipe';
  end if;

  candidate := base_slug;
  while exists (select 1 from public.recipes where slug = candidate and id <> target_recipe) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;

  update public.recipes
    set slug = candidate, is_public = true, updated_at = now()
    where id = target_recipe;

  return candidate;
end;
$$;

grant execute on function public.publish_recipe(uuid, boolean) to authenticated;
