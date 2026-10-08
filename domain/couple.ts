import { dayOfPeriod, isHaidDay, openPeriod, type HaidLog } from './haid';

/** Satu hubungan pasangan: istri pemilik data, suami pembaca. */
export type CouplePair = {
  id: string;
  invite_code: string;
  wife_id: string;
  husband_id: string | null;
  joined_at: string | null;
};

export type CoupleRole = 'wife' | 'husband';

/** Peran saya di pasangan ini; null bila bukan bagian (seharusnya tak terjadi karena RLS). */
export function myRole(pair: CouplePair, myId: string): CoupleRole | null {
  if (pair.wife_id === myId) return 'wife';
  if (pair.husband_id === myId) return 'husband';
  return null;
}

export function isLinked(pair: CouplePair): boolean {
  return pair.husband_id !== null;
}

export type PartnerStatus =
  | { state: 'hamil' }
  | { state: 'nifas'; day: number }
  | { state: 'haid'; day: number }
  | { state: 'suci' };

/** Ringkasan satu baris untuk suami: sedang apa + hari ke berapa. */
export function partnerStatus(log: HaidLog, today: string): PartnerStatus {
  if (log.pregnant) return { state: 'hamil' };
  const open = openPeriod(log);
  if (open) {
    const day = dayOfPeriod(open, today);
    return open.nifas ? { state: 'nifas', day } : { state: 'haid', day };
  }
  if (!isHaidDay(log, today)) return { state: 'suci' };
  return { state: 'haid', day: 1 };
}

export const PARTNER_STATE_LABEL: Record<PartnerStatus['state'], string> = {
  hamil: 'Sedang hamil',
  nifas: 'Sedang nifas',
  haid: 'Sedang haid',
  suci: 'Suci',
};

/** Kode undangan valid: 6 huruf/angka seperti grup. */
export function isInviteCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
}
