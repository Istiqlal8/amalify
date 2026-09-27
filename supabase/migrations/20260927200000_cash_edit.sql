-- Cash entries become editable by whoever recorded them, like deleting already is.
create policy "edit own" on public.cash_entries for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid() and group_id in (select my_group_ids()));
