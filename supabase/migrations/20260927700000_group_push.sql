-- Push notifications for the things a member cannot see coming: a new program and a new
-- announcement. Each device registers its Expo token here; the database posts straight to Expo
-- through pg_net when a row changes, so there is no server to keep running.

create extension if not exists pg_net;

create table public.push_tokens (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  token text not null check (char_length(token) between 1 and 200),
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);

alter table public.push_tokens enable row level security;
create policy "own tokens" on public.push_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Expo takes up to 100 messages per request; a group that outgrows that gets the first 100.
create function public.push_to_group(g uuid, skip uuid, heading text, message text) returns void
language plpgsql security definer set search_path = public as $$
declare payload jsonb;
begin
  select jsonb_agg(jsonb_build_object('to', t.token, 'title', heading, 'body', message, 'channelId', 'grup'))
    into payload
    from (
      select t.token from push_tokens t
      join group_members m on m.user_id = t.user_id
      where m.group_id = g and (skip is null or t.user_id <> skip)
      limit 100
    ) t;
  if payload is null then return; end if;
  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload);
end $$;

create function public.on_event_added() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform push_to_group(new.group_id, new.created_by, 'Program baru', new.title);
  return null;
end $$;

create trigger event_added after insert on public.group_events
  for each row execute function public.on_event_added();

create function public.on_announcement_set() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.announcement is not null and new.announcement is distinct from old.announcement then
    perform push_to_group(new.id, auth.uid(), new.name, new.announcement);
  end if;
  return null;
end $$;

create trigger announcement_set after update on public.groups
  for each row execute function public.on_announcement_set();
