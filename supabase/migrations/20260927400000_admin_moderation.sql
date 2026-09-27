-- Admins may edit and delete any member's group events and cash entries, not only their own.
drop policy "delete own" on public.group_events;
create policy "delete own or admin" on public.group_events for delete
  using (created_by = auth.uid() or is_group_admin(group_id));

drop policy "delete own" on public.cash_entries;
create policy "delete own or admin" on public.cash_entries for delete
  using (created_by = auth.uid() or is_group_admin(group_id));

drop policy "edit own" on public.cash_entries;
create policy "edit own or admin" on public.cash_entries for update
  using (created_by = auth.uid() or is_group_admin(group_id))
  with check (group_id in (select my_group_ids()));
