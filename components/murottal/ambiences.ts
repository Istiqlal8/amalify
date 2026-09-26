/** Background sounds that can play under the recitation. Sources and licences: assets/sounds/murottal/CREDITS.md. */
export type AmbienceId = 'mati' | 'hujan' | 'ombak' | 'jangkrik' | 'burung' | 'angin';

export const AMBIENCES: { id: AmbienceId; label: string; source: number | null }[] = [
  { id: 'mati', label: 'Mati', source: null },
  { id: 'hujan', label: 'Hujan', source: require('@/assets/sounds/murottal/hujan.m4a') },
  { id: 'ombak', label: 'Ombak', source: require('@/assets/sounds/murottal/ombak.m4a') },
  { id: 'jangkrik', label: 'Jangkrik', source: require('@/assets/sounds/murottal/jangkrik.m4a') },
  { id: 'burung', label: 'Burung', source: require('@/assets/sounds/murottal/burung.m4a') },
  { id: 'angin', label: 'Angin', source: require('@/assets/sounds/murottal/angin.m4a') },
];
