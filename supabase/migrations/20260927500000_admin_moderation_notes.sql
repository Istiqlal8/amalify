-- Admins may edit and delete any member's group notes and reports, like events and cash.
drop policy "edit own" on public.group_notes;
drop policy "delete own" on public.group_notes;
create policy "edit own or admin" on public.group_notes for update
  using (created_by = auth.uid() or is_group_admin(group_id))
  with check (group_id in (select my_group_ids()));
create policy "delete own or admin" on public.group_notes for delete
  using (created_by = auth.uid() or is_group_admin(group_id));

drop policy "edit own" on public.group_reports;
drop policy "delete own" on public.group_reports;
create policy "edit own or admin" on public.group_reports for update
  using (created_by = auth.uid() or is_group_admin(group_id))
  with check (group_id in (select my_group_ids()));
create policy "delete own or admin" on public.group_reports for delete
  using (created_by = auth.uid() or is_group_admin(group_id));
