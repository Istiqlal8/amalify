import type { SupabaseClient } from '@supabase/supabase-js';

import type { CouplePair } from '@/domain/couple';
import type { HaidLog } from '@/domain/haid';

type PairRow = CouplePair;

async function myUserId(db: SupabaseClient): Promise<string | null> {
  const { data } = await db.auth.getUser();
  return data.user?.id ?? null;
}

/** Pasangan saya (sebagai istri atau suami); null bila belum ada. RLS hanya menampakkan milik sendiri. */
export async function myPair(db: SupabaseClient): Promise<{ pair: PairRow | null; myId: string | null }> {
  const myId = await myUserId(db);
  if (!myId) return { pair: null, myId: null };
  const { data, error } = await db.from('couple_pairs').select('id, invite_code, wife_id, husband_id, joined_at').limit(1);
  if (error) throw error;
  const rows = data as PairRow[];
  return { pair: rows[0] ?? null, myId };
}

/** Istri membuat (atau memakai ulang) kode undangannya. */
export async function createInvite(db: SupabaseClient): Promise<PairRow> {
  const { data, error } = await db.rpc('create_couple_invite');
  if (error) throw error;
  return data as PairRow;
}

/** Istri membuat kode baru; suami yang sudah terhubung tetap terhubung. */
export async function regenCode(db: SupabaseClient): Promise<PairRow> {
  const { data, error } = await db.rpc('regen_couple_code');
  if (error) throw error;
  return data as PairRow;
}

/** Suami bergabung dengan kode milik istri. */
export async function joinCouple(db: SupabaseClient, code: string): Promise<PairRow> {
  const { data, error } = await db.rpc('join_couple', { code: code.trim().toUpperCase() });
  if (error) throw error;
  return data as PairRow;
}

/** Kedua pihak bisa keluar; istri keluar menghapus snapshot, suami keluar membuka slot. */
export async function leaveCouple(db: SupabaseClient): Promise<void> {
  const { error } = await db.rpc('leave_couple');
  if (error) throw error;
}

/** Istri mendorong seluruh HaidLog-nya agar suami membaca detail yang sama. */
export async function pushHaid(db: SupabaseClient, log: HaidLog): Promise<void> {
  const myId = await myUserId(db);
  if (!myId) throw new Error('not signed in');
  const { error } = await db.from('couple_haid_states').upsert({ wife_id: myId, data: log, at: log.at });
  if (error) throw error;
}

/** Data Haid istri untuk suami yang terhubung; null bila istri belum pernah sync. */
export async function fetchPartnerHaid(db: SupabaseClient, wifeId: string): Promise<HaidLog | null> {
  const { data, error } = await db.from('couple_haid_states').select('data, at').eq('wife_id', wifeId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return (data as { data: HaidLog }).data ?? null;
}

/** Nama tampilan pasangan (terbaca berkat policy "read couple"). */
export async function fetchPartnerName(db: SupabaseClient, partnerId: string): Promise<string> {
  const { data, error } = await db.from('profiles').select('display_name').eq('id', partnerId).maybeSingle();
  if (error) throw error;
  return (data as { display_name: string } | null)?.display_name ?? 'Pasangan';
}
