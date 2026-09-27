-- Group roles: every member is an admin or a plain member. Admins change the logo and the
-- report format, promote or demote members, and remove members. A group always keeps at
-- least one admin while it has members; the last member leaving deletes the group.

alter table public.group_members
  add column role text not null default 'member' check (role in ('admin', 'member'));

update public.group_members m set role = 'admin'
  from public.groups g where g.id = m.group_id and g.created_by = m.user_id;

-- Groups whose creator is gone get their earliest member as admin.
update public.group_members m set role = 'admin'
  where (m.group_id, m.user_id) in (
    select distinct on (group_id) group_id, user_id from public.group_members
    where group_id not in (select group_id from public.group_members where role = 'admin')
    order by group_id, joined_at);

create function public.is_group_admin(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = g and user_id = auth.uid() and role = 'admin')
$$;

create or replace function public.create_group(group_name text) returns public.groups
language plpgsql security definer set search_path = public as $$
declare g groups;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into groups (name, created_by) values (trim(group_name), auth.uid()) returning * into g;
  insert into group_members (group_id, user_id, role) values (g.id, auth.uid(), 'admin');
  return g;
end $$;

create or replace function public.set_group_logo(g uuid, url text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can change the logo'; end if;
  update groups set logo_url = url where id = g;
end $$;

create or replace function public.set_report_fields(g uuid, fields jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can change the report format'; end if;
  if jsonb_typeof(fields) <> 'array' or jsonb_array_length(fields) > 20 then
    raise exception 'report format must be a list of at most 20 fields';
  end if;
  update groups set report_fields = fields where id = g;
end $$;

drop policy "group logo insert by creator" on storage.objects;
drop policy "group logo delete by creator" on storage.objects;
drop policy "group logo list by creator" on storage.objects;
create policy "group logo insert by admin" on storage.objects for insert to authenticated
  with check (bucket_id = 'group-logos' and public.is_group_admin(((storage.foldername(name))[1])::uuid));
create policy "group logo delete by admin" on storage.objects for delete to authenticated
  using (bucket_id = 'group-logos' and public.is_group_admin(((storage.foldername(name))[1])::uuid));
create policy "group logo list by admin" on storage.objects for select to authenticated
  using (bucket_id = 'group-logos' and public.is_group_admin(((storage.foldername(name))[1])::uuid));

create function public.set_member_role(g uuid, member uuid, new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can change roles'; end if;
  if new_role not in ('admin', 'member') then raise exception 'unknown role'; end if;
  if new_role = 'member' and not exists (
    select 1 from group_members where group_id = g and role = 'admin' and user_id <> member
  ) then raise exception 'a group needs at least one admin'; end if;
  update group_members set role = new_role where group_id = g and user_id = member;
end $$;

create function public.remove_member(g uuid, member uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can remove members'; end if;
  if member = auth.uid() then raise exception 'use leave_group to leave'; end if;
  delete from group_members where group_id = g and user_id = member;
end $$;

-- Runs after any membership ends (leaving, removal, account deletion): the last member out
-- deletes the group, and a group left without an admin promotes its earliest member.
create function public.after_member_gone() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from group_members where group_id = old.group_id) then
    delete from groups where id = old.group_id;
  elsif not exists (select 1 from group_members where group_id = old.group_id and role = 'admin') then
    update group_members set role = 'admin'
      where group_id = old.group_id and user_id = (
        select user_id from group_members where group_id = old.group_id order by joined_at limit 1);
  end if;
  return null;
end $$;

create trigger member_gone after delete on public.group_members
  for each row execute function public.after_member_gone();
