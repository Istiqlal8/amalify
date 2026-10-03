/** Pilihan bunyi untuk semua pengingat lokal (amalan, malam, adzan). */
export type ReminderSoundId = 'default' | 'lembut' | 'ceria' | 'sunyi';

export type ReminderSound = {
  id: ReminderSoundId;
  label: string;
  caption: string;
  /** Nama file bundel untuk channel Android & content iOS; undefined = suara sistem, null = sunyi. */
  file: string | undefined | false;
  /** Channel Android per bunyi; channel tidak bisa ganti suara setelah dibuat. */
  channelId: string;
};

export const REMINDER_SOUNDS: ReminderSound[] = [
  {
    id: 'default',
    label: 'Bawaan HP',
    caption: 'Mengikuti nada dering notifikasi di HP-mu.',
    file: undefined,
    channelId: 'pengingat',
  },
  {
    id: 'lembut',
    label: 'Lembut',
    caption: 'Nada dua ketuk yang tenang.',
    file: 'lembut.wav',
    channelId: 'pengingat-lembut',
  },
  {
    id: 'ceria',
    label: 'Ceria',
    caption: 'Nada naik tiga ketuk yang semangat.',
    file: 'ceria.wav',
    channelId: 'pengingat-ceria',
  },
  {
    id: 'sunyi',
    label: 'Sunyi',
    caption: 'Tanpa bunyi, hanya muncul di layar.',
    file: false,
    channelId: 'pengingat-sunyi',
  },
];

export const DEFAULT_REMINDER_SOUND: ReminderSoundId = 'default';

export function reminderSoundOf(id: unknown): ReminderSound {
  return REMINDER_SOUNDS.find((s) => s.id === id) ?? REMINDER_SOUNDS[0];
}

export function isValidReminderSound(id: unknown): id is ReminderSoundId {
  return REMINDER_SOUNDS.some((s) => s.id === id);
}
