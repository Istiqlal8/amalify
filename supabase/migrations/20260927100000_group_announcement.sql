-- Group announcement: one short message an admin pins on the group card; null when none.
alter table public.groups add column announcement text check (char_length(announcement) between 1 and 280);

create function public.set_group_announcement(g uuid, message text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can set the announcement'; end if;
  update groups set announcement = nullif(trim(message), '') where id = g;
end $$;

-- Members see a new announcement (and logo or dues changes) without reopening the app.
alter publication supabase_realtime add table public.groups;
