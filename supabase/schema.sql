-- Amalify group layer. Only a daily percentage and a display name leave the device;
-- the full checklist stays in each user's own Google Drive.

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
