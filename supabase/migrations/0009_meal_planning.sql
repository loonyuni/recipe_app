-- 0009_meal_planning.sql: meal plan + grocery list + pantry staples.
create table if not exists public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  day smallint,
  sort_order int not null default 0,
  made boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  item_key text not null,
  display text not null,
  status text not null default 'need',
  manual boolean not null default false,
  source jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, item_key)
);

create table if not exists public.pantry_staples (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

alter table public.planned_meals enable row level security;
alter table public.grocery_items enable row level security;
alter table public.pantry_staples enable row level security;

create policy "members manage planned_meals"
  on public.planned_meals for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "members manage grocery_items"
  on public.grocery_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "members manage pantry_staples"
  on public.pantry_staples for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create index if not exists planned_meals_household_idx on public.planned_meals (household_id);
create index if not exists grocery_items_household_idx on public.grocery_items (household_id);
create index if not exists pantry_staples_household_idx on public.pantry_staples (household_id);
