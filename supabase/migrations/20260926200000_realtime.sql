-- Group screens refresh live: Realtime forwards row changes on these tables to subscribed
-- clients, still filtered by each table's select policy. Delete events carry only the
-- primary key, so clients reload on any delete rather than filtering them.
alter publication supabase_realtime
  add table public.daily_summaries, public.group_members, public.group_events, public.cash_entries;
