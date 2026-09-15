-- Open homepage + cook log + browsing signals.
-- Run after supabase-public-sharing.sql, via the Supabase Management API / SQL editor.
-- Additive and backward compatible with the current live frontend.

-- 1. Flags -------------------------------------------------------------------
alter table public.recipes
  add column if not exists is_hidden boolean not null default false;
alter table public.households
  add column if not exists public_library boolean not null default false;

-- 2. Slug auto-assignment (so imports / all recipes get a permalink) ---------
create or replace function public.slugify_title(t text)
returns text language sql immutable as $$
  select coalesce(
    nullif(trim(both '-' from regexp_replace(lower(t), '[^a-z0-9]+', '-', 'g')), ''),
    'recipe'
  );
$$;

create or replace function public.recipes_ensure_slug()
returns trigger language plpgsql as $$
declare
  base text;
  cand text;
  n int := 1;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;
  base := public.slugify_title(coalesce(new.title, 'recipe'));
  cand := base;
  while exists (select 1 from public.recipes where slug = cand and id <> new.id) loop
    n := n + 1;
    cand := base || '-' || n;
  end loop;
  new.slug := cand;
  return new;
end;
$$;

drop trigger if exists recipes_set_slug on public.recipes;
create trigger recipes_set_slug
  before insert or update of title on public.recipes
  for each row execute function public.recipes_ensure_slug();

-- Backfill slugs for existing rows (loop so uniqueness sees prior assignments).
do $$
declare
  rec record;
  base text;
  cand text;
  n int;
begin
  for rec in select id, title from public.recipes where slug is null loop
    base := public.slugify_title(coalesce(rec.title, 'recipe'));
    cand := base;
    n := 1;
    while exists (select 1 from public.recipes where slug = cand) loop
      n := n + 1;
      cand := base || '-' || n;
    end loop;
    update public.recipes set slug = cand where id = rec.id;
  end loop;
end $$;

-- 3. Cook log ----------------------------------------------------------------
create table if not exists public.cook_log (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  cooked_by uuid references auth.users(id) on delete set null,
  cooked_at timestamptz not null default now(),
  note text not null default ''
);
create index if not exists cook_log_recipe_idx on public.cook_log (recipe_id, cooked_at desc);

alter table public.cook_log enable row level security;

drop policy if exists "members manage cook_log" on public.cook_log;
create policy "members manage cook_log" on public.cook_log for all
  using (
    exists (select 1 from public.recipes r
            where r.id = recipe_id and public.is_household_member(r.household_id))
  )
  with check (
    exists (select 1 from public.recipes r
            where r.id = recipe_id and public.is_household_member(r.household_id))
  );

grant select, insert, update, delete on public.cook_log to authenticated;

-- 4. Public read view: whole non-hidden library + cook aggregates ------------
-- Visibility: NOT hidden AND (household is public OR recipe explicitly shared).
-- Definer view (default), so anon reads only this, never the base tables.
create or replace view public.public_recipes as
  select
    r.id, r.slug, r.title, r.description, r.servings, r.time_minutes,
    r.ingredients, r.instructions, r.sections, r.nutrition,
    r.source_label, r.source_url, r.image_url, r.image_urls,
    r.measurement_mode, r.created_at, r.updated_at,
    coalesce(
      (select array_agg(t.name order by t.name)
       from public.recipe_tags rt join public.tags t on t.id = rt.tag_id
       where rt.recipe_id = r.id),
      '{}'::text[]
    ) as tags,
    (select count(*) from public.cook_log cl where cl.recipe_id = r.id) as cook_count,
    (select max(cl.cooked_at) from public.cook_log cl where cl.recipe_id = r.id) as last_cooked_at
  from public.recipes r
  join public.households h on h.id = r.household_id
  where not r.is_hidden and (h.public_library or r.is_public);

grant select on public.public_recipes to anon, authenticated;

-- 5. RPCs --------------------------------------------------------------------
create or replace function public.log_cook(target_recipe uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare cnt integer;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in';
  end if;
  if not exists (select 1 from public.recipes r
                 where r.id = target_recipe and public.is_household_member(r.household_id)) then
    raise exception 'Recipe not found or access denied';
  end if;
  insert into public.cook_log (recipe_id, cooked_by) values (target_recipe, auth.uid());
  select count(*) into cnt from public.cook_log where recipe_id = target_recipe;
  return cnt;
end;
$$;
grant execute on function public.log_cook(uuid) to authenticated;

create or replace function public.set_public_library(enabled boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in';
  end if;
  select household_id into hid from public.household_members where user_id = auth.uid() limit 1;
  if hid is null then
    raise exception 'No household';
  end if;
  update public.households set public_library = enabled where id = hid;
  return enabled;
end;
$$;
grant execute on function public.set_public_library(boolean) to authenticated;

-- 6. Turn on the open homepage for the owner's household ---------------------
update public.households
  set public_library = true
  where id = 'baf66ac8-8c7f-4447-9be9-40fc1dd61dc0';
