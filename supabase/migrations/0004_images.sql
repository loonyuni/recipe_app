-- Run once after the existing schema.
alter table public.recipes
  add column if not exists image_url text;

alter table public.recipes
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

alter table public.recipes
  add column if not exists measurement_mode text not null default 'both';
