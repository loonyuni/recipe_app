-- Run this after the schema and onboarding migration.
-- SQL-created tables need explicit Data API grants in some Supabase projects.

grant usage on schema public to authenticated;
grant usage on schema public to anon;

grant all privileges on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to anon;

grant select, insert, update, delete
on public.households,
   public.household_members,
   public.recipes,
   public.tags,
   public.recipe_tags,
   public.recipe_variants,
   public.ratings
to authenticated;

grant select, insert, update, delete
on public.households,
   public.household_members,
   public.recipes,
   public.tags,
   public.recipe_tags,
   public.recipe_variants,
   public.ratings
to anon;

grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
grant all on tables to authenticated;

alter default privileges in schema public
grant all on sequences to authenticated;

grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.create_household(text, text) to authenticated;
