/**
 * Looping backdrops for the player, taken from the earlier Quran app. Each clip plays
 * forwards then backwards, so the loop has no seam. Authors and licences are on the
 * website's credits page; see CREDITS.md.
 */
export type Scene = { id: string; label: string; source: number | null };

export const SCENES: Scene[] = [
  { id: 'malam', label: 'Malam', source: require('@/assets/videos/malam.mp4') },
  { id: 'hujan', label: 'Hujan', source: require('@/assets/videos/hujan.mp4') },
  { id: 'senja', label: 'Senja', source: require('@/assets/videos/senja.mp4') },
  { id: 'kabut', label: 'Kabut', source: require('@/assets/videos/kabut.mp4') },
  { id: 'awan', label: 'Awan', source: require('@/assets/videos/awan.mp4') },
  { id: 'polos', label: 'Tanpa video', source: null },
];

export function sceneById(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
