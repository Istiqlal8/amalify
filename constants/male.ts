/**
 * Design system "Malam" khusus laki-laki: latar gelap, panel bersudut, aksen amber,
 * tipografi sans tebal. Tidak membaca palet tema pastel sama sekali.
 */
export const male = {
  bg: '#0B1220',
  panel: '#121B2E',
  panelHi: '#18233A',
  line: '#24314D',
  ink: '#E8EEF8',
  inkSoft: '#8A9BB8',
  accent: '#F5B23D',
  /** Teks di atas permukaan amber. */
  onAccent: '#1A1204',
  ok: '#34D399',
  late: '#F87171',
} as const;

export const maleRadius = { sm: 6, md: 10 } as const;

export const maleFonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
} as const;

/** Label kecil kapital berjarak, dipakai sebagai judul seksi. */
export const maleKicker = {
  fontFamily: maleFonts.bold,
  fontSize: 11,
  lineHeight: 14,
  letterSpacing: 1.6,
  textTransform: 'uppercase',
  color: male.inkSoft,
} as const;
