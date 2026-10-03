/** Profil pemilik perangkat; gender menentukan apakah modul Haid tampil. */
export type Gender = 'laki-laki' | 'perempuan';

export function isGender(value: unknown): value is Gender {
  return value === 'laki-laki' || value === 'perempuan';
}

export const GENDER_LABEL: Record<Gender, string> = {
  'laki-laki': 'Laki-laki',
  perempuan: 'Perempuan',
};

/** User lama (sebelum ada pilihan) dianggap perempuan agar perilaku Haid tidak berubah. */
export const LEGACY_GENDER: Gender = 'perempuan';
