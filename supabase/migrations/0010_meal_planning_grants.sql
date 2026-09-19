-- 0010_meal_planning_grants.sql: grant table privileges to the authenticated
-- role for the meal-planning tables. 0009 created them via raw SQL as postgres,
-- which on this hardened schema does not auto-grant to authenticated, so the RLS
-- policies alone still left "permission denied for table ..." (SQLSTATE 42501)
-- for signed-in users. Household access stays gated by the RLS policies from
-- 0009; anon is intentionally granted nothing (these tables are private).
grant select, insert, update, delete on public.planned_meals to authenticated;
grant select, insert, update, delete on public.grocery_items to authenticated;
grant select, insert, update, delete on public.pantry_staples to authenticated;
