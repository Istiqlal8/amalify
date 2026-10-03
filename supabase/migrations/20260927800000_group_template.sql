-- An admin writes one amal yaumi list for the whole group. Members keep their own checklist;
-- the template is a copy they take, not a live constraint, so an edited personal list is never
-- overwritten behind their back. Members get it pushed to their phone, and see it in the app.

create table public.group_templates (
  group_id uuid primary key references public.groups on delete cascade,
  fields jsonb not null default '[]'::jsonb,
  updated_by uuid references public.profiles on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.group_templates enable row level security;

-- A member reads their group's list; nobody writes it directly, only through set_group_template.
create policy "read my group template" on public.group_templates for select
  using (group_id in (select my_group_ids()));

create function public.set_group_template(g uuid, fields jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_group_admin(g) then raise exception 'only a group admin can change the amal list'; end if;
  if jsonb_typeof(fields) <> 'array' or jsonb_array_length(fields) > 60 then
    raise exception 'the amal list must be a list of at most 60 items';
  end if;
  insert into group_templates (group_id, fields, updated_by, updated_at)
  values (g, fields, auth.uid(), now())
  on conflict (group_id) do update set fields = excluded.fields, updated_by = excluded.updated_by, updated_at = now();
end $$;

-- Waking the members is what makes the list theirs to notice, not something to go looking for.
-- The push names the pressing admin so a member can tell who to ask.
create function public.on_group_template_set() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text;
begin
  select display_name into who from profiles where id = new.updated_by;
  perform push_to_group(
    new.group_id,
    new.updated_by,
    (select name from groups where id = new.group_id),
    coalesce(who, 'Admin') || ' memperbarui amal yaumi grup');
  return null;
end $$;

-- Fires on both the first save (insert) and every later one (update).
create trigger group_template_set after insert or update on public.group_templates
  for each row execute function public.on_group_template_set();
