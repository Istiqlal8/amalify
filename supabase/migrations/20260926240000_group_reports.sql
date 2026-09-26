-- Weekly group reports: when and where the group met, plus custom fields (class progress,
-- tilawah, attendance...). The group's creator sets which fields a report asks for; each report
-- keeps its own copy of the labels, so later format changes leave old reports readable.

alter table public.groups add column report_fields jsonb not null default
  '[{"id":"kelas","label":"Progres kelas","kind":"text","unit":""},
    {"id":"tilawah","label":"Tilawah","kind":"number","unit":"halaman"},
    {"id":"hadir","label":"Kehadiran","kind":"number","unit":"orang"},
    {"id":"catatan","label":"Catatan","kind":"long","unit":""}]'::jsonb;

create function public.set_report_fields(g uuid, fields jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from groups where id = g and created_by = auth.uid()) then
    raise exception 'only the group creator can change the report format';
  end if;
  if jsonb_typeof(fields) <> 'array' or jsonb_array_length(fields) > 20 then
    raise exception 'report format must be a list of at most 20 fields';
  end if;
  update groups set report_fields = fields where id = g;
end $$;

create table public.group_reports (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups on delete cascade,
  day date not null,
  time text not null check (time ~ '^\d{2}:\d{2}$'),
  location text not null default '' check (char_length(location) <= 120),
  entries jsonb not null default '[]'::jsonb check (jsonb_typeof(entries) = 'array'),
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.group_reports enable row level security;

create policy "read" on public.group_reports for select using (group_id in (select my_group_ids()));
create policy "add" on public.group_reports for insert
  with check (group_id in (select my_group_ids()) and created_by = auth.uid());
create policy "edit own" on public.group_reports for update using (created_by = auth.uid());
create policy "delete own" on public.group_reports for delete using (created_by = auth.uid());

alter publication supabase_realtime add table public.group_reports;
