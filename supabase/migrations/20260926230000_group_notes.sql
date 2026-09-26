-- Shared group notes (study material, announcements, minutes). Any member reads and adds;
-- only the author edits or deletes. Authorship is cleared, not cascaded, when an account goes.
create table public.group_notes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  body text not null default '' check (char_length(body) <= 5000),
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.group_notes enable row level security;

create policy "read" on public.group_notes for select using (group_id in (select my_group_ids()));
create policy "add" on public.group_notes for insert
  with check (group_id in (select my_group_ids()) and created_by = auth.uid());
create policy "edit own" on public.group_notes for update using (created_by = auth.uid());
create policy "delete own" on public.group_notes for delete using (created_by = auth.uid());

alter publication supabase_realtime add table public.group_notes;
