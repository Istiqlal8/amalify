-- The group's amal list is now live: every member works through the same items the admin wrote,
-- and their ticks on those items are stored here so the admin can follow each member. Only items
-- from the group list land here; a member's personal amalan never leave the device.

create table public.group_item_logs (
  group_id uuid not null references public.groups on delete cascade,
  user_id uuid not null references public.profiles on delete cascade default auth.uid(),
  -- The cadence bucket the tick belongs to, e.g. `harian:2026-10-02` or `mingguan:2026-W40`.
  bucket text not null check (bucket ~ '^(harian|mingguan|bulanan|3bulan|5bulan):[0-9W-]{7,10}$'),
  -- `group_templates.fields[].id`; kept even if the admin later removes the item.
  field_id text not null check (char_length(field_id) between 1 and 80),
  count integer not null check (count between 0 and 100000),
  updated_at timestamptz not null default now(),
  primary key (group_id, user_id, bucket, field_id)
);

create index group_item_logs_bucket on public.group_item_logs (group_id, bucket);

alter table public.group_item_logs enable row level security;

-- A member sees their own ticks; an admin sees everyone's in the groups they run.
create policy "read own or as admin" on public.group_item_logs for select
  using (user_id = auth.uid() or is_group_admin(group_id));

-- A member writes only their own ticks, and only in a group they belong to.
create policy "write self" on public.group_item_logs for insert
  with check (user_id = auth.uid() and group_id in (select my_group_ids()));

create policy "update self" on public.group_item_logs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and group_id in (select my_group_ids()));

-- Leaving a group takes the member's ticks in it along.
create function public.after_member_left_logs() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from group_item_logs where group_id = old.group_id and user_id = old.user_id;
  return null;
end $$;

create trigger group_member_left_logs after delete on public.group_members
  for each row execute function public.after_member_left_logs();

alter publication supabase_realtime add table public.group_item_logs;
