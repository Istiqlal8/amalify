-- Group logo: an optional photo the group's creator picks; members see it on the group card.
alter table public.groups add column logo_url text check (char_length(logo_url) <= 500);

-- groups has no update policy (rows change only through RPCs), so the logo goes through one too.
create function public.set_group_logo(g uuid, url text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from groups where id = g and created_by = auth.uid()) then
    raise exception 'only the group creator can change the logo';
  end if;
  update groups set logo_url = url where id = g;
end $$;

-- Public bucket; files live under a folder named after the group, writable only by its creator.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('group-logos', 'group-logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "group logo insert by creator" on storage.objects for insert to authenticated
  with check (bucket_id = 'group-logos' and (storage.foldername(name))[1] in
    (select id::text from public.groups where created_by = auth.uid()));
create policy "group logo delete by creator" on storage.objects for delete to authenticated
  using (bucket_id = 'group-logos' and (storage.foldername(name))[1] in
    (select id::text from public.groups where created_by = auth.uid()));
create policy "group logo list by creator" on storage.objects for select to authenticated
  using (bucket_id = 'group-logos' and (storage.foldername(name))[1] in
    (select id::text from public.groups where created_by = auth.uid()));
