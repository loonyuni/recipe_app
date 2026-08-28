-- Run this once after supabase-schema.sql.
-- It lets a newly authenticated user create the first household safely.

create or replace function public.create_household(
  household_name text,
  member_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in';
  end if;

  insert into public.households (name, created_by)
  values (household_name, auth.uid())
  returning id into new_household_id;

  insert into public.household_members (household_id, user_id, display_name, role)
  values (new_household_id, auth.uid(), member_name, 'owner');

  return new_household_id;
end;
$$;

grant execute on function public.create_household(text, text) to authenticated;
