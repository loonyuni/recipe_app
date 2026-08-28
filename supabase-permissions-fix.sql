-- Run this after the schema and onboarding migration.
-- SQL-created tables need explicit Data API grants in some Supabase projects.
--
-- Privileges are granted only to `authenticated`. Row Level Security still
-- governs which rows each user may touch, but the `anon` role is never given
-- table-level DML — an unauthenticated visitor should not be able to write to
-- any table, and withholding the grant is defense-in-depth in case a policy is
-- ever misconfigured. If you previously ran a version that granted privileges
-- to `anon`, the revoke statements below undo it.

grant usage on schema public to authenticated;
grant usage on schema public to anon;

revoke all privileges on all tables in schema public from anon;

grant select, insert, update, delete
on public.households,
   public.household_members,
   public.recipes,
   public.tags,
   public.recipe_tags,
   public.recipe_variants,
   public.ratings
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
grant all on tables to authenticated;

alter default privileges in schema public
grant all on sequences to authenticated;

grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.create_household(text, text) to authenticated;
