-- A member can keep their daily percentage off the server (e.g. so haid days cannot be read from
-- it). The row still carries tilawah pages for the leaderboard; percent is then null.
alter table public.daily_summaries alter column percent drop not null;
