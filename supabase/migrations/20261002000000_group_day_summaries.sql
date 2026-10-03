-- The group farm grows from the group's own amal list, not from each member's personal plan.
-- Ticks in group_item_logs are private to the member (and the admin), so each member's app shares
-- only the resulting daily percentage here, per group, for every mate to see on the farm.

create table public.group_day_summaries (
  group_id uuid not null references public.groups on delete cascade,
  user_id uuid not null references public.profiles on delete cascade default auth.uid(),
  day date not null,
  -- Null when the member hides their progress, as in daily_summaries.
  percent smallint check (percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (group_id, user_id, day)
);

alter table public.group_day_summaries enable row level security;

create policy "read my groups" on public.group_day_summaries for select
  using (group_id in (select my_group_ids()));

create policy "write self" on public.group_day_summaries for insert
  with check (user_id = auth.uid() and group_id in (select my_group_ids()));

create policy "update self" on public.group_day_summaries for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and group_id in (select my_group_ids()));

-- Leaving a group takes the member's summaries in it along.
create function public.after_member_left_day_summaries() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from group_day_summaries where group_id = old.group_id and user_id = old.user_id;
  return null;
end $$;

create trigger group_member_left_day_summaries after delete on public.group_members
  for each row execute function public.after_member_left_day_summaries();

alter publication supabase_realtime add table public.group_day_summaries;
