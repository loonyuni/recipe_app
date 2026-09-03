-- Kitchen Archive schema
-- Run this in Supabase Dashboard → SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('owner', 'editor', 'member')),
  created_at timestamptz not null default now(),
  unique (household_id, user_id),
  unique (household_id, display_name)
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text not null default '',
  servings integer check (servings is null or servings > 0),
  time_minutes integer check (time_minutes is null or time_minutes >= 0),
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  -- Multi-component recipes (e.g. flan = pie pastry + custard + finishing).
  -- Each element is { title, ingredients: [], instructions: [] }. Empty for
  -- single-component recipes, which use the flat ingredients/instructions above.
  sections jsonb not null default '[]'::jsonb,
  nutrition jsonb not null default '{}'::jsonb,
  source_label text,
  source_url text,
  source_text text,
  extraction_status text not null default 'manual'
    check (extraction_status in ('manual', 'draft', 'reviewed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

create table if not exists public.recipe_tags (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, tag_id)
);

create table if not exists public.recipe_variants (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  note text not null default '',
  ingredients jsonb,
  instructions jsonb,
  nutrition jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  variant_id uuid references public.recipe_variants(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  score numeric(2,1) not null check (score >= 0 and score <= 5),
  would_make_again boolean,
  comment text not null default '',
  occasion text,
  cooked_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists recipes_household_updated_idx
  on public.recipes (household_id, updated_at desc);
create index if not exists recipe_tags_tag_idx on public.recipe_tags (tag_id);
create index if not exists ratings_recipe_idx on public.ratings (recipe_id);

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household
      and user_id = auth.uid()
  );
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.recipes enable row level security;
alter table public.tags enable row level security;
alter table public.recipe_tags enable row level security;
alter table public.recipe_variants enable row level security;
alter table public.ratings enable row level security;

create policy "members can view their households"
  on public.households for select
  using (public.is_household_member(id));

create policy "members can view household members"
  on public.household_members for select
  using (public.is_household_member(household_id));

create policy "members can manage recipes"
  on public.recipes for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "members can manage tags"
  on public.tags for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "members can manage recipe tags"
  on public.recipe_tags for all
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and public.is_household_member(r.household_id)
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and public.is_household_member(r.household_id)
    )
  );

create policy "members can manage recipe variants"
  on public.recipe_variants for all
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and public.is_household_member(r.household_id)
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and public.is_household_member(r.household_id)
    )
  );

create policy "members can manage ratings"
  on public.ratings for all
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and public.is_household_member(r.household_id)
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and public.is_household_member(r.household_id)
    )
  );
