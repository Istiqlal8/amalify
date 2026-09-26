-- Amalify group layer. Only a daily percentage, today's tilawah pages and a display name
-- leave the device; the full checklist stays in each user's own Google Drive.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade default auth.uid(),
  display_name text not null check (char_length(display_name) between 1 and 60)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  invite_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_by uuid not null references auth.users on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups on delete cascade,
  user_id uuid not null references public.profiles on delete cascade default auth.uid(),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.daily_summaries (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  day date not null,
  percent smallint not null check (percent between 0 and 100),
  tilawah smallint not null default 0 check (tilawah between 0 and 1000),
  primary key (user_id, day)
);

-- Security definer so policies on group_members do not recurse into themselves.
create function public.my_group_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select group_id from group_members where user_id = auth.uid()
$$;

create function public.is_group_mate(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select other = auth.uid() or exists (
    select 1 from group_members where user_id = other and group_id in (select my_group_ids())
  )
$$;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.daily_summaries enable row level security;

create policy "read mates" on public.profiles for select using (is_group_mate(id));
create policy "write self" on public.profiles for insert with check (id = auth.uid());
create policy "update self" on public.profiles for update using (id = auth.uid());

create policy "read my groups" on public.groups for select using (id in (select my_group_ids()));

create policy "read my group members" on public.group_members for select
  using (group_id in (select my_group_ids()));
create policy "leave group" on public.group_members for delete using (user_id = auth.uid());

create policy "read mates" on public.daily_summaries for select using (is_group_mate(user_id));
create policy "write self" on public.daily_summaries for insert with check (user_id = auth.uid());
create policy "update self" on public.daily_summaries for update using (user_id = auth.uid());

-- Groups are created and joined only through these, so membership rows are never forged.
create function public.create_group(group_name text) returns public.groups
language plpgsql security definer set search_path = public as $$
declare g groups;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into groups (name, created_by) values (trim(group_name), auth.uid()) returning * into g;
  insert into group_members (group_id, user_id) values (g.id, auth.uid());
  return g;
end $$;

create function public.join_group(code text) returns public.groups
language plpgsql security definer set search_path = public as $$
declare g groups;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into g from groups where invite_code = upper(trim(code));
  if g.id is null then raise exception 'invite code not found'; end if;
  insert into group_members (group_id, user_id) values (g.id, auth.uid()) on conflict do nothing;
  return g;
end $$;

-- Tilawah pages per user over a day range. Global (only_group null) lists every signed-in user
-- who read something; a group board lists all its members and is open only to members.
-- Returns names and page totals only, so percentages stay visible to group mates alone.
create function public.tilawah_board(from_day date, to_day date, only_group uuid default null)
returns table (user_id uuid, display_name text, pages bigint)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, coalesce(sum(s.tilawah), 0)
  from profiles p
  left join daily_summaries s on s.user_id = p.id and s.day between from_day and to_day
  where auth.uid() is not null
    and (only_group is null or (
      only_group in (select my_group_ids())
      and p.id in (select m.user_id from group_members m where m.group_id = only_group)))
  group by p.id, p.display_name
  having only_group is not null or coalesce(sum(s.tilawah), 0) > 0
  order by 3 desc, p.display_name
  limit 100
$$;

-- Group programs. A check event (target 1) is done once progress reaches 1; a counted one
-- tracks progress toward its target, like a counted amal yaumi item.
create table public.group_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  starts_at timestamptz not null,
  pic uuid references public.profiles on delete set null,
  target integer not null default 1 check (target between 1 and 100000),
  unit text not null default '' check (char_length(unit) <= 12),
  progress integer not null default 0 check (progress between 0 and 100000),
  created_by uuid not null references auth.users on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.group_events enable row level security;
create policy "read" on public.group_events for select using (group_id in (select my_group_ids()));
create policy "add" on public.group_events for insert
  with check (group_id in (select my_group_ids()) and created_by = auth.uid());
create policy "edit" on public.group_events for update
  using (group_id in (select my_group_ids())) with check (group_id in (select my_group_ids()));
create policy "delete own" on public.group_events for delete using (created_by = auth.uid());

-- Group cash book. Positive amounts come in, negative go out (whole rupiah). A dues payment
-- names the member and the month (first day) it pays for.
alter table public.groups add column dues_amount integer check (dues_amount between 1 and 100000000);

create table public.cash_entries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups on delete cascade,
  amount bigint not null check (amount <> 0 and abs(amount) <= 1000000000),
  note text not null check (char_length(note) between 1 and 80),
  day date not null default current_date,
  dues_for uuid references public.profiles on delete set null,
  dues_month date check (dues_month is null or extract(day from dues_month) = 1),
  created_by uuid not null references auth.users on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  check ((dues_month is null) or (amount > 0 and dues_for is not null))
);

alter table public.cash_entries enable row level security;
create policy "read" on public.cash_entries for select using (group_id in (select my_group_ids()));
create policy "add" on public.cash_entries for insert
  with check (group_id in (select my_group_ids()) and created_by = auth.uid());
create policy "delete own" on public.cash_entries for delete using (created_by = auth.uid());

-- Any member may set or clear (null) the monthly dues.
create function public.set_group_dues(g uuid, amount integer) returns void
language plpgsql security definer set search_path = public as $$
begin
  if g not in (select my_group_ids()) then raise exception 'not a member'; end if;
  update groups set dues_amount = amount where id = g;
end $$;
