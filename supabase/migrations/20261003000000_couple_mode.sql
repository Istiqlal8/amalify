-- Mode pasangan Haid: istri (pemilik data) membuat kode undangan 6 huruf,
-- suami bergabung dengan kode itu seperti grup. Istri mendorong ringkasan
-- HaidLog lengkapnya; suami hanya membaca milik istrinya yang terhubung.

create table public.couple_pairs (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  wife_id uuid not null unique references auth.users on delete cascade default auth.uid(),
  husband_id uuid references auth.users on delete cascade default null,
  created_at timestamptz not null default now(),
  joined_at timestamptz
);

create table public.couple_haid_states (
  wife_id uuid primary key references auth.users on delete cascade default auth.uid(),
  data jsonb not null,
  at bigint not null,
  updated_at timestamptz not null default now()
);

alter table public.couple_pairs enable row level security;
alter table public.couple_haid_states enable row level security;

-- True ketika other terhubung pasangan dengan pemilik token (salah satu arah).
create function public.is_couple(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select other = auth.uid() or exists (
    select 1 from couple_pairs
    where (wife_id = auth.uid() and husband_id = other)
       or (husband_id = auth.uid() and wife_id = other)
  )
$$;

-- Pasangan boleh membaca nama profil satu sama lain (selain teman grup).
create policy "read couple" on public.profiles for select using (is_couple(id));

-- Pasangan terlihat oleh kedua belah pihak; tulis hanya lewat RPC di bawah.
create policy "read own pair" on public.couple_pairs for select
  using (wife_id = auth.uid() or husband_id = auth.uid());

-- Istri menulis snapshot-nya sendiri; suami yang terhubung boleh membaca.
create policy "read own or partner haid" on public.couple_haid_states for select
  using (wife_id = auth.uid() or is_couple(wife_id));
create policy "write own haid" on public.couple_haid_states for insert
  with check (wife_id = auth.uid());
create policy "update own haid" on public.couple_haid_states for update
  using (wife_id = auth.uid()) with check (wife_id = auth.uid());
create policy "delete own haid" on public.couple_haid_states for delete
  using (wife_id = auth.uid());

-- Istri membuat (atau memakai ulang) undangannya; suami tidak bisa membuat.
create function public.create_couple_invite() returns public.couple_pairs
language plpgsql security definer set search_path = public as $$
declare p couple_pairs;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if exists (select 1 from couple_pairs where husband_id = auth.uid()) then
    raise exception 'sudah terhubung sebagai suami';
  end if;
  select * into p from couple_pairs where wife_id = auth.uid();
  if p.id is not null then return p; end if;
  insert into couple_pairs (wife_id) values (auth.uid()) returning * into p;
  return p;
end $$;

-- Suami bergabung dengan kode milik istri; kode tetap bisa dipakai ulang.
create function public.join_couple(code text) returns public.couple_pairs
language plpgsql security definer set search_path = public as $$
declare p couple_pairs;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into p from couple_pairs where invite_code = upper(trim(code));
  if p.id is null then raise exception 'kode undangan tidak ditemukan'; end if;
  if p.wife_id = auth.uid() then raise exception 'ini kode undanganmu sendiri'; end if;
  if p.husband_id is not null and p.husband_id <> auth.uid() then
    raise exception 'kode sudah dipakai';
  end if;
  if exists (select 1 from couple_pairs where wife_id = auth.uid()) then
    raise exception 'kamu sudah punya undangan pasangan';
  end if;
  if exists (select 1 from couple_pairs where husband_id = auth.uid() and id <> p.id) then
    raise exception 'sudah terhubung ke pasangan lain';
  end if;
  update couple_pairs set husband_id = auth.uid(), joined_at = now() where id = p.id returning * into p;
  return p;
end $$;

-- Istri keluar menghapus pasangan + snapshot; suami keluar membuka slot suami.
create function public.leave_couple() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from couple_haid_states where wife_id = auth.uid();
  delete from couple_pairs where wife_id = auth.uid();
  update couple_pairs set husband_id = null, joined_at = null where husband_id = auth.uid();
end $$;

-- Regenerasi kode oleh istri (slot suami dipertahankan).
create function public.regen_couple_code() returns public.couple_pairs
language plpgsql security definer set search_path = public as $$
declare p couple_pairs;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update couple_pairs
    set invite_code = upper(substr(md5(gen_random_uuid()::text), 1, 6))
    where wife_id = auth.uid()
    returning * into p;
  if p.id is null then raise exception 'belum punya undangan pasangan'; end if;
  return p;
end $$;
