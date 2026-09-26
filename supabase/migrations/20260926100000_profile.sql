-- Profile: avatar, a short bio seen by group mates, and opting out of the global leaderboard.
alter table public.profiles
  add column avatar_url text check (char_length(avatar_url) <= 500),
  add column bio text check (char_length(bio) <= 80),
  add column hide_global boolean not null default false;

-- Deleting an account must not take a whole group, its events or its cash book with it,
-- so authorship is cleared instead of cascading.
alter table public.groups alter column created_by drop not null;
alter table public.groups drop constraint groups_created_by_fkey,
  add constraint groups_created_by_fkey foreign key (created_by) references auth.users on delete set null;
alter table public.group_events alter column created_by drop not null;
alter table public.group_events drop constraint group_events_created_by_fkey,
  add constraint group_events_created_by_fkey foreign key (created_by) references auth.users on delete set null;
alter table public.cash_entries alter column created_by drop not null;
alter table public.cash_entries drop constraint cash_entries_created_by_fkey,
  add constraint cash_entries_created_by_fkey foreign key (created_by) references auth.users on delete set null;

-- Removes the caller's auth user; profiles, memberships and summaries cascade from it.
-- Avatar files are removed by the app through the Storage API first.
create function public.delete_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Same board as before, plus avatars; users who hide themselves drop off the global board only.
drop function public.tilawah_board(date, date, uuid);
create function public.tilawah_board(from_day date, to_day date, only_group uuid default null)
returns table (user_id uuid, display_name text, avatar_url text, pages bigint)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.avatar_url, coalesce(sum(s.tilawah), 0)
  from profiles p
  left join daily_summaries s on s.user_id = p.id and s.day between from_day and to_day
  where auth.uid() is not null
    and (only_group is not null or not p.hide_global or p.id = auth.uid())
    and (only_group is null or (
      only_group in (select my_group_ids())
      and p.id in (select m.user_id from group_members m where m.group_id = only_group)))
  group by p.id, p.display_name, p.avatar_url
  having only_group is not null or coalesce(sum(s.tilawah), 0) > 0
  order by 4 desc, p.display_name
  limit 100
$$;

-- Public bucket: avatars are shown to group mates and on the leaderboard.
-- Each user writes only under a folder named after their own id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "avatar insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar list own" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
