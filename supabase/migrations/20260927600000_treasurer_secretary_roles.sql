-- Two roles join admin and member, one per person: a bendahara keeps the cash book and sets the
-- dues, a sekretaris keeps the notes, reports and events. An admin may do everything both of them
-- can. The logo, the group name, the announcement, roles and removals stay admin only.

alter table public.group_members drop constraint group_members_role_check;
alter table public.group_members add constraint group_members_role_check
  check (role in ('admin', 'bendahara', 'sekretaris', 'member'));

create function public.can_manage_cash(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = g and user_id = auth.uid() and role in ('admin', 'bendahara'))
$$;

create function public.can_manage_records(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = g and user_id = auth.uid() and role in ('admin', 'sekretaris'))
$$;

drop policy "edit own or admin" on public.cash_entries;
create policy "edit own or bendahara" on public.cash_entries for update
  using (created_by = auth.uid() or can_manage_cash(group_id))
  with check (group_id in (select my_group_ids()));
drop policy "delete own or admin" on public.cash_entries;
create policy "delete own or bendahara" on public.cash_entries for delete
  using (created_by = auth.uid() or can_manage_cash(group_id));

drop policy "edit own or admin" on public.group_notes;
create policy "edit own or sekretaris" on public.group_notes for update
  using (created_by = auth.uid() or can_manage_records(group_id))
  with check (group_id in (select my_group_ids()));
drop policy "delete own or admin" on public.group_notes;
create policy "delete own or sekretaris" on public.group_notes for delete
  using (created_by = auth.uid() or can_manage_records(group_id));

drop policy "edit own or admin" on public.group_reports;
create policy "edit own or sekretaris" on public.group_reports for update
  using (created_by = auth.uid() or can_manage_records(group_id))
  with check (group_id in (select my_group_ids()));
drop policy "delete own or admin" on public.group_reports;
create policy "delete own or sekretaris" on public.group_reports for delete
  using (created_by = auth.uid() or can_manage_records(group_id));

drop policy "edit" on public.group_events;
create policy "edit own or sekretaris" on public.group_events for update
  using (created_by = auth.uid() or can_manage_records(group_id))
  with check (group_id in (select my_group_ids()));
drop policy "delete own or admin" on public.group_events;
create policy "delete own or sekretaris" on public.group_events for delete
  using (created_by = auth.uid() or can_manage_records(group_id));

drop function public.set_group_dues(uuid, integer, text);

-- Setting or clearing (null) the dues and picking its period is the bendahara's job.
create function public.set_group_dues(g uuid, amount integer, period text default 'month') returns void
language plpgsql security definer set search_path = public as $$
begin
  if not can_manage_cash(g) then raise exception 'only a group admin or bendahara can set the dues'; end if;
  update groups set dues_amount = amount, dues_period = period where id = g;
end $$;

-- Demoting the last admin to any other role would leave the group without one.
create or replace function public.set_member_role(g uuid, member uuid, new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can change roles'; end if;
  if new_role not in ('admin', 'bendahara', 'sekretaris', 'member') then raise exception 'unknown role'; end if;
  if new_role <> 'admin' and not exists (
    select 1 from group_members where group_id = g and role = 'admin' and user_id <> member
  ) then raise exception 'a group needs at least one admin'; end if;
  update group_members set role = new_role where group_id = g and user_id = member;
end $$;

-- Ticking a program's progress stays open to every member: the program belongs to the group, not
-- to whoever typed it in. Only its wording, time, PIC and target are gated by the policy above.
create function public.set_event_progress(e uuid, value integer) returns void
language plpgsql security definer set search_path = public as $$
declare ev group_events;
begin
  select * into ev from group_events where id = e;
  if ev.id is null or ev.group_id not in (select my_group_ids()) then raise exception 'not a member'; end if;
  update group_events set progress = least(greatest(value, 0), ev.target) where id = e;
end $$;
