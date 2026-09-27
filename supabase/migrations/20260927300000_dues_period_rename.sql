-- Dues can be weekly or monthly. A dues payment's dues_month now holds the start of the
-- period it pays for: the 1st for monthly dues, a Monday for weekly ones.
alter table public.groups add column dues_period text not null default 'month' check (dues_period in ('week', 'month'));

alter table public.cash_entries drop constraint cash_entries_dues_month_check;
alter table public.cash_entries add constraint cash_entries_dues_month_check
  check (dues_month is null or extract(day from dues_month) = 1 or extract(isodow from dues_month) = 1);

drop function public.set_group_dues(uuid, integer);

-- Any member may set or clear (null) the dues and pick their period.
create function public.set_group_dues(g uuid, amount integer, period text default 'month') returns void
language plpgsql security definer set search_path = public as $$
begin
  if g not in (select my_group_ids()) then raise exception 'not a member'; end if;
  update groups set dues_amount = amount, dues_period = period where id = g;
end $$;

create function public.rename_group(g uuid, new_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can rename the group'; end if;
  update groups set name = trim(new_name) where id = g;
end $$;
